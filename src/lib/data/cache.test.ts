import { afterEach, describe, expect, it, vi } from "vitest";
import { createOrganizationCache, schemaVersion } from "./cache";
import { OrganizationSchema, type OrganizationData } from "./ldkit/schemas";

const PREFIX = "enterprise-directory:organizations:";
const CURRENT = schemaVersion(OrganizationSchema);

const organization: OrganizationData = {
    $id: "https://data.test/organizations/6/",
    name: "Blackdown Hills Orchard",
    description: null,
    email: "test@email.com",
    phone: "+11 2222 3333",
    website: "test.site.com",
    logo: null,
    hasAddress: null,
    supplies: null,
};

function memoryStorage(): Storage {
    const items = new Map<string, string>();
    return {
        get length() { return items.size; },
        clear: () => items.clear(),
        getItem: (key) => items.get(key) ?? null,
        key: (index) => [...items.keys()][index] ?? null,
        removeItem: (key) => void items.delete(key),
        setItem: (key, value) => void items.set(key, value),
    };
}

describe("schemaVersion", () => {
    it("is stable for the same schema", () => {
        expect(schemaVersion(OrganizationSchema)).toBe(schemaVersion(structuredClone(OrganizationSchema)));
    });

    it("changes when a property is added", () => {
        const changed = { ...OrganizationSchema, email: { "@id": "dfc-b:email", "@optional": true } };
        expect(schemaVersion(changed)).not.toBe(CURRENT);
    });

    it("changes when a nested schema changes", () => {
        const changed = structuredClone(OrganizationSchema) as unknown as {
            hasAddress: { "@schema": { contains: { "@schema": { city: { "@optional"?: true } } } } };
        };
        delete changed.hasAddress["@schema"].contains["@schema"].city["@optional"];
        expect(schemaVersion(changed)).not.toBe(CURRENT);
    });
});

describe("createOrganizationCache", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("returns null when localStorage is unavailable (SSR)", () => {
        expect(createOrganizationCache("host").read()).toBeNull();
    });

    it("round-trips organisations per key", () => {
        vi.stubGlobal("localStorage", memoryStorage());
        createOrganizationCache("a").write([organization]);

        expect(createOrganizationCache("a").read()).toEqual([organization]);
        expect(createOrganizationCache("b").read()).toBeNull();
    });

    it("ignores entries with a mismatched version or corrupt JSON", () => {
        const storage = memoryStorage();
        vi.stubGlobal("localStorage", storage);
        const key = `${PREFIX}${CURRENT}:a`;

        storage.setItem(key, JSON.stringify({ version: "old", organizations: [organization] }));
        expect(createOrganizationCache("a").read()).toBeNull();

        storage.setItem(key, "{not json");
        expect(createOrganizationCache("a").read()).toBeNull();
    });

    it("removes entries from other schema versions on write, keeping other hosts", () => {
        const storage = memoryStorage();
        vi.stubGlobal("localStorage", storage);
        storage.setItem(`${PREFIX}oldversion:a`, "stale");
        storage.setItem(`${PREFIX}oldversion:https://other.host`, "stale");
        storage.setItem("unrelated", "keep");
        createOrganizationCache("https://other.host").write([organization]);

        createOrganizationCache("a").write([organization]);

        expect([...Array(storage.length).keys()].map((i) => storage.key(i)).sort()).toEqual([
            `${PREFIX}${CURRENT}:a`,
            `${PREFIX}${CURRENT}:https://other.host`,
            "unrelated",
        ]);
    });

    it("treats a throwing storage as a cache miss", () => {
        const storage = memoryStorage();
        storage.setItem = () => { throw new DOMException("quota", "QuotaExceededError"); };
        storage.getItem = () => { throw new DOMException("denied", "SecurityError"); };
        vi.stubGlobal("localStorage", storage);

        const cache = createOrganizationCache("a");
        expect(() => cache.write([organization])).not.toThrow();
        expect(cache.read()).toBeNull();
    });
});
