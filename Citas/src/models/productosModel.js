const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'db-citas',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: 'solicitudcita'
});

async function obtenerProductos() {
    // Se ajustó a la tabla real 'solicitudes'
    const result = await connection.query('SELECT * FROM solicitudes');
    return result[0];
}

async function obtenerProductoPorId(id) {
    const result = await connection.query(
        'SELECT * FROM solicitudes WHERE id_cita = ?',
        [id]
    );
    return result[0][0];
}

async function crearProducto(id_comprador, id_vehiculo, fecha_hora, estado_cita) {
    const result = await connection.query(
        'INSERT INTO solicitudes (id_comprador, id_vehiculo, fecha_hora, estado_cita) VALUES (?, ?, ?, ?)',
        [id_comprador, id_vehiculo, fecha_hora, estado_cita || 'Pendiente']
    );
    return result;
}

async function editarProducto(id, id_comprador, id_vehiculo, fecha_hora, estado_cita) {
    const result = await connection.query(
        'UPDATE solicitudes SET id_comprador = ?, id_vehiculo = ?, fecha_hora = ?, estado_cita = ? WHERE id_cita = ?',
        [id_comprador, id_vehiculo, fecha_hora, estado_cita, id]
    );
    return result;
    }

async function eliminarProducto(id) {
    const result = await connection.query(
        'DELETE FROM solicitudes WHERE id_cita = ?',
        [id]
    );
    return result;
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    editarProducto,
    eliminarProducto
};
