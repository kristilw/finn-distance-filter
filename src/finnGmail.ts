import { config } from "./config";
import { Observable, merge } from "rxjs";
import { flatMap, tap } from "rxjs/operators";
import { FinnTripResult } from "./model";
import { HTML } from "./html";
const cheerioApi: CheerioAPI = require('cheerio');

const supression = 'Andre annonser vi tror du vil like';

interface GmailMeta {
    id: string;
}

export function getUrlsFromFinn(auth, gmail): Observable<string> {
    return getLabelIdForFinnCrawlerLabel(gmail, config.finnSearchGmailLabel).pipe(
        flatMap((labelId) =>
            getMailsFromFinn(gmail, auth, config.finnSearchGmailLabel, 50).pipe(
                flatMap((mailList) =>
                    merge(...mailList.map((mailMeta) => getFinnUrlsFromMail(gmail, auth, mailMeta, labelId).pipe(tap(console.log)))
                )
            )
        ))
    );
}

function getLabelIdForFinnCrawlerLabel(gmail, labelName: string): Observable<string> {
    return new Observable<string>((observable) => {
        gmail.users.labels.list({userId: 'me'}, (err, response) => {
            if (err) {
                observable.error(err);
            }
            const id = response.data.labels.find((l) => l.name === labelName).id;
            if (id) {
                observable.next(id);
            } else {
                observable.error("not able to find label id for finn crawler!");
            }
            observable.complete();
        });
    });
}

function getMailsFromFinn(gmail, auth, label, maxResults = 50000): Observable<Array<GmailMeta>> {
    return new Observable((observable) => {
        gmail.users.messages.list({
            auth: auth,
            userId: 'me',
            q: 'label:' + label,
            maxResults: maxResults
        }, function (err, response) {
            if (err) {
                observable.error(err);
            } else {
                if (response.data.messages === undefined || response.data.messages.length === 0) {
                    console.log("Did not find any new mails from Finn.no");
                } else {
                    console.log("found " + response.data.messages.length + " new mails from finn");
                    observable.next(response.data.messages);
                }
            }
            observable.complete();
        });
    });
}

function getFinnUrlsFromMail(gmail, auth, mailMeta: GmailMeta, finnCrawlerLabelId: string): Observable<string> {
    return new Observable((observable) => {
        gmail.users.messages.get({
            userId: 'me',
            id: mailMeta.id,
            auth,
            format: 'full'
        }, (err, response) => {
            if (err) {
                observable.error(err);
            }

            const msg = response.data.payload.parts.find((p) => p.mimeType === 'text/html').body.data;
            const buff = Buffer.from(msg, 'base64');

            const mailContent = buff.toString('ascii');
            let [_, htmlContent] = mailContent.match(new RegExp(".*(<html.*</html>).*", "s"));

            if(htmlContent.includes(supression)) {
                const [_, b, a] = htmlContent.match(new RegExp("(.*)" + supression + "(.*)", "s"));
                const a_fixed = a.replace(new RegExp("(<a.*</a>)", "gs"), '');
                htmlContent = b + a_fixed;
            }


            const html = cheerioApi.load(htmlContent);
            const searchResults = html.root().find("table").find("table>tbody>tr").find("a");

            searchResults.toArray()
                .map((aElement) => aElement?.attribs?.href)
                .filter((href) => !!href)
                .filter((href) => href.includes("www.finn.no/ad.html?finnkode="))
                .filter((e, i, l) => l.indexOf(e) === i)
                .forEach((href) => observable.next(href))

            gmail.users.messages.modify({
                userId: 'me',
                id: mailMeta.id,
                removeLabelIds: finnCrawlerLabelId
            }, (err, response) => {
                if (err) {
                    console.log(response);
                    console.log("was not able to remove label from mail! " + mailMeta.id);
                    console.error(err);
                }
            });

            observable.complete();
        });
    })
}

export function forwardTrips(gmail, auth, finnTripResults: Array<FinnTripResult>): void {
    if (finnTripResults.length === 0) {
        console.log("no new finn results, will not send email");
        return;
    }

    let msg = '<h2>Finn crawler results:</h2>';
    finnTripResults.forEach((result) => {
        function inMinutes(seconds) {
            return Math.ceil(seconds / 60) + "min";
        }

        msg += HTML.div(
            HTML.a(result.ad.url, HTML.h3(result.ad.address)),
            ...result.ad.facts.map((fact) => HTML.span(HTML.b(fact.key + ':') + ' ' + fact.value)  + HTML.lineBreak),
            HTML.lineBreak,
            HTML.table(
                HTML.tr(
                    result.trips.map((trip) =>
                        HTML.th(
                            trip.to.address + ': ' + inMinutes(trip.duration)
                        )
                    ).join('')
                ) +
                HTML.tr(
                    result.trips.map((trip) =>
                        HTML.td(
                            HTML.ul(
                                ...trip.legs.map((leg) =>
                                    leg.mode + (leg.line ? " line " + leg.line.publicCode : "") + " - " + inMinutes(leg.duration))
                            )
                        )
                    ).join('')
                )
            )
        )
    });

    gmail.users.messages.send({
        auth,
        userId: "me",
        resource: {
          raw: createEmail(
            config.forwardResultsToMail,
            config.finnCrawlerMail,
            "Finn trip custom search result",
            msg
          )
        }
    }, (err, _) => {
        if (err) {
            console.log("not able to forward mail!");
            console.error(err);
        } else {
            console.log("mail forwarded sucessfully");
        }
    });
}

function createEmail(to, from, subject, message) {
    let email = [
        "Content-Type: text/html; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');
  
    return Base64.encodeURI(email);
}