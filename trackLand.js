/**
 * Searches properties in my custom dmv map box which has greater than 1/2 acre of land
 */

const zillow = require("./helpers/scrapeZillow");
const dynamo = require("./helpers/dynamoInterface");
const twilio = require("./helpers/twilioClient");
const areaVibes = require("./helpers/areaVibesClient");
const { USERNAME } = require('./config');


module.exports.handler = async () => {
  // get fresh data from zillow scraper
  const zillowZpids = await zillow.getZillowZpidsForSearch();

  // get current records for user
  const activeZpids = await dynamo.getActiveZpidsForUser(USERNAME);

  const oldZpids = activeZpids.filter(z => !zillowZpids.includes(z));
  const newZpids = zillowZpids.filter(z => !activeZpids.includes(z));

  console.info('old', oldZpids);
  console.info('new', newZpids);

  // get items for zillow for new zpids
  if (newZpids.length) {
    const zillowItems = await zillow.getItemsForZpids(newZpids);
    console.info(`Found items for ${zillowItems.length} new properties`);

    // add livability scores to Dynamo items here
    await areaVibes.addLivabilityScoresToZillowItems(zillowItems);

    // add items to Dynamo
    await dynamo.insertNewZillowItemsForUser(zillowItems, USERNAME);

    // async send text message
    twilio.sendSMS(zillowItems.length);
  }

  // put active zpids in Dynamo for user
  await dynamo.putActiveZpidsForUser(zillowZpids, USERNAME);

  // TODO: add handling deactivating old zpids
  if (oldZpids.length) {
    const { feed } = await dynamo.getUsersFeed(USERNAME);
    const inactiveItems = feed.filter(({ zpid }) => oldZpids.includes(zpid));
    console.info(`Found items for ${inactiveItems.length} inactive properties`);

    // move to new table
    await dynamo.insertInactiveZillowItemsForUser(inactiveItems, USERNAME);

    // delete items from table
    await dynamo.removeInactiveZillowItemsForUserFromActiveTable(inactiveItems, USERNAME);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        newZpids,
        oldZpids
      }
    ),
  };
};
