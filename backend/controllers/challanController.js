const pool = require("../db");


const createChallan = async (req, res) => {
    const client = await pool.connect();

    try {
        const { customer_id, items } = req.body;

        if (!customer_id || !items || items.length === 0) {
            return res.status(400).json({
                message: "Customer and at least one product are required"
            });
        }

     
        const customerResult = await client.query(
            "SELECT * FROM customers WHERE id = $1",
            [customer_id]
        );

        if (customerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        await client.query("BEGIN");

      
        const challanNumber = `CH-${Date.now()}`;

        const challanResult = await client.query(
            `INSERT INTO challans
            (challan_number, customer_id, created_by)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [
                challanNumber,
                customer_id,
                req.user.id
            ]
        );

        const challan = challanResult.rows[0];

        let totalQuantity = 0;

        for (const item of items) {
            const {
                product_id,
                quantity
            } = item;

            if (!product_id || !quantity || quantity <= 0) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "Invalid product or quantity"
                });
            }

            const productResult = await client.query(
                `SELECT *
                 FROM products
                 WHERE id = $1`,
                [product_id]
            );

            if (productResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: `Product ${product_id} not found`
                });
            }

            const product = productResult.rows[0];

            await client.query(
                `INSERT INTO challan_items
                (
                    challan_id,
                    product_id,
                    product_name_snapshot,
                    sku_snapshot,
                    unit_price_snapshot,
                    quantity
                )
                VALUES ($1,$2,$3,$4,$5,$6)`,
                [
                    challan.id,
                    product.id,
                    product.product_name,
                    product.sku,
                    product.unit_price,
                    quantity
                ]
            );

            totalQuantity += quantity;
        }

        await client.query(
            `UPDATE challans
             SET total_quantity = $1
             WHERE id = $2`,
            [totalQuantity, challan.id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Challan created successfully",
            challan_id: challan.id,
            challan_number: challanNumber,
            status: "DRAFT"
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            message: "Failed to create challan"
        });

    } finally {
        client.release();
    }
};


const getChallans = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                c.*,
                cu.customer_name,
                cu.business_name
             FROM challans c
             JOIN customers cu
             ON c.customer_id = cu.id
             ORDER BY c.created_at DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            challans: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch challans"
        });
    }
};



const getChallanById = async (req, res) => {
    try {
        const { id } = req.params;

        const challanResult = await pool.query(
            `SELECT
                c.*,
                cu.customer_name,
                cu.business_name
             FROM challans c
             JOIN customers cu
             ON c.customer_id = cu.id
             WHERE c.id = $1`,
            [id]
        );

        if (challanResult.rows.length === 0) {
            return res.status(404).json({
                message: "Challan not found"
            });
        }

        const itemsResult = await pool.query(
            `SELECT *
             FROM challan_items
             WHERE challan_id = $1`,
            [id]
        );

        res.status(200).json({
            challan: challanResult.rows[0],
            items: itemsResult.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch challan"
        });
    }
};



const confirmChallan = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

      
        const challanResult = await client.query(
            `SELECT *
             FROM challans
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        if (challanResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Challan not found"
            });
        }

        const challan = challanResult.rows[0];

        if (challan.status !== "DRAFT") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Only draft challans can be confirmed"
            });
        }

        const itemsResult = await client.query(
            `SELECT *
             FROM challan_items
             WHERE challan_id = $1`,
            [id]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Challan has no items"
            });
        }

       
        for (const item of itemsResult.rows) {

            const productResult = await client.query(
                `SELECT *
                 FROM products
                 WHERE id = $1
                 FOR UPDATE`,
                [item.product_id]
            );

            const product = productResult.rows[0];

            if (!product) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: `Product ${item.product_id} not found`
                });
            }

            if (product.current_stock < item.quantity) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message:
                        `Insufficient stock for ${product.product_name}`
                });
            }
        }

    
        for (const item of itemsResult.rows) {

            await client.query(
                `UPDATE products
                 SET current_stock = current_stock - $1
                 WHERE id = $2`,
                [
                    item.quantity,
                    item.product_id
                ]
            );

            await client.query(
                `INSERT INTO stock_movements
                (
                    product_id,
                    quantity_changed,
                    movement_type,
                    reason,
                    created_by
                )
                VALUES ($1,$2,'OUT',$3,$4)`,
                [
                    item.product_id,
                    item.quantity,
                    `Sales Challan ${challan.challan_number}`,
                    req.user.id
                ]
            );
        }


        const updatedChallan = await client.query(
            `UPDATE challans
             SET status = 'CONFIRMED'
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Challan confirmed successfully",
            challan: updatedChallan.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            message: "Failed to confirm challan"
        });

    } finally {
        client.release();
    }
};


module.exports = {
    createChallan,
    getChallans,
    getChallanById,
    confirmChallan
};