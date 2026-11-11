import { DATA_HOST } from "$app/env/public";
import { createLens } from "ldkit";
import { Store } from "n3";
import { JsonLdParser } from "jsonld-streaming-parser";
import type { IDocumentLoader, IJsonLdContext } from "jsonld-context-parser";
import type { QueryEngine } from "@comunica/query-sparql-rdfjs-lite";
import { Enterprise } from "$lib/models/enterprise";
import { OrganizationSchema, type OrganizationData } from "./ldkit/schemas";
import { createOrganizationCache } from "./cache";
import type { EnterpriseSource, Fetch } from ".";

const CONTAINERS = ["organizations", "organization_addresses", "supplied_products"];
const KNOWN_CONTEXTS = ["https://cdn.startinblox.com/owl/context.jsonld"];

let engine: Promise<QueryEngine> | null = null;

function getEngine(): Promise<QueryEngine> {
    engine ??= import("@comunica/query-sparql-rdfjs-lite").then(
        ({ QueryEngine }) => new QueryEngine()
    );
    return engine;
}

function createDocumentLoader(fetcher: Fetch): IDocumentLoader & { preload(url: string): void } {
    const contexts = new Map<string, Promise<IJsonLdContext>>();

    const load = (url: string) => {
        let context = contexts.get(url);

        if (!context) {
            context = fetcher(url, { headers: { Accept: "application/ld+json" } }).then((response) => {
                if (!response.ok)
                    throw new Error(`Failed to fetch JSON-LD context ${url}: ${response.status}`);
                return response.json();
            });
            context.catch(() => contexts.delete(url));
            contexts.set(url, context);
        }

        return context;
    };

    return { load, preload: (url) => void load(url).catch(() => { }) };
}

async function fetchJsonLd(fetcher: Fetch, url: string): Promise<string> {
    const response = await fetcher(url, { headers: { Accept: "application/ld+json" } });

    if (!response.ok)
        throw new Error(`Failed to fetch ${url}: ${response.status}`);

    return response.text();
}

function parseInto(store: Store, json: string, baseIRI: string, documentLoader: IDocumentLoader): Promise<void> {
    return new Promise((resolve, reject) => {
        const parser = new JsonLdParser({ baseIRI, documentLoader });

        parser.on("data", (quad) => store.addQuad(quad));
        parser.on("error", reject);
        parser.on("end", resolve);
        parser.write(json);
        parser.end();
    });
}

export async function fetchOrganizations(fetcher: Fetch = globalThis.fetch): Promise<OrganizationData[]> {
    const documentLoader = createDocumentLoader(fetcher);
    KNOWN_CONTEXTS.forEach((url) => documentLoader.preload(url));

    const urls = CONTAINERS.map((path) => `${DATA_HOST}/${path}/`);
    const [documents, queryEngine] = await Promise.all([
        Promise.all(urls.map((url) => fetchJsonLd(fetcher, url))),
        getEngine(),
    ]);

    const store = new Store();
    await Promise.all(documents.map((json, index) => parseInto(store, json, urls[index], documentLoader)));

    const organizations = createLens(OrganizationSchema, { engine: queryEngine, sources: [store] });

    return organizations.find({ take: 1000 });
}

function toEnterprises(organizations: OrganizationData[]): Enterprise[] {
    return organizations
        .map((organization) => Enterprise.fromLdkit(organization))
        .filter((enterprise) => enterprise.name);
}

export class LdkitEnterpriseSource implements EnterpriseSource {
    private cache = createOrganizationCache(DATA_HOST);

    cached(): Enterprise[] | null {
        const organizations = this.cache.read();
        return organizations ? toEnterprises(organizations) : null;
    }

    async fetchEnterprises(fetcher: Fetch = globalThis.fetch): Promise<Enterprise[]> {
        const organizations = await fetchOrganizations(fetcher);
        this.cache.write(organizations);
        return toEnterprises(organizations);
    }
}
