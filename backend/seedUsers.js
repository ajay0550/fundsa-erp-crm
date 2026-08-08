require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./db");

const users = [
    {
        name: "Admin User",
        email: "admin@fundsa.com",
        password: "Admin@123",
        role: "ADMIN"
    },
    {
        name: "Sales User",
        email: "sales@fundsa.com",
        password: "Sales@123",
        role: "SALES"
    },
    {
        name: "Warehouse User",
        email: "warehouse@fundsa.com",
        password: "Warehouse@123",
        role: "WAREHOUSE"
    },
    {
        name: "Accounts User",
        email: "accounts@fundsa.com",
        password: "Accounts@123",
        role: "ACCOUNTS"
    }
];

const seedUsers = async () => {
    try {
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(
                user.password,
                10
            );

            await pool.query(
                `INSERT INTO users
                (name, email, password_hash, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING`,
                [
                    user.name,
                    user.email,
                    hashedPassword,
                    user.role
                ]
            );
        }

        console.log("Users seeded successfully");

    } catch (error) {
        console.error(error);

    } finally {
        await pool.end();
    }
};

seedUsers();