const { Router } = require('express');
const router = Router();
const axios = require('axios');
const productosModel = require('../models/productosModel');

// ==========================================
// OBTENER TODAS LAS CITAS (GET)
// ==========================================
router.get('/api/citas', async (req, res) => {
  try {
    const citas = await productosModel.obtenerProductos();

    const citasConDetalle = await Promise.all(
      citas.map(async (c) => {
        let compradorData = null;
        let vehiculoData = null;

        if (c.id_comprador) {
          try {
            const resComprador = await axios.get(`http://192.168.100.3:3004/api/usuarios/${c.id_comprador}`);
            compradorData = resComprador.data;
          } catch (e) {
            compradorData = { nota: 'Comprador no disponible' };
          }
        }

        if (c.id_vehiculo) {
          try {
            const resVehiculo = await axios.get(`http://192.168.100.3:3005/api/vehiculos/${c.id_vehiculo}`);
            vehiculoData = resVehiculo.data;
          } catch (e) {
            vehiculoData = { nota: 'Vehículo no disponible' };
          }
        }

        return {
          id_cita: c.id_cita,          id_comprador: c.id_comprador,
          id_vehiculo: c.id_vehiculo,
          fecha_hora: c.fecha_hora,
          estado_cita: c.estado_cita,
          comprador: compradorData,
          vehiculo: vehiculoData,
          publicacion: null
        };
      })
    );

    res.status(200).json(citasConDetalle);
  } catch (error) {
    console.error("Error al obtener las citas:", error);
    res.status(500).json({ error: "Error del servidor al obtener las citas" });
  }
});

// ==========================================
// OBTENER CITA POR ID (GET)
// ==========================================
router.get('/api/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await productosModel.obtenerProductoPorId(id);
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    try {
      if (cita.id_comprador) {
        const resComprador = await axios.get(`http://192.168.100.3:3004/api/usuarios/${cita.id_comprador}`);
        cita.comprador = resComprador.data;
      }
      if (cita.id_vehiculo) {
        const resVehiculo = await axios.get(`http://192.168.100.3:3005/api/vehiculos/${cita.id_vehiculo}`);
        cita.vehiculo = resVehiculo.data;
              }
    } catch (e) {
      console.warn("No se pudieron cargar todos los detalles remotos");
    }

    res.status(200).json(cita);
  } catch (error) {
    console.error("Error al obtener cita por ID:", error);
    res.status(500).json({ error: "Error del servidor al obtener la cita" });
  }
});

// ==========================================
// CREAR CITA (POST)
// ==========================================
router.post('/api/citas', async (req, res) => {
  try {
    let { id_comprador, id_vehiculo, correo, usuario, placa, fecha_hora, estado_cita } = req.body;

    if (!fecha_hora) {
      return res.status(400).json({ error: "La fecha y hora son obligatorias" });
    }

    // 1. Obtener ID del vehículo si enviaron la placa
    if (!id_vehiculo && placa) {
      try {
        const resVehiculos = await axios.get('http://192.168.100.3:3005/api/vehiculos');
        const vehiculoEncontrado = resVehiculos.data.find(v =>
          v.placa && String(v.placa).trim().toUpperCase() === String(placa).trim().toUpperCase()
        );
        if (vehiculoEncontrado) {
          id_vehiculo = vehiculoEncontrado.id_vehiculo || vehiculoEncontrado.id;
        } else {
          return res.status(404).json({ error: `No existe un vehículo registrado con la placa ${placa}` });
        }
      } catch (err) {
        return res.status(500).json({ error: "No se pudo conectar con el servicio de vehículos para verificar la placa" });
              }
    }

    // 2. Obtener ID del comprador si enviaron el correo/usuario
    const emailOBusqueda = correo || usuario;
    if (!id_comprador && emailOBusqueda) {
      try {
        const resUsuarios = await axios.get('http://192.168.100.3:3004/api/usuarios');
        const usuarioEncontrado = resUsuarios.data.find(u =>
          (u.correo && u.correo.toLowerCase() === emailOBusqueda.toLowerCase()) ||
          (u.nombre && u.nombre.toLowerCase() === emailOBusqueda.toLowerCase()) ||
          (u.usuario && u.usuario.toLowerCase() === emailOBusqueda.toLowerCase())
        );
        if (usuarioEncontrado) {
          id_comprador = usuarioEncontrado.id || usuarioEncontrado.id_usuario;
        } else {
          return res.status(404).json({ error: `No existe un usuario registrado con la credencial ${emailOBusqueda}` });
        }
      } catch (err) {
        return res.status(500).json({ error: "No se pudo conectar con el servicio de usuarios" });
      }
    }

    // 3. Validar que tengamos ambos IDs necesarios
    if (!id_comprador || !id_vehiculo) {
      return res.status(400).json({ error: "No se pudieron resolver el comprador y el vehículo obligatorios." });
    }

    const estadoInicial = estado_cita || 'Pendiente';

    // 4. Guardar en la base de datos
    await productosModel.crearProducto(id_comprador, id_vehiculo, fecha_hora, estadoInicial);
    res.status(201).json({ mensaje: "Cita creada con éxito" });

  } catch (error) {
    console.error("Error al insertar cita:", error);
    res.status(500).json({
            error: "Error del servidor al crear la cita."
    });
  }
});

