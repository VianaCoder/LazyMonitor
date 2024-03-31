const express = require("express");
const routes = require("./routes")
const wsRoutes = require("./wsRoutes")
require("dotenv").config();
const { connectDB, setupDatabase } = require("./modules/dataConnector")
const expressWs = require("express-ws");
const monitoringHTTP = require("./services/monitoringHTTP")
const monitoringPing = require("./services/monitoringPing")

const PORT = process.env.PORT || 3001;

connectDB().then(setupDatabase);

const app = express();

app.use(express.json());
app.use(routes);

expressWs(app);
app.use(wsRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

async function monitor() {
  Promise.all([monitoringHTTP(), monitoringPing()]);
}
  
monitor()