import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API_URL from "../services/api";
import { hasRole } from "../utils/auth";


const emptyForm = {
    customer_name: "",
    mobile: "",
    email: "",
    business_name: "",
    gst_number: "",
    customer_type: "RETAIL",
    address: "",
    status: "LEAD",
    follow_up_date: "",
    notes: ""
};


export default function Customers() {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] =
        useState(null);

    const [formData, setFormData] =
        useState(emptyForm);


    // ==========================================
    // GET CUSTOMERS
    // ==========================================

    useEffect(() => {

        const loadCustomers = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/customers`,
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
                        "Failed to load customers"
                    );
                }


                setCustomers(
                    data.customers
                );


            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };


        loadCustomers();

    }, []);


    // ==========================================
    // HANDLE FORM INPUT
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ==========================================
    // OPEN ADD FORM
    // ==========================================

    const openAddForm = () => {

        setEditingCustomer(null);

        setFormData(emptyForm);

        setError("");

        setShowForm(true);
    };


    // ==========================================
    // OPEN EDIT FORM
    // ==========================================

    const openEditForm = (customer) => {

        setEditingCustomer(customer);

        setFormData({

            customer_name:
                customer.customer_name || "",

            mobile:
                customer.mobile || "",

            email:
                customer.email || "",

            business_name:
                customer.business_name || "",

            gst_number:
                customer.gst_number || "",

            customer_type:
                customer.customer_type ||
                "RETAIL",

            address:
                customer.address || "",

            status:
                customer.status || "LEAD",


            // Convert PostgreSQL date/timestamp
            // to yyyy-mm-dd

            follow_up_date:
                customer.follow_up_date
                    ? new Date(
                        customer.follow_up_date
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            notes:
                customer.notes || ""

        });


        setError("");

        setShowForm(true);
    };


    // ==========================================
    // ADD OR UPDATE CUSTOMER
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token =
                localStorage.getItem("token");


            const url = editingCustomer

                ? `${API_URL}/customers/${editingCustomer.id}`

                : `${API_URL}/customers`;


            const method = editingCustomer
                ? "PUT"
                : "POST";


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

                    body: JSON.stringify(
                        formData
                    )
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    `Failed to ${
                        editingCustomer
                            ? "update"
                            : "create"
                    } customer`
                );
            }


            // UPDATE

            if (editingCustomer) {

                setCustomers(

                    customers.map(
                        (customer) =>

                            customer.id ===
                            editingCustomer.id

                                ? data.customer

                                : customer
                    )

                );

            }


            // ADD

            else {

                setCustomers([

                    data.customer,

                    ...customers

                ]);

            }


            // Close form

            setShowForm(false);


            // Reset

            setEditingCustomer(null);

            setFormData(emptyForm);

            setError("");


        } catch (error) {

            setError(
                error.message
            );
        }
    };


    // ==========================================
    // DELETE CUSTOMER
    // ==========================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this customer?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/customers/${id}`,
                {
                    method: "DELETE",

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
                    "Failed to delete customer"
                );
            }


            // Remove customer

            setCustomers(

                customers.filter(
                    (customer) =>
                        customer.id !== id
                )

            );


        } catch (error) {

            setError(
                error.message
            );
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <Layout>

                <p>
                    Loading customers...
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
                        Customers
                    </h2>

                    <p>
                        Manage your customers and relationships
                    </p>

                </div>


                {/* ADMIN + SALES ONLY */}

                {hasRole(
                    "ADMIN",
                    "SALES"
                ) && (

                    <button
                        className="primary-button"
                        onClick={openAddForm}
                    >
                        Add Customer
                    </button>

                )}

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
                FORM
                ADMIN + SALES ONLY
            ================================== */}

            {showForm &&
                hasRole(
                    "ADMIN",
                    "SALES"
                ) && (

                    <div
                        className=
                            "dashboard-card customer-form"
                    >

                        <h3>

                            {editingCustomer
                                ? "Edit Customer"
                                : "Add Customer"
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


                                {/* CUSTOMER NAME */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Customer Name
                                    </label>

                                    <input
                                        name=
                                            "customer_name"
                                        placeholder=
                                            "Enter customer name"
                                        value={
                                            formData
                                                .customer_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* MOBILE */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Mobile
                                    </label>

                                    <input
                                        name="mobile"
                                        placeholder=
                                            "Enter mobile number"
                                        value={
                                            formData.mobile
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* EMAIL */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder=
                                            "Enter email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* BUSINESS */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Business Name
                                    </label>

                                    <input
                                        name=
                                            "business_name"
                                        placeholder=
                                            "Enter business name"
                                        value={
                                            formData
                                                .business_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* GST */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        GST Number
                                    </label>

                                    <input
                                        name=
                                            "gst_number"
                                        placeholder=
                                            "Enter GST number"
                                        value={
                                            formData
                                                .gst_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* CUSTOMER TYPE */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Customer Type
                                    </label>

                                    <select
                                        name=
                                            "customer_type"
                                        value={
                                            formData
                                                .customer_type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option
                                            value="RETAIL"
                                        >
                                            Retail
                                        </option>

                                        <option
                                            value="WHOLESALE"
                                        >
                                            Wholesale
                                        </option>

                                        <option
                                            value=
                                                "DISTRIBUTOR"
                                        >
                                            Distributor
                                        </option>

                                    </select>

                                </div>


                                {/* ADDRESS */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Address
                                    </label>

                                    <input
                                        name="address"
                                        placeholder=
                                            "Enter address"
                                        value={
                                            formData
                                                .address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* STATUS */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData
                                                .status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option
                                            value="LEAD"
                                        >
                                            Lead
                                        </option>

                                        <option
                                            value="ACTIVE"
                                        >
                                            Active
                                        </option>

                                        <option
                                            value="INACTIVE"
                                        >
                                            Inactive
                                        </option>

                                    </select>

                                </div>


                                {/* FOLLOW UP */}

                                <div
                                    className=
                                        "form-group"
                                >

                                    <label>
                                        Follow-up Date
                                    </label>

                                    <input
                                        type="date"
                                        name=
                                            "follow_up_date"
                                        value={
                                            formData
                                                .follow_up_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* NOTES */}

                                <div
                                    className=
                                        "form-group full-width"
                                >

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        placeholder=
                                            "Enter notes"
                                        value={
                                            formData.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* FORM BUTTONS */}

                            <div
                                className=
                                    "customer-form-actions"
                            >

                                <button
                                    type="button"
                                    className=
                                        "secondary-button"
                                    onClick={() => {

                                        setShowForm(
                                            false
                                        );

                                        setEditingCustomer(
                                            null
                                        );

                                        setFormData(
                                            emptyForm
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

                                    {editingCustomer
                                        ? "Save Changes"
                                        : "Add Customer"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                )}


            {/* ==================================
                CUSTOMER TABLE
            ================================== */}

            <div
                className="dashboard-card"
            >

                <table>

                    <thead>

                        <tr>

                            <th>
                                Customer
                            </th>

                            <th>
                                Business
                            </th>

                            <th>
                                Type
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Follow-up
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {customers.map(
                            (customer) => (

                                <tr
                                    key={
                                        customer.id
                                    }
                                >

                                    <td>
                                        {
                                            customer
                                                .customer_name
                                        }
                                    </td>


                                    <td>
                                        {
                                            customer
                                                .business_name
                                        }
                                    </td>


                                    <td>
                                        {
                                            customer
                                                .customer_type
                                        }
                                    </td>


                                    <td>
                                        {
                                            customer
                                                .status
                                        }
                                    </td>


                                    <td>

                                        {
                                            customer
                                                .follow_up_date

                                            ? new Date(
                                                customer
                                                    .follow_up_date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )

                                            : "—"
                                        }

                                    </td>


                                    <td>

                                        {hasRole(
                                            "ADMIN",
                                            "SALES"
                                        ) && (

                                            <div
                                                className=
                                                    "action-buttons"
                                            >

                                                <button
                                                    className=
                                                        "edit-button"
                                                    onClick={() =>
                                                        openEditForm(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className=
                                                        "delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            customer.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        )}

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