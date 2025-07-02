const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const authController = require('../controllers/auth');

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

router.get('/', async (req, res) => {
    try {
        const filas = await handleQuery('SELECT * FROM usuario', []);
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/usuario/hijos', authController.isAuthenticated, async (req, res) => {
    try {
        const IdAcudiente = req.user.IdUsuario;
        const query = `
            SELECT e.* 
            FROM estudiante e
            JOIN estudianteusuario eu ON e.IdEstudiante = eu.IdEstudiante
            WHERE eu.IdAcudiente = ?
        `;
        
        const estudiantes = await handleQuery(query, [IdAcudiente]);
        
        res.status(200).json(estudiantes);
    } catch (error) {
        console.error('Error al obtener los hijos:', error);
        res.status(400).json({ 
            success: false, 
            message: 'Error al obtener los hijos',
            error: error.message 
        });
    }
});

module.exports = router;