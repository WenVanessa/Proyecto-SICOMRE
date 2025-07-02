const express = require('express');
const router = express.Router();
const conexion = require('../models/db');

const handleQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        conexion.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Ruta para guardar asistencia
router.post('/', async (req, res) => {
    const { IdViaje, IdEstudiante, DescripcionViaje } = req.body;

    const query = `INSERT INTO asistencia (IdViaje, IdEstudiante, descripcionViaje) 
                  VALUES (?, ?, ?)`;
    const values = [IdViaje, IdEstudiante, DescripcionViaje];

    try {
        await handleQuery(query, values);
        res.status(201).json({ message: 'Asistencia guardada con éxito' });
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        res.status(500).json({ error: 'Error al guardar asistencia' });
    }
});

module.exports = router;