const express = require('express');
const router = express.Router();
const conexion = require('../models/db'); // Importa la conexión desde db.js
const { isAuthenticated } = require('../controllers/auth');

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

// Buscar estudiantes por apellido o identificación
router.get('/buscar', async (req, res) => {
    const { query } = req.query; // Obtenemos el query de la URL
    const sql = `
    SELECT e.*, 
           TIMESTAMPDIFF(YEAR, e.FechaNacimiento, CURDATE()) AS edad,
           c.NumeroCurso AS cursoNombre 
    FROM estudiante e
    LEFT JOIN cursoestudiante ce ON e.IDEstudiante = ce.IDEstudiante
    LEFT JOIN curso c ON ce.IDCurso = c.IDCurso
    WHERE (e.ApellidosEst LIKE ? OR e.NoIdentificacion LIKE ?) AND e.Estado = 'activo'
    `;
    const params = [`%${query}%`, `%${query}%`]; // Utiliza LIKE para buscar coincidencias

    try {
        const filas = await handleQuery(sql, params);
        res.json(filas);
    } catch (error) {
        console.log('Error en la consulta:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Mostrar todos los estudiantes
router.get('/', async (req, res) => {
    const { Estado } = req.query; // Leer el parámetro Estado
    let sql = `
        SELECT e.*, c.NumeroCurso,
        TIMESTAMPDIFF(YEAR, e.FechaNacimiento, CURDATE()) AS edad 
        FROM estudiante e 
        LEFT JOIN cursoestudiante ce ON e.IdEstudiante = ce.IdEstudiante 
        LEFT JOIN curso c ON ce.IdCurso = c.IdCurso
    `;

    // Filtrar por estado si el parámetro está presente
    if (Estado) {
        sql += ` WHERE e.Estado = ?`;
    }

    try {
        const filas = await handleQuery(sql, Estado ? [Estado] : []);
        res.json(filas);
    } catch (error) {
        console.log('Error en la consulta:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Mostrar todos los estudiantes con sus cursos y la edad calculada
router.get('/', async (req, res) => {
    const sql = `
        SELECT e.*, c.NumeroCurso,
        TIMESTAMPDIFF(YEAR, e.FechaNacimiento, CURDATE()) AS edad 
        FROM estudiante e 
        LEFT JOIN cursoestudiante ce ON e.IdEstudiante = ce.IdEstudiante 
        LEFT JOIN curso c ON ce.IdCurso = c.IdCurso
    `;
    try {
        const filas = await handleQuery(sql);
        res.json(filas);
    } catch (error) {
        console.log('Error en la consulta:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Mostrar un solo estudiante con la edad calculada
router.get('/:IdEstudiante', async (req, res) => {
    const { IdEstudiante } = req.params;
    const sql = `
        SELECT *, 
        TIMESTAMPDIFF(YEAR, FechaNacimiento, CURDATE()) AS edad 
        FROM estudiante 
        WHERE IdEstudiante = ? AND Estado = 'activo'
    `;
    try {
        const fila = await handleQuery(sql, [IdEstudiante]);
        if (fila.length === 0) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
        } else {
            res.json(fila[0]);
        }
    } catch (error) {
        console.log('Error en la consulta:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo estudiante y curso
router.post('/', async (req, res) => {
    const { NombreEst, ApellidosEst, TipoIdentificacion, NoIdentificacion, FechaNacimiento, NumeroCurso } = req.body;

    // Validación de campos
    if (!NombreEst || !ApellidosEst || !TipoIdentificacion || !NoIdentificacion || !FechaNacimiento || !NumeroCurso) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // Iniciar transacción
        await handleQuery('START TRANSACTION');

        // 1. Insertar en la tabla estudiante
        const sqlEstudiante = "INSERT INTO estudiante (NombreEst, ApellidosEst, TipoIdentificacion, NoIdentificacion, FechaNacimiento, Estado) VALUES (?, ?, ?, ?, ?, 'activo')";
        const resultEstudiante = await handleQuery(sqlEstudiante, [NombreEst, ApellidosEst, TipoIdentificacion, NoIdentificacion, FechaNacimiento]);
        const IdEstudiante = resultEstudiante.insertId;

        // 2. Insertar o actualizar en la tabla curso
        const sqlCurso = "INSERT INTO curso (NumeroCurso) VALUES (?) ON DUPLICATE KEY UPDATE IdCurso=LAST_INSERT_ID(IdCurso)";
        const resultCurso = await handleQuery(sqlCurso, [NumeroCurso]);
        const IdCurso = resultCurso.insertId;

        // 3. Insertar en la tabla cursoestudiante con estado 1
        const sqlCursoEstudiante = "INSERT INTO cursoestudiante (IdEstudiante, IdCurso, Estado) VALUES (?, ?, 1)";
        await handleQuery(sqlCursoEstudiante, [IdEstudiante, IdCurso]);

        // Confirmar transacción
        await handleQuery('COMMIT');

        res.status(201).json({ 
            message: 'Estudiante registrado correctamente',
            IdEstudiante,
            IdCurso
        });

    } catch (error) {
        // Revertir transacción en caso de error
        await handleQuery('ROLLBACK');
        console.error('Error al registrar estudiante:', error);
        res.status(500).json({ error: error.message });
    }
});

// Editar un estudiante sin el campo edad
router.put('/:IdEstudiante', async (req, res) => {
    const { IdEstudiante } = req.params;
    const { NombreEst, ApellidosEst, TipoIdentificacion, NoIdentificacion, FechaNacimiento, NumeroCurso } = req.body;

    try {
        // Iniciar transacción
        await handleQuery('START TRANSACTION');

        // 1. Actualizar información del estudiante
        const sqlUpdateEstudiante = `
            UPDATE estudiante 
            SET NombreEst = ?,
                ApellidosEst = ?,
                TipoIdentificacion = ?,
                NoIdentificacion = ?,
                FechaNacimiento = ?
            WHERE IdEstudiante = ?
        `;
        await handleQuery(sqlUpdateEstudiante, [
            NombreEst,
            ApellidosEst,
            TipoIdentificacion,
            NoIdentificacion,
            FechaNacimiento,
            IdEstudiante
        ]);

        // 2. Obtener o crear el ID del curso
        const sqlCurso = "INSERT INTO curso (NumeroCurso) VALUES (?) ON DUPLICATE KEY UPDATE IdCurso=LAST_INSERT_ID(IdCurso)";
        const resultCurso = await handleQuery(sqlCurso, [NumeroCurso]);
        const IdCurso = resultCurso.insertId;

        // 3. Actualizar o crear el registro en cursoestudiante
        const sqlUpdateCursoEstudiante = `
            INSERT INTO cursoestudiante (IdEstudiante, IdCurso, Estado)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE
            IdCurso = ?, Estado = 1
        `;
        await handleQuery(sqlUpdateCursoEstudiante, [IdEstudiante, IdCurso, IdCurso]);

        // Confirmar transacción
        await handleQuery('COMMIT');

        res.json({ 
            message: 'Estudiante y curso actualizados correctamente',
            IdEstudiante,
            IdCurso
        });

    } catch (error) {
        // Revertir transacción en caso de error
        await handleQuery('ROLLBACK');
        console.error('Error al actualizar estudiante y curso:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un estudiante
router.delete('/:IdEstudiante', async (req, res) => {
    const { IdEstudiante } = req.params;
    try {
        const filas = await handleQuery('DELETE FROM estudiante WHERE IdEstudiante = ?', [IdEstudiante]);
        if (filas.affectedRows === 0) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
        } else {
            res.json({ message: 'Estudiante eliminado correctamente' });
        }
    } catch (error) {
        console.log('Error al eliminar estudiante:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Activar un estudiante
router.put('/activar/:IdEstudiante', async (req, res) => {
    const { IdEstudiante } = req.params;
    const sql = `UPDATE estudiante SET Estado = 'activo' WHERE IdEstudiante = ?`;

    try {
        const results = await handleQuery(sql, [IdEstudiante]);
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
        } else {
            res.json({ message: 'Estudiante activado correctamente' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inactivar un estudiante
router.put('/inactivar/:IdEstudiante', async (req, res) => {
    const { IdEstudiante } = req.params;
    const sql = `UPDATE estudiante SET Estado = 'inactivo' WHERE IdEstudiante = ?`;

    try {
        const results = await handleQuery(sql, [IdEstudiante]);
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
        } else {
            res.json({ message: 'Estudiante inactivado correctamente' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/estudiante-acudiente', isAuthenticated, async (req, res) => {
    try {
        // Obtener el ID del acudiente desde la sesión o token
        const acudienteId = req.user;

        // Consulta actualizada usando la tabla estudianteusuario
        const query = `
            SELECT 
                e.IdEstudiante,
                e.NombreEst, 
                e.ApellidosEst, 
                e.TipoIdentificacion, 
                e.NoIdentificacion, 
                e.FechaNacimiento,
                eu.Parentesco
            FROM Estudiante e
            JOIN EstudianteUsuario eu ON e.IdEstudiante = eu.IdEstudiante
            WHERE eu.IdAcudiente = ?
        `;

        const estudiantes = await database.query(query, [acudienteId]);

        if (estudiantes.length === 0) {
            return res.status(404).json({ 
                message: 'No se encontraron estudiantes asociados' 
            });
        }

        res.json(estudiantes);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
});

module.exports = router;
