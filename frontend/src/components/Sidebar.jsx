import { Link, useNavigate } from "react-router-dom";
import { getUserFromToken, getUserRole } from "../utils/auth";

export default function Sidebar() {

    const navigate = useNavigate();

    const user = getUserFromToken();
    const role = getUserRole();



    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };


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


    

    return (

        <aside className="sidebar">


            <div className="logo-section">

                <h1>
                    FundsA
                </h1>

                <p>
                    ERP & CRM
                </p>

            </div>


            <nav className="nav-menu">


                <Link to="/dashboard">
                    Dashboard
                </Link>


                {[
                    "ADMIN",
                    "SALES",
                    "ACCOUNTS"
                ].includes(role) && (

                    <Link to="/customers">
                        Customers
                    </Link>

                )}

                <Link to="/products">
                    Products
                </Link>

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