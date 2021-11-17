const DATABASE_URL = "ec2-34-198-189-252.compute-1.amazonaws.com";

const { Pool } = require('pg');
const client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
// const client = await pool.connect();

module.exports = client;

//-- LOCAL --

// const { Client } = require('pg');

// //Ganti Sesuai dengan Database yang dituju
// const client = new Client({
//     // Lengkapi koneksi dengan database
//     host: "localhost",
//     port: 5432,
//     user: "postgres",
//     password: "postgres",
//     database: "akur",
// });

// module.exports = client;