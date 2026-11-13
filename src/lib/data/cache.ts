import { MAPPING, type OrganizationData } from "./ld/mapping";

const PREFIX = "enterprise-directory:organizations:";

// FNV-1a (32-bit). Not cryptographic, just a stable short fingerprint.
function fnv1a(input: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}

export function schemaVersion(schema: object): string {
    return fnv1a(JSON.stringify(schema));
}

// Derived from the mapping, so any change to what is read invalidates old entries.
const VERSION = schemaVersion(MAPPING);

interface CacheEntry {
    version: string;
    savedAt: number;
    organizations: OrganizationData[];
}

// localStorage can be missing (SSR) or throw (privacy modes, sandboxed
// iframes, quota). The cache is an optimisation, so every failure is a miss.
function storage(): Storage | null {
    try {
        return typeof localStorage === "undefined" ? null : localStorage;
    } catch {
        return null;
    }
}

// Drop entries written under any other schema version (all hosts).
function removeStaleVersions(store: Storage): void {
    const current = `${PREFIX}${VERSION}:`;
    const stale: string[] = [];

    for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key?.startsWith(PREFIX) && !key.startsWith(current))
            stale.push(key);
    }

    stale.forEach((key) => store.removeItem(key));
}

export function createOrganizationCache(key: string) {
    const storageKey = `${PREFIX}${VERSION}:${key}`;

    return {
        read(): OrganizationData[] | null {
            try {
                const raw = storage()?.getItem(storageKey);
                if (!raw) return null;

                const entry: CacheEntry = JSON.parse(raw);
                return entry.version === VERSION && Array.isArray(entry.organizations)
                    ? entry.organizations
                    : null;
            } catch {
                return null;
            }
        },

        write(organizations: OrganizationData[]): void {
            try {
                const store = storage();
                if (!store) return;

                removeStaleVersions(store);

                const entry: CacheEntry = { version: VERSION, savedAt: Date.now(), organizations };
                store.setItem(storageKey, JSON.stringify(entry));
            } catch {
                // Quota exceeded or storage unavailable: skip caching.
            }
        },
    };
}
