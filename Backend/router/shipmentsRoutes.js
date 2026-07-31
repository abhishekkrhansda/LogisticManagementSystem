const express = require("express");
const router = express.Router();
const {
    getAllShipments,
    getShipmentByshipment_id,
    addShipment,
    updateShipment,
    deleteShipment
} = require("../controllers/shipment");

router.get("/", getAllShipments);
router.get("/:shipment_id", getShipmentByshipment_id);
router.post("/", addShipment);
router.put("/:shipment_id", updateShipment);
router.delete("/:shipment_id", deleteShipment);

module.exports = router;