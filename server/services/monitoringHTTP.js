const DB = require('../modules/dataConnector.js')
require("dotenv").config()
const httpTestServers = require("../modules/httpTest.js")
const { normalizerServerData, updateServerHealthStatus } = require('../modules/serverUtils')


async function monitoringHTTP() {

    const clientDB = await DB.connectDB()
    const INTERVAL_FOR_TESTS = process.env.INTERVAL_FOR_TESTS * 1000

    let servers

    setInterval(async() => {

        console.log("Testando")

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

            console.log(statusHTTPTests)
    
            if (statusHTTPTests.includes("Problem") && !statusHTTPTests.includes("Success") && !statusHTTPTests.includes("Blocked") && server.healthStatusHTTP != `Offline` ){
                await updateServerHealthStatus(server, "HTTP", "Offline");
            }
            else if (statusHTTPTests.includes("Success") && statusHTTPTests.includes("Problem") && !statusHTTPTests.includes("Blocked") && server.healthStatusHTTP != `Depracated`) {
                await updateServerHealthStatus(server, "HTTP", "Deprecated");
            }
            else if (statusHTTPTests.includes("Success") && !statusHTTPTests.includes("Problem") && !statusHTTPTests.includes("Blocked") && server.healthStatusHTTP != `Online`) {
                await updateServerHealthStatus(server, "HTTP", "Online");
            }
            else if (statusHTTPTests.includes("Blocked") && server.healthStatusHTTP != `Blocked`) {
                await updateServerHealthStatus(server, "HTTP", "Blocked");
            }
        }
    }, INTERVAL_FOR_TESTS)

}

module.exports = monitoringHTTP
