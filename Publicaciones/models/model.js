const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'db-concesionario',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'consesionario'
});

async function obtenerPublicaciones() {
    const [rows] = await connection.query('SELECT * FROM publicacion');
    return rows;
}

async function obtenerPublicacionPorId(id) {
    // Si el 'id' es numérico busca por id_publicacion, si es texto busca por placa para evitar errores de tipo
    const esNumerico = !isNaN(id) && Number.isInteger(Number(id));
    const sql = esNumerico 
        ? 'SELECT * FROM publicacion WHERE id_publicacion = ?' 
        : 'SELECT * FROM publicacion WHERE placa = ?';
        
    const [rows] = await connection.query(sql, [id]);
    return rows[0];
}

async function crearPublicacion(titulo, descripcion, precio_publicacion, fecha_publicacion, placa, imagen) {
    // Garantiza que la fecha sea válida o use la fecha actual
    let fecha = fecha_publicacion;
    if (!fecha || isNaN(new Date(fecha).getTime())) {
        fecha = new Date();
    }

    const [result] = await connection.query(
        'INSERT INTO publicacion (titulo, descripcion, precio_publicacion, fecha_publicacion, placa, imagen) VALUES (?, ?, ?, ?, ?, ?)',
        [
            titulo, 
            descripcion, 
            parseFloat(precio_publicacion) || 0, 
            fecha, 
            placa, 
            imagen || null
        ]
    );
    return result;
}

async function actualizarPublicacion(id_publicacion, titulo, descripcion, precio_publicacion, placa, imagen) {
    // Si id_publicacion es numérico actualiza por id_publicacion; de lo contrario, por placa
    const esNumerico = !isNaN(id_publicacion) && Number.isInteger(Number(id_publicacion));

    const sql = esNumerico
        ? 'UPDATE publicacion SET titulo = ?, descripcion = ?, precio_publicacion = ?, placa = ?, imagen = COALESCE(?, imagen) WHERE id_publicacion = ?'
        : 'UPDATE publicacion SET titulo = ?, descripcion = ?, precio_publicacion = ?, placa = ?, imagen = COALESCE(?, imagen) WHERE placa = ?';

    const [result] = await connection.query(sql, [
        titulo,
        descripcion,
        parseFloat(precio_publicacion) || 0,
        placa,
        imagen || null,
        id_publicacion
    ]);
    return result;
}

async function crearUsuario(nombre, usuario, correo, password, rol) {
    const [result] = await connection.query(
        'INSERT INTO usuario (nombre, usuario, correo, password, rol) VALUES (?, ?, ?, ?, ?)',
        [nombre, usuario, correo, password, rol]
    );
    return result;
}

async function validarUsuario(correo, password) {
    const [rows] = await connection.query(
        'SELECT * FROM usuario WHERE correo = ? AND password = ?',
        [correo, password]
    );
    return rows[0];
}

module.exports = {
    obtenerPublicaciones,
    obtenerPublicacionPorId,
    crearPublicacion,
    actualizarPublicacion,
    crearUsuario,
    validarUsuario
};
