-- Users / Employees
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    business_name VARCHAR(150),
    gst_number VARCHAR(30),
    customer_type VARCHAR(20) NOT NULL
        CHECK (customer_type IN ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR')),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'LEAD'
        CHECK (status IN ('LEAD', 'ACTIVE', 'INACTIVE')),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- CRM Follow-ups
CREATE TABLE follow_ups (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL
        REFERENCES customers(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    follow_up_date DATE,
    created_by INTEGER
        REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Products / Inventory
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    unit_price NUMERIC(12,2) NOT NULL
        CHECK (unit_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0
        CHECK (current_stock >= 0),
    min_stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (min_stock_quantity >= 0),
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Stock Movement History
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL
        REFERENCES products(id),
    quantity_changed INTEGER NOT NULL
        CHECK (quantity_changed > 0),
    movement_type VARCHAR(10) NOT NULL
        CHECK (movement_type IN ('IN', 'OUT')),
    reason TEXT,
    created_by INTEGER
        REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Sales Challans
CREATE TABLE challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL
        REFERENCES customers(id),
    total_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    created_by INTEGER
        REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Products inside each Challan
CREATE TABLE challan_items (
    id SERIAL PRIMARY KEY,
    challan_id INTEGER NOT NULL
        REFERENCES challans(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id),
    product_name_snapshot VARCHAR(150) NOT NULL,
    sku_snapshot VARCHAR(50) NOT NULL,
    unit_price_snapshot NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL
        CHECK (quantity > 0)
);