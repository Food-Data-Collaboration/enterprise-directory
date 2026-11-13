// Runs the RDF pipeline (fetch, JSON-LD parse, Comunica query) off the main thread.
// One request per worker: http.ts terminates it after the reply to free the engine.
import { fetchOrganizations } from "./ldkit/fetch";
import type { OrganizationData } from "./ldkit/schemas";

export interface OrganizationsRequest {
    dataHost: string;
}

export type OrganizationsResponse =
    | { ok: true; organizations: OrganizationData[] }
    | { ok: false; message: string };

// The project's TS lib is DOM, not WebWorker; this is the slice of the worker scope we use.
const scope = self as unknown as {
    onmessage: ((event: MessageEvent<OrganizationsRequest>) => void) | null;
    postMessage(message: OrganizationsResponse): void;
};

scope.onmessage = async ({ data }) => {
    try {
        const organizations = await fetchOrganizations(data.dataHost);
        scope.postMessage({ ok: true, organizations });
    } catch (error) {
        scope.postMessage({
            ok: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
