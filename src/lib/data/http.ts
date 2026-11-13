import { DATA_HOST } from "$app/env/public";
import { Enterprise } from "$lib/models/enterprise";
import type { OrganizationData } from "./ldkit/schemas";
import type { OrganizationsRequest, OrganizationsResponse } from "./organizations.worker";
import { createOrganizationCache } from "./cache";
import { createOrganizationsWorker } from "$lib/data/organizations_worker";
import type { EnterpriseSource } from ".";

/** Fetch and map the organisations in a worker; the RDF stack never loads on the main thread. */
function fetchOrganizations(dataHost: string): Promise<OrganizationData[]> {
    const worker = createOrganizationsWorker();

    return new Promise<OrganizationData[]>((resolve, reject) => {
        worker.onmessage = ({ data }: MessageEvent<OrganizationsResponse>) => {
            if (data.ok) resolve(data.organizations);
            else reject(new Error(data.message));
        };
        worker.onerror = (event) => {
            event.preventDefault();
            reject(new Error(event.message || "Organisations worker failed"));
        };
        worker.postMessage({ dataHost } satisfies OrganizationsRequest);
    }).finally(() => worker.terminate());
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

    async fetchEnterprises(): Promise<Enterprise[]> {
        const organizations = await fetchOrganizations(DATA_HOST);
        this.cache.write(organizations);
        return toEnterprises(organizations);
    }
}
