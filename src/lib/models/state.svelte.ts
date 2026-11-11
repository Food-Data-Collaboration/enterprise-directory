import { createContext } from "svelte";
import { FilterState } from "$lib/models/filter_state.svelte";
import type { Enterprise } from '$lib/models/enterprise';
import type { Tabs } from "./tabs";
import { analytics } from "$lib/analytics";
import type { Product } from "./product";

export class DirectoryState {
    enterprises = $state<Enterprise[]>([]);
    products = $state<Product[]>([]);
    selectedEnterprise = $state<Enterprise | null>(null);
    isLoadingEnterprises = $state(true);
    showFilters = $state(false);
    filters = $state(new FilterState());
    activeTab = $state<Tabs>("Directory");
    isTabbed = $state(true);

    init(promise: Promise<Enterprise[]>) {
        this.isLoadingEnterprises = true;

        promise
            .then((enterprises) => {
                this.enterprises = enterprises;
                this.products = enterprises.flatMap((e) => e.products);
            })
            .catch((error: Error) => {
                analytics.catch(error);
            })
            .finally(() => this.isLoadingEnterprises = false);
    }
}

export const [getDirectoryState, setDirectoryState] = createContext<DirectoryState>();
