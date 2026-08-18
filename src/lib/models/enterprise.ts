import { Address } from "$lib/models/address";
import type { DfcEnterprise } from "$lib/models/dfc";

export class Enterprise {
    id: string = "";
    name: string = "";
    addresses: Address[] = [];
    description: string = "";
    profileId: string = "";
    categories: string[] = ["Bakery", "Pastries", "Bread"];
    logoUrl: string = "";
    images: string[] = [];

    static fromJSON(data: DfcEnterprise): Enterprise {
        const enterprise = new Enterprise();

        if (!data["dfc-b:name"])
            return enterprise;

        enterprise.id = data["@id"] ?? "";
        enterprise.name = data["dfc-b:name"];
        enterprise.description = data["dfc-b:hasDescription"] ?? "";
        enterprise.logoUrl = data["dfc-b:logo"] ?? "";
        enterprise.addresses = (data["dfc-b:hasAddress"]?.["ldp:contains"] ?? [])
            .map((address) => Address.fromJSON(address));
        const id = enterprise.id?.slice(-3).replaceAll('/', '1') ?? "";
        enterprise.images = [`https://picsum.photos/seed/x${id}/1500/800`, `https://picsum.photos/seed/y${id}/800/800`];

        if (URL.canParse(enterprise.id))
            enterprise.profileId = new URL(enterprise.id).pathname
                .split("/")
                .filter(Boolean)
                .pop() ?? "";

        return enterprise;
    }
}