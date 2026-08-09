import { Link, useNavigate } from "react-router-dom";
import { getUserFromToken, getUserRole } from "../utils/auth";

export default function Sidebar() {

    const navigate = useNavigate();

    const user = getUserFromToken();
    const role = getUserRole();


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };


    // ==========================================
    // USER DETAILS
    // ==========================================

    const userName =
        user?.name ||
        user?.username ||
        user?.email ||
        "User";


    const displayRole =
        role || "User";


    const avatar =
        userName
            .charAt(0)
            .toUpperCase();


    // ==========================================
    // SIDEBAR
    // ==========================================

    return (

        <aside className="sidebar">


            {/* ==================================
                LOGO
            ================================== */}

            <div className="logo-section">

                <h1>
                    FundsA
                </h1>

                <p>
                    ERP & CRM
                </p>

            </div>


            {/* ==================================
                NAVIGATION
            ================================== */}

            <nav className="nav-menu">


                {/* DASHBOARD
                    Everyone */}

                <Link to="/dashboard">
                    Dashboard
                </Link>


                {/* CUSTOMERS
                    ADMIN + SALES + ACCOUNTS */}

                {[
                    "ADMIN",
                    "SALES",
                    "ACCOUNTS"
                ].includes(role) && (

                    <Link to="/customers">
                        Customers
                    </Link>

                )}


                {/* PRODUCTS
                    Everyone */}

                <Link to="/products">
                    Products
                </Link>


                {/* INVENTORY
                    ADMIN + WAREHOUSE + ACCOUNTS */}

                {[
                    "ADMIN",
                    "WAREHOUSE",
                    "ACCOUNTS"
                ].includes(role) && (

                    <Link to="/inventory">
                        Inventory
                    </Link>

                )}


                {/* CHALLANS
                    ADMIN + SALES + WAREHOUSE */}

                {[
                    "ADMIN",
                    "SALES",
                    "WAREHOUSE"
                ].includes(role) && (

                    <Link to="/challans">
                        Challans
                    </Link>

                )}

            </nav>


            {/* ==================================
                USER / LOGOUT
            ================================== */}

            <div className="sidebar-bottom">

                <div className="user-info">

                    <div className="avatar">
                        {avatar}
                    </div>


                    <div>

                        <strong>
                            {userName}
                        </strong>

                        <span>
                            {displayRole}
                        </span>

                    </div>

                </div>


                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </aside>
    );
}