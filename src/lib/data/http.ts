import { DATA_HOST } from "$app/env/public";
import { createLens } from "ldkit";
import type { QueryEngine } from "@comunica/query-sparql";
import { Enterprise } from "$lib/models/enterprise";
import { OrganizationSchema } from "./ldkit/schemas";
import type { EnterpriseSource, Fetch } from ".";

let engine: Promise<QueryEngine> | null = null;

// Comunica is large. Load it only on first use, so the dummy-data path and the
// initial bundle don't pay for it. Keep one engine per process/page.
function getEngine(): Promise<QueryEngine> {
    engine ??= import("@comunica/query-sparql").then(({ QueryEngine }) => new QueryEngine());
    return engine;
}

export class LdkitEnterpriseSource implements EnterpriseSource {
    async fetchEnterprises(fetcher: Fetch = globalThis.fetch): Promise<Enterprise[]> {
        const organizations = createLens(OrganizationSchema, {
            engine: await getEngine(),
            sources: [
                `${DATA_HOST}/organizations/`,
                `${DATA_HOST}/organization_addresses/`,
                `${DATA_HOST}/supplied_products/`,
            ],
            fetch: fetcher,
        });

        const data = await organizations.find({ take: 1000 });

        return data
            .map((organization) => Enterprise.fromLdkit(organization))
            .filter((enterprise) => enterprise.name);
    }
}
