import { ukEnterprises } from "./uk_enterprises";
import type { EnterpriseSource } from ".";

export class DummyEnterpriseSource implements EnterpriseSource {
    fetchEnterprises(): Promise<Response> {
        return Promise.resolve(
            new Response(JSON.stringify(ukEnterprises), {
                headers: { "content-type": "application/json" }
            })
        );
    }
}
