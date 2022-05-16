const dynamo = require('../helpers/dynamoInterface');
const areaVibes = require("../helpers/areaVibesClient");

const { USERNAME } = require('../config');

const main = async () => {
    // assumes all documents fit in a single dynamo page
    const { feed } = await dynamo.getUsersFeed(USERNAME);

    console.info(`Getting Livability Scores for ${feed.length} Existing Items`);
    for (const item of feed) {
        const {
            address: {
                streetAddress,
                city,
                state,
                zipcode
            }
        } = item;
        const fullAddress = `${streetAddress}, ${city}, ${state}, ${zipcode}`;
        try {
            const livabilityScore = await areaVibes.getLivabilityScoreForFullAddress(fullAddress);
            item.livabilityScore = livabilityScore;
        } catch (error) {
            console.error(`Error: Couldn't get livability score for ${fullAddress}`, error.message);
        }
    }

    console.info('\nUpdating Livability Scores for Existing Items');
    await dynamo.insertItems(feed);
    console.info(`Successfully updated ${feed.length} items`);

}

main();