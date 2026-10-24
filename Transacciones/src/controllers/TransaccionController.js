const { Router } = require('express');
const router = Router();
const axios = require('axios');
const transaccionModel = require('../models/TransaccionModel');

router.get('/', async (req, res) => {
  try {
    const transacciones = await transaccionModel.obtenerTransacciones();
    const transaccionesConDetalle = await Promise.all(
      transacciones.map(async (t) => {
        let compradorData = null;
        let vendedorData = null;
        let vehiculoData = null;

        if (t.id_comprador) {
          try {
            const resComprador = await axios.get(`http://192.168.100.3:3004/api/usuarios/${t.id_comprador}`);
            compradorData = resComprador.data;
          } catch (e) { compradorData = { nota: 'Comprador no disponible' }; }
        }

        if (t.id_vendedor) {
          try {
            const resVendedor = await axios.get(`http://192.168.100.3:3004/api/usuarios/${t.id_vendedor}`);
            vendedorData = resVendedor.data;
          } catch (e) { vendedorData = { nota: 'Vendedor no disponible' }; }
        }

        if (t.id_vehiculo) {
          try {
            const resVehiculo = await axios.get(`http://192.168.100.3:3005/api/vehiculos/${t.id_vehiculo}`);
            vehiculoData = resVehiculo.data;
          } catch (e) { vehiculoData = { nota: 'Vehículo no disponible' }; }
        }

        return {
          id_venta: t.id_venta,
                    monto_total: t.monto_total,
          metodo_pago: t.metodo_pago,
          fecha_venta: t.fecha_venta,
          id_comprador: t.id_comprador,
          id_vendedor: t.id_vendedor,
          id_vehiculo: t.id_vehiculo,
          comprador: compradorData,
          vendedor: vendedorData,
          vehiculo: vehiculoData
        };
      })
    );

    res.status(200).json(transaccionesConDetalle);
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ error: "Error del servidor al obtener las transacciones" });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_vehiculo, id_comprador, id_vendedor, id_publicacion, metodo_pago, fecha_venta } = req.body;

    if (!id_vehiculo || !id_comprador || !id_vendedor || !metodo_pago || !fecha_venta) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const resVehiculo = await axios.get(`http://192.168.100.3:3005/api/vehiculos/${id_vehiculo}`);
    const vehiculo = resVehiculo.data;
    if (vehiculo.estado === 'Vendido') {
      return res.status(400).json({ error: "El vehículo ya se encuentra vendido" });
    }

    await axios.get(`http://192.168.100.3:3004/api/usuarios/${id_comprador}`);
    await axios.get(`http://192.168.100.3:3004/api/usuarios/${id_vendedor}`);

        if (id_publicacion) {
      try {
        await axios.get(`http://192.168.100.3:3002/api/publicaciones/${id_publicacion}`);
      } catch (e) {
        console.warn("Publicación no encontrada, se omite.");
      }
    }

    const monto_total = vehiculo.precio;

    const resultado = await transaccionModel.crearTransaccion(
      id_vehiculo,
      id_comprador,
      id_vendedor,
      Number(monto_total),
      metodo_pago,
      fecha_venta
    );

    try {
      await axios.put(`http://192.168.100.3:3005/api/vehiculos/${id_vehiculo}/estado`, { estado: 'Vendido' });
    } catch (e) {
      console.warn("No se pudo actualizar el estado del vehículo a Vendido");
    }

    res.status(201).json({
      mensaje: "Transacción registrada con éxito",
      id_venta: resultado.insertId
    });

  } catch (error) {
    console.error("Error al insertar transacción:", error);
    res.status(500).json({
      error: "Error al registrar la transacción. Verifique que el vehículo, comprador o vendedor existan."
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaccion = await transaccionModel.obtenerTransaccionPorId(id);
    if (!transaccion) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }
    res.status(200).json(transaccion);
  } catch (error) {
    console.error("Error al consultar transacción:", error);
    res.status(500).json({ error: "Error del servidor al consultar la transacción" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_total, metodo_pago, fecha_venta } = req.body;

    await transaccionModel.actualizarTransaccion(
      id,
      Number(monto_total),
      metodo_pago,
      fecha_venta
    );

    res.status(200).json({ mensaje: "Transacción actualizada con éxito" });
  } catch (error) {
    console.error("Error al actualizar transacción:", error);
    res.status(500).json({ error: "Error del servidor al actualizar la transacción" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
        await transaccionModel.eliminarTransaccion(id);
    res.status(200).json({ mensaje: "Transacción eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar transacción:", error);
    res.status(500).json({ error: "Error del servidor al eliminar la transacción" });
  }
});

module.exports = router;