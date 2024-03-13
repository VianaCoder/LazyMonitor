const DB = require('../modules/dataConnector.js')
require("dotenv").config()
const telegramBot = require("../modules/telegramBot.js")
const httpTestServers = require("../modules/httpTest.js")
const serverNormalizer = require("../modules/serverNormalizer")

async function monitoringHTTP() {

    const clientDB = await DB.connectDB()
    const INTERVAL_FOR_TESTS = process.env.INTERVAL_FOR_TESTS * 1000
    let servers
    let serverInMonitoring

    try {
        servers = await clientDB.query("SELECT * FROM servers")
        servers = servers.rows
    } catch(erro) {
        console.log("ERROR - DataBase Error: " + erro)
    }

    for(server of servers) {

        server = serverNormalizer.normalizerServerData(server)
  
        if(server.monitoringHTTP !== true) {
          console.log(server.monitoringHTTP)
        }
        else if (server.monitoringHTTP === true) {
            serverInMonitoring.push(server)
        }
    }


    setInterval(async() => {

        for (server of serverInMonitoring) {
            statusTests = []
          
            try {
              for(let i = 1; i <= 3; i++){
                statusTests.push(await httpTestServers(server))
              }
            }
            catch(erro) {
                telegramBot.reportProblem('HTTP', `Problem in HTTP Test (${erro})`)
            }

            console.log(statusTests)
    
            if (statusTests.includes("Problem") & !statusTests.includes("Sucess") & server.lastState != `Offline` ){
                server.lastState = `Offline`
                telegramBot.reportNewState(server, "HTTP")
            }
            else if (statusTests.includes("Sucess") & statusTests.includes("Problem") & server.lastState != `Depracated`) {
                server.lastState = `Depracated`
                telegramBot.reportNewState(server, "HTTP")
            }
            else if (statusTests.includes("Sucess") & !statusTests.includes("Problem") & !statusTests.includes("Blocked") & server.lastState != `Online`) {
                server.lastState = `Online`
                telegramBot.reportNewState(server, "HTTP")
            }
            else if (statusTests.includes("Blocked") & server.lastState != `Blocked`) {
                server.lastState = `Blocked`
                telegramBot.reportNewState(server, "HTTP")
            }
        }

    }, INTERVAL_FOR_TESTS)

}

module.exports = monitoringHTTP