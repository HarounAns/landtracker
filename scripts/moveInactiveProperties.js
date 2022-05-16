const dynamo = require('../helpers/dynamoInterface');
const { USERNAME } = require('../config');

const main = async () => {
    const activeZpids = await dynamo.getActiveZpidsForUser(USERNAME);

    // assumes all documents fit in a single dynamo page
    const { feed } = await dynamo.getUsersFeed(USERNAME);

    const inactiveItems = feed.filter(({ zpid }) => !activeZpids.includes(zpid));
    console.log('inactive zpids');
    console.log(inactiveItems.map(({ zpid }) => zpid));

    // move to new table
    await dynamo.insertInactiveZillowItemsForUser(inactiveItems, USERNAME);

    // delete items from table
    await dynamo.removeInactiveZillowItemsForUserFromActiveTable(inactiveItems, USERNAME);
}

main();