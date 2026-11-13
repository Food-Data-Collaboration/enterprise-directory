// Creates the organisations worker from its own file. The web component build swaps
// this module for src/web-component/organizations_worker.web-component.ts, which
// inlines the worker: the element is served cross-origin and workers must be same-origin.
export function createOrganizationsWorker(): Worker {
    return new Worker(new URL("./organizations.worker.ts", import.meta.url), { type: "module" });
}
