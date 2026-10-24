const mysql = require('mysql2/promise');

// Configuración del pool de conexiones a la base de datos
const connection = mysql.createPool({
    host: process.env.DB_HOST || 'db-usuarios',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'usuarios'
});
// 1. OBTENER TODOS LOS USUARIOS
async function obtenerUsuarios() {
    const [rows] = await connection.query('SELECT id, nombre, correo, rol FROM usuario');
    return rows;
}

// 2. OBTENER USUARIO POR ID
async function obtenerUsuarioPorId(id) {
    const [rows] = await connection.query('SELECT id, nombre, correo, rol FROM usuario WHERE id = ?', [id]);
    return rows[0];
}

// 3. AUTENTICAR USUARIO (LOGIN)
async function autenticarUsuario(correo, password) {
    const [rows] = await connection.query(
        'SELECT id, nombre, correo, rol FROM usuario WHERE correo = ? AND password = ?',
        [correo, password]
    );
    return rows[0];
}

// 4. CREAR NUEVO USUARIO
async function crearUsuario(nombre, correo, password, rol = 'cliente') {
    const [result] = await connection.query(
        'INSERT INTO usuario (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, correo, password, rol]
    );
        return result;
}

// 5. ACTUALIZAR USUARIO
async function actualizarUsuario(id, nombre, correo, password, rol) {
    const [result] = await connection.query(
        'UPDATE usuario SET nombre = ?, correo = ?, password = ?, rol = ? WHERE id = ?',
        [nombre, correo, password, rol, id]
    );
    return result;
}

// 6. ELIMINAR USUARIO
async function eliminarUsuario(id) {
    const [result] = await connection.query(
        'DELETE FROM usuario WHERE id = ?',
        [id]
    );
    return result;
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    autenticarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};
