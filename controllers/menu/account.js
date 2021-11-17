const express = require('express');
const app = express();
const path = require('path')
const client = require(path.join(__dirname, 'utility/configDatabase'));
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// })
// const client = await pool.connect();

app.get("/show", async (req, res) => {
    try {
        const values = await client.query("SELECT * FROM akun");
        res.json(values.rows);
    } catch (err) {
        console.error(err.message);
        res.json(err);
    }
});

app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const values = await client.query(`SELECT COUNT(username) FROM akun WHERE username = ${username} AND password = ${password}`);


    } catch (err) {

    }
});


app.post('/register', async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const values = await client.query(`INSERT INTO akun (username, email, password) VALUES ('${username}', '${email}', '${password}')`);

        console.log("Akun Berhasil didaftarkan");
        res.json(values.rows[0]);
    } catch (err) {
        console.error(err.message);
        console.log("Akun gagal didaftarkan");
        res.json(err);
    }
});


app.post("/changePassword", async (req, res) => {
    try {
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const username = req.body.username;

        let checkPassword = await client.query(`SELECT password FROM akun WHERE username = '${username}'`);
        // console.log(checkPassword.rows)
        if (checkPassword.rows[0].password == oldPassword) {
            const values = await client.query(`UPDATE akun SET password = '${newPassword}' WHERE username = '${username}'`);
            // res.json({
            //   success:true
            // })
            res.send(true);
        }
        else {
            res.send(false);
            // res.json({
            //   success:false
            // })
        }
    } catch (err) {
        console.error(err.message);
        res.json(err);
    }
});

module.exports = app;