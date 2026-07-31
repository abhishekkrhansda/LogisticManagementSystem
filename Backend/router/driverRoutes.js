const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authentication");
const roleMiddleware = require("../middleware/role");

const {
    getAllDrivers,
    getDriverBydriver_id,
    addDriver,
    updateDriver,
    deleteDriver
} = require("../controllers/drivers");

router.get("/", getAllDrivers);
router.get("/:driver_id", getDriverBydriver_id);
router.post("/", addDriver);
router.put("/:driver_id",authMiddleware, roleMiddleware("admin"), updateDriver);
router.delete("/:driver_id",authMiddleware, roleMiddleware("admin"), deleteDriver);

module.exports = router;