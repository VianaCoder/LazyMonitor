const express = require("express");
const expressWs = require("express-ws");
const router = express.Router();

const DB = require('./modules/dataConnector')
const pingTestServers = require('./modules/pingTest');
const httpTestServers = require("./modules/httpTest");
const serverNormalizer = require("./modules/serverNormalizer")


expressWs(router);

router.ws("/servers/ping", async (ws, req) => {

  ws.on("message", async (message) => {

    const data = JSON.parse(message)

    const clientDB = await DB.connectDB()

    const serversList = data.serversList
  
  
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

      server = serverNormalizer.normalizerServerData(server)

      console.log(server) 
      if(server.monitoringPing !== true) {
        console.log(server.monitoringPing)
        ws.close(1001, `ERROR - Server: ${server.id} - MonitoringPing is not authorized`)
        return
      }
    }

    intervalId = setInterval(async() => {

      for(server of servers) {
  
        statusTests = []
          
        try {
          for(let i = 1; i <= 3; i++){
            statusTests.push(await pingTestServers(server.hostname))
          }
        }
        catch(erro) {
          ws.close(1001, `Problemas ao efetuar testes ICMP: ${erro}`)
          console.log(`Problemas ao efetuar testes ICMP: ${erro}`)
          return
        }

        if (statusTests.includes(false) & !statusTests.includes(true) & server.lastState != `Offline` ){
          server.lastState = `Offline`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Offline`
            }
          }))
        }
        else if (statusTests.includes(false) & statusTests.includes(true) & server.lastState != `Depracated`) {
          server.lastState = `Depracated`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Depracated`
            }
          }))
        }
        else if (statusTests.includes(true) & !statusTests.includes(false) & server.lastState != `Online`) {
          server.lastState = `Online`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Online`
            }
          }))
        }
  
      };
    }, 1000);

  },
  
  ws.on("close", () => {
    clearInterval(intervalId);
  })
  
  );
});

router.ws("/servers/http", async (ws, req) => {

  ws.on("message", async (message) => {

    const data = JSON.parse(message)

    const clientDB = await DB.connectDB()

    const serversList = data.serversList
  
  
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

      server = serverNormalizer.normalizerServerData(server)

      console.log(server) 
      if(server.monitoringPing !== true) {
        console.log(server.monitoringHTTP)
        ws.close(1001, `ERROR - Server: ${server.id} - MonitoringHTTP is not authorized`)
        return
      }
    }

    intervalId = setInterval(async() => {

      for(server of servers) {
  
        statusTests = []
          
        try {
          for(let i = 0; i <= 3; i++){
            statusTests.push(await httpTestServers(server))
          }
        }
        catch(erro) {
          ws.close(1001, `Problemas ao efetuar testes HTTP: ${erro}`)
          console.log(`Problemas ao efetuar testes HTTP: ${erro}`)
        }

        console.log(statusTests)

        if (statusTests.includes("Problem") & !statusTests.includes("Sucess") & server.lastState != `Offline` ){
          server.lastState = `Offline`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Offline`
            }
          }))
        }
        else if (statusTests.includes("Sucess") & statusTests.includes("Problem") & server.lastState != `Depracated`) {
          server.lastState = `Depracated`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Depracated`
            }
          }))
        }
        else if (statusTests.includes("Sucess") & !statusTests.includes("Problem") & !statusTests.includes("Blocked") & server.lastState != `Online`) {
          server.lastState = `Online`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Online`
            }
          }))
        }
        else if (statusTests.includes("Blocked") & server.lastState != `Blocked`) {
          server.lastState = `Blocked`
          ws.send(JSON.stringify({
            status: 'success',
            data: {
              server: `${server.id}`,
              statusServer: `Blocked`
            }
          }))
        }
  
      };
    }, 1000)

  }),

  ws.on("close", () => {
    clearInterval(intervalId);
  })

});

module.exports = router;
