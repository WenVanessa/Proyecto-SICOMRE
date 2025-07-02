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

// Obtener todos los cursos
router.get('/', async (req, res) => {
    try {
        const results = await handleQuery('SELECT * FROM curso', []);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/estudiantes', async (req, res) => {
    const cursoId = req.query.cursoId;

    // SQL query para obtener estudiantes activos
    let sql = `
        SELECT 
            e.IdEstudiante,
            e.NombreEst, 
            e.ApellidosEst, 
            c.NumeroCurso
        FROM estudiante e
        LEFT JOIN cursoestudiante ce ON e.IdEstudiante = ce.IdEstudiante
        LEFT JOIN curso c ON ce.IdCurso = c.IdCurso
        WHERE e.Estado = 'activo'`; // Filtra por estudiantes activos

    const params = [];

    if (cursoId) {
        sql += ` AND c.IdCurso = ?`;
        params.push(cursoId);
    }

    sql += ` ORDER BY e.ApellidosEst, e.NombreEst`;

    try {
        const estudiantes = await handleQuery(sql, params);
        res.json(estudiantes);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
});

module.exports = router;