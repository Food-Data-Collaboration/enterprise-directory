import type { AddressData } from "$lib/data/ld/mapping";

export class Address {
    id: string = "";
    city: string = "";
    country: string = "";
    postcode: string = "";
    street: string = "";
    lnglat: { lng: number, lat: number } | null = null;
    region: string = "";
    formatted = "";

    static fromData(data: AddressData): Address {
        const address = new Address();

        address.id = data.$id;
        address.city = data.city ?? "";
        address.country = data.country ?? "";
        address.postcode = data.postcode ?? "";
        address.street = data.street ?? "";
        address.region = data.region ?? "";
        address.formatted = `${address.street}${address.street ? ',' : ''} ${address.city}${address.city ? ',' : ''} ${address.region} ${address.postcode}`;

        const lng = Address.toCoordinate(data.longitude);
        const lat = Address.toCoordinate(data.latitude);

        if (lng !== null && lat !== null)
            address.lnglat = { lng, lat }

        return address;
    }

    static toCoordinate(value: number | string | null | undefined): number | null {
        if (value === undefined || value === null || value === "")
            return null;

        const coordinate = Number(value);

        return Number.isFinite(coordinate) ? coordinate : null;
    }
}
