const express = require('express');
const routerController = require('./controllers/controller');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Importa el controlador genérico
app.use(routerController);

app.listen(3002, '0.0.0.0', () => {
  console.log('Servidor ejecutandose en el puerto 3002');
});