import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API_URL from "../services/api";

const emptyProductForm = {
    product_name: "",
    sku: "",
    category: "",
    unit_price: "",
    current_stock: "",
    min_stock_quantity: "",
    location: ""
};

const emptyMovementForm = {
    product_id: "",
    quantity_changed: "",
    movement_type: "IN",
    reason: ""
};

export default function Products() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] =
        useState(emptyProductForm);

    const [showMovementForm, setShowMovementForm] =
        useState(false);

    const [movementData, setMovementData] =
        useState(emptyMovementForm);

    const [movements, setMovements] = useState([]);

    const [showMovements, setShowMovements] =
        useState(false);

    const [movementsLoading, setMovementsLoading] =
        useState(false);


    // ==========================================
    // GET PRODUCTS
    // ==========================================

    useEffect(() => {

        const loadProducts = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/products`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to load products"
                    );
                }

                setProducts(data.products);

            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };

        loadProducts();

    }, []);


    // ==========================================
    // PRODUCT FORM INPUT
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ==========================================
    // OPEN ADD PRODUCT FORM
    // ==========================================

    const openAddForm = () => {

        setEditingProduct(null);

        setFormData(emptyProductForm);

        setError("");

        setShowForm(true);

        setShowMovementForm(false);
    };


    // ==========================================
    // OPEN EDIT PRODUCT FORM
    // ==========================================

    const openEditForm = (product) => {

        setEditingProduct(product);

        setFormData({

            product_name:
                product.product_name || "",

            sku:
                product.sku || "",

            category:
                product.category || "",

            unit_price:
                product.unit_price || "",

            current_stock:
                product.current_stock || "",

            min_stock_quantity:
                product.min_stock_quantity || "",

            location:
                product.location || ""
        });

        setError("");

        setShowForm(true);

        setShowMovementForm(false);
    };


    // ==========================================
    // ADD / UPDATE PRODUCT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            const url = editingProduct
                ? `${API_URL}/products/${editingProduct.id}`
                : `${API_URL}/products`;

            const method = editingProduct
                ? "PUT"
                : "POST";


            let body;


            // EDIT
            if (editingProduct) {

                body = {

                    product_name:
                        formData.product_name,

                    sku:
                        formData.sku,

                    category:
                        formData.category,

                    unit_price:
                        Number(
                            formData.unit_price
                        ),

                    min_stock_quantity:
                        Number(
                            formData.min_stock_quantity
                        ),

                    location:
                        formData.location
                };

            }


            // ADD
            else {

                body = {

                    product_name:
                        formData.product_name,

                    sku:
                        formData.sku,

                    category:
                        formData.category,

                    unit_price:
                        Number(
                            formData.unit_price
                        ),

                    current_stock:
                        Number(
                            formData.current_stock || 0
                        ),

                    min_stock_quantity:
                        Number(
                            formData.min_stock_quantity || 0
                        ),

                    location:
                        formData.location
                };
            }


            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify(body)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    `Failed to ${
                        editingProduct
                            ? "update"
                            : "create"
                    } product`
                );
            }


            // UPDATE
            if (editingProduct) {

                setProducts(
                    products.map((product) =>
                        product.id ===
                        editingProduct.id
                            ? data.product
                            : product
                    )
                );

            }


            // ADD
            else {

                setProducts([
                    data.product,
                    ...products
                ]);
            }


            setShowForm(false);

            setEditingProduct(null);

            setFormData(emptyProductForm);

            setError("");

        } catch (error) {

            setError(error.message);
        }
    };


    // ==========================================
    // STOCK MOVEMENT INPUT
    // ==========================================

    const handleMovementChange = (e) => {

        const { name, value } = e.target;

        setMovementData({
            ...movementData,
            [name]: value
        });
    };


    // ==========================================
    // CREATE STOCK MOVEMENT
    // ==========================================

    const handleMovementSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/products/movements`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        product_id:
                            Number(
                                movementData.product_id
                            ),

                        quantity_changed:
                            Number(
                                movementData.quantity_changed
                            ),

                        movement_type:
                            movementData.movement_type,

                        reason:
                            movementData.reason
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to record movement"
                );
            }


            // Update stock immediately
            setProducts(
                products.map((product) => {

                    if (
                        product.id ===
                        Number(
                            movementData.product_id
                        )
                    ) {

                        return {

                            ...product,

                            current_stock:
                                data.new_stock,

                            low_stock:
                                data.new_stock <=
                                Number(
                                    product.min_stock_quantity
                                )
                        };
                    }

                    return product;
                })
            );


            setMovementData(
                emptyMovementForm
            );

            setShowMovementForm(false);

            setError("");

        } catch (error) {

            setError(error.message);
        }
    };


    // ==========================================
    // GET STOCK MOVEMENTS
    // ==========================================

    const loadMovements = async () => {

        try {

            setMovementsLoading(true);

            setError("");

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/products/movements`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load stock history"
                );
            }


            setMovements(data.movements);

            setShowMovements(true);

        } catch (error) {

            setError(error.message);

        } finally {

            setMovementsLoading(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <Layout>

                <p>
                    Loading products...
                </p>

            </Layout>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <Layout>


            {/* ==================================
                HEADER
            ================================== */}

            <div className="page-header">

                <div>

                    <h2>
                        Products
                    </h2>

                    <p>
                        Manage products and inventory
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px"
                    }}
                >

                    <button
                        className="secondary-button"
                        onClick={loadMovements}
                    >
                        Stock History
                    </button>


                    <button
                        className="secondary-button"
                        onClick={() => {

                            setShowMovementForm(true);

                            setShowForm(false);

                            setError("");

                        }}
                    >
                        Stock Movement
                    </button>


                    <button
                        className="primary-button"
                        onClick={openAddForm}
                    >
                        Add Product
                    </button>

                </div>

            </div>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* ==================================
                STOCK HISTORY
            ================================== */}

            {showMovements && (

                <div
                    className="dashboard-card"
                    style={{
                        marginBottom: "24px"
                    }}
                >

                    <div className="page-header">

                        <div>

                            <h3>
                                Stock History
                            </h3>

                            <p>
                                Recent inventory movements
                            </p>

                        </div>


                        <button
                            className="secondary-button"
                            onClick={() =>
                                setShowMovements(false)
                            }
                        >
                            Close
                        </button>

                    </div>


                    {movementsLoading ? (

                        <p>
                            Loading stock history...
                        </p>

                    ) : movements.length === 0 ? (

                        <p>
                            No stock movements found.
                        </p>

                    ) : (

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        SKU
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {movements.map(
                                    (movement) => (

                                        <tr
                                            key={
                                                movement.id
                                            }
                                        >

                                            <td>

                                                {new Date(
                                                    movement.created_at
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </td>


                                            <td>

                                                {
                                                    movement.product_name
                                                }

                                            </td>


                                            <td>

                                                {
                                                    movement.sku
                                                }

                                            </td>


                                            <td>

                                                {movement
                                                    .movement_type ===
                                                "IN" ? (

                                                    <span
                                                        className=
                                                            "stock-ok"
                                                    >
                                                        IN
                                                    </span>

                                                ) : (

                                                    <span
                                                        className=
                                                            "low-stock"
                                                    >
                                                        OUT
                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                {
                                                    movement
                                                        .quantity_changed
                                                }

                                            </td>


                                            <td>

                                                {
                                                    movement.reason ||
                                                    "—"
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            )}


            {/* ==================================
                STOCK MOVEMENT FORM
            ================================== */}

            {showMovementForm && (

                <div
                    className=
                        "dashboard-card customer-form"
                >

                    <h3>
                        Stock Movement
                    </h3>


                    <form
                        onSubmit={
                            handleMovementSubmit
                        }
                    >

                        <div
                            className=
                                "customer-form-grid"
                        >


                            {/* PRODUCT */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Product
                                </label>


                                <select
                                    name="product_id"
                                    value={
                                        movementData
                                            .product_id
                                    }
                                    onChange={
                                        handleMovementChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Product
                                    </option>


                                    {products.map(
                                        (product) => (

                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >

                                                {
                                                    product.product_name
                                                }

                                                {" — "}

                                                {
                                                    product.sku
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* TYPE */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Movement Type
                                </label>


                                <select
                                    name="movement_type"
                                    value={
                                        movementData
                                            .movement_type
                                    }
                                    onChange={
                                        handleMovementChange
                                    }
                                >

                                    <option value="IN">
                                        IN — Stock Received
                                    </option>

                                    <option value="OUT">
                                        OUT — Stock Removed
                                    </option>

                                </select>

                            </div>


                            {/* QUANTITY */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Quantity
                                </label>


                                <input
                                    type="number"
                                    min="1"
                                    name=
                                        "quantity_changed"
                                    placeholder=
                                        "Enter quantity"
                                    value={
                                        movementData
                                            .quantity_changed
                                    }
                                    onChange={
                                        handleMovementChange
                                    }
                                    required
                                />

                            </div>


                            {/* REASON */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Reason
                                </label>


                                <input
                                    name="reason"
                                    placeholder=
                                        "Purchase / Return / Damage"
                                    value={
                                        movementData.reason
                                    }
                                    onChange={
                                        handleMovementChange
                                    }
                                />

                            </div>

                        </div>


                        <div
                            className=
                                "customer-form-actions"
                        >

                            <button
                                type="button"
                                className=
                                    "secondary-button"
                                onClick={() =>
                                    setShowMovementForm(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className=
                                    "primary-button"
                            >
                                Record Movement
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ==================================
                ADD / EDIT PRODUCT FORM
            ================================== */}

            {showForm && (

                <div
                    className=
                        "dashboard-card customer-form"
                >

                    <h3>

                        {editingProduct
                            ? "Edit Product"
                            : "Add Product"
                        }

                    </h3>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div
                            className=
                                "customer-form-grid"
                        >


                            {/* NAME */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Product Name
                                </label>

                                <input
                                    name="product_name"
                                    placeholder=
                                        "Enter product name"
                                    value={
                                        formData
                                            .product_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* SKU */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    SKU
                                </label>

                                <input
                                    name="sku"
                                    placeholder=
                                        "Enter SKU"
                                    value={
                                        formData.sku
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* CATEGORY */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Category
                                </label>

                                <input
                                    name="category"
                                    placeholder=
                                        "Enter category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* PRICE */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Unit Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="unit_price"
                                    placeholder=
                                        "Enter price"
                                    value={
                                        formData
                                            .unit_price
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* CURRENT STOCK */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Current Stock
                                </label>


                                <input
                                    type="number"
                                    min="0"
                                    name=
                                        "current_stock"
                                    value={
                                        formData
                                            .current_stock
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !!editingProduct
                                    }
                                />

                            </div>


                            {/* MIN STOCK */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Minimum Stock
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name=
                                        "min_stock_quantity"
                                    placeholder=
                                        "Enter minimum stock"
                                    value={
                                        formData
                                            .min_stock_quantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* LOCATION */}

                            <div
                                className="form-group"
                            >

                                <label>
                                    Location
                                </label>

                                <input
                                    name="location"
                                    placeholder=
                                        "Example: A1"
                                    value={
                                        formData.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>


                        <div
                            className=
                                "customer-form-actions"
                        >

                            <button
                                type="button"
                                className=
                                    "secondary-button"
                                onClick={() => {

                                    setShowForm(false);

                                    setEditingProduct(
                                        null
                                    );

                                    setFormData(
                                        emptyProductForm
                                    );

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className=
                                    "primary-button"
                            >

                                {editingProduct
                                    ? "Save Changes"
                                    : "Add Product"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ==================================
                PRODUCTS TABLE
            ================================== */}

            <div
                className="dashboard-card"
            >

                <table>

                    <thead>

                        <tr>

                            <th>
                                Product
                            </th>

                            <th>
                                SKU
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Stock
                            </th>

                            <th>
                                Location
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {products.map(
                            (product) => (

                                <tr
                                    key={
                                        product.id
                                    }
                                >

                                    <td>
                                        {
                                            product.product_name
                                        }
                                    </td>


                                    <td>
                                        {
                                            product.sku
                                        }
                                    </td>


                                    <td>
                                        {
                                            product.category
                                        }
                                    </td>


                                    <td>
                                        ₹
                                        {
                                            product.unit_price
                                        }
                                    </td>


                                    <td>
                                        {
                                            product.current_stock
                                        }
                                    </td>


                                    <td>
                                        {
                                            product.location
                                        }
                                    </td>


                                    <td>

                                        {product.low_stock
                                            ? (

                                                <span
                                                    className=
                                                        "low-stock"
                                                >
                                                    Low Stock
                                                </span>

                                            )
                                            : (

                                                <span
                                                    className=
                                                        "stock-ok"
                                                >
                                                    In Stock
                                                </span>

                                            )}

                                    </td>


                                    <td>

                                        <button
                                            className=
                                                "edit-button"
                                            onClick={() =>
                                                openEditForm(
                                                    product
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </Layout>
    );
}