import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "mH12UR0245.@",
  database: process.env.DB_NAME || "dentist_platform",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => {
    console.error("MySQL connection failed:", err.message);
    process.exit(1);
  });

export default db;