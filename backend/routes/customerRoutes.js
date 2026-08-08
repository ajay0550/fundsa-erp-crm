const express = require("express");

const {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    addFollowUp,
    getFollowUps
} = require("../controllers/customerController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.post("/:id/follow-ups", addFollowUp);
router.get("/:id/follow-ups", getFollowUps);

module.exports = router;