import { Enterprise } from "$lib/models/enterprise";
import { ukEnterprises } from "./uk_enterprises";
import type { EnterpriseSource } from ".";

export class DummyEnterpriseSource implements EnterpriseSource {
    fetchEnterprises(): Promise<Enterprise[]> {
        return Promise.resolve(
            ukEnterprises.map(({ data, images }) => Enterprise.fromData(data, images))
        );
    }
}
