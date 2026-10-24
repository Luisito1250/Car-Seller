const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'db-transacciones',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'transacciones'
});

const TransaccionModel = {
  obtenerTransacciones: () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM transaccion';
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // CORREGIDO: Ahora recibe las 6 variables necesarias
  crearTransaccion: (id_vehiculo, id_comprador, id_vendedor, monto_total, metodo_pago, fecha_venta) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO transaccion
          (id_vehiculo, id_comprador, id_vendedor, monto_total, metodo_pago, fecha_venta)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [id_vehiculo, id_comprador, id_vendedor, monto_total, metodo_pago, fecha_venta],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
      },

  obtenerTransaccionPorId: (id_venta) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM transaccion WHERE id_venta = ?';
      db.query(sql, [id_venta], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  actualizarTransaccion: (id_venta, monto_total, metodo_pago, fecha_venta) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE transaccion SET monto_total = ?, metodo_pago = ?, fecha_venta = ? WHERE id_venta = ?';
      db.query(sql, [monto_total, metodo_pago, fecha_venta, id_venta], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  eliminarTransaccion: (id_venta) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM transaccion WHERE id_venta = ?';
      db.query(sql, [id_venta], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = TransaccionModel;
