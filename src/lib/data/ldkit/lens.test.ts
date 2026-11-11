import { describe, expect, it } from "vitest";
import { createLens } from "ldkit";
import { QueryEngine } from "@comunica/query-sparql-rdfjs-lite";
import { Parser, Store } from "n3";
import { Enterprise } from "$lib/models/enterprise";
import { OrganizationSchema } from "./schemas";

// Mirrors the live sioldata shape: the organisation only references its
// address/product containers, and the full records live elsewhere. The
// literal `dfc-b:` scheme matches what the server's JSON-LD context produces.
const fixture = `
@prefix ldp: <http://www.w3.org/ns/ldp#> .
@prefix b: <dfc-b:> .
@prefix d: <https://data.test/> .

d:organizations\\/ a ldp:Container ; ldp:contains d:organizations\\/6\\/ .
d:organizations\\/6\\/ a b:Organization ;
    b:name "Blackdown Hills Orchard" ;
    b:hasDescription "Pasture-fed livestock." ;
    b:hasAddress d:organizations\\/6\\/addresses\\/ ;
    b:supplies d:organizations\\/6\\/supplied_products\\/ .
d:organizations\\/6\\/addresses\\/ a ldp:Container ; ldp:contains d:enterprise_addresses\\/5\\/ .
d:organizations\\/6\\/supplied_products\\/ a ldp:Container ;
    ldp:contains d:supplied_products\\/14\\/, d:supplied_products\\/15\\/ .

d:enterprise_addresses\\/5\\/ a b:Address ;
    b:city "Bath" ; b:latitude "51.46762" ; b:longitude "-2.38335" ; b:postcode "BA2A 8DB" .
d:supplied_products\\/14\\/ a b:SuppliedProduct ; b:name "Sourdough Loaf" .
d:supplied_products\\/15\\/ a b:SuppliedProduct ; b:name "Strawberries" .
`;

describe("OrganizationSchema lens", () => {
    it("joins addresses and products by IRI and maps to Enterprise", async () => {
        const store = new Store(new Parser().parse(fixture));
        const lens = createLens(OrganizationSchema, {
            engine: new QueryEngine(),
            sources: [store],
        });

        const [enterprise] = (await lens.find()).map((org) => Enterprise.fromLdkit(org));

        expect(enterprise.name).toBe("Blackdown Hills Orchard");
        expect(enterprise.profileId).toBe("6");
        expect(enterprise.addresses).toHaveLength(1);
        expect(enterprise.addresses[0].city).toBe("Bath");
        expect(enterprise.addresses[0].lnglat).toEqual({ lng: -2.38335, lat: 51.46762 });
        expect(enterprise.products.map((p) => p.name).sort()).toEqual(["Sourdough Loaf", "Strawberries"]);
        expect(enterprise.products[0].enterpriseName).toBe("Blackdown Hills Orchard");
    }, 30_000);
});
