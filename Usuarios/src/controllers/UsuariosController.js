const { Router } = require('express');
const router = Router();
const usuariosModel = require('../models/UsuariosModel');

// 1. ENDPOINT DE LOGIN
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const usuario = await usuariosModel.autenticarUsuario(correo, password);

        if (!usuario) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        res.status(200).json({
            mensaje: "Login exitoso",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error del servidor en el inicio de sesión" });
    }
});

// 2. CONSULTAR TODOS LOS USUARIOS
router.get('/', async (req, res) => {
    try {
        const usuarios = await usuariosModel.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error del servidor al obtener los usuarios" });
            }
});

// 3. CONSULTAR USUARIO POR ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await usuariosModel.obtenerUsuarioPorId(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error("Error al consultar usuario por ID:", error);
        res.status(500).json({ error: "Error del servidor al consultar el usuario" });
    }
});

// 4. CREAR USUARIO
router.post('/', async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;
        await usuariosModel.crearUsuario(nombre, correo, password, rol);
        res.status(201).json({ mensaje: 'Usuario creado correctamente' });
    } catch (error) {
        console.error("Error al insertar usuario:", error);
        res.status(500).json({ error: "Error del servidor al insertar el usuario" });
    }
});

// 5. ACTUALIZAR USUARIO
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, password, rol } = req.body;
        await usuariosModel.actualizarUsuario(id, nombre, correo, password, rol);
        res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
            } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error del servidor al actualizar el usuario" });
    }
});

// 6. ELIMINAR USUARIO
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await usuariosModel.eliminarUsuario(id);
        res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error del servidor al eliminar el usuario" });
    }
});

module.exports = router;