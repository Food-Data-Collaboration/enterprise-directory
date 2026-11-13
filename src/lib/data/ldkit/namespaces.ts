import type { createNamespace as ldkitCreateNamespace } from "ldkit";

// ldkit's own createNamespace, re-implemented: importing anything at runtime from
// "ldkit" pulls the whole library (n3, SPARQL, Buffer shims) into the main bundle,
// and the schema is needed there for the cache version. The type keeps ldkit's typing.
const createNamespace: typeof ldkitCreateNamespace = (spec) =>
    Object.assign(
        Object.fromEntries(spec.terms.map((term) => [term, `${spec.iri}${term}`])),
        { $prefix: spec.prefix, $iri: spec.iri },
    ) as ReturnType<typeof ldkitCreateNamespace<typeof spec>>;

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
        "email",
        "websitePage",
        "hasPhoneNumber",
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
