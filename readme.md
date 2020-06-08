# Finn distance-filter

## Dependencies
You need `credentials.json` before start this utility. You can get it from https://developers.google.com/gmail/api/quickstart/nodejs by enable GMAIL API.
Save file `credentials.json` in the root folder of the project

Install Node from https://nodejs.org/en/download/ then install npm dependencies with

`npm i`

## Before you can run the program

### Gmail account

Set up a new gmail account. Forward email from Finn.no to this gmail account or create a new account at Finn.no and turn on email notifications.

### Create a label for mails from Finn.no

The Finn distance-filter works by looking for mails with a custom label. Create such a label for all incomming emails from Finn.no (https://support.google.com/mail/thread/13836359?hl=en)

### Set up a config for your distance filter

Open src/config.ts and set the following properties:
*"finnSearchGmailLabel": the gmail label you created to mark emails from Finn.no
*"forwardResultsToMail": email address you want to forward the results to
*"filters": set your filters using an adress name and lat/lon coordinates


## To run the program
`node start`

First time you run the program you will be asked to sign in to your gmail account. Just follow instructions.
