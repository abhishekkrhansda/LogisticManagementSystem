const express = require("express");
const router = express.Router();
const authenticationToken = require("../middleware/authentication");
const roleMiddleware = require("../middleware/role");
const {
  getAllRoutes,
  getRouteByroute_id,
  addRoute,
  updateRoute,
  deleteRoute
} = require("../controllers/routes");

router.get("/", getAllRoutes);
router.get("/:route_id", getRouteByroute_id);
router.post("/", addRoute);
router.put("/:route_id",authenticationToken, roleMiddleware("driver","admin"), updateRoute);
router.delete("/:route_id", authenticationToken, roleMiddleware("admin"), deleteRoute);

module.exports = router;    