const accessToken = require('../src/consoleConfig').accessToken;
const opn = require('opn');
opn('http://tracker.transistorsoft.com#' + companyToken);
process.exit();
