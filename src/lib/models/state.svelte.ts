import { FilterState } from "$lib/models/filter_state.svelte";
import type { Tabs } from "./tabs";
import { DATA_URL } from "$app/env/public"
import { Enterprise } from '$lib/models/enterprise';

export const userState: {
    selectedEnterprise: Enterprise | undefined,
    enterprises: Enterprise[],
    showFilters: boolean,
    filters: FilterState,
    activeTab: Tabs,
    isTabbed: boolean
} = $state({
    selectedEnterprise: undefined,
    enterprises: [],
    showFilters: false,
    filters: new FilterState(),
    activeTab: "Map",
    isTabbed: true
});


export async function fetchEnterprises() {
    if (userState.enterprises.length == 0) {
        let enterprises: Enterprise[] = await fetch(`${DATA_URL}/enterprises/`)
            .then(async (e: any) => {
                const data = await e.json();
                return data["ldp:contains"].map(Enterprise.fromJSON);
            });

        userState.enterprises = enterprises;
    }
}