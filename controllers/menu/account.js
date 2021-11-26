const express = require('express');
const app = express();
const path = require('path')
const client = require(path.join(__dirname, '../../utility/configDatabase'));
const axios = require('axios');
const moment = require('moment');
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


app.post('/register', async (req, res) => {
    try {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

        const checkExisting = await client.query(`SELECT COUNT(username) from users WHERE username = '${username}'`);

        if (checkExisting.rows[0].count > 0) {
            res.json("User Exists !");
        } else {
            const values = await client.query(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`);
            console.log("Akun Berhasil didaftarkan");
            res.json("Successfully Registered");
        }

    } catch (err) {
        console.error(err.message);
        console.log("Akun gagal didaftarkan");
        res.json(err);
    }
});

app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const values = await client.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);
        if (values.rows.length === undefined || values.rows.length < 1) {
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

app.post('/userinfo', async (req, res) => {
    try {
        const user_id = req.body.user_id;

        const values = await client.query(`SELECT * FROM users WHERE user_id = ${user_id}`);
        if (values.rows.length === undefined || values.rows.length < 1) {
            res.json("User Id not exists");
        } else if (values.rows.length >= 1) {
            res.json({
                nama_toko: values.rows[0].nama_toko,
                email: values.rows[0].email,
                username: values.rows[0].username
            });
        }
    } catch (err) {

    }
});

app.post("/updateInfo", async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const nama_toko = req.body.nama_toko;
        const phone_number = req.body.phone_number;

        if (nama_toko === undefined || nama_toko == null || nama_toko == "") {
            const values = await client.query(`UPDATE users SET phone_number = '${phone_number}' WHERE user_id = ${user_id}`);
            res.send(true);
        } else if (phone_number === undefined || phone_number == null || phone_number == "") {
            const values = await client.query(`UPDATE users SET nama_toko = '${nama_toko}' WHERE user_id = ${user_id}`);
            res.send(true);
        } else {
            const values = await client.query(`UPDATE users SET nama_toko = '${nama_toko}', phone_number = '${phone_number}' WHERE user_id = ${user_id}`);
            res.send(true);
        }

    } catch (err) {
        console.error(err.message);
        res.send(false);
    }
});

app.post("/changePassword", async (req, res) => {
    try {
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const user_id = req.body.user_id;

        let checkPassword = await client.query(`SELECT password FROM users WHERE user_id = ${user_id}`);
        // console.log(checkPassword.rows)
        if (checkPassword.rows[0].password == oldPassword) {
            const values = await client.query(`UPDATE users SET password = '${newPassword}' WHERE user_id = '${user_id}'`);
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

app.post("/scanResi", async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const nama_kurir = req.body.nama_kurir;
        const no_resi = req.body.no_resi;

        //Tambahin Pengecekan kalo udah ada resi yang sama

        let getKurir = await client.query(`SELECT id_kurir FROM kurir WHERE nama_kurir = '${nama_kurir}'`);
        console.log(getKurir);
        let id_kurir = getKurir.rows[0].id_kurir;
        let currentTime = moment();
        // console.log(checkPassword.rows)
        if (id_kurir != undefined || id_kurir != null) {

            const values = await client.query(`INSERT into qr_scan (user_id, id_kurir, nama_kurir, no_resi, date) VALUES (${user_id}, ${id_kurir}, '${nama_kurir}', '${no_resi}', '${currentTime}')`);
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

app.post("/history", async (req, res) => {
    try {
        const user_id = req.body.user_id;

        const values = await client.query(`SELECT q.id_qr, q.nama_kurir, q.no_resi, a.jenis_kurir, q.date FROM qr_scan AS q LEFT JOIN api_info as a on q.id_qr = a.id_qr WHERE user_id = ${user_id} ORDER BY q.id_qr DESC`);
        // const values = await client.query(`SELECT * FROM qr_scan WHERE user_id = ${user_id}`);

        res.json(values.rows);
    } catch (err) {
        console.error(err.message);
        res.send(false);
    }
});

app.get("/formatResi", async (req, res) => {
    try {
        const values = await client.query(`SELECT * FROM kurir`);

        res.json(values.rows);
    } catch (err) {
        console.error(err.message);
        res.send(false);
    }
});

app.post("/apiInfo", async (req, res) => {
    try {
        const id_qr = req.body.id_qr;
        const api_key = "7920e0c8e6aad029f11340b03627d8cd3a37b4cb6ae157373ad5cba276034096";

        const getData = await client.query(`SELECT * FROM api_info WHERE id_qr = ${id_qr}`);

        if (getData.rows.length < 1) {
            const barcodeInfo = await client.query(`SELECT nama_kurir, no_resi FROM qr_scan WHERE id_qr = ${id_qr}`);
            let kurir = barcodeInfo.rows[0].nama_kurir;
            let resi = barcodeInfo.rows[0].no_resi;

            var config = {
                method: 'get',
                url: `https://api.binderbyte.com/v1/track?api_key=${api_key}&courier=${kurir}&awb=${resi}`,
                headers: {}
            };

            var values;
            axios(config)
                .then(function (response) {
                    data = response.data.summary;
                    values = {
                        jenis_kurir: data.service,
                        date: data.date,
                        status: data.service
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });

            const insertAPI = await client.query(`INSERT INTO api_info (id_qr, jenis_kurir, date, status) VALUES (${id_qr}, '${values.jenis_kurir}', '${values.date}', '${values.service}')`);
            //------- belom selesai
            const newData = await client.query(`SELECT * FROM api_info WHERE id_qr = ${id_qr}`);
            res.json(newData.rows[0]);
        } else {
            res.json(getData.rows[0]);
        }

    } catch (err) {
        console.error(err.message);
        res.send(false);
    }
});

app.post("/dataKurir", async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const nama_kurir = req.body.nama_kurir;

        const values = await client.query(`SELECT * FROM qr_scan WHERE nama_kurir = '${nama_kurir}' AND user_id = ${user_id}`);

        res.json(values.rows);
    } catch (err) {
        console.error(err.message);
        res.send(false);
    }
});

module.exports = app;