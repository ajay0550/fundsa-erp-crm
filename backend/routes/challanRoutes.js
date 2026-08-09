const express = require("express");

const {
    createChallan,
    getChallans,
    getChallanById,
    confirmChallan
} = require("../controllers/challanController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/",
    authorizeRoles("ADMIN", "SALES"),
    createChallan
);

router.get(
    "/",
    getChallans
);

router.get(
    "/:id",
    getChallanById
);

router.put(
    "/:id/confirm",
    authorizeRoles("ADMIN", "WAREHOUSE"),
    confirmChallan
);

module.exports = router;