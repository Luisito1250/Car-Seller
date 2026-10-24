const express = require('express');
const productosController = require('./controllers/productosController');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(productosController);

app.listen(3003, () => {
  console.log('capasBack ejecutandose en el puerto 3003');
});