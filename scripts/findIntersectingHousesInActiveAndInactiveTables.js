const dynamo = require('../helpers/dynamoInterface');

const { USERNAME } = require('../config');

const main = async () => {
    const inactiveItems = await dynamo.getAllInactiveItemsForUser(USERNAME);
    const inactiveZpids = inactiveItems.map(({ zpid }) => zpid);

    const { feed: activeItems } = await dynamo.getUsersFeed(USERNAME);
    const activeZpids = activeItems.map(({ zpid }) => zpid);

    const intersection = inactiveZpids.filter(z => activeZpids.includes(z));
    console.log('intersection');
    console.log(intersection);

}

main();