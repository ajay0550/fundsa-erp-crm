import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo-section">
                <h1>FundsA</h1>
                <p>ERP & CRM</p>
            </div>

            <nav className="nav-menu">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/customers">
                    Customers
                </Link>

                <Link to="/products">
                    Products
                </Link>

                <Link to="/inventory">
                    Inventory
                </Link>

                <Link to="/challans">
                    Challans
                </Link>

            </nav>

            <div className="sidebar-bottom">

                <div className="user-info">
                    <div className="avatar">
                        R
                    </div>

                    <div>
                        <strong>Rahul</strong>
                        <span>Sales</span>
                    </div>
                </div>

                <button className="logout-btn">
                    Logout
                </button>

            </div>

        </aside>
    );
}