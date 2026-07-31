const express = require("express");
const router = express.Router();
const cors = require("cors");

require("dotenv").config();

const customerRoutes = require("./router/customerRoutes");
const driverRoutes = require("./router/driverRoutes");
const routeRoutes = require("./router/routes");
const shipmentsRoutes = require("./router/shipmentsRoutes");
const vehiclesRoutes = require("./router/vehiclesRoutes");
const loginRoutes = require("./router/loginRoutes");
const registerRoutes = require("./router/registerRoutes");
const shipmentTrackingRoutes = require("./router/shipmentTrackingroutes");
const reportRoutes = require("./router/reportRoutes");
const workflowRoutes = require("./router/shipmentWorflowRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//customer routes
app.use("/api/customers", customerRoutes);

//driver routes
app.use("/api/drivers", driverRoutes);

//route routes
app.use("/api/routes", routeRoutes);

//shipments routes
app.use("/api/shipments", shipmentsRoutes);

//vehicles routes
app.use("/api/vehicles", vehiclesRoutes);

//login routes
app.use("/api/auth", loginRoutes);

//register routes
app.use("/api/auth", registerRoutes);

//shipment tracking routes
app.use("/api/shipmenttracking", shipmentTrackingRoutes);

//report routes
app.use("/api/reports", reportRoutes);

//shipment workflow routes
app.use("/api/workflow", workflowRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to the Logistic API");
});

app.listen(PORT, () =>{
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
})
