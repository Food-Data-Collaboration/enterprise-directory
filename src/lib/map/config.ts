import type { Enterprise } from "$lib/models/enterprise";

export type LngLat = { lng: number; lat: number };

export interface MapConfig {
    style: string;
    centre: LngLat;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    bounds?: [LngLat, LngLat];
}

export const MAP_STYLE_URL =
    "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json";

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
        style: MAP_STYLE_URL,
        centre,
        zoom: toNumber(env.MAP_ZOOM),
        minZoom: toNumber(env.MAP_ZOOM_MIN),
        maxZoom: toNumber(env.MAP_ZOOM_MAX),
        bounds: sw && ne ? [sw, ne] : undefined,
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
