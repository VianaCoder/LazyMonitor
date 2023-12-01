const express = require("express");
const routes = require("./routes")
const wsRoutes = require("./wsRoutes")
require("dotenv").config();
const { connectDB, setupDatabase } = require("./modules/dataConnector")
const expressWs = require("express-ws");
const monitoringHTTP = require("./services/monitoringHTTP")

const PORT = process.env.PORT || 3001;

connectDB().then(setupDatabase);

const app = express();

// Adicionar o serviço HTTP e suas rotas ao App do Express
app.use(express.json());
app.use(routes);

// Adicionar o serviço WebSocket e suas rotas ao App do Express
expressWs(app);
app.use(wsRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

//Iniciando monitoramento
monitoringHTTP()