import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API_URL from "../services/api";

export default function Dashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/dashboard/summary`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load dashboard"
                    );
                }

                setDashboard(data);

            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };

        fetchDashboard();

    }, []);


    if (loading) {
        return (
            <Layout>
                <p>Loading dashboard...</p>
            </Layout>
        );
    }


    if (error) {
        return (
            <Layout>
                <p>{error}</p>
            </Layout>
        );
    }


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
                    <h3>{dashboard.customers}</h3>
                </div>


                <div className="stat-card">
                    <span>Products</span>
                    <h3>{dashboard.products}</h3>
                </div>


                <div className="stat-card">
                    <span>Low Stock</span>
                    <h3>{dashboard.lowStock}</h3>
                </div>


                <div className="stat-card">
                    <span>Pending Challans</span>
                    <h3>{dashboard.pendingChallans}</h3>
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

                        {dashboard.recentChallans.map((challan) => (

                            <tr key={challan.id}>

                                <td>
                                    {challan.challan_number}
                                </td>

                                <td>
                                    {challan.business_name}
                                </td>

                                <td>

                                    <span
                                        className={
                                            `status ${
                                                challan.status === "CONFIRMED"
                                                    ? "confirmed"
                                                    : "draft"
                                            }`
                                        }
                                    >
                                        {challan.status}
                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </Layout>
    );
}