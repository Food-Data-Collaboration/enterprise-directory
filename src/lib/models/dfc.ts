export interface LdpContainer<T> {
    "@id"?: string;
    "ldp:contains"?: T[];
}

export interface DfcAddress {
    "@id"?: string;
    "dfc-b:hasCity"?: string;
    "dfc-b:hasCountry"?: string;
    "dfc-b:hasPostalCode"?: string;
    "dfc-b:hasStreet"?: string;
    "dfc-b:region"?: string;
    "dfc-b:latitude"?: number | string;
    "dfc-b:longitude"?: number | string;
}

export interface DfcEnterprise {
    "@id"?: string;
    "dfc-b:name"?: string;
    "dfc-b:hasDescription"?: string;
    "dfc-b:logo"?: string;
    "dfc-b:hasAddress"?: LdpContainer<DfcAddress>;
}
