const dynamo = require('../helpers/dynamoInterface');
const zillow = require("../helpers/scrapeZillow");

const { USERNAME } = require('../config');

const main = async () => {
    // assumes all documents fit in a single dynamo page
    const inactiveItems = await dynamo.getAllInactiveItemsForUser(USERNAME);
    const zpids = inactiveItems.map(({zpid}) => zpid);
    await zillow.getItemsForZpids(zpids);
    console.log('zpids');
    console.log(zpids);

    // console.info('\nUpdating Livability Scores for Existing Items');
    // await dynamo.insertItems(feed);
    // console.info(`Successfully updated ${feed.length} items`);

}

main();