const pool = require("../db");

const getDashboardSummary = async (req, res) => {
    try {
        const customers = await pool.query(
            "SELECT COUNT(*) FROM customers"
        );

        const products = await pool.query(
            "SELECT COUNT(*) FROM products"
        );

        const lowStock = await pool.query(
    `SELECT COUNT(*)
     FROM products
     WHERE current_stock <= min_stock_quantity`
);

        const pendingChallans = await pool.query(
            `SELECT COUNT(*)
             FROM challans
             WHERE status = 'DRAFT'`
        );

        const recentChallans = await pool.query(
            `SELECT
                c.id,
                c.challan_number,
                c.status,
                cu.business_name
             FROM challans c
             JOIN customers cu
             ON c.customer_id = cu.id
             ORDER BY c.created_at DESC
             LIMIT 5`
        );

        res.json({
            customers: Number(customers.rows[0].count),
            products: Number(products.rows[0].count),
            lowStock: Number(lowStock.rows[0].count),
            pendingChallans: Number(pendingChallans.rows[0].count),
            recentChallans: recentChallans.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load dashboard"
        });
    }
};

module.exports = {
    getDashboardSummary
};