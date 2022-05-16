const areaVibes = require("../helpers/areaVibesClient");

const properties = [
    { address: '4318 Mission Ct, Alexandria, VA, 22310', expectedLivabiltyScore: 79 },
    { address: '12713 Old Marlboro Pike, Upper Marlboro, MD', expectedLivabiltyScore: 75 },
    { address: '12110 Brandywine Rd, Brandywine, MD, ', expectedLivabiltyScore: 53 },
];


const test_getLivabilityScoreForFullAddress = async () => {
    for (const { address, expectedLivabiltyScore } of properties) {
        const livabiltyScore = await areaVibes.getLivabilityScoreForFullAddress(address);
        if (livabiltyScore !== expectedLivabiltyScore) {
            throw `test_getLivabilityScoreForFullAddress: Expected liviability score of ${expectedLivabiltyScore}. Got ${livabiltyScore}`;
        }
    }
}

const test_addLivabilityScoresToZillowItems = async () => {
    const mockItems = [
        {
            zpid: '0001',
            address: {
                streetAddress: '4318 Mission Ct',
                city: 'Alexandria',
                state: 'VA',
                zipcode: '22310'
            },
            expectedLivabiltyScore: 79
        },
        {
            zpid: '0002',
            address: {
                streetAddress: '12713 Old Marlboro Pike',
                city: 'Upper Marlboro',
                state: 'MD'
            },
            expectedLivabiltyScore: 75
        },
        {
            zpid: '0003',
            address: {
                streetAddress: '12110 Brandywine Rd',
                city: 'Brandywine',
                state: 'MD',
            },
            expectedLivabiltyScore: 53
        },
    ];
    await areaVibes.addLivabilityScoresToZillowItems(mockItems);

    for (const { expectedLivabiltyScore, livabilityScore } of mockItems) {
        if (expectedLivabiltyScore !== livabilityScore) {
            throw `test_addLivabilityScoresToZillowItems: Expected liviability score of ${expectedLivabiltyScore}. Got ${livabiltyScore}`;
        }
    }
}

const main = async () => {
    try {
        await test_getLivabilityScoreForFullAddress();
        await test_addLivabilityScoresToZillowItems();
        console.info('\nAll tests passed!');
    } catch (error) {
        console.error(error);
    }
}

main();