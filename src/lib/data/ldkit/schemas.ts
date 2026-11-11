import type { SchemaInterface } from "ldkit";
import { dfcb, ldp } from "./namespaces";

export const AddressSchema = {
    "@type": dfcb.Address,
    street: { "@id": dfcb.street, "@optional": true },
    city: { "@id": dfcb.city, "@optional": true },
    region: { "@id": dfcb.region, "@optional": true },
    postcode: { "@id": dfcb.postcode, "@optional": true },
    country: { "@id": dfcb.hasCountry, "@optional": true },
    // Served as strings, e.g. "51.46762"
    latitude: { "@id": dfcb.latitude, "@optional": true },
    longitude: { "@id": dfcb.longitude, "@optional": true },
} as const;

export const ProductSchema = {
    "@type": dfcb.SuppliedProduct,
    name: dfcb.name,
    description: { "@id": dfcb.description, "@optional": true },
    type: { "@id": dfcb.hasType, "@optional": true },
    image: { "@id": dfcb.Image, "@optional": true },
    url: { "@id": dfcb.URL, "@optional": true },
} as const;

// Organisations only hold `{@id, @type}` stubs for their addresses and
// products, inside LDP containers. The full records are in the flat
// /organization_addresses/ and /supplied_products/ containers, which the lens
// queries as extra sources. Comunica joins them by IRI.
export const OrganizationSchema = {
    "@type": dfcb.Organization,
    name: dfcb.name,
    description: { "@id": dfcb.hasDescription, "@optional": true },
    logo: { "@id": dfcb.logo, "@optional": true },
    hasAddress: {
        "@id": dfcb.hasAddress,
        "@optional": true,
        "@schema": {
            contains: { "@id": ldp.contains, "@array": true, "@schema": AddressSchema },
        },
    },
    supplies: {
        "@id": dfcb.supplies,
        "@optional": true,
        "@schema": {
            contains: { "@id": ldp.contains, "@array": true, "@schema": ProductSchema },
        },
    },
} as const;

export type OrganizationData = SchemaInterface<typeof OrganizationSchema>;
export type AddressData = SchemaInterface<typeof AddressSchema>;
export type ProductData = SchemaInterface<typeof ProductSchema>;
