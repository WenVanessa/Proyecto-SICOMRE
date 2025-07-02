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

// Ruta para guardar un viaje
router.post('/', async (req, res) => {
    console.log('Datos recibidos:', req.body);
    const { IdRuta, TiempoRecorrido, FechaViaje, HoraInicio, HoraFinal, NumEstudiantes } = req.body;

    const query = `INSERT INTO viaje (IdRuta, TiempoRecorrido, FechaViaje, HoraInicio, HoraFinal, NumEstudiantes) 
                  VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [IdRuta, TiempoRecorrido, FechaViaje, HoraInicio, HoraFinal, NumEstudiantes];

    try {
        const result = await handleQuery(query, values);
        res.status(201).json({ id: result.insertId, message: 'Viaje guardado con éxito' });
    } catch (error) {
        console.error('Error al guardar el viaje:', error);
        res.status(500).json({ error: 'Error al guardar el viaje' });
    }
});

module.exports = router;