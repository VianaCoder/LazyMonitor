const express = require('express');
const routes = express.Router()

const serverController = require("./controllers/serverController.js")

// EndPoint to Check
routes.get("/ping", (req, res) => {
    res.json({ message: "Pong!" });
});

// Server Management
routes.get("/servers", serverController.getServers)
routes.get("/server/:serverId", serverController.getServer)
routes.post("/server/", serverController.createServer)
routes.patch("/server/:serverId", serverController.updateServer)
routes.delete("/server/:serverId", serverController.deleteServer)

module.exports = routes;