const { Router } = require('express');
const router = Router();
const axios = require('axios');
const vehiculoModel = require('../models/vehiculoModel');

router.get('/api/vehiculos', async (req, res) => {
  try {
    const vehiculos = await vehiculoModel.obtenerVehiculos();
    res.status(200).json(vehiculos);
  } catch (error) {
    console.error("Error al obtener vehiculos:", error);
    res.status(500).json({ error: "Error del servidor al obtener los vehiculos" });
  }
});

router.get('/api/vehiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await vehiculoModel.obtenerVehiculoPorId(id);
    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    res.status(200).json(vehiculo);
  } catch (error) {
    console.error("Error al obtener vehículo por ID:", error);
    res.status(500).json({ error: "Error del servidor al obtener el vehículo" });
  }
});

router.post('/api/vehiculos', async (req, res) => {
  try {
    const { tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa } = req.body;

    // 1. Guardar vehículo en la BD de vehículos
    const resultado = await vehiculoModel.crearVehiculo(
      tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa
    );
    
    // 2. Crear la publicación de forma automática en el microservicio de Publicaciones (puerto 3002)
    try {
      await axios.post('http://192.168.100.3:3002/api/publicaciones', {
        titulo: `${marca} ${modelo} ${ano}`,
        descripcion: `Vehículo ${tipo} marca ${marca} modelo ${modelo}. Estado: ${estado || 'Disponible'}.`,
        precio_publicacion: precio,
        placa: placa || (resultado ? resultado.insertId : null)
      });
    } catch (e) {
      console.warn("No se pudo crear automáticamente la publicación asociada:", e.message);
    }

    res.status(201).json({ mensaje: "Vehículo y Publicación creados con éxito" });
  } catch (error) {
    console.error("Error al insertar vehiculo:", error);
    res.status(500).json({ error: "Error del servidor al insertar vehiculo" });
  }
});

router.put('/api/vehiculos/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await vehiculoModel.actualizarEstadoVehiculo(id, estado);
    res.status(200).json({ mensaje: `Estado del vehículo actualizado a: ${estado}` });
  } catch (error) {
    console.error("Error al actualizar estado del vehículo:", error);
    res.status(500).json({ error: "Error del servidor al actualizar estado del vehículo" });
  }
});

router.put('/api/vehiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa } = req.body;
    await vehiculoModel.actualizarVehiculo(id, tipo, marca, modelo, ano, precio, kilometraje, estado, imagen, placa);
        res.status(200).json({ mensaje: "Vehiculo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar vehiculo:", error);
    res.status(500).json({ error: "Error del servidor al actualizar vehiculo" });
  }
});

router.delete('/api/vehiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await vehiculoModel.eliminarVehiculo(id);
    res.status(200).json({ mensaje: "Vehiculo eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar vehiculo:", error);
    res.status(500).json({ error: "Error del servidor al eliminar vehiculo" });
  }
});

module.exports = router;