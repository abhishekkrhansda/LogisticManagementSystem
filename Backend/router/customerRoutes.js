const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authentication");
const roleMiddleware = require("../middleware/role");

const {
  getAllCustomers,
  getCustomerBycustomer_id,
  addCustomer,
  updateCostumer,
  deleteCustomers
} = require("../controllers/customers");

router.get("/", getAllCustomers);
router.get("/:customer_id", getCustomerBycustomer_id);
router.post("/", addCustomer);
router.put("/:customer_id", authMiddleware, roleMiddleware("admin"), updateCostumer);
router.delete("/:customer_id", authMiddleware, 
    roleMiddleware("admin"), deleteCustomers);

module.exports = router;