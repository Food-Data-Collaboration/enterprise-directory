import { createContext } from "svelte";
import { FilterState } from "$lib/models/filter_state.svelte";
import { Enterprise } from '$lib/models/enterprise';
import type { DfcEnterprise, LdpContainer } from "$lib/models/dfc";
import type { Tabs } from "./tabs";

export class DirectoryState {
    enterprises = $state<Enterprise[]>([]);
    selectedEnterprise = $state<Enterprise | null>();
    isLoading = $state(true);
    showFilters = $state(false);
    filters = $state(new FilterState());
    activeTab = $state<Tabs>("Map");
    isTabbed = $state(true);

    init(promise: Promise<Response>) {
        this.isLoading = true;

        promise.then(async (response) => {
            const json: LdpContainer<DfcEnterprise> = await response.json();
            this.enterprises = (json["ldp:contains"] ?? [])
                .map((data) => Enterprise.fromJSON(data))
                .filter((e) => e.name);
        }).catch((err) => {
            console.error("Data load failed:", err);
        }).finally(() => this.isLoading = false);
    }
}

export const [getDirectoryState, setDirectoryState] = createContext<DirectoryState>();
