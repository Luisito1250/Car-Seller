const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const transaccionController = require('./controllers/TransaccionController');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/transacciones', transaccionController);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(3001, () => {
  console.log('Servidor ejecutándose en el puerto 3001');
});