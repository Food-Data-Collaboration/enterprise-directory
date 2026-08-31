import { createContext } from "svelte";
import { FilterState } from "$lib/models/filter_state.svelte";
import { Enterprise } from '$lib/models/enterprise';
import type { DfcEnterprise, LdpContainer } from "$lib/models/dfc";
import type { Tabs } from "./tabs";

export class DirectoryState {
    enterprises = $state<Enterprise[]>([]);
    selectedEnterprise = $state<Enterprise | null>(null);
    isLoadingEnterprises = $state(true);
    showFilters = $state(false);
    filters = $state(new FilterState());
    activeTab = $state<Tabs>("Directory");
    isTabbed = $state(true);

    init(promise: Promise<Response>) {
        this.isLoadingEnterprises = true;

        promise.then(async (response) => {
            const json: LdpContainer<DfcEnterprise> = await response.json();
            this.enterprises = (json["ldp:contains"] ?? [])
                .map((data) => Enterprise.fromJSON(data))
                .filter((e) => e.name) ?? [new Enterprise()];
        }).finally(() => this.isLoadingEnterprises = false);
    }
}

export const [getDirectoryState, setDirectoryState] = createContext<DirectoryState>();
