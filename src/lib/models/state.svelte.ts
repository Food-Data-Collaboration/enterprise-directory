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

        // This resolves in the background and won't block rendering
        promise.then((resolvedData) => {
            this.enterprises = resolvedData;
            this.isLoading = false;
        }).catch((err) => {
            console.error("Data load failed:", err);
            this.isLoading = false;
        });
    }
}

export const userState = new SharedUtility();
