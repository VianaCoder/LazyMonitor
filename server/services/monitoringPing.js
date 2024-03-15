const DB = require('../modules/dataConnector.js')
require("dotenv").config()
const telegramBot = require("../modules/telegramBot.js")
const pingTestServers = require("../modules/pingTest.js")
const normalizerServerData = require("../modules/serverNormalizer")

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
      try {
        telegramBot.reportNewState(server, "PING", `Blocked`)
        await clientDB.query({text: "UPDATE servers SET healthstatus_ping = $1 WHERE id = $2", values: [`Offline`, server.id]})
      }
      catch(erro) {
        console.log(erro)
      }
    }
    else if (statusPingTests.includes(false) & statusPingTests.includes(true) & server.healthStatusPing != `Depracated`) {
      try {
        telegramBot.reportNewState(server, "PING", `Depracated`)
        await clientDB.query({text: "UPDATE servers SET healthstatus_ping = $1 WHERE id = $2", values: [`Depracated`, server.id]})
      }
      catch(erro) {
        console.log(erro)
      }
    }
    else if (statusPingTests.includes(true) & !statusPingTests.includes(false) & server.healthStatusPing != `Up`) {
      try{
        telegramBot.reportNewState(server, "PING", `Online`)
        await clientDB.query({text: "UPDATE servers SET healthstatus_ping = $1 WHERE id = $2", values: [`Online`, server.id]})
      }
      catch(erro){
        console.log(erro)
      }
    }

  };



  }, INTERVAL_FOR_TESTS)

}

module.exports = monitoringPing