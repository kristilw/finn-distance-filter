import { config } from "./config";
import { getUrlsFromFinn, forwardTrips } from "./finnGmail";
import { filter, reduce, concatMap } from "rxjs/operators";
import { getTrips } from "./finnCrawler";
import { FinnFilter, FinnTripResult } from "./model";

require('js-base64');
const AuthFetcher = require('./googleAPIWrapper');

function forwardRelevantMail(auth, gmail): void {
    getUrlsFromFinn(auth, gmail).pipe(
        concatMap((url) => getTrips([url], config.filters)),
        filter((finnTripResult) => isWithinReach(finnTripResult, config.filters)),
        reduce((a, b) => { a.push(b); return a}, new Array<FinnTripResult>()),
    ).subscribe((relevantFinnTripResults) => forwardTrips(gmail, auth, relevantFinnTripResults));
}

function isWithinReach(finnTripResult: FinnTripResult, finnFilters: Array<FinnFilter>): boolean {
    return finnTripResult.trips.every((trip) => {
        const filter = finnFilters.find((filter) => filter.address === trip.from.address);
        return filter ? trip.duration < filter.maxDurationSeconds : true;
    });
}

AuthFetcher.getAuthAndGmail(forwardRelevantMail);

