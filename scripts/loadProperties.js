const dynamoDocs = require('../helpers/dynamoDocs.json');
const AWS = require('aws-sdk');
const { LANDTRACKER_TABLENAME } = require('../config');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });


const main = async () => {
    for (const Item of dynamoDocs) {
        const params = {
            TableName: LANDTRACKER_TABLENAME,
            Item
        };
        await dynamoDb.put(params).promise();
        console.info(`Loaded Item PK:${Item.PK} - SK:${Item.SK}`);
    }
}

try {
    main();
} catch (error) {
    console.error(error);
}