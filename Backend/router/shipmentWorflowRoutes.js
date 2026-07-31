const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const workflow = require("../controllers/shipmentWorkflow");

router.post(

"/:shipment_id/pickup",

upload.single("pickup_photo"),

workflow.pickupShipment

);

router.post(

"/:shipment_id/deliver",

upload.fields([

{

name:"delivery_photo",

maxCount:1

},

{

name:"signature",

maxCount:1

}

]),

workflow.deliverShipment

);

module.exports = router;