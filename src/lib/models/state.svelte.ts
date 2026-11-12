import { createContext } from "svelte";
import { FilterState } from "$lib/models/filter_state.svelte";
import type { Enterprise } from '$lib/models/enterprise';
import type { Tabs } from "./tabs";
import { analytics } from "$lib/analytics";
import type { Product } from "./product";
import type { MapView } from "$lib/map/enterprise_map";

export class DirectoryState {
    enterprises = $state<Enterprise[]>([]);
    products = $state<Product[]>([]);
    selectedEnterprise = $state<Enterprise | null>(null);
    isLoadingEnterprises = $state(true);
    showFilters = $state(false);
    filters = $state(new FilterState());
    activeTab = $state<Tabs>("Directory");
    isTabbed = $state(true);
    // Not reactive: only read when the map mounts, so it survives route changes.
    mapView: MapView | null = null;

    init(promise: Promise<Enterprise[]>, cached: Enterprise[] | null = null) {
        if (cached?.length) {
            this.enterprises = cached;
            this.products = cached.flatMap((e) => e.products);
        }

        this.isLoadingEnterprises = !cached?.length;

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
