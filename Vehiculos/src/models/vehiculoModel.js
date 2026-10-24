const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'db-vehiculos',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'capasalmacen'
});

async function obtenerVehiculos() {
  const result = await connection.query('SELECT * FROM vehiculo');
  return result[0];
}

async function obtenerVehiculoPorId(id) {
  const result = await connection.query('SELECT * FROM vehiculo WHERE id_vehiculo = ?', [id]);
  return result[0][0];
}

async function actualizarEstadoVehiculo(id, estado) {
  const [result] = await connection.query(
    'UPDATE vehiculo SET estado = ? WHERE id_vehiculo = ?',
    [estado, id]
  );
  return result;
}

async function crearVehiculo(tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa) {
  const sql = `
    INSERT INTO vehiculo (tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await connection.query(sql, [
    tipo,
    marca,
    modelo,
    ano,
        precio,
    kilometraje,
    estado,
    imagen,
    placa
  ]);

  // result.insertId contiene el ID del vehículo recién creado en MySQL
  return result;
}

async function actualizarVehiculo(id, tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa) {
  const sql = `
    UPDATE vehiculo
    SET tipo=?, marca=?, modelo=?, ano=?, precio=?, kilometraje=?, estado=?, imagen=?, placa=?
    WHERE id_vehiculo=?
  `;
  const [result] = await connection.query(sql, [
    tipo,
    marca,
    modelo,
    ano,
    precio,
    kilometraje,
    estado,
    imagen,
    placa,
    id
  ]);
  return result;
}

async function eliminarVehiculo(id) {
  const [result] = await connection.query(
    'DELETE FROM vehiculo WHERE id_vehiculo = ?',
    [id]
  );
    return result;
}

module.exports = {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  actualizarEstadoVehiculo,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
};
