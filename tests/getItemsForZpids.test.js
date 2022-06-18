const { getItemsForZpids } = require("../helpers/scrapeZillow");

const main = async () => {
    const zpids = ['37436318'];
    console.log(await getItemsForZpids(zpids));
}

main();