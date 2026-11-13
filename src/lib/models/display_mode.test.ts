import { afterEach, describe, expect, it, vi } from "vitest";
import { layoutFor, parseDisplayMode, resolveTab, tabsFor, viewFor } from "./display_mode";

describe("parseDisplayMode", () => {
    afterEach(() => vi.restoreAllMocks());

    it("accepts every mode, ignoring case and whitespace", () => {
        expect(parseDisplayMode("tabbed", "map")).toBe("tabbed");
        expect(parseDisplayMode(" Stacked ", "tabbed")).toBe("stacked");
        expect(parseDisplayMode("MAP", "tabbed")).toBe("map");
        expect(parseDisplayMode("directory", "tabbed")).toBe("directory");
    });

    it("falls back when unset or blank, without warning", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(parseDisplayMode(undefined, "stacked")).toBe("stacked");
        expect(parseDisplayMode(null, "stacked")).toBe("stacked");
        expect(parseDisplayMode("  ", "stacked")).toBe("stacked");
        expect(warn).not.toHaveBeenCalled();
    });

    it("warns and falls back on an unknown value", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(parseDisplayMode("grid", "tabbed")).toBe("tabbed");
        expect(warn).toHaveBeenCalledOnce();
    });
});

describe("layoutFor", () => {
    it("mounts only the views a mode can show", () => {
        expect(layoutFor("tabbed")).toEqual({ showMap: true, showDirectory: true });
        expect(layoutFor("stacked")).toEqual({ showMap: true, showDirectory: true });
        expect(layoutFor("map")).toEqual({ showMap: true, showDirectory: false });
        expect(layoutFor("directory")).toEqual({ showMap: false, showDirectory: true });
    });
});

describe("tabsFor", () => {
    it("offers the map as a tab only when tabbed", () => {
        expect(tabsFor("tabbed", false)).toEqual(["Map", "Directory"]);
        expect(tabsFor("tabbed", true)).toEqual(["Map", "Directory", "Product"]);
    });

    it("keeps list tabs in stacked and directory modes when there is a choice", () => {
        expect(tabsFor("stacked", true)).toEqual(["Directory", "Product"]);
        expect(tabsFor("directory", true)).toEqual(["Directory", "Product"]);
    });

    it("hides the tabs when there is nothing to choose", () => {
        expect(tabsFor("stacked", false)).toEqual([]);
        expect(tabsFor("directory", false)).toEqual([]);
        expect(tabsFor("map", true)).toEqual([]);
    });
});

describe("resolveTab", () => {
    it("keeps the user's tab when the mode offers it", () => {
        expect(resolveTab("Map", "tabbed", false)).toBe("Map");
        expect(resolveTab("Product", "stacked", true)).toBe("Product");
    });

    it("shows the directory when the map tab has no slot", () => {
        expect(resolveTab("Map", "stacked", false)).toBe("Directory");
        expect(resolveTab("Map", "directory", true)).toBe("Directory");
    });

    it("drops the product tab when products are disabled", () => {
        expect(resolveTab("Product", "stacked", false)).toBe("Directory");
        expect(resolveTab("Product", "tabbed", false)).toBe("Map");
    });

    it("is always the map in map mode", () => {
        expect(resolveTab("Directory", "map", true)).toBe("Map");
    });
});

describe("viewFor", () => {
    it("shows one view at a time when tabbed", () => {
        const map = viewFor("tabbed", "Map", false);
        expect(map).toMatchObject({ mapVisible: true, directoryVisible: false, visibleTab: "Map" });

        const list = viewFor("tabbed", "Directory", false);
        expect(list).toMatchObject({ mapVisible: false, directoryVisible: true });
    });

    it("shows both when stacked, whatever tab was picked", () => {
        expect(viewFor("stacked", "Map", false)).toMatchObject({
            mapVisible: true,
            directoryVisible: true,
            visibleTab: "Directory",
            tabs: [],
        });
    });

    it("shows only the chosen view in single modes", () => {
        expect(viewFor("map", "Directory", true)).toMatchObject({
            showDirectory: false,
            mapVisible: true,
            directoryVisible: false,
        });
        expect(viewFor("directory", "Map", true)).toMatchObject({
            showMap: false,
            mapVisible: false,
            directoryVisible: true,
            visibleTab: "Directory",
        });
    });
});
