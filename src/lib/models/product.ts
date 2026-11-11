import type { ProductData } from "$lib/data/ldkit/schemas";

export class Product {
    id: string = "";
    name: string = "";
    description: string = "";
    type: string = "";
    image: string = "";
    url: string = "";
    profileId: string = "";
    enterpriseId: string = "";
    enterpriseName: string = "";

    static fromLdkit(data: ProductData, enterpriseId: string, enterpriseName: string): Product {
        const product = new Product();

        if (!data.name)
            return product;

        product.id = data.$id;
        product.name = data.name;
        product.description = data.description ?? "";
        product.type = data.type ?? "";
        product.image = data.image ?? "";
        product.url = data.url ?? "";
        product.enterpriseId = enterpriseId;
        product.enterpriseName = enterpriseName;

        if (URL.canParse(product.id)) {
            product.profileId = new URL(product.id).pathname
                .split("/")
                .filter(Boolean)
                .pop() ?? "";
        }

        return product;
    }
}
