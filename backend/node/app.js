const express = require('express');
const path = require('path');
const config = require('./config');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../frontend/src/pages'));

app.use('/styles', express.static(path.join(__dirname, '../../frontend/src/styles')));
app.use('/scripts', express.static(path.join(__dirname, '../../frontend/src/scripts')));
app.use('/assets', express.static(path.join(__dirname, '../../frontend/public/assets')));

app.use(express.json());

const routes = require('./src/routes');
app.use('/', routes);

app.listen(config.port, () => {
  console.log(`Arzisoft running at http://localhost:${config.port}`);
});
