const { type } = require('os')
const dataValidate = require("../modules/dataValidate")
const serverNormalizer = require("../modules/serverNormalizer")
const serverSchema = require("../model/servers")

const DB = require('../modules/dataConnector')


module.exports = {
    
async getServers(request, response) {

    const clientDB = await DB.connectDB()

    try {
        const servers = await clientDB.query("SELECT * FROM servers")
        return response.json(servers.rows)
    } catch(erro) {
        return response.json("ERROR - DataBase Error: " + erro).status(500)
    }
},

async getServer(request, response) {

    const serverId = request.params.serverId

    const clientDB = await DB.connectDB()

    let query = {
        text: 'SELECT * FROM servers WHERE id = $1',
        values: [serverId],
    }

    try {
        const servers = await clientDB.query(query)
        return response.json(servers.rows)
    } catch(erro) {
        return response.json("ERROR - DataBase Error: " + erro).status(500)
    }
},

async createServer(request, response) { 

    const clientDB = await DB.connectDB()

    let serverId
    serverData = request.body
    serverData.healthStatusHTTP = true
    serverData.healthStatusPing = true

    console.log(serverData)


    if ( dataValidate.validateHostnameAddress(serverData.hostname) === Error) {
        return response.status(400).json("ERROR - Hostname Invalited")
    }

    try {
        serverSchema.validate(serverData)
    }
    catch (error) {
        return response.status(400).json("ERROR - Data Invalited: " + error)
    }

    let query = {
        text: 'INSERT INTO servers (name, hostname, monitoring_ping, monitoring_http, healthstatus_ping, healthstatus_http, monitoring_uri) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        values: [serverData.name, serverData.hostname, serverData.monitoringPing, serverData.monitoringHTTP, serverData.healthStatusPing, serverData.healthStatusHTTP, serverData.monitoringURI]
    }

    try { 
        const result = await clientDB.query(query)
        serverId = result.rows[0].id
    }
    catch (error) {
        console.log(error)
        return response.json("ERROR - Was not possible insert server: " + error).status(500)
    }

    response.status(201).json('Sucess') 
},

async updateServer(request, response) { 

    const clientDB = await DB.connectDB()

    const updateData = request.body;
    const serverId = request.params.serverId

    if (!serverId) {
        return response.status(400).json("ERROR - ID is required")
    }


    let query = {
        text: 'SELECT * FROM servers WHERE id = $1',
        values: [serverId],
    }

    try {
        const servers = await clientDB.query(query)
        serverData = servers.rows[0]
    } catch(erro) {
        return response.json("ERROR - DataBase Error: " + erro).status(500)
    }

    //ServerData Normalizer
    serverData = serverNormalizer.normalizerServerData(serverData)

    console.log(serverData)
    
    for (const key in updateData) {
        if (updateData.hasOwnProperty(key) && key !== 'id') {
          serverData[key] = updateData[key];
        }
    }
  
    if ( dataValidate.validateHostnameAddress(serverData.hostname) === Error) {
        return response.status(400).json("ERROR - IP Invalited")
    }

    try {
        const testSchema = serverSchema.validate(serverData)
    }
    catch (error) {
        return response.status(400).json("ERROR - Data Invalited: " + error)
    }

    console.log(serverData)
  
    query = {
      text: 'UPDATE servers SET name = $1, hostname = $2, monitoring_ping = $3, monitoring_http = $4, monitoring_uri = $5 WHERE id = $6',
      values: [serverData.name, serverData.hostname, serverData.monitoringPing, serverData.monitoringHTTP, serverData.monitoringURI, serverData.id],
    }
  
    try { 
      await clientDB.query(query);
      response.status(201).json('Sucess');
    } catch (error) {
      console.log(error);
      response.status(500).json("ERROR - Was not possible update server: " + error);
    }
},

async deleteServer(request, response) {

    const clientDB = await DB.connectDB()
    
    const serverId = request.params.serverId;
    
    if (serverId === undefined || serverId === null) {
        response.status(400).json("ERROR - ID is required or invalited");
    }
  
    const query = {
      text: 'DELETE FROM servers WHERE id = $1',
      values: [serverId],
    }
  
    try { 
      await clientDB.query(query);
      response.status(200).json('Sucess');
    } catch (error) {
      console.log(error);
      response.status(500).json("ERROR - Was not possible delete server: " + error);
    }
}
  
}