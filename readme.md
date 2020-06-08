# Finn distance-filter

## Dependencies
To enable usage of the gmail api you need to generate a `credentials.json` file. You can get it from https://developers.google.com/gmail/api/quickstart/nodejs by clicking the button "Enable the Gmail API". Save file `credentials.json` in the root folder of the project.

Install npm dependencies with `npm i` (node is required, install Node from https://nodejs.org/en/download/ if you do not have it)

## Before you can run the program

### Gmail account

Set up a new gmail account. Forward emails from Finn.no to the new gmail account OR create a new account at Finn.no using the gmail account and turn on email notifications.

### Create a label for emails from Finn.no

The Finn distance-filter works by looking for mails with a custom label. Create such a label for all incomming emails from Finn.no (https://support.google.com/mail/thread/13836359?hl=en)

### Set up a config for your distance filter

Open src/config.ts and set the following properties:
* finnSearchGmailLabel - the gmail label you created to mark emails from Finn.no
* forwardResultsToMail - email address you want to forward the results to
* filters - set your filters using an adress name, lat/lon coordinates, and the maximum duration (in seconds) of the trip to this address.

## To run the program
`node start`

First time you run the program you will be asked to sign in to your gmail account. Just follow instructions.
