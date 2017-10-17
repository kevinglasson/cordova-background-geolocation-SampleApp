const  fs = require('fs');
const consoleConfigPath = './src/consoleConfig.js';
if (!fs.existsSync(consoleConfigPath)) {
  const _ = require('lodash');
  const ip = require('ip');
  const ipAddress = ip.address();
  const ifaces = require('os').networkInterfaces();
  const macAddress = _.find(_.flatten(_.values(ifaces)), { address : ipAddress}).mac;
  const md5 = require('md5');
  const accessToken = md5(macAddress).substring(0, 8);


  const r2ccToken = 'xA^kf#W.(yzm$3#';
  const r2ccUrl = 'http://cheermeon.com.au/post';
  const generatedContent = `
exports.defaultLocationUrl = '${r2ccUrl}';
exports.accessToken = '${r2ccToken}';
  `;

  fs.writeFileSync(consoleConfigPath, generatedContent, 'utf-8');
}
