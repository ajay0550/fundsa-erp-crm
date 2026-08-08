const pool = require("../db");


const createProduct = async (req, res) => {
    try {
        const {
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            min_stock_quantity,
            location
        } = req.body;

        if (!product_name || !sku || unit_price === undefined) {
            return res.status(400).json({
                message: "Product name, SKU and price are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO products
            (product_name, sku, category, unit_price,
             current_stock, min_stock_quantity, location)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [
                product_name,
                sku,
                category,
                unit_price,
                current_stock || 0,
                min_stock_quantity || 0,
                location
            ]
        );

        res.status(201).json({
            message: "Product created successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create product"
        });
    }
};



const getProducts = async (req, res) => {
    try {
        const { search, lowStock } = req.query;

        let query = `
            SELECT *,
            CASE
                WHEN current_stock <= min_stock_quantity
                THEN true
                ELSE false
            END AS low_stock
            FROM products
            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        if (search) {
            query += `
                AND (
                    product_name ILIKE $${index}
                    OR sku ILIKE $${index}
                    OR category ILIKE $${index}
                )
            `;

            values.push(`%${search}%`);
            index++;
        }

        if (lowStock === "true") {
            query += `
                AND current_stock <= min_stock_quantity
            `;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, values);

        res.status(200).json({
            count: result.rows.length,
            products: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};



const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch product"
        });
    }
};



const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product_name,
            sku,
            category,
            unit_price,
            min_stock_quantity,
            location
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET product_name = $1,
                 sku = $2,
                 category = $3,
                 unit_price = $4,
                 min_stock_quantity = $5,
                 location = $6
             WHERE id = $7
             RETURNING *`,
            [
                product_name,
                sku,
                category,
                unit_price,
                min_stock_quantity,
                location,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update product"
        });
    }
};



const createStockMovement = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            product_id,
            quantity_changed,
            movement_type,
            reason
        } = req.body;

        if (!product_id || !quantity_changed || !movement_type) {
            return res.status(400).json({
                message: "Product, quantity and movement type are required"
            });
        }

        if (!["IN", "OUT"].includes(movement_type)) {
            return res.status(400).json({
                message: "Movement type must be IN or OUT"
            });
        }

        if (quantity_changed <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than zero"
            });
        }

        await client.query("BEGIN");

        const productResult = await client.query(
            "SELECT * FROM products WHERE id = $1 FOR UPDATE",
            [product_id]
        );

        if (productResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = productResult.rows[0];

        let newStock;

        if (movement_type === "IN") {
            newStock = product.current_stock + quantity_changed;
        } else {
            newStock = product.current_stock - quantity_changed;
        }

        if (newStock < 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        await client.query(
            `UPDATE products
             SET current_stock = $1
             WHERE id = $2`,
            [newStock, product_id]
        );

        const movementResult = await client.query(
            `INSERT INTO stock_movements
            (product_id, quantity_changed, movement_type, reason, created_by)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *`,
            [
                product_id,
                quantity_changed,
                movement_type,
                reason,
                req.user.id
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Stock movement recorded successfully",
            movement: movementResult.rows[0],
            new_stock: newStock
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            message: "Failed to record stock movement"
        });

    } finally {
        client.release();
    }
};



const getStockMovements = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                sm.*,
                p.product_name,
                p.sku
             FROM stock_movements sm
             JOIN products p
             ON sm.product_id = p.id
             ORDER BY sm.created_at DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            movements: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch stock movements"
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    createStockMovement,
    getStockMovements
};