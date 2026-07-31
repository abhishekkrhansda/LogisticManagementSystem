const express = require('express');
const router = express.Router();

const {
    getAllShipment,
    getShipmentByshipment_id,
    getLatestStatusByShipmentId,
    getStatusHistoryByShipmentId,
    addShipmentTracking
} = require("../controllers/shipmentTracking");


router.get("/", getAllShipment);
router.get("/:shipment_id", getShipmentByshipment_id);
router.post("/", addShipmentTracking);
router.get("/:shipment_id/latest-status", getLatestStatusByShipmentId);
router.get("/:shipment_id/status-history", getStatusHistoryByShipmentId);

module.exports = router;