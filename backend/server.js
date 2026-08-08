const express = require("express");
require("dotenv").config();
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req,res)=>{
    res.send("Funds backend running");
})

app.get("/api/test-db", async (req,res)=>{
    try{
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully"
        });
    }
    catch (error){
        console.log(error);
        res.status(500).json({
            message: "conenction failed"
        });
    }
});


const PORT = 5000 || process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});