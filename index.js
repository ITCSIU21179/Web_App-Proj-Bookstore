require('dotenv').config();
const express = require('express');
// const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const hostname = process.env.HOST_Name || 'localhost';
const webRoutes = require('./src/route/web');

const configViewEngine = require('./src/config/viewEngine');

configViewEngine(app);

app.use('/', webRoutes);

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`);
});