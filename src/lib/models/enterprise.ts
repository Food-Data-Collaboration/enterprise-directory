import { Address } from "$lib/models/address";
import type { OrganizationData } from "$lib/data/ldkit/schemas";
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

    static fromLdkit(data: OrganizationData, images: string[] = []): Enterprise {
        const enterprise = new Enterprise();

        if (!data.name)
            return enterprise;

        enterprise.id = data.$id;
        enterprise.name = data.name;
        enterprise.description = data.description ?? "";
        enterprise.logoUrl = data.logo ?? "";
        enterprise.addresses = (data.hasAddress?.contains ?? [])
            .map((address) => Address.fromLdkit(address));
        enterprise.images = images;

        if (URL.canParse(enterprise.id))
            enterprise.profileId = new URL(enterprise.id).pathname
                .split("/")
                .filter(Boolean)
                .pop() ?? "";

        enterprise.products = (data.supplies?.contains ?? [])
            .map((product) => Product.fromLdkit(product, enterprise.profileId, enterprise.name));
        return enterprise;
    }
}
