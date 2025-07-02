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

// Función para crear la relación estudiante-curso
const crearRelacion = async (req, res) => {
    const { IdCurso, IdEstudiante } = req.body;
    const data = { IdCurso: IdCurso, IdEstudiante: IdEstudiante };

    try {
        await handleQuery("INSERT INTO cursoestudiante SET ?", data);
        res.status(201).json({ message: 'Relación estudiante-curso creada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para obtener el curso por estudiante
const obtenerCursoPorEstudiante = async (req, res) => {
    const idEstudiante = req.params.id;

    try {
        const result = await handleQuery(
            'SELECT curso.NombreCurso FROM cursoestudiante JOIN curso ON cursoestudiante.IdCurso = curso.IdCurso WHERE IdEstudiante = ?',
            [idEstudiante]
        );
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Curso no encontrado para este estudiante' });
        }

        res.json(result[0]); // Enviamos solo el primer curso encontrado
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear el router y definir las rutas
const express = require('express');
const router = express.Router();

router.post('/', crearRelacion); // Ruta para crear la relación estudiante-curso
router.get('/:id', obtenerCursoPorEstudiante); // Ruta para obtener el curso por estudiante

// Obtener curso del estudiante
router.get('/cursoestudiante/:IdEstudiante', async (req, res) => {
    const { IdEstudiante } = req.params;
    const sql = `
        SELECT c.NumeroCurso 
        FROM cursoestudiante ce 
        LEFT JOIN curso c ON ce.IdCurso = c.IdCurso 
        WHERE ce.IdEstudiante = ?
    `;
    try {
        const filas = await handleQuery(sql, [IdEstudiante]);
        if (filas.length === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        res.json(filas[0]); // Retornar solo el primer curso asociado
    } catch (error) {
        console.log('Error al obtener el curso:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Exportar el router
module.exports = router;
