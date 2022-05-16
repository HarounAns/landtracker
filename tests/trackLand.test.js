const { handler: trackLand } = require("../trackLand");

const main = async () => {
    console.log(await trackLand());
}

main();