const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    createStockMovement,
    getStockMovements
} = require("../controllers/productController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/",
    authorizeRoles("ADMIN", "WAREHOUSE"),
    createProduct
);

router.get(
    "/",
    getProducts
);

router.get(
    "/movements",
    getStockMovements
);

router.post(
    "/movements",
    authorizeRoles("ADMIN", "WAREHOUSE"),
    createStockMovement
);

router.get(
    "/:id",
    getProductById
);

router.put(
    "/:id",
    authorizeRoles("ADMIN", "WAREHOUSE"),
    updateProduct
);

module.exports = router;