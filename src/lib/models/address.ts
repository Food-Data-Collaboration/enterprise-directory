export class Address {
    id: string = "";
    city: string = "";
    country: string = "";
    postalCode: string = "";
    street: string = "";
    lnglat: { lng: number, lat: number } | null = null;
    region: string = "";
    formatted = "";

    static fromJSON(data: any): Address {
        const address = new Address();

        address.id = data["@id"] ?? "";
        address.city = data["dfc-b:hasCity"] ?? "";
        address.country = data["dfc-b:hasCountry"] ?? "";
        address.postalCode = data["dfc-b:hasPostalCode"] ?? "";
        address.street = data["dfc-b:hasStreet"] ?? "";
        address.region = data["dfc-b:region"] ?? "";
        address.formatted = `${address.city}, ${address.region} ${address.postalCode}` || "Default Address";
        const lng = data["dfc-b:longitude"] ?? "";
        const lat = data["dfc-b:latitude"] ?? "";
        if (!!lng && !!lat)
            address.lnglat = { lng: data["dfc-b:longitude"], lat: data["dfc-b:latitude"] }

        return address;
    }
}