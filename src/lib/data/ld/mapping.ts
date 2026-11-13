// Maps the sioldata LDP containers (compact JSON-LD) to plain data, by hand.
//
// The server's context (https://cdn.startinblox.com/owl/context.jsonld) doesn't define
// the `dfc-b` prefix, so its keys arrive as literal "dfc-b:name" etc. and are read
// as-is. Organisations hold only `{@id, @type}` stubs for their addresses and
// products, inside nested LDP containers; the full records live in the flat
// /organization_addresses/ and /supplied_products/ containers and are joined by @id.

const ORGANIZATION = {
    name: "dfc-b:name",
    description: "dfc-b:hasDescription",
    website: "dfc-b:websitePage",
    email: "dfc-b:email",
    phone: "dfc-b:hasPhoneNumber",
    logo: "dfc-b:logo",
} as const;

const ADDRESS = {
    street: "dfc-b:street",
    city: "dfc-b:city",
    region: "dfc-b:region",
    postcode: "dfc-b:postcode",
    country: "dfc-b:hasCountry",
    // Served as strings, e.g. "51.46762"
    latitude: "dfc-b:latitude",
    longitude: "dfc-b:longitude",
} as const;

const PRODUCT = {
    name: "dfc-b:name",
    description: "dfc-b:description",
    type: "dfc-b:hasType",
    image: "dfc-b:Image",
    url: "dfc-b:URL",
} as const;

/** Everything the mapper reads. Also hashed for the cache version (cache.ts). */
export const MAPPING = {
    types: {
        organization: "dfc-b:Organization",
        address: "dfc-b:Address",
        product: "dfc-b:SuppliedProduct",
    },
    links: {
        addresses: "dfc-b:hasAddress",
        products: "dfc-b:supplies",
        contains: "ldp:contains",
    },
    organization: ORGANIZATION,
    address: ADDRESS,
    product: PRODUCT,
} as const;

type Literals<Fields> = { -readonly [K in keyof Fields]: string | null };

export type AddressData = { $id: string } & Literals<typeof ADDRESS>;
export type ProductData = { $id: string } & Literals<typeof PRODUCT>;
export type OrganizationData = { $id: string } & Literals<typeof ORGANIZATION> & {
    addresses: AddressData[];
    products: ProductData[];
};

/** The three containers as fetched, unparsed beyond JSON. */
export interface Containers {
    organizations: unknown;
    addresses: unknown;
    products: unknown;
}

type Node = Record<string, unknown> & { "@id": string };

function isNode(value: unknown): value is Node {
    return typeof value === "object" && value !== null && typeof (value as Node)["@id"] === "string";
}

/** A JSON-LD value as a string: plain literals, `{@value}`, `{@id}`, or the first of an array. */
function literal(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) return literal(value[0]);
    if (typeof value === "object") {
        const object = value as Record<string, unknown>;
        return literal(object["@value"] ?? object["@id"]);
    }
    return String(value);
}

function hasType(node: Node, type: string): boolean {
    const types = node["@type"];
    return Array.isArray(types) ? types.includes(type) : types === type;
}

/** The members of an LDP container (one object or an array of them). */
function contained(container: unknown): Node[] {
    if (typeof container !== "object" || container === null) return [];
    const members = (container as Record<string, unknown>)[MAPPING.links.contains];
    return (Array.isArray(members) ? members : [members]).filter(isNode);
}

function pick<Fields extends Record<string, string>>(node: Node, fields: Fields): Literals<Fields> {
    return Object.fromEntries(
        Object.entries(fields).map(([key, term]) => [key, literal(node[term])]),
    ) as Literals<Fields>;
}

function index(container: unknown, type: string): Map<string, Node> {
    return new Map(
        contained(container)
            .filter((node) => hasType(node, type))
            .map((node) => [node["@id"], node]),
    );
}

/** Stubs resolved against the flat container; a record embedded in place is used as-is. */
function resolve(container: unknown, records: Map<string, Node>): Node[] {
    return contained(container).flatMap((stub) => {
        const record = records.get(stub["@id"]);
        if (record) return [record];
        const embedded = Object.keys(stub).some((key) => !key.startsWith("@"));
        return embedded ? [stub] : [];
    });
}

export function mapOrganizations({ organizations, addresses, products }: Containers): OrganizationData[] {
    const addressRecords = index(addresses, MAPPING.types.address);
    const productRecords = index(products, MAPPING.types.product);

    return contained(organizations)
        .filter((node) => hasType(node, MAPPING.types.organization))
        .map((organization) => ({
            $id: organization["@id"],
            ...pick(organization, ORGANIZATION),
            addresses: resolve(organization[MAPPING.links.addresses], addressRecords).map(
                (address) => ({ $id: address["@id"], ...pick(address, ADDRESS) }),
            ),
            products: resolve(organization[MAPPING.links.products], productRecords).map(
                (product) => ({ $id: product["@id"], ...pick(product, PRODUCT) }),
            ),
        }));
}
