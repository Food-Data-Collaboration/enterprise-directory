// Web component stand-in for $lib/data/organizations_worker: the worker is inlined as
// a blob: URL, which has the host page's origin, so it can start from a cross-origin
// script where a worker file next to the bundle could not.
import OrganizationsWorker from '$lib/data/organizations.worker?worker&inline';

export function createOrganizationsWorker(): Worker {
	return new OrganizationsWorker();
}
