import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Challans from "./pages/Challans";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/customers"
                    element={<Customers />}
                />

                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/challans"
                    element={<Challans />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;