const express = require("express");
const router = express.Router();

const {
  getAllVehicles,
  getVehicleByvehicle_id,
  addVehicle,
  updateVehicle,
  deleteVehicle
} = require("../controllers/vehicles");

router.get("/", getAllVehicles);
router.get("/:vehicle_id", getVehicleByvehicle_id);
router.post("/", addVehicle);
router.put("/:vehicle_id", updateVehicle);
router.delete("/:vehicle_id", deleteVehicle);

module.exports = router;