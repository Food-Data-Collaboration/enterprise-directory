import { createNamespace } from "ldkit";

// The sioldata JSON-LD context (https://cdn.startinblox.com/owl/context.jsonld)
// does not define the `dfc-b` prefix, so RDF parsers read "dfc-b:name" as an
// absolute IRI with the scheme `dfc-b:`. Match that literally. If the server
// fixes its context, change `iri`/`prefix` to the DFC Business Ontology IRI.
export const dfcb = createNamespace({
    iri: "dfc-b:",
    prefix: "dfc-b:",
    terms: [
        "Organization",
        "Address",
        "SuppliedProduct",
        "name",
        "hasDescription",
        "logo",
        "hasAddress",
        "supplies",
        "city",
        "hasCountry",
        "postcode",
        "street",
        "region",
        "latitude",
        "longitude",
        "description",
        "hasType",
        "Image",
        "URL",
    ],
} as const);

// ldkit/namespaces has no LDP namespace. Spell out the full IRI as the prefix
// so the terms expand to absolute IRIs.
export const ldp = createNamespace({
    iri: "http://www.w3.org/ns/ldp#",
    prefix: "http://www.w3.org/ns/ldp#",
    terms: ["contains"],
} as const);
