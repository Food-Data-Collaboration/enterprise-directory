export class FilterState {
    postcode: string | null = $state(null);
    delivery: boolean = $state(false);
    collection: boolean = $state(false);
    radius: number = $state(25);
    categories: string[] = $state([]);
    certifications: string[] = $state([]);

    public reset() {
        this.postcode = null;
        this.delivery = false;
        this.collection = false;
        this.radius = 25;
        this.categories = [];
        this.certifications = [];
    }
}