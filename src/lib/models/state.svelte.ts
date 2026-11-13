import { createContext } from "svelte";
import { MediaQuery } from "svelte/reactivity";
import { BREAKPOINT_MEDIUM } from "$lib/styles/breakpoints";
import { FilterState } from "$lib/models/filter_state.svelte";
import type { Enterprise } from '$lib/models/enterprise';
import type { Tabs } from "./tabs";
import { analytics } from "$lib/analytics";
import type { Product } from "./product";
import type { MapView } from "$lib/map/enterprise_map";
import { DISPLAY_MODE, DISPLAY_MODE_MOBILE, ENABLE_PRODUCTS } from "$app/env/public";
import {
    DEFAULT_DISPLAY_MODE,
    parseDisplayMode,
    viewFor,
    type DisplayMode,
    type ModeView,
    type Responsive,
} from "./display_mode";

const PRODUCTS_ENABLED = ENABLE_PRODUCTS === "true";

export class DirectoryState {
    enterprises = $state<Enterprise[]>([]);
    products = $state<Product[]>([]);
    selectedEnterprise = $state<Enterprise | null>(null);
    isLoadingEnterprises = $state(true);
    hasFetchedEnterprises = $state(false);
    showFilters = $state(false);
    filters = $state(new FilterState());
    activeTab = $state<Tabs>("Directory");
    mapView: MapView | null = null;

    displayMode = $state<DisplayMode>(DEFAULT_DISPLAY_MODE);
    displayModeMobile = $state<DisplayMode>(DEFAULT_DISPLAY_MODE);

    constructor() {
        this.configureDisplay();
    }

    configureDisplay(mode?: string | null, mobileMode?: string | null): void {
        this.displayMode = parseDisplayMode(
            mode,
            parseDisplayMode(DISPLAY_MODE, DEFAULT_DISPLAY_MODE),
        );
        const mobileFallback = parseDisplayMode(DISPLAY_MODE_MOBILE, this.displayMode);
        this.displayModeMobile = parseDisplayMode(mobileMode, mobileFallback);
    }

    readonly views: Responsive<ModeView> = $derived({
        desktop: viewFor(this.displayMode, this.activeTab, PRODUCTS_ENABLED),
        mobile: viewFor(this.displayModeMobile, this.activeTab, PRODUCTS_ENABLED),
    });
    readonly current: ModeView = $derived(this.isMobile ? this.views.mobile : this.views.desktop);
    readonly mode: DisplayMode = $derived(this.current.mode);
    readonly tabs: Tabs[] = $derived(this.current.tabs);
    readonly visibleTab: Tabs = $derived(this.current.visibleTab);

    readonly #viewportIsMobile = new MediaQuery(`(width < ${BREAKPOINT_MEDIUM}px)`, false);
    #containerWidth = $state<number | null>(null);
    get isMobile(): boolean {
        return this.#containerWidth === null
            ? this.#viewportIsMobile.current
            : this.#containerWidth < BREAKPOINT_MEDIUM;
    }

    observeContainer(element: Element): () => void {
        this.#containerWidth = element.getBoundingClientRect().width;
        const observer = new ResizeObserver(([entry]) => {
            this.#containerWidth = entry.contentRect.width;
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
            this.#containerWidth = null;
        };
    }

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
            .finally(() => {
                this.isLoadingEnterprises = false;
                this.hasFetchedEnterprises = true;
            });
    }
}

export const [getDirectoryState, setDirectoryState] = createContext<DirectoryState>();
