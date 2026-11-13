import { Address } from "$lib/models/address";
import type { OrganizationData } from "$lib/data/ld/mapping";
import { Product } from "./product";

export class Enterprise {
    id: string = "";
    name: string = "";
    addresses: Address[] = [];
    products: Product[] = [];
    description: string = "";
    profileId: string = "";
    categories: string[] = ["Bakery", "Pastries", "Bread"];
    logoUrl: string = "";
    images: string[] = [];
    website: string = "";
    email: string = "";
    phone: string = "";
    csa: string = "";

    static fromData(data: OrganizationData, images: string[] = []): Enterprise {
        const enterprise = new Enterprise();

        if (!data.name)
            return enterprise;

        enterprise.id = data.$id;
        enterprise.name = data.name;
        enterprise.description = data.description ?? "";
        enterprise.website = data.website ?? "";
        enterprise.email = data.email ?? "";
        enterprise.phone = data.phone ?? "";
        enterprise.logoUrl = data.logo ?? "";
        enterprise.addresses = data.addresses.map((address) => Address.fromData(address));
        enterprise.images = images;

        if (URL.canParse(enterprise.id))
            enterprise.profileId = new URL(enterprise.id).pathname
                .split("/")
                .filter(Boolean)
                .pop() ?? "";

        enterprise.products = data.products.map((product) =>
            Product.fromData(product, enterprise.profileId, enterprise.name),
        );
        return enterprise;
    }
}
