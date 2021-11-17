const cool = require('cool-ascii-faces');
const express = require('express')
const app = express();
const cors = require('cors');
const menu = require('./controllers/routePath')

const path = require('path')
const PORT = process.env.PORT || 5000
// const DATABASE_URL = "ec2-34-198-189-252.compute-1.amazonaws.com";
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// })
const client = require('./utility/configDatabase');

app
  .use(express.static(path.join(__dirname, 'public')))
  .use(cors())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()));

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

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
