const DB = require('../modules/dataConnector.js')
require("dotenv").config()
const telegramBot = require("../modules/telegramBot.js")
const httpTestServers = require("../modules/httpTest.js")
const normalizerServerData = require("../modules/serverNormalizer")

async function monitoringHTTP() {

    const clientDB = await DB.connectDB()
    const INTERVAL_FOR_TESTS = process.env.INTERVAL_FOR_TESTS * 1000

    let servers

    setInterval(async() => {

        try {
            servers = await clientDB.query("SELECT * FROM servers")
            servers = servers.rows
        } catch(erro) {
            console.log("ERROR - DataBase Error: " + erro)
        }

        servers = servers.reduce((filteredServers, server) => {
            server = normalizerServerData(server);
            
            if (server.monitoringHTTP === true) {
                filteredServers.push(server);
            }
            
            return filteredServers;
        }, []);
    
        for (server of servers) {
            let statusHTTPTests = []
            
            try {
                for(let i = 1; i <= 3; i++){
                statusHTTPTests.push(await httpTestServers(server))
                }
            }
            catch(erro) {
                telegramBot.reportProblem('HTTP', `Problem in HTTP Test (${erro})`)
            }
    
            if (statusHTTPTests.includes("Problem") & !statusHTTPTests.includes("Sucess") & server.healthStatusHTTP != `Offline` ){
                try {
                telegramBot.reportNewState(server, "HTTP", `Offline`)
                await clientDB.query({text: "UPDATE servers SET healthstatus_http = $1 WHERE id = $2", values: [`Offline`, server.id]})
                }
                catch(erro) {
                    console.log(erro)
                }
            }
            else if (statusHTTPTests.includes("Sucess") & statusHTTPTests.includes("Problem") & server.healthStatusHTTP != `Depracated`) {
                try {
                telegramBot.reportNewState(server, "HTTP", `Depracated`)
                await clientDB.query({text: "UPDATE servers SET healthstatus_http = $1 WHERE id = $2", values: [`Depracated`, server.id]})
                }
                catch(erro) {
                    console.log(erro)
                }
            }
            else if (statusHTTPTests.includes("Sucess") & !statusHTTPTests.includes("Problem") & !statusHTTPTests.includes("Blocked") & server.healthStatusHTTP != `Online`) {
                try {
                telegramBot.reportNewState(server, "HTTP", `Online`)
                await clientDB.query({text: "UPDATE servers SET healthstatus_http = $1 WHERE id = $2", values: [`Online`, server.id]})
                }
                catch(erro) {
                    console.log(erro)
                }
            }
            else if (statusHTTPTests.includes("Blocked") & server.healthStatusHTTP != `Blocked`) {
                try {
                telegramBot.reportNewState(server, "HTTP", `Blocked`)
                await clientDB.query({text: "UPDATE servers SET healthstatus_http = $1 WHERE id = $2", values: [`Blocked`, server.id]})
                }
                catch(erro) {
                    console.log(erro)
                }
            }
        }
    }, INTERVAL_FOR_TESTS)

}

module.exports = monitoringHTTP