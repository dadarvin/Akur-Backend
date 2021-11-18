const express = require('express');
const app = express();
const path = require('path')
const client = require(path.join(__dirname, '../../utility/configDatabase'));
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
        const values = await client.query("SELECT * FROM users");
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

        const values = await client.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);
        if (values.rows.length < 1) {
            res.json({
                user_id: -1
            })
        } else if (values.rows.length >= 1) {
            res.json({
                user_id: values.rows[0].user_id,
            });
        }
    } catch (err) {

    }
});

app.post('/register', async (req, res) => {
    try {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

        const checkExisting = await client.query(`SELECT COUNT(username) from users WHERE username = '${username}'`);

        if (checkExisting.rows.length >= 1) {
            res.json("User Exists !");
        } else {
            const values = await client.query(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`);
            console.log("Akun Berhasil didaftarkan");
            res.json(values);
        }

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

        let checkPassword = await client.query(`SELECT password FROM users WHERE username = '${username}'`);
        // console.log(checkPassword.rows)
        if (checkPassword.rows[0].password == oldPassword) {
            const values = await client.query(`UPDATE users SET password = '${newPassword}' WHERE username = '${username}'`);
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