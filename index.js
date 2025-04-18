require('dotenv').config();
const express = require('express');
// const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const hostname = process.env.HOST_Name || 'localhost';

app.set('views', './src/views/');
app.set('view engine', 'ejs');
app.use(express.static('./src/public'));

app.get('/', (req, res) => {
  res.render('HomePage.ejs');
});

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`);
});