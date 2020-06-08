const cheerioApi: CheerioAPI = require('cheerio');
const requstPromise = require('request-promise');

import createEnturService from '@entur/sdk'

import { map, concatMap, reduce, delay, tap } from 'rxjs/operators'
import { Observable } from 'rxjs/internal/Observable';
import { FinnTripResult, Address, TripPatternWithAddresses, FinnAdData } from './model';
import { from, concat } from 'rxjs';

const enTurService = createEnturService({clientName: 'get-trip-time'});

const factKeys = [
    'Totalpris',
    'Boligtype',
    'Primærrom',
    'Tomteareal',
    'Byggeår'
];

const enturApiDelay_ms = 500;

export function getTrips(urls: Array<string>, toList: Array<Address>): Observable<FinnTripResult> {
    return concat(...urls.map((url) => getTrip(url, toList)));
}

function getTrip(url: string, toList: Array<Address>): Observable<FinnTripResult> {
    return from(requstPromise(url)).pipe(
        map((response: string) => {
            const html = cheerioApi.load(response);
            const address = getAddressFromFinnAd(html);
            const [latitude, longitude] = getCoordinatesFromFinnAd(html);
            const facts = factKeys.map((factKey) => ({ key: factKey, value: getValue(response, factKey)}))

            return <FinnAdData> {
                url,
                facts,
                address,
                lat: +latitude,
                lon: +longitude
            };
        }),
        concatMap((ad) =>
            concat(...toList.map((toAddress) => findShortestTripFromTo(ad, toAddress).pipe(delay(enturApiDelay_ms))))
            .pipe(
                reduce((a, b) => { a.push(b); return a }, new Array<TripPatternWithAddresses>()),
                map((trips) => ({ trips, ad}))
            )
        )
    );
}

function getFinnAd(html: CheerioStatic): Cheerio {
    return html.root().find(".pageholder").find("div > div.grid > div");
}

function getAddressFromFinnAd(html: CheerioStatic): string {
    return getFinnAd(html).find("section.panel > p.u-caption").first().text();
}

function getCoordinatesFromFinnAd(html: CheerioStatic): [string, string] {
    const images = getFinnAd(html).find('img');
    const mapImg = images.toArray().find((img) => {
        if (img.attribs) {
            const src = img.attribs.src;
            return src && src.includes("maptiles.finncdn.no");
        }
        return false;
    })

    const [_, latitude, longitude] = mapImg.attribs.src.match(new RegExp(".*lat=([0-9\.]*)&lng=([0-9\.]*)"))
    return [latitude, longitude];
}

function getValue(html: string, value: string): string {
    const result = html.match(new RegExp('<dt> *' + value + ' *<\/dt>[\n ]*<dd>(.{1,50})<\/dd>', 's'));
    if (result) {
        return result[1];
    } else {
        console.log("Not able to find " + value);
        return 'klarte ikke hente ut verdi'
    }
}

function findShortestTripFromTo(fromAddress: Address, toAddress: Address): Observable<TripPatternWithAddresses>  {
    return from(
        enTurService.getTripPatterns(
        {
            from: {
                name: fromAddress.address,
                coordinates: {
                    latitude: fromAddress.lat,
                    longitude: fromAddress.lon
                },
            },
            to: {
                name: toAddress.address,
                coordinates: {
                    latitude: toAddress.lat,
                    longitude: toAddress.lon
                }
            },
            searchDate: new Date('2020-08-18 6:00Z'),
        }
    )).pipe(
        map((trips) => [...trips].sort((a, b) => a.duration - b.duration)[0]),
        map((trip) => ({ ...trip, from: fromAddress, to: toAddress })),
        tap((trip) => console.log("shortest path between " + fromAddress.address + " and " + toAddress.address + ": " + trip.duration))
    )
}
