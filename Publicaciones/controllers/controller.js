const { Router } = require('express');
const router = Router();
const axios = require('axios');
const dbModel = require('../models/model');

// ==========================================
// OBTENER TODAS LAS PUBLICACIONES (GET)
// ==========================================
router.get('/api/publicaciones', async (req, res) => {
    try {
        const publicaciones = await dbModel.obtenerPublicaciones();

        let listaVehiculos = [];
        try {
            const resVehiculos = await axios.get(`http://192.168.100.3:3005/api/vehiculos`);
            listaVehiculos = resVehiculos.data;
        } catch (e) {
            console.warn("Advertencia: No se pudo obtener la lista de vehículos desde el microservicio.");
        }

        const publicacionesConDetalle = publicaciones.map((p) => {
            const vehiculoData = listaVehiculos.find(v =>
                (v.placa && String(v.placa).toUpperCase() === String(p.placa).toUpperCase()) ||
                String(v.id_vehiculo) === String(p.placa)
            ) || null;

            return {
                id_publicacion: p.id_publicacion,
                titulo: p.titulo,
                descripcion: p.descripcion,
                precio_publicacion: p.precio_publicacion,
                fecha_publicacion: p.fecha_publicacion,
                placa: p.placa,
                imagen: vehiculoData ? vehiculoData.imagen : null,
                vehiculo: vehiculoData
            };
        });
        
        res.status(200).json(publicacionesConDetalle);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ error: "Error del servidor al obtener las publicaciones" });
    }
});

// ==========================================
// CREAR O ACTUALIZAR PUBLICACIÓN (POST)
// ==========================================
router.post('/api/publicaciones', async (req, res) => {
    try {
        const { titulo, descripcion, precio_publicacion, precio, placa, imagen, imagen_url } = req.body;

        // Normalizar y asegurar campos obligatorios
        const precioFinal = precio_publicacion || precio;
        const tituloFinal = titulo || (placa ? `Vehículo Placa ${placa}` : 'Publicación de Vehículo');
        const descripcionFinal = descripcion || 'Sin descripción';

        if (!placa) {
            return res.status(400).json({ error: "La placa es obligatoria para registrar la publicación" });
        }

        if (!precioFinal) {
            return res.status(400).json({ error: "El precio de la publicación es obligatorio" });
        }

        const placaLimpia = String(placa).trim().toUpperCase();
        const fecha_publicacion = new Date();

        // 1. Verificar si ya existe una publicación previa para esta placa
        let publicacionExistente = null;
        try {
            const publicaciones = await dbModel.obtenerPublicaciones();
            publicacionExistente = publicaciones.find(p => p.placa && String(p.placa).trim().toUpperCase() === placaLimpia);
        } catch (e) {
                        console.warn("No se pudo consultar duplicados previos en publicaciones:", e.message);
        }

        if (publicacionExistente) {
            const idPub = publicacionExistente.id_publicacion || publicacionExistente.id;
            await dbModel.actualizarPublicacion(idPub, tituloFinal, descripcionFinal, precioFinal, placaLimpia);

            return res.status(200).json({
                mensaje: "Publicación existente actualizada correctamente",
                id_publicacion: idPub
            });
        }

        // 2. Crear nueva publicación si no existe
        const result = await dbModel.crearPublicacion(
            tituloFinal,
            descripcionFinal,
            precioFinal,
            fecha_publicacion,
            placaLimpia
        );

        res.status(201).json({
            mensaje: "Publicación creada con éxito",
            id_publicacion: result ? result.insertId : null
        });

    } catch (error) {
        console.error("Error al registrar publicación:", error);
        res.status(500).json({
            error: "Error del servidor al registrar la publicación: " + (error.sqlMessage || error.message)
        });
    }
});

// ==========================================
// ACTUALIZAR PUBLICACIÓN EXISTENTE POR ID (PUT)
// ==========================================
router.put('/api/publicaciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, precio_publicacion, precio, placa } = req.body;
        const precioFinal = precio_publicacion || precio;

        await dbModel.actualizarPublicacion(id, titulo, descripcion, precioFinal, placa);

        res.status(200).json({ mensaje: "Publicación actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar la publicación:", error);
        res.status(500).json({ error: "Error del servidor al actualizar la publicación" });
    }
});

// ==========================================
// CONSULTAR PUBLICACIÓN POR ID (GET)
// ==========================================
router.get('/api/publicaciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const publicacion = await dbModel.obtenerPublicacionPorId(id);
        if (!publicacion) {
            return res.status(404).json({ error: "Publicación no encontrada" });
        }
        res.status(200).json(publicacion);
    } catch (error) {
        console.error("Error al consultar publicación:", error);
        res.status(500).json({ error: "Error del servidor al obtener la publicación" });
    }
});

module.exports = router;