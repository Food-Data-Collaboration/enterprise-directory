import type { Tabs } from "./tabs";


export const DISPLAY_MODES = ["tabbed", "stacked", "map", "directory"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];
export const DEFAULT_DISPLAY_MODE: DisplayMode = "tabbed";

function isDisplayMode(value: string): value is DisplayMode {
    return (DISPLAY_MODES as readonly string[]).includes(value);
}

export function parseDisplayMode(
    value: string | null | undefined,
    fallback: DisplayMode,
): DisplayMode {
    const normalised = value?.trim().toLowerCase();
    if (!normalised) return fallback;
    if (isDisplayMode(normalised)) return normalised;

    console.warn(
        `Unknown display mode "${value}", using "${fallback}". Expected one of: ${DISPLAY_MODES.join(", ")}.`,
    );
    return fallback;
}

export interface Layout {
    showMap: boolean;
    showDirectory: boolean;
}

export function layoutFor(mode: DisplayMode): Layout {
    return {
        showMap: mode !== "directory",
        showDirectory: mode !== "map",
    };
}

export function tabsFor(mode: DisplayMode, productsEnabled: boolean): Tabs[] {
    if (mode === "map") return [];

    const lists: Tabs[] = productsEnabled ? ["Directory", "Product"] : ["Directory"];
    const tabs: Tabs[] = mode === "tabbed" ? ["Map", ...lists] : lists;

    return tabs.length > 1 ? tabs : [];
}

export function resolveTab(activeTab: Tabs, mode: DisplayMode, productsEnabled: boolean): Tabs {
    if (mode === "map") return "Map";

    const tabs = tabsFor(mode, productsEnabled);
    if (tabs.includes(activeTab)) return activeTab;
    return mode === "tabbed" ? "Map" : "Directory";
}

export interface Responsive<T> {
    desktop: T;
    mobile: T;
}

export interface ModeView extends Layout {
    mode: DisplayMode;
    tabs: Tabs[];
    visibleTab: Tabs;
    mapVisible: boolean;
    directoryVisible: boolean;
}

export function viewFor(mode: DisplayMode, activeTab: Tabs, productsEnabled: boolean): ModeView {
    const { showMap, showDirectory } = layoutFor(mode);
    const visibleTab = resolveTab(activeTab, mode, productsEnabled);
    const shared = mode === "tabbed";

    return {
        mode,
        tabs: tabsFor(mode, productsEnabled),
        visibleTab,
        showMap,
        showDirectory,
        mapVisible: showMap && (!shared || visibleTab === "Map"),
        directoryVisible: showDirectory && (!shared || visibleTab !== "Map"),
    };
}
