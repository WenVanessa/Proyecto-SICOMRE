const express = require('express');
const router = express.Router();
const conexion = require('../models/db');

// Función para manejar la lógica de consulta
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

// Obtener todos los nodedades
router.get('/', async (req, res) => {
    try {
        const results = await handleQuery('SELECT * FROM novedades', []);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Insertar datos a la tabla novedad 
router.post('/', async (req, res) => {
    const { IdViaje = null, Descripcion } = req.body; // Desestructuramos el cuerpo de la solicitud
    const FechaNovedad = new Date(); // Obtenemos la fecha actual

    if (!Descripcion) {
        return res.status(400).json({ error: 'La descripción es obligatoria' });
    }

    try {
        const result = await handleQuery(
            'INSERT INTO novedades (IdViaje, FechaNovedad, Descripcion) VALUES (?, ?, ?)',
            [IdViaje, FechaNovedad, Descripcion]
        );
        res.status(201).json({ message: 'Comentario guardado correctamente', IdNovedad: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;