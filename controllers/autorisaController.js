const express = require('express');
const router = express.Router();
const connection = require('../models/db');  // Asegúrate de tener configurada tu conexión a la base de datos
const multer = require('multer');
const fs = require('fs');

// Configuración de multer para manejar archivos PDF
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);  // Crear el directorio si no existe
        }
        cb(null, uploadDir);  // Carpeta donde se guardarán los PDFs
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para el archivo
    }
});

const upload = multer({ storage });

// Función para manejar la consulta a la base de datos
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

// Crear una nueva autorización (subir PDF)
router.post('/', upload.single('pdfAutorizacion'), async (req, res) => {


    const { IdEstudiante, TipoAutorizacion, FechaInicioAutorizacion, FechaFinAutorizacion, Direccion } = req.body;
    const pdfAutorizacion = req.file ? req.file.path : null;

    try {
        // Verifica que los datos de entrada estén completos
        if (!IdEstudiante || !TipoAutorizacion || !FechaInicioAutorizacion || !FechaFinAutorizacion || !Direccion) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        const estudiante = await handleQuery('SELECT * FROM estudiante WHERE IdEstudiante = ?', [IdEstudiante]);
        if (estudiante.length === 0) {
            return res.status(400).json({ message: 'El estudiante no existe' });
        }

        const data = {
            IdEstudiante,
            TipoAutorizacion,
            FechaInicioAutorizacion,
            FechaFinAutorizacion,
            Direccion,
            pdfAutorizacion
        };

        const result = await handleQuery('INSERT INTO autorizacion SET ?', data);
        data.IdAutorizacion = result.insertId;

        res.status(201).json(data);
    } catch (error) {
        console.error("Error al insertar datos:", error); // Mostrar el error completo
        res.status(500).json({ error: error.message });
    }
});


// Obtener todas las autorizaciones
router.get('/', async (req, res) => {
    try {
        const filas = await handleQuery('SELECT * FROM autorizacion', []);
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una autorización específica por su ID
router.get('/:IdAutorizacion', async (req, res) => {
    const { IdAutorizacion } = req.params;
    try {
        const fila = await handleQuery('SELECT * FROM autorizacion WHERE IdAutorizacion = ?', [IdAutorizacion]);
        if (fila.length === 0) {
            return res.status(404).json({ message: 'Autorización no encontrada' });
        }
        res.json(fila[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar una autorización
router.put('/:IdAutorizacion', upload.single('pdfAutorizacion'), async (req, res) => {
    const { IdAutorizacion } = req.params;
    const { IdEstudiante, TipoAutorizacion, FechaInicioAutorizacion, FechaFinAutorizacion, Direccion } = req.body;
    const pdfAutorizacion = req.file ? req.file.path : undefined; // Si se sube un nuevo PDF, actualizar la ruta

    let sql = `UPDATE autorizacion SET IdEstudiante = ?, TipoAutorizacion = ?, FechaInicioAutorizacion = ?, FechaFinAutorizacion = ?, Direccion = ?`;
    const updates = [IdEstudiante, TipoAutorizacion, FechaInicioAutorizacion, FechaFinAutorizacion, Direccion];
    
    if (pdfAutorizacion) {
        sql += `, pdfAutorizacion = ?`;
        updates.push(pdfAutorizacion);
    }

    sql += ` WHERE IdAutorizacion = ?`;
    updates.push(IdAutorizacion);

    try {
        const result = await handleQuery(sql, updates);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Autorización no encontrada' });
        }
        res.json({ message: 'Autorización actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una autorización
router.delete('/:IdAutorizacion', async (req, res) => {
    const { IdAutorizacion } = req.params;

    try {
        // Obtener la ruta del PDF para eliminarlo
        const autorizacion = await handleQuery('SELECT pdfAutorizacion FROM autorizacion WHERE IdAutorizacion = ?', [IdAutorizacion]);
        if (autorizacion.length > 0) {
            const pdfPath = autorizacion[0].pdfAutorizacion;
            if (pdfPath && fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);  // Eliminar archivo PDF
            }
        }

        const result = await handleQuery('DELETE FROM autorizacion WHERE IdAutorizacion = ?', [IdAutorizacion]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Autorización no encontrada' });
        }
        res.json({ message: 'Autorización eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Descargar el PDF de una autorización
router.get('/download/:IdAutorizacion', async (req, res) => {
    const { IdAutorizacion } = req.params;
    try {
        const autorizacion = await handleQuery('SELECT pdfAutorizacion FROM autorizacion WHERE IdAutorizacion = ?', [IdAutorizacion]);
        if (autorizacion.length === 0 || !autorizacion[0].pdfAutorizacion) {
            return res.status(404).json({ message: 'PDF no encontrado' });
        }

        const filePath = autorizacion[0].pdfAutorizacion;
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ error: 'Error al descargar el archivo' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los estudiantes
router.get('/estudiantes', async (req, res) => {
    try {
        const estudiantes = await handleQuery('SELECT IdEstudiante, NombreEst,ApellidosEst FROM estudiante', []);
        console.log(estudiantes);
        res.json(estudiantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
