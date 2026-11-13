import { describe, expect, it } from "vitest";
import { Enterprise } from "$lib/models/enterprise";
import { mapOrganizations, type Containers } from "./mapping";

// Mirrors the live sioldata responses: each container is compact JSON-LD whose keys
// use a literal "dfc-b:" prefix. The organisation only references its address and
// product containers; the full records live in the flat containers.
const CONTEXT = "https://cdn.startinblox.com/owl/context.jsonld";
const container = (id: string, members: unknown[]) => ({
    "@context": CONTEXT,
    "@id": id,
    "@type": "ldp:Container",
    "ldp:contains": members,
});

const fixture = (): Containers => ({
    organizations: container("https://data.test/organizations/", [
        {
            "@id": "https://data.test/organizations/6/",
            "@type": "dfc-b:Organization",
            "dfc-b:name": "Blackdown Hills Orchard",
            "dfc-b:hasDescription": "Pasture-fed livestock.",
            "dfc-b:email": "hello@blackdown.example",
            "dfc-b:logo": null,
            "dfc-b:hasAddress": container("https://data.test/organizations/6/addresses/", [
                { "@id": "https://data.test/enterprise_addresses/5/", "@type": "dfc-b:Address" },
            ]),
            "dfc-b:supplies": container("https://data.test/organizations/6/supplied_products/", [
                { "@id": "https://data.test/supplied_products/14/", "@type": "dfc-b:SuppliedProduct" },
                { "@id": "https://data.test/supplied_products/15/", "@type": "dfc-b:SuppliedProduct" },
            ]),
        },
    ]),
    addresses: container("https://data.test/organization_addresses/", [
        {
            "@id": "https://data.test/enterprise_addresses/5/",
            "@type": "dfc-b:Address",
            "dfc-b:city": "Bath",
            "dfc-b:latitude": "51.46762",
            "dfc-b:longitude": "-2.38335",
            "dfc-b:postcode": "BA2A 8DB",
        },
    ]),
    products: container("https://data.test/supplied_products/", [
        { "@id": "https://data.test/supplied_products/14/", "@type": "dfc-b:SuppliedProduct", "dfc-b:name": "Sourdough Loaf" },
        { "@id": "https://data.test/supplied_products/15/", "@type": "dfc-b:SuppliedProduct", "dfc-b:name": "Strawberries" },
    ]),
});

describe("mapOrganizations", () => {
    it("joins addresses and products by @id and maps to Enterprise", () => {
        const [enterprise] = mapOrganizations(fixture()).map((org) => Enterprise.fromData(org));

        expect(enterprise.name).toBe("Blackdown Hills Orchard");
        expect(enterprise.profileId).toBe("6");
        expect(enterprise.email).toBe("hello@blackdown.example");
        expect(enterprise.logoUrl).toBe("");
        expect(enterprise.addresses).toHaveLength(1);
        expect(enterprise.addresses[0].city).toBe("Bath");
        expect(enterprise.addresses[0].lnglat).toEqual({ lng: -2.38335, lat: 51.46762 });
        expect(enterprise.products.map((p) => p.name).sort()).toEqual(["Sourdough Loaf", "Strawberries"]);
        expect(enterprise.products[0].enterpriseName).toBe("Blackdown Hills Orchard");
    });

    it("reads @value objects and arrays as literals", () => {
        const data = fixture();
        const [org] = (data.organizations as { "ldp:contains": Record<string, unknown>[] })["ldp:contains"];
        org["dfc-b:name"] = [{ "@value": "Blackdown Hills Orchard", "@language": "en" }];
        org["dfc-b:hasPhoneNumber"] = { "@value": 1234 };

        const [organization] = mapOrganizations(data);
        expect(organization.name).toBe("Blackdown Hills Orchard");
        expect(organization.phone).toBe("1234");
    });

    it("uses records embedded in place, and drops stubs it cannot resolve", () => {
        const data = fixture();
        const [org] = (data.organizations as { "ldp:contains": Record<string, unknown>[] })["ldp:contains"];
        org["dfc-b:supplies"] = container("https://data.test/organizations/6/supplied_products/", [
            { "@id": "https://data.test/supplied_products/99/", "@type": "dfc-b:SuppliedProduct", "dfc-b:name": "Embedded Jam" },
            { "@id": "https://data.test/supplied_products/404/", "@type": "dfc-b:SuppliedProduct" },
        ]);

        const [organization] = mapOrganizations(data);
        expect(organization.products.map((p) => p.name)).toEqual(["Embedded Jam"]);
    });

    it("ignores members of the wrong type and tolerates missing containers", () => {
        const data = fixture();
        (data.organizations as { "ldp:contains": unknown[] })["ldp:contains"].push({
            "@id": "https://data.test/people/1/",
            "@type": "dfc-b:Person",
            "dfc-b:name": "Not an organisation",
        });

        expect(mapOrganizations(data)).toHaveLength(1);
        expect(mapOrganizations({ organizations: null, addresses: undefined, products: {} })).toEqual([]);
    });
});
