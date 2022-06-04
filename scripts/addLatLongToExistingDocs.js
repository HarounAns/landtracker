const dynamo = require('../helpers/dynamoInterface');
const zillow = require('../helpers/scrapeZillow');


const { USERNAME } = require('../config');

const main = async () => {
    // assumes all documents fit in a single dynamo page
    const { feed } = await dynamo.getUsersFeed(USERNAME);
    const zillowItems = await zillow.getItemsForZpids(feed.map(({ zpid }) => zpid));

    console.info(`Getting Lat/Long for ${feed.length} Existing Items`);
    for (const i in feed) {
        if (feed[i].zpid !== zillowItems[i].zpid) {
            throw new Error(`Mismatch in zpids. Feed: ${feed[i].zpid} - Zillow: ${zillowItems[i].zpid}`);
        }

        const { latitude, longitude } = zillowItems[i];
        feed[i].latitude = latitude;
        feed[i].longitude = longitude;
    }

    console.info('\nUpdating Lat/Long Existing Items');
    await dynamo.insertItems(feed);
    console.info(`Successfully updated ${feed.length} items`);

}

main();