import { FilterState } from "$lib/models/filter_state.svelte";
import { Enterprise } from '$lib/models/enterprise';

class SharedUtility {
    enterprises = $state<Enterprise[]>([]);
    selectedEnterprise = $state<Enterprise | null>();
    isLoading = $state(true);
    showFilters = $state(false);
    filters = $state(new FilterState());
    activeTab = $state("Map");
    isTabbed = $state(true);

    init(promise: Promise<any>) {
        this.isLoading = true;

        promise.then(async (data: any) => {
            const json = await data.json();
            this.enterprises = json["ldp:contains"]
                .map(Enterprise.fromJSON)
                .filter((e: Enterprise) => e.name);

            this.isLoading = false;
        }).catch((err) => {
            console.error("Data load failed:", err);
            this.isLoading = false;
        });
    }
}

export const userState = new SharedUtility();
