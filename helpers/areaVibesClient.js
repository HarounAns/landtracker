const axios = require('axios');
const HTMLParser = require('node-html-parser');

const _getLivabilityScoreForFullAddress = async (fullAddress) => {
    const [streetAddress, city, state] = fullAddress.split(', ');

    const { data } = await axios.get(`https://www.areavibes.com/${encodeURIComponent(city)}-${state.toLowerCase()}/`, {
        params: {
            'addr': streetAddress.toLowerCase()
        },
        headers: {
            'authority': 'www.areavibes.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-US,en;q=0.9',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        }
    });

    const root = HTMLParser.parse(data);
    const livabilityScore = parseInt(root.querySelector('.hero-liv-score').innerText);
    console.info(`Found livability score of ${livabilityScore} for ${fullAddress}`);
    return livabilityScore;
}

module.exports.getLivabilityScoreForFullAddress = async (fullAddress) => {
    return _getLivabilityScoreForFullAddress(fullAddress);
}

module.exports.addLivabilityScoresToZillowItems = async (items) => {
    for (const item of items) {
        let fullAddress;
        try {
            const {
                address: {
                    streetAddress,
                    city,
                    state,
                    zipcode
                }
            } = item;
            fullAddress = `${streetAddress}, ${city}, ${state}, ${zipcode || ''}`;
            const livabilityScore = await _getLivabilityScoreForFullAddress(fullAddress);
            item.livabilityScore = livabilityScore;
        } catch (error) {
            console.error(`Error adding livability score for ${fullAddress || JSON.stringify(address)}`, error.message);
        }
    }
}