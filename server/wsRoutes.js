const express = require("express");
const expressWs = require("express-ws");
const router = express.Router();
const DB = require('./modules/dataConnector')
const { normalizerServerData } = require('./modules/serverUtils')
const ServerMonitoringList = require("./modules/serverList.js")


expressWs(router);

router.ws("/servers/ping", async (ws, req) => {

  let intervalId = undefined;
  let intervalCreated = false;

  ws.on("message", async (message) => {

    const data = JSON.parse(message)
    const clientDB = await DB.connectDB()
    const serversList = data.serversList
    const sharedServerMonitoringList = ServerMonitoringList.getInstance()
  
  
    for ( id of serversList) {
      if (isNaN(Number(id))){
        ws.close(1001, `ERROR - ServerID Invalited: ${server.name}`)
        return
      }
    }

    let servers

    try {
      servers = await clientDB.query(`SELECT * FROM servers WHERE id IN ('${serversList.join("' , '")}');`)
      servers = servers.rows
    }
    catch(erro) {
      ws.close(1001, `ERROR - BD Search: ${erro}`)
      console.log(`ERROR - BD Search: ${erro}`)
      return
    }

    if (servers.length === 0 ){
      ws.send(`ERROR - Servers not found`)
      ws.close(1001, `ERROR - Servers not found`)
      return
    }

    for(server of servers) {

      server = normalizerServerData(server)

      if(server.monitoringPing !== true) {
        ws.send(`ERROR - Server: ${server.id} - MonitoringPing is not authorized`)
        ws.close(1001, `ERROR - Server: ${server.id} - MonitoringPing is not authorized`)
        return
      }
    }

    let serverStatusHistory = {}

    if (!intervalCreated) {
      intervalId = setInterval(async() => {
        for(server of servers) {

          serverInMonitoring = sharedServerMonitoringList.getServer(server.id)

          if (!serverInMonitoring){
            continue
          }

          if (!serverStatusHistory[server.id]) {
            serverStatusHistory[server.id] = server;
          }


          if (serverStatusHistory[server.id].healthStatusPing != serverInMonitoring.healthStatusPing) {
            serverStatusHistory[server.id].healthStatusPing = serverInMonitoring.healthStatusPing
            ws.send(JSON.stringify({
              status: 'success',
              data: {
                server: `${server.id}`,
                statusServer: serverInMonitoring.healthStatusPing
              }
            }))
          }
    
        };
      }, 5000)
    };

  },
  
  ws.on("close", () => {
    if (intervalCreated) {;
      clearInterval(intervalId);
    }
  })
  
  );
});

router.ws("/servers/http", async (ws, req) => {

  let intervalId = undefined;
  let intervalCreated = false;
  let serverStatusHistory = {};

  ws.on("message", async (message) => {

    const data = JSON.parse(message)
    const clientDB = await DB.connectDB()
    const serversList = data.serversList
    const sharedServerMonitoringList = ServerMonitoringList.getInstance()
  
  
    for ( id of serversList) {
      if (isNaN(Number(id))){
        ws.close(1001, `ERROR - ServerID Invalited: ${server.name}`)
      }
    }

    let servers

    try {
      servers = await clientDB.query(`SELECT * FROM servers WHERE id IN ('${serversList.join("' , '")}');`)
      servers = servers.rows
    }
    catch(erro) {
      ws.close(1001, `ERROR - BD Search: ${erro}`)
      console.log(`ERROR - BD Search: ${erro}`)
    }

    if (servers.length === 0 ){
      ws.send(`ERROR - Servers not found`)
      ws.close(1001, `ERROR - Servers not found`)
      return
    }

    for(server of servers) {

        server = normalizerServerData(server)

        if(server.monitoringHTTP !== true) {
          ws.close(1001, `ERROR - Server: ${server.id} - MonitoringHTTP is not authorized`)
          return
        }
      }

      let serverStatusHistory = {}

      if (!intervalCreated) {
        intervalId = setInterval(async() => {
          for(server of servers) {
            
            serverInMonitoring = sharedServerMonitoringList.getServer(server.id)

            if (!serverInMonitoring) {
              continue
            }
            
            if (!serverStatusHistory[server.id]) {
              serverStatusHistory[server.id] = server;
            }

            if (serverStatusHistory[server.id].healthStatusHTTP !== serverInMonitoring.healthStatusHTTP) {
              serverStatusHistory[server.id].healthStatusHTTP = serverInMonitoring.healthStatusHTTP
              ws.send(JSON.stringify({
                status: 'success',
                data: {
                  server: `${server.id}`,
                  statusServer: serverInMonitoring.healthStatusHTTP
                }
              }))
            }
      
          };
        }, 5000)
      }
  }),

  ws.on("close", () => {
    if (intervalCreated) {;
      clearInterval(intervalId);
    }
  })

});

module.exports = router;
