const express = require("express");
const {
    authenticateToken
} = require("../middleware/authMiddleware");
const router = express.Router();

const {
    getDashboardSummary
} = require("../controllers/dashboardController");



router.get(
    "/summary",
    authenticateToken,
    getDashboardSummary
);

module.exports = router;