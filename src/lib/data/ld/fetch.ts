import { mapOrganizations, type OrganizationData } from "./mapping";

type Fetch = typeof globalThis.fetch;

const CONTAINERS = {
    organizations: "organizations",
    addresses: "organization_addresses",
    products: "supplied_products",
} as const;

async function fetchContainer(fetcher: Fetch, url: string): Promise<unknown> {
    const response = await fetcher(url, { headers: { Accept: "application/ld+json" } });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return response.json();
}

/** Fetch the three LDP containers in parallel and join them into organisations. */
export async function fetchOrganizations(
    dataHost: string,
    fetcher: Fetch = globalThis.fetch,
): Promise<OrganizationData[]> {
    const [organizations, addresses, products] = await Promise.all(
        [CONTAINERS.organizations, CONTAINERS.addresses, CONTAINERS.products].map((path) =>
            fetchContainer(fetcher, `${dataHost}/${path}/`),
        ),
    );

    return mapOrganizations({ organizations, addresses, products });
}
