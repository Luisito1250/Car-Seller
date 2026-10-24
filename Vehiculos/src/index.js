const express = require('express');
const vehiculoController = require('./controllers/vehiculoController');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(vehiculoController);

app.listen(3005, () => {
  console.log('Servidor ejecutandose en el puerto 3005');
});