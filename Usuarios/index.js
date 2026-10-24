const express = require('express');
const usuariosController = require('./src/controllers/UsuariosController');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Montaje de rutas con el prefijo correcto
app.use('/api/usuarios', usuariosController);

// Inicio del servidor
app.listen(3004, () => {
    console.log('Servidor corriendo en el puerto 3004');
});