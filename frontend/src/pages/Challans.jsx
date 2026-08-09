import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API_URL from "../services/api";

const emptyItem = {
    product_id: "",
    quantity: ""
};

export default function Challans() {

    const [challans, setChallans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [customerId, setCustomerId] = useState("");

    const [items, setItems] = useState([
        { ...emptyItem }
    ]);


    // ==========================================
    // VIEW DETAILS
    // ==========================================

    const [selectedChallan, setSelectedChallan] =
        useState(null);

    const [challanItems, setChallanItems] =
        useState([]);

    const [showDetails, setShowDetails] =
        useState(false);

    const [detailsLoading, setDetailsLoading] =
        useState(false);


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        const loadData = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const headers = {
                    Authorization:
                        `Bearer ${token}`
                };


                const [
                    challansResponse,
                    customersResponse,
                    productsResponse
                ] = await Promise.all([

                    fetch(
                        `${API_URL}/challans`,
                        { headers }
                    ),

                    fetch(
                        `${API_URL}/customers`,
                        { headers }
                    ),

                    fetch(
                        `${API_URL}/products`,
                        { headers }
                    )

                ]);


                const challansData =
                    await challansResponse.json();

                const customersData =
                    await customersResponse.json();

                const productsData =
                    await productsResponse.json();


                if (!challansResponse.ok) {

                    throw new Error(
                        challansData.message ||
                        "Failed to load challans"
                    );
                }


                if (!customersResponse.ok) {

                    throw new Error(
                        customersData.message ||
                        "Failed to load customers"
                    );
                }


                if (!productsResponse.ok) {

                    throw new Error(
                        productsData.message ||
                        "Failed to load products"
                    );
                }


                setChallans(
                    challansData.challans
                );

                setCustomers(
                    customersData.customers
                );

                setProducts(
                    productsData.products
                );


            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };


        loadData();

    }, []);


    // ==========================================
    // OPEN CREATE FORM
    // ==========================================

    const openForm = () => {

        setCustomerId("");

        setItems([
            { ...emptyItem }
        ]);

        setError("");

        setShowForm(true);

        setShowDetails(false);
    };


    // ==========================================
    // ADD PRODUCT ROW
    // ==========================================

    const addItem = () => {

        setItems([
            ...items,
            { ...emptyItem }
        ]);
    };


    // ==========================================
    // REMOVE PRODUCT ROW
    // ==========================================

    const removeItem = (index) => {

        if (items.length === 1) {
            return;
        }

        setItems(
            items.filter(
                (_, i) => i !== index
            )
        );
    };


    // ==========================================
    // UPDATE PRODUCT ROW
    // ==========================================

    const updateItem = (
        index,
        field,
        value
    ) => {

        const updatedItems = [...items];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        setItems(updatedItems);
    };


    // ==========================================
    // CREATE CHALLAN
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setError("");


            if (!customerId) {

                throw new Error(
                    "Please select a customer"
                );
            }


            const validItems = items.filter(
                (item) =>
                    item.product_id &&
                    Number(item.quantity) > 0
            );


            if (validItems.length === 0) {

                throw new Error(
                    "Add at least one product"
                );
            }


            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/challans`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        customer_id:
                            Number(customerId),

                        items: validItems.map(
                            (item) => ({

                                product_id:
                                    Number(
                                        item.product_id
                                    ),

                                quantity:
                                    Number(
                                        item.quantity
                                    )

                            })
                        )
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to create challan"
                );
            }


            // Reload challans

            const challansResponse =
                await fetch(
                    `${API_URL}/challans`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const challansData =
                await challansResponse.json();


            if (!challansResponse.ok) {

                throw new Error(
                    challansData.message ||
                    "Failed to reload challans"
                );
            }


            setChallans(
                challansData.challans
            );


            setShowForm(false);

            setCustomerId("");

            setItems([
                { ...emptyItem }
            ]);


        } catch (error) {

            setError(error.message);
        }
    };


    // ==========================================
    // VIEW CHALLAN DETAILS
    // ==========================================

    const viewChallan = async (id) => {

        try {

            setDetailsLoading(true);

            setError("");


            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/challans/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load challan"
                );
            }


            setSelectedChallan(
                data.challan
            );

            setChallanItems(
                data.items
            );

            setShowDetails(true);

            setShowForm(false);


        } catch (error) {

            setError(error.message);

        } finally {

            setDetailsLoading(false);

        }
    };


    // ==========================================
    // CLOSE DETAILS
    // ==========================================

    const closeDetails = () => {

        setShowDetails(false);

        setSelectedChallan(null);

        setChallanItems([]);
    };


    // ==========================================
    // CONFIRM CHALLAN
    // ==========================================

    const confirmChallan = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to confirm this challan? Stock will be deducted."
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");


            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/challans/${id}/confirm`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to confirm challan"
                );
            }


            // Update challan in table

            setChallans(
                challans.map((challan) =>
                    challan.id === id
                        ? data.challan
                        : challan
                )
            );


            // If details are open for this challan,
            // update them too.

            if (
                selectedChallan &&
                selectedChallan.id === id
            ) {

                setSelectedChallan(
                    data.challan
                );
            }


        } catch (error) {

            setError(error.message);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <Layout>

                <p>
                    Loading challans...
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
                        Challans
                    </h2>

                    <p>
                        Create and manage delivery challans
                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={openForm}
                >
                    Create Challan
                </button>

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
                CHALLAN DETAILS
            ================================== */}

            {showDetails &&
                selectedChallan && (

                    <div
                        className="dashboard-card"
                        style={{
                            marginBottom: "24px"
                        }}
                    >

                        <div className="page-header">

                            <div>

                                <h3>
                                    {
                                        selectedChallan
                                            .challan_number
                                    }
                                </h3>

                                <p>
                                    Challan Details
                                </p>

                            </div>


                            <button
                                className=
                                    "secondary-button"
                                onClick={
                                    closeDetails
                                }
                            >
                                Close
                            </button>

                        </div>


                        {detailsLoading ? (

                            <p>
                                Loading...
                            </p>

                        ) : (

                            <>

                                <div
                                    className=
                                        "challan-details"
                                >

                                    <div>

                                        <strong>
                                            Customer
                                        </strong>

                                        <p>
                                            {
                                                selectedChallan
                                                    .customer_name
                                            }
                                        </p>

                                    </div>


                                    <div>

                                        <strong>
                                            Business
                                        </strong>

                                        <p>
                                            {
                                                selectedChallan
                                                    .business_name ||
                                                "—"
                                            }
                                        </p>

                                    </div>


                                    <div>

                                        <strong>
                                            Status
                                        </strong>

                                        <p>
                                            {
                                                selectedChallan
                                                    .status
                                            }
                                        </p>

                                    </div>


                                    <div>

                                        <strong>
                                            Total Quantity
                                        </strong>

                                        <p>
                                            {
                                                selectedChallan
                                                    .total_quantity
                                            }
                                        </p>

                                    </div>

                                </div>


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
                                                Unit Price
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {challanItems.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            item
                                                                .product_name_snapshot
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item
                                                                .sku_snapshot
                                                        }
                                                    </td>

                                                    <td>
                                                        ₹
                                                        {
                                                            item
                                                                .unit_price_snapshot
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantity
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>


                                {selectedChallan.status ===
                                    "DRAFT" && (

                                    <div
                                        className=
                                            "customer-form-actions"
                                    >

                                        <button
                                            className=
                                                "primary-button"
                                            onClick={() =>
                                                confirmChallan(
                                                    selectedChallan.id
                                                )
                                            }
                                        >
                                            Confirm Challan
                                        </button>

                                    </div>

                                )}

                            </>

                        )}

                    </div>

                )
            }


            {/* ==================================
                CREATE CHALLAN FORM
            ================================== */}

            {showForm && (

                <div
                    className=
                        "dashboard-card customer-form"
                >

                    <h3>
                        Create Challan
                    </h3>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >


                        {/* CUSTOMER */}

                        <div
                            className="form-group"
                            style={{
                                marginBottom:
                                    "20px"
                            }}
                        >

                            <label>
                                Customer
                            </label>


                            <select
                                value={customerId}
                                onChange={(e) =>
                                    setCustomerId(
                                        e.target.value
                                    )
                                }
                                required
                            >

                                <option value="">
                                    Select Customer
                                </option>


                                {customers.map(
                                    (customer) => (

                                        <option
                                            key={
                                                customer.id
                                            }
                                            value={
                                                customer.id
                                            }
                                        >

                                            {
                                                customer.customer_name
                                            }

                                            {customer.business_name
                                                ? ` — ${customer.business_name}`
                                                : ""
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* PRODUCTS */}

                        <h4>
                            Products
                        </h4>


                        {items.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 150px auto",
                                        gap:
                                            "10px",
                                        marginBottom:
                                            "12px"
                                    }}
                                >

                                    {/* PRODUCT */}

                                    <select
                                        value={
                                            item.product_id
                                        }
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "product_id",
                                                e.target.value
                                            )
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
                                                        product
                                                            .product_name
                                                    }

                                                    {" — "}

                                                    {
                                                        product.sku
                                                    }

                                                    {" — Stock: "}

                                                    {
                                                        product
                                                            .current_stock
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>


                                    {/* QUANTITY */}

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder=
                                            "Quantity"
                                        value={
                                            item.quantity
                                        }
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "quantity",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />


                                    {/* REMOVE */}

                                    <button
                                        type="button"
                                        className=
                                            "delete-button"
                                        onClick={() =>
                                            removeItem(
                                                index
                                            )
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            )
                        )}


                        {/* ADD PRODUCT */}

                        <button
                            type="button"
                            className=
                                "secondary-button"
                            onClick={addItem}
                        >
                            + Add Product
                        </button>


                        {/* FORM BUTTONS */}

                        <div
                            className=
                                "customer-form-actions"
                        >

                            <button
                                type="button"
                                className=
                                    "secondary-button"
                                onClick={() =>
                                    setShowForm(
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
                                Create Draft
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ==================================
                CHALLANS TABLE
            ================================== */}

            <div
                className="dashboard-card"
            >

                <table>

                    <thead>

                        <tr>

                            <th>
                                Challan
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Business
                            </th>

                            <th>
                                Quantity
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Created
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {challans.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    style={{
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    No challans found
                                </td>

                            </tr>

                        ) : (

                            challans.map(
                                (challan) => (

                                    <tr
                                        key={
                                            challan.id
                                        }
                                    >

                                        <td>

                                            {
                                                challan
                                                    .challan_number
                                            }

                                        </td>


                                        <td>

                                            {
                                                challan
                                                    .customer_name
                                            }

                                        </td>


                                        <td>

                                            {
                                                challan
                                                    .business_name ||
                                                "—"
                                            }

                                        </td>


                                        <td>

                                            {
                                                challan
                                                    .total_quantity
                                            }

                                        </td>


                                        <td>

                                            {challan.status ===
                                            "DRAFT" ? (

                                                <span
                                                    className=
                                                        "low-stock"
                                                >
                                                    DRAFT
                                                </span>

                                            ) : (

                                                <span
                                                    className=
                                                        "stock-ok"
                                                >
                                                    CONFIRMED
                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            {new Date(
                                                challan
                                                    .created_at
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}

                                        </td>


                                        <td>

                                            <div
                                                className=
                                                    "action-buttons"
                                            >

                                                <button
                                                    className=
                                                        "edit-button"
                                                    onClick={() =>
                                                        viewChallan(
                                                            challan.id
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>


                                                {challan.status ===
                                                    "DRAFT" && (

                                                    <button
                                                        className=
                                                            "primary-button"
                                                        onClick={() =>
                                                            confirmChallan(
                                                                challan.id
                                                            )
                                                        }
                                                    >
                                                        Confirm
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </Layout>
    );
}