import Supercluster from "supercluster";
import type { Enterprise } from "$lib/models/enterprise";
import { mappableEnterprises, type LngLat } from "./config";

export type MapItem =
    | { kind: "enterprise"; key: string; enterprise: Enterprise; lnglat: LngLat }
    | { kind: "cluster"; key: string; clusterId: number; count: number; lnglat: LngLat };

type PointProps = { enterprise: Enterprise };

const WORLD: [number, number, number, number] = [-180, -85, 180, 85];

export class EnterpriseClusters {
    readonly #index: Supercluster<PointProps>;

    constructor(options: { radius: number; maxZoom: number }) {
        this.#index = new Supercluster<PointProps>(options);
    }

    load(enterprises: Enterprise[]): void {
        this.#index.load(
            mappableEnterprises(enterprises).map(({ enterprise, lnglat }) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [lnglat.lng, lnglat.lat] },
                properties: { enterprise },
            })),
        );
    }

    itemsAt(zoom: number): MapItem[] {
        return this.#index.getClusters(WORLD, Math.floor(zoom)).map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            const lnglat = { lng, lat };
            const props = feature.properties;

            if ("cluster" in props && props.cluster) {
                return {
                    kind: "cluster",
                    key: `cluster:${props.cluster_id}`,
                    clusterId: props.cluster_id,
                    count: props.point_count,
                    lnglat,
                };
            }

            const { enterprise } = props as PointProps;
            return { kind: "enterprise", key: `enterprise:${enterprise.id}`, enterprise, lnglat };
        });
    }

    expansionZoom(clusterId: number): number {
        return this.#index.getClusterExpansionZoom(clusterId);
    }
}
