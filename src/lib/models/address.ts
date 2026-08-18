import type { DfcAddress } from "$lib/models/dfc";

export class Address {
    id: string = "";
    city: string = "";
    country: string = "";
    postalCode: string = "";
    street: string = "";
    lnglat: { lng: number, lat: number } | null = null;
    region: string = "";
    formatted = "";

    static fromJSON(data: DfcAddress): Address {
        const address = new Address();

        address.id = data["@id"] ?? "";
        address.city = data["dfc-b:hasCity"] ?? "";
        address.country = data["dfc-b:hasCountry"] ?? "";
        address.postalCode = data["dfc-b:hasPostalCode"] ?? "";
        address.street = data["dfc-b:hasStreet"] ?? "";
        address.region = data["dfc-b:region"] ?? "";
        address.formatted = `${address.city}, ${address.region} ${address.postalCode}`;
        const lng = Address.toCoordinate(data["dfc-b:longitude"]);
        const lat = Address.toCoordinate(data["dfc-b:latitude"]);
        if (lng !== null && lat !== null)
            address.lnglat = { lng, lat }

        return address;
    }

    static toCoordinate(value: number | string | undefined): number | null {
        if (value === undefined || value === "") return null;

        const coordinate = Number(value);
        return Number.isFinite(coordinate) ? coordinate : null;
    }
}
