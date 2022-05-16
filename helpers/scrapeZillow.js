const axios = require("axios");

/**
 * Get list of zpids based on search paramenters specified
 * TODO: allow for different types of search queries based on parameter or user
 * @returns zpids
 */
module.exports.getZillowZpidsForSearch = async () => {
    const url = `https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-79.3446478423473%2C%22east%22%3A-74.9556097564098%2C%22south%22%3A37.32623661959014%2C%22north%22%3A40.262518844449%7D%2C%22customRegionId%22%3A%221513c626f1X1-CR1pw6lbyctys8u_ua0x1%22%2C%22mapZoom%22%3A8%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22price%22%3A%7B%22min%22%3A0%2C%22max%22%3A600000%7D%2C%22isCondo%22%3A%7B%22value%22%3Afalse%7D%2C%22isApartment%22%3A%7B%22value%22%3Afalse%7D%2C%22enableSchools%22%3A%7B%22value%22%3Afalse%7D%2C%22isMultiFamily%22%3A%7B%22value%22%3Afalse%7D%2C%22monthlyPayment%22%3A%7B%22min%22%3A0%2C%22max%22%3A2567%7D%2C%22isAllHomes%22%3A%7B%22value%22%3Atrue%7D%2C%22sortSelection%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22lotSize%22%3A%7B%22min%22%3A21780%7D%2C%22isLotLand%22%3A%7B%22value%22%3Afalse%7D%2C%22isManufactured%22%3A%7B%22value%22%3Afalse%7D%2C%22isApartmentOrCondo%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%7D&wants={%22cat1%22:[%22mapResults%22]}&requestId=2`;
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
            data: {
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
                        photos
                    }
                }
            }
        } = await axios(options);

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
            photos: photos.map(({ mixedSources: { jpeg } }) => jpeg[jpeg.length - 1].url)
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