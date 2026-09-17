import { DATA_HOST } from "$app/env/public";
import type { EnterpriseSource, Fetch } from ".";

export class HttpEnterpriseSource implements EnterpriseSource {
    fetchEnterprises(fetcher: Fetch = globalThis.fetch): Promise<Response> {
        return fetcher(`${DATA_HOST}/enterprises/`);
    }
}
