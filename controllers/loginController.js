const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const connection = require('../models/db');
require('dotenv').config();

router.post('/', async (req, res) => {
    const { Usuario, Contraseña } = req.body;

    if (!Usuario || !Contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const query = 'SELECT * FROM usuario WHERE Usuario = ?';
    connection.query(query, [Usuario], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor al consultar la base de datos.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado. Verifica tus credenciales.' });
        }

        const user = results[0];

        // Verificar si el usuario está inactivo
        if (user.Estado === 'inactivo') {
            return res.status(403).json({ error: 'El usuario está inactivo. No se puede iniciar sesión, comuníquese con el administrador.' });
        }

        const contraseñaEncriptada = user.Contraseña;
        const contraseñaCorrecta = await bcryptjs.compare(Contraseña, contraseñaEncriptada);

        if (contraseñaCorrecta) {
            const id = user.IdUsuario;
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                expiresIn: process.env.JWT_TIEMPO_EXPIRA
            });

            const cookiesOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            res.cookie('jwt', token, cookiesOptions);

            return res.json({
                status: 'success',
                message: 'Inicio de sesión exitoso.',
                role: user.TipoRol // Devuelve el rol del usuario
            });
        } else {
            return res.status(401).json({ error: 'Contraseña incorrecta. Intenta nuevamente.' });
        }
    });
});

module.exports = router;
