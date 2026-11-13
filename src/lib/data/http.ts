import { DATA_HOST } from "$app/env/public";
import { Enterprise } from "$lib/models/enterprise";
import { fetchOrganizations } from "./ld/fetch";
import type { OrganizationData } from "./ld/mapping";
import { createOrganizationCache } from "./cache";
import type { EnterpriseSource, Fetch } from ".";

function toEnterprises(organizations: OrganizationData[]): Enterprise[] {
    return organizations
        .map((organization) => Enterprise.fromData(organization))
        .filter((enterprise) => enterprise.name);
}

export class LdpEnterpriseSource implements EnterpriseSource {
    private cache = createOrganizationCache(DATA_HOST);

    cached(): Enterprise[] | null {
        const organizations = this.cache.read();
        return organizations ? toEnterprises(organizations) : null;
    }

    async fetchEnterprises(fetcher: Fetch = globalThis.fetch): Promise<Enterprise[]> {
        const organizations = await fetchOrganizations(DATA_HOST, fetcher);
        this.cache.write(organizations);
        return toEnterprises(organizations);
    }
}
