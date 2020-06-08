import { FinnFilter } from "./model";

export const config = {
    finnSearchGmailLabel: 'finn-crawler',
    finnCrawlerMail: 'me',
    forwardResultsToMail: 'my.actual@email.com',
    filters: [
        <FinnFilter> { address: "Address 1", lat: 59.912305, lon: 10.734814, maxDurationSeconds: 60 * 30},
        <FinnFilter> { address: "Address 2", lat: 59.914685, lon: 10.750883, maxDurationSeconds: 2134 }
    ]
}