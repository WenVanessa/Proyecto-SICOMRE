const express = require('express');
const router = express.Router();
const connection = require('../models/db');

// Función para manejar la lógica de consulta
const handleQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Buscar rutas por placa
router.get('/buscar', async (req, res) => {
    const { placa } = req.query; // Obtenemos la placa de la URL
    const sql = `SELECT * FROM ruta WHERE PlacaRuta LIKE ? AND Estado = 'activo'`;
    const params = [`%${placa}%`]; // Utiliza LIKE para buscar coincidencias

    try {
        const filas = await handleQuery(sql, params);
        res.json(filas);
    } catch (error) {
        console.log('Error en la consulta:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Mostrar todas las rutas
router.get('/', async (req, res) => {
    try {
        const filas = await handleQuery('SELECT * FROM ruta', []);
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Crear una nueva ruta
router.post('/', async (req, res) => {
    const { PlacaRuta, DireccionParadas, NumeroParadas } = req.body;

    const data = { PlacaRuta, DireccionParadas, NumeroParadas };

    try {
        const result = await handleQuery("INSERT INTO ruta SET ?", data);
        data.IdRuta = result.insertId;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar una ruta
router.put('/:IdRuta', async (req, res) => {
    const { IdRuta } = req.params;
    const { PlacaRuta, DireccionParadas, NumeroParadas } = req.body;

    const updates = [PlacaRuta, DireccionParadas, NumeroParadas, IdRuta];

    const sql = "UPDATE ruta SET PlacaRuta = ?, DireccionParadas = ?, NumeroParadas = ? WHERE IdRuta = ?";

    try {
        const results = await handleQuery(sql, updates);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Ruta no encontrada' });
        }
        res.json({ message: 'Ruta actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una ruta
router.delete('/:IdRuta', async (req, res) => {
    const { IdRuta } = req.params;
    try {
        const filas = await handleQuery('DELETE FROM ruta WHERE IdRuta = ?', [IdRuta]);
        if (filas.affectedRows === 0) {
            return res.status(404).json({ message: 'Ruta no encontrada' });
        }
        res.json({ message: 'Ruta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inactivar ruta
router.put('/inactivar/:IdRuta', async (req, res) => {
    const { IdRuta } = req.params;
    try {
        const result = await handleQuery("UPDATE ruta SET Estado = 'inactivo' WHERE IdRuta = ?", [IdRuta]);
        res.json({ message: 'Ruta inactivada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activar usuario
router.put('/activar/:IdRuta', async (req, res) => {
    const { IdRuta } = req.params;
    try {
        const result = await handleQuery("UPDATE ruta SET Estado = 'activo' WHERE IdRuta = ?", [IdRuta]);
        res.json({ message: 'Ruta activada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las rutas activas
router.get('/rutas/activas', async (req, res) => {
    try {
        const rutasActivas = await handleQuery('SELECT IdRuta, PlacaRuta FROM ruta WHERE Estado = "activo"', []);
        res.json(rutasActivas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
