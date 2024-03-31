const DB = require('./dataConnector.js')
require("dotenv").config()
const telegramBot = require("./telegramBot.js")
const ServerMonitoringList = require("../modules/serverList.js")

const validateHostnameAddress = (hostname) => {
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const hostnamePattern = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;

  if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname) || hostnamePattern.test(hostname)) {
    return true;
  } else {
    throw new Error('Hostname Invalited');
    }
};

const normalizerServerData = (serverData) => {

  serverData.monitoringURI = serverData.monitoring_uri
  serverData.monitoringPing = serverData.monitoring_ping
  serverData.monitoringHTTP = serverData.monitoring_http
  serverData.healthStatusHTTP = serverData.healthstatus_http
  serverData.healthStatusPing = serverData.healthstatus_ping

  delete serverData.monitoring_uri
  delete serverData.monitoring_ping
  delete serverData.monitoring_http
  delete serverData.healthstatus_http
  delete serverData.healthstatus_ping

  return serverData

}

const updateServerHealthStatus = async (server, serviceType, newStatus) => {

  const clientDB = await DB.connectDB()
  const sharedServerMonitoringList = ServerMonitoringList.getInstance()
  let serverInCache = sharedServerMonitoringList.getServer(server.id)

  if (!serverInCache) {
    serverInCache = server
  }

  if (serviceType === 'HTTP') {
    serverInCache.healthStatusHTTP = newStatus
  }
  else if (serviceType === "PING"){
    serverInCache.healthStatusPing = newStatus
  }

  sharedServerMonitoringList.updateServer(serverInCache.id, serverInCache)

  try {
    await clientDB.query({
        text: `UPDATE servers SET healthstatus_${serviceType} = $1 WHERE id = $2`,
        values: [newStatus, server.id]
    });
    telegramBot.reportNewState(server, serviceType, newStatus);
  } catch (error) {
    console.log(error);
  }

}

module.exports = { validateHostnameAddress, normalizerServerData, updateServerHealthStatus };
