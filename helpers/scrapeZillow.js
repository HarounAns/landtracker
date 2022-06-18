const axios = require("axios");

/**
 * Get list of zpids based on search paramenters specified
 * TODO: allow for different types of search queries based on parameter or user
 * @returns zpids
 */
module.exports.getZillowZpidsForSearch = async () => {
    const mapBounds = { "west": -77.98796743161508, "east": -76.09282583005258, "south": 37.93353582354758, "north": 39.404532209165104 };
    const customRegionId = "8de9c629cfX1-CRc7sbmyf9mvzy_wuqg7";
    const searchQueryState = `{"pagination":{},"mapBounds":${JSON.stringify(mapBounds)},"customRegionId":"${customRegionId}","mapZoom":8,"isMapVisible":true,"filterState":{"price":{"min":0,"max":600000},"isCondo":{"value":false},"isApartment":{"value":false},"enableSchools":{"value":false},"isMultiFamily":{"value":false},"monthlyPayment":{"min":0,"max":2567},"isAllHomes":{"value":true},"sortSelection":{"value":"globalrelevanceex"},"lotSize":{"min":21780},"isLotLand":{"value":false},"isManufactured":{"value":false},"isApartmentOrCondo":{"value":false}},"isListVisible":true}`;
    const url = `https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=${encodeURIComponent(searchQueryState)}&wants={%22cat1%22:[%22mapResults%22]}&requestId=2`;
    const headers = {
        'authority': 'www.zillow.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
    };

    const {
        data: {
            cat1: {
                searchResults: {
                    mapResults
                }
            }
        }
    } = await axios.get(url, { headers });

    const zpids = mapResults.map(({ zpid }) => zpid);
    return zpids;
}

module.exports.getItemsForZpids = async (zpids) => {
    const _getItemsForZpid = async (zpid) => {
        const headers = {
            authority: "www.zillow.com",
            "sec-ch-ua":
                '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            "sec-ch-ua-mobile": "?0",
            "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
            "content-type": "text/plain",
            accept: "*/*",
            origin: "https://www.zillow.com",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            referer:
                "https://www.zillow.com//homedetails/11617-Kipling-Dr-Waldorf-MD-20601/36720300_zpid/",
            "accept-language": "en-US,en;q=0.9",
        };

        const data = {
            operationName: "ForSaleShopperPlatformFullRenderQuery",
            variables: {
                zpid: zpid,
                contactFormRenderParameter: {
                    zpid: zpid,
                    platform: "desktop",
                    isDoubleScroll: true,
                },
            },
            clientVersion: "home-details/6.0.11.0.0.hotfix-5-27-2021-PERF.91d2df8",
            queryId: "35974635cacd35e52a0f5d9f3a49ebd5",
        };

        const options = {
            method: "POST",
            url: `https://www.zillow.com/graphql/?zpid=${zpid}&contactFormRenderParameter=&operationName=ForSaleShopperPlatformFullRenderQuery`,
            headers,
            data,
        };

        const {
            data: zillowData
        } = await axios(options);

        const {
            data: {
                property: {
                    address,
                    livingArea,
                    hdpUrl,
                    price,
                    resoFacts: {
                        bedrooms,
                        bathrooms,
                        lotSize,
                    },
                    photos,
                    latitude,
                    longitude,
                    homeStatus,
                    contingentListingType,
                    priceHistory
                }
            }
        } = zillowData;

        const item = {
            scrapedTs: new Date().toISOString(),
            zpid,
            bedrooms,
            bathrooms,
            lotSize,
            address,
            livingArea,
            hdpUrl,
            price,
            photos: photos.map(({ mixedSources: { jpeg } }) => jpeg[jpeg.length - 1].url),
            latitude,
            longitude,
            homeStatus: contingentListingType === 'UNDER_CONTRACT' ? contingentListingType : homeStatus,
            priceHistory
        }
        return item;
    }

    const items = [];
    for (const zpid of zpids) {
        try {
            const item = await _getItemsForZpid(zpid);
            items.push(item);
            process.stdout.write(".");
        } catch (error) {
            console.error(`Error with ${zpid}`, error);
        }
    }
    return items;
}