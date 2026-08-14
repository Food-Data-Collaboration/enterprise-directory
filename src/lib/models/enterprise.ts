import { Address } from "$lib/models/address";

export class Enterprise {
    id: string = "";
    name: string = "";
    addresses: Address[] = [];
    description: string = "";
    profileUrl: string = "";
    categories: string[] = ["Bakery", "Pastries", "Bread"];
    logoUrl: string = "";
    images: string[] = [];

    static fromJSON(data: any): Enterprise {
        const enterprise = new Enterprise();

        if (!data["dfc-b:name"])
            return enterprise;

        enterprise.id = data["@id"] ?? "";
        enterprise.name = data["dfc-b:name"];
        enterprise.description = data["dfc-b:hasDescription"] ?? "";
        enterprise.logoUrl = data["dfc-b:logo"] ?? "";
        enterprise.addresses = data["dfc-b:hasAddress"]["ldp:contains"]
            .map((address: any) => Address.fromJSON(address)) ?? [];
        const id = enterprise.id?.slice(-3).replaceAll('/', '1') ?? "";
        enterprise.images = [`https://picsum.photos/seed/x${id}}/1500/800`, `https://picsum.photos/seed/y${id}}/800/800`];

        enterprise.profileUrl = new URL(enterprise.id).pathname ?? "";
        if (enterprise.profileUrl.endsWith("/"))
            enterprise.profileUrl = enterprise.profileUrl.slice(0, -1) ?? "";

        return enterprise;
    }
}