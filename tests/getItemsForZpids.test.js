const { getItemsForZpids } = require("../helpers/scrapeZillow");

const main = async () => {
    const zpids = ['37493744'];
    console.log(await getItemsForZpids(zpids));
}

main();