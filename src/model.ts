import { TripPattern } from "@entur/sdk";

export interface FinnTripResult {
    trips: Array<TripPatternWithAddresses>
    ad: FinnAdData;
}

export interface FinnAdData extends Address {
    url: string;
    facts: Array<
        {
            key: string,
            value: string
        }>
}

export interface TripPatternWithAddresses extends TripPattern {
    to: Address;
    from: Address;
}

export interface FinnFilter extends Address {
    maxDurationSeconds: number;
}

export interface Address {
    address: string;
    lat: number;
    lon: number;
}