// ==========================================
// ACTUALIZAR CITA (PUT) - MEJORADO Y CORREGIDO
// ==========================================
router.put('/api/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { id_comprador, id_vehiculo, correo, usuario, placa, fecha_hora, estado_cita } = req.body;

    // 1. Obtener la cita actual para mantener datos existentes si algo viene vacío
    const citaActual = await productosModel.obtenerProductoPorId(id);
    if (!citaActual) {
      return res.status(404).json({ error: "La cita a actualizar no existe" });
    }

    // Usar la fecha actual de la base de datos si no envían una nueva
    const fechaFinal = fecha_hora || citaActual.fecha_hora;
    const estadoFinal = estado_cita || citaActual.estado_cita;

    // 2. Resolver ID del comprador si no viene directo
    if ((!id_comprador || id_comprador === 'null') && (correo || usuario)) {
      const busqueda = correo || usuario;
      try {
        const resUsuarios = await axios.get('http://192.168.100.3:3004/api/usuarios');
        const usuarioEncontrado = resUsuarios.data.find(u =>
          (u.correo && u.correo.toLowerCase() === busqueda.toLowerCase()) ||
          (u.nombre && u.nombre.toLowerCase() === busqueda.toLowerCase()) ||
          (u.usuario && u.usuario.toLowerCase() === busqueda.toLowerCase())
        );
        if (usuarioEncontrado) {
          id_comprador = usuarioEncontrado.id || usuarioEncontrado.id_usuario;
        }
      } catch (e) {
                console.warn("Advertencia: No se pudo conectar con el microservicio de usuarios");
      }
    }

    // 3. Resolver ID del vehículo si no viene directo
    if ((!id_vehiculo || id_vehiculo === 'null') && placa) {
      try {
        const resVehiculos = await axios.get('http://192.168.100.3:3005/api/vehiculos');
        const vehiculoEncontrado = resVehiculos.data.find(v =>
          v.placa && String(v.placa).trim().toUpperCase() === String(placa).trim().toUpperCase()
        );
        if (vehiculoEncontrado) {
          id_vehiculo = vehiculoEncontrado.id_vehiculo || vehiculoEncontrado.id;
        }
      } catch (e) {
        console.warn("Advertencia: No se pudo conectar con el microservicio de vehículos");
      }
    }

    // 4. Si después de buscar siguen siendo nulos, mantener los valores que ya tenía la cita
    const idCompradorFinal = id_comprador || citaActual.id_comprador;
    const idVehiculoFinal = id_vehiculo || citaActual.id_vehiculo;

    // 5. Ejecutar actualización en la base de datos
    await productosModel.editarProducto(id, idCompradorFinal, idVehiculoFinal, fechaFinal, estadoFinal);

    res.status(200).json({ mensaje: "Cita actualizada con éxito" });

  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ error: "Error del servidor al actualizar la cita" });
  }
});

// ==========================================
// ELIMINAR CITA (DELETE)
// ==========================================
router.delete('/api/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await productosModel.eliminarProducto(id);
    res.status(200).json({ mensaje: "Cita eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ error: "Error del servidor al eliminar cita" });
  }
});

module.exports = router;