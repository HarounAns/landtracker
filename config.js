const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}
const LANDTRACKER_TABLENAME = 'landtracker';
const INACTIVE_LANDTRACKER_TABLENAME = 'inactive_landtracker';
const USERNAME = 'harouna';

const config = {
    headers,
    LANDTRACKER_TABLENAME,
    INACTIVE_LANDTRACKER_TABLENAME,
    USERNAME
}

module.exports = config;