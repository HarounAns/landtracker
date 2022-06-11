const AWS = require('aws-sdk');
const {
    LANDTRACKER_TABLENAME,
    INACTIVE_LANDTRACKER_TABLENAME
} = require('../config');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

module.exports.putActiveZpidsForUser = async (activeZpids, username) => {
    const params = {
        TableName: LANDTRACKER_TABLENAME,
        Item: {
            PK: 'USER',
            SK: username,
            activeZpids
        }
    };
    await dynamoDb.put(params).promise();
}

module.exports.getActiveZpidsForUser = async (username) => {
    const { Item: { activeZpids } } = await dynamoDb.get({
        TableName: LANDTRACKER_TABLENAME,
        Key: {
            PK: `USER`,
            SK: username
        },
    }).promise();
    return activeZpids;
}

// will create an item with a new createdTs SK
module.exports.insertNewZillowItemsForUser = async (items, username) => {
    username = username.toLowerCase();

    for (const item of items) {
        const params = {
            TableName: LANDTRACKER_TABLENAME,
            Item: {
                PK: `FEED#${username}`,
                SK: new Date().toISOString(),
                username,
                ...item,
            }
        };
        await dynamoDb.put(params).promise();
    }
}

module.exports.getUsersFeed = async (username, ExclusiveStartKey) => {
    username = username.toLowerCase();

    let hasNext = false;
    const params = {
        TableName: LANDTRACKER_TABLENAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": `FEED#${username}`
        },
        ScanIndexForward: false,
        ExclusiveStartKey
    }

    const res = await dynamoDb.query(params).promise();
    const {
        Items,
        LastEvaluatedKey: nextKey
    } = res;
    if (nextKey) {
        hasNext = true;
    }
    return {
        feed: Items,
        hasNext,
        nextKey
    };
}

module.exports.getUsersInactiveFeed = async (username, ExclusiveStartKey) => {
    username = username.toLowerCase();

    let hasNext = false;
    const params = {
        TableName: INACTIVE_LANDTRACKER_TABLENAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": `FEED#${username}`
        },
        Limit: 20,
        ScanIndexForward: false,
        ExclusiveStartKey
    }

    const res = await dynamoDb.query(params).promise();
    const {
        Items,
        LastEvaluatedKey: nextKey
    } = res;
    if (nextKey) {
        hasNext = true;
    }
    return {
        feed: Items,
        hasNext,
        nextKey
    };
}

module.exports.insertInactiveZillowItemsForUser = async (items, username) => {
    username = username.toLowerCase();

    for (const item of items) {
        try {
            const params = {
                TableName: INACTIVE_LANDTRACKER_TABLENAME,
                Item: {
                    ...item,
                    PK: `FEED#${username}`,
                    SK: new Date().toISOString(),
                    username,
                }
            };
            await dynamoDb.put(params).promise();
            console.info(`Inserted ${item.zpid} into ${INACTIVE_LANDTRACKER_TABLENAME}`);
        } catch (error) {
            console.error(`Error inserting inactive item ${item.zpid}`, error);
        }
    }
}

module.exports.removeInactiveZillowItemsForUserFromActiveTable = async (items, username) => {
    username = username.toLowerCase();

    for (const item of items) {
        try {
            const { PK, SK, zpid } = item;
            const params = {
                TableName: LANDTRACKER_TABLENAME,
                Key: {
                    PK,
                    SK,
                }
            };
            await dynamoDb.delete(params).promise();
            console.info(`Deleted ${zpid} from ${LANDTRACKER_TABLENAME}`);
        } catch (error) {
            console.error(`Error removing inactive item for ${item.zpid}`, error);
        }
    }
}

module.exports.insertItems = async (items) => {
    for (const Item of items) {
        const params = {
            TableName: LANDTRACKER_TABLENAME,
            Item
        };
        await dynamoDb.put(params).promise();
    }
}