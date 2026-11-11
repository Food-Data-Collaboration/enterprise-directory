import { USE_DUMMY_DATA } from "$app/env/public";
import type { Enterprise } from "$lib/models/enterprise";
import { LdkitEnterpriseSource } from "./http";
import { DummyEnterpriseSource } from "./dummy";

export type Fetch = typeof globalThis.fetch;

export interface EnterpriseSource {
    fetchEnterprises(fetcher?: Fetch): Promise<Enterprise[]>;
}

export const enterpriseSource: EnterpriseSource =
    USE_DUMMY_DATA === "true" ? new DummyEnterpriseSource() : new LdkitEnterpriseSource();
