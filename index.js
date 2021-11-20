const express = require('express')
const app = express();
const cors = require('cors');
const path = require('path');
var bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000
// const DATABASE_URL = "ec2-34-198-189-252.compute-1.amazonaws.com";
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// })
const menu = require(path.join(__dirname, 'controllers/routePath'));
const client = require(path.join(__dirname, 'utility/configDatabase'));

app
  .use(express.json())
  .use(express.urlencoded({
    extended: true
  }))
  .use(require('connect').bodyParser())
  .use(cors())

app.get('/', async function (req, res) {
  try {
    res.send("Welcome to API Page for Akur Backend");
  } catch (err) {
    res.json(err);
  }
});

//Router API untuk Account
app.use("/account", menu.account);

app.get('/db', async (req, res) => {
  try {
    // const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    const results = { 'results': (result) ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

app.post('/register', async (req, res) => {
  try {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    const values = await client.query(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`);

    console.log("Akun Berhasil didaftarkan");
    res.json(values.rows[0]);
  } catch (err) {
    console.error(err.message);
    console.log("Akun gagal didaftarkan");
    res.json(err);
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
