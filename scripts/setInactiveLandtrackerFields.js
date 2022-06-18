const dynamo = require('../helpers/dynamoInterface');
const zillow = require('../helpers/scrapeZillow');


const { USERNAME, INACTIVE_LANDTRACKER_TABLENAME } = require('../config');

const main = async () => {
    // assumes all documents fit in a single dynamo page
    const inactiveItems = await dynamo.getAllInactiveItemsForUser(USERNAME);
    const zillowItems = await zillow.getItemsForZpids(inactiveItems.map(({ zpid }) => zpid));

    const updatedInactiveItems = [];
    zillowItems.map((
        {
            zpid,
            // priceHistory,
            homeStatus,
        }
    ) => {
        const inactiveItem = inactiveItems.find(({ zpid: _zpid }) => zpid === _zpid);
        updatedInactiveItems.push({
            ...inactiveItem,
            // priceHistory,
            homeStatus,
        })
    })

    dynamo.insertItems(updatedInactiveItems, INACTIVE_LANDTRACKER_TABLENAME);
}

main();