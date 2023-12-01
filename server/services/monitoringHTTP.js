const DB = require('../modules/dataConnector.js')
require("dotenv").config()
const telegramBot = require("../modules/telegramBot.js")
const httpTestServers = require("../modules/httpTest.js")
const serverNormalizer = require("../modules/serverNormalizer")

async function monitoringHTTP() {

    const clientDB = await DB.connectDB()
    const INTERVAL_FOR_TESTS = process.env.INTERVAL_FOR_TESTS * 1000
    let servers

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
    }


    intervalId = setInterval(async() => {

        for (server of servers) {
            statusTests = []
          
            try {
              for(let i = 1; i <= 3; i++){
                statusTests.push(await httpTestServers(server))
              }
            }
            catch(erro) {
              console.log(`ERROR - Problems in HTTP Tests: ${erro}`)
            }

            console.log(statusTests)
    
            if (statusTests.includes("Problem") & !statusTests.includes("Success") & server.lastState != `Offline` ){
                server.lastState = `Offline`
                telegramBot.sendMessage(server)
            }
            else if (statusTests.includes("Success") & statusTests.includes("Problem") & server.lastState != `Depracated`) {
                server.lastState = `Depracated`
                telegramBot.sendMessage(server)
            }
            else if (statusTests.includes("Success") & !statusTests.includes("Problem") & !statusTests.includes("Blocked") & server.lastState != `Online`) {
                server.lastState = `Online`
                telegramBot.sendMessage(server)
            }
            else if (statusTests.includes("Blocked") & server.lastState != `Blocked`) {
                server.lastState = `Blocked`
                telegramBot.sendMessage(server)
            }
        }

    }, INTERVAL_FOR_TESTS)

}

module.exports = monitoringHTTP