const { USERNAME, headers } = require('./config');
const dynamo = require("./helpers/dynamoInterface");


module.exports.handler = async (event) => {
    const ExclusiveStartKey = event.queryStringParameters && JSON.parse(event.queryStringParameters.nextKey);
    const { username  } = event.pathParameters;
    
    try {
        // TODO: handle other users
        if (username !== USERNAME) 
            throw new Error(`Only supporting single user ${USERNAME}`);

        const { feed, nextKey, hasNext } = await dynamo.getUsersFeed(USERNAME, ExclusiveStartKey);
        return {
            statusCode: 200,
            body: JSON.stringify({
                feed,
                hasNext,
                nextKey
            }),
            headers,
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: error.statusCode || 501,
            headers: {
                ...headers,
                'Content-Type': 'text/plain'
            },
            body: `Couldn\'t fetch Feed for ${USERNAME}`,
        };
    }
}