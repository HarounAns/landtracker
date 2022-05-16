const twilio = require("../helpers/twilioClient");

const main = async () => {
    const numProperties = 2;
    await twilio.sendSMS(numProperties);
}

main();