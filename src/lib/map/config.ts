import type { Enterprise } from "$lib/models/enterprise";

export type LngLat = { lng: number; lat: number };

export interface TileSource {
    url: string;
    attribution: string;
    maxZoom: number;
}

export interface MapConfig {
    tiles: TileSource;
    centre: LngLat;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    bounds?: [LngLat, LngLat];
    clusterRadius: number;
    clusterMaxZoom: number;
}

/** Standard OpenStreetMap raster tiles; see https://operations.osmfoundation.org/policies/tiles/ */
export const OSM_TILES: TileSource = {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
};

const DEFAULT_CLUSTER_RADIUS = 60;
const DEFAULT_CLUSTER_MAX_ZOOM = 14;

type Env = Record<string, string | undefined>;

function toNumber(value: string | undefined): number | undefined {
    if (value === undefined || value.trim() === "") return undefined;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function toLngLat(lng: string | undefined, lat: string | undefined): LngLat | undefined {
    const parsedLng = toNumber(lng);
    const parsedLat = toNumber(lat);
    if (parsedLng === undefined || parsedLat === undefined) return undefined;
    return { lng: parsedLng, lat: parsedLat };
}

export function parseMapConfig(env: Env): MapConfig {
    const centre = toLngLat(env.MAP_CENTRE_LNG, env.MAP_CENTRE_LAT);
    if (!centre) throw new Error("MAP_CENTRE_LNG and MAP_CENTRE_LAT must be numbers");

    const sw = toLngLat(env.MAP_BOUND_SW_LNG, env.MAP_BOUND_SW_LAT);
    const ne = toLngLat(env.MAP_BOUND_NE_LNG, env.MAP_BOUND_NE_LAT);

    return {
        tiles: OSM_TILES,
        centre,
        zoom: toNumber(env.MAP_ZOOM),
        minZoom: toNumber(env.MAP_ZOOM_MIN),
        maxZoom: toNumber(env.MAP_ZOOM_MAX),
        bounds: sw && ne ? [sw, ne] : undefined,
        clusterRadius: toNumber(env.MAP_CLUSTER_RADIUS) ?? DEFAULT_CLUSTER_RADIUS,
        clusterMaxZoom: toNumber(env.MAP_CLUSTER_MAX_ZOOM) ?? DEFAULT_CLUSTER_MAX_ZOOM,
    };
}

export function mappableEnterprises(
    enterprises: Enterprise[],
): { enterprise: Enterprise; lnglat: LngLat }[] {
    return enterprises.flatMap((enterprise) => {
        const lnglat = enterprise.addresses[0]?.lnglat;
        return lnglat ? [{ enterprise, lnglat }] : [];
    });
}
