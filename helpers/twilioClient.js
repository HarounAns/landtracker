require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const botNum = process.env.TWILIO_BOT_NUMBER;
const myPhoneNumber = process.env.MY_PHONE_NUMBER;
const shortUrl = 'shorturl.at/eghmL';

const client = require("twilio")(accountSid, authToken);
module.exports.sendSMS = async (numProperties) => {
    if (numProperties <= 0) return;

    const propertyString = numProperties === 1 ? 'property' : 'properties';
    const body = `We found ${numProperties} new ${propertyString} based on your search criteria: ${shortUrl}`;
    await client.messages.create({
        from: botNum,
        body,
        to: `+1${myPhoneNumber.replace(/\D/g, "")}`,
    });
    console.info('Text Message queued!');
}