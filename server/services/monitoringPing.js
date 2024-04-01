const DB = require('../modules/dataConnector.js')
require("dotenv").config()
const telegramBot = require("../modules/telegramBot.js")
const pingTestServers = require("../modules/pingTest.js")
const { normalizerServerData, updateServerHealthStatus } = require('../modules/serverUtils')

async function monitoringPing() {

  const clientDB = await DB.connectDB()
  const INTERVAL_FOR_TESTS = process.env.INTERVAL_FOR_TESTS * 1000
  
  let servers

  setTimeout(async() => {

    try {
      servers = await clientDB.query("SELECT * FROM servers")
      servers = servers.rows
  } catch(erro) {
      console.log("ERROR - DataBase Error: " + erro)
  }

  servers = servers.reduce((filteredServers, server) => {
    server = normalizerServerData(server);
    
    if (server.monitoringPing === true) {
        filteredServers.push(server);
    }
    
    return filteredServers;
  }, []);

  for(server of servers) {
    let statusPingTests = []

    try {
      for(let i = 1; i <= 3; i++){
        statusPingTests.push(await pingTestServers(server.hostname))
      }
    }
    catch(erro) {
      telegramBot.reportProblem('PING', `Problem in ICMP Test (${erro})`)
      return
    }

    if (statusPingTests.includes(false) & !statusPingTests.includes(true) & server.healthStatusPing != `Down` ){
      await updateServerHealthStatus(server, "PING", "Down");
    }
    else if (statusPingTests.includes(false) & statusPingTests.includes(true) & server.healthStatusPing != `Depracated`) {
      await updateServerHealthStatus(server, "PING", "Depracated");
    }
    else if (statusPingTests.includes(true) & !statusPingTests.includes(false) & server.healthStatusPing != `Online`) {
      await updateServerHealthStatus(server, "PING", "Online");
    }

  };



  }, INTERVAL_FOR_TESTS)

}

module.exports = monitoringPing
