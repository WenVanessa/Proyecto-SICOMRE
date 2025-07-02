const express = require('express');
const router = express.Router();
const conexion = require('../models/db');
const authController = require('./auth'); 

// Función para manejar las consultas
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

// Ruta para obtener la información de la tabla estudianteusuario filtrada por IdAcudiente
router.get('/:IdAcudiente', async (req, res) => {
    const { IdAcudiente } = req.params;

    const query = `
        SELECT * 
        FROM estudianteusuario 
        WHERE IdAcudiente = ?
    `;

    try {
        const results = await handleQuery(query, [IdAcudiente]);

        if (results.length === 0) {
            res.status(404).json({ success: false, message: 'No se encontraron relaciones para este acudiente.' });
        } else {
            res.status(200).json({ success: true, data: results });
        }
    } catch (error) {
        console.error('Error al obtener las relaciones:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las relaciones' });
    }
});


// Ruta para guardar la relación en la tabla estudianteusuario
router.post('/', async (req, res) => {
    const { IdAcudiente, IdEstudiante, Parentesco } = req.body;

    const query = `
        INSERT INTO estudianteusuario (IdAcudiente, IdEstudiante, Parentesco) 
        VALUES (?, ?, ?)
    `;

    try {
        await handleQuery(query, [IdAcudiente, IdEstudiante, Parentesco]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al guardar la relación:', error);
        res.status(500).json({ success: false, message: 'Error al guardar la relación' });
    }
});



module.exports = router;