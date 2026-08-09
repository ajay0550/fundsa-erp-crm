import Layout from "../components/Layout";

export default function Dashboard() {
    return (
        <Layout>

            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>Overview of your business</p>
                </div>
            </div>

            <div className="stats-grid">

                <div className="stat-card">
                    <span>Customers</span>
                    <h3>24</h3>
                </div>

                <div className="stat-card">
                    <span>Products</span>
                    <h3>48</h3>
                </div>

                <div className="stat-card">
                    <span>Low Stock</span>
                    <h3>5</h3>
                </div>

                <div className="stat-card">
                    <span>Pending Challans</span>
                    <h3>7</h3>
                </div>

            </div>

            <div className="dashboard-card">

                <h3>Recent Challans</h3>

                <table>

                    <thead>
                        <tr>
                            <th>Challan</th>
                            <th>Customer</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>CH-0001</td>
                            <td>Rahul Traders</td>
                            <td>
                                <span className="status confirmed">
                                    CONFIRMED
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td>CH-0002</td>
                            <td>ABC Distributors</td>
                            <td>
                                <span className="status draft">
                                    DRAFT
                                </span>
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </Layout>
    );
}