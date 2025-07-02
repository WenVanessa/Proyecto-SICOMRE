const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const bcryptjs = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const authController = require('../controllers/auth');


// Configuración de multer para manejar las imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para el archivo
    }
});

const upload = multer({ storage });

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

// Mostrar todos los usuarios o buscar por nombre o correo
router.get('/', async (req, res) => {
    const { search } = req.query; // Captura el parámetro de búsqueda
    try {
        let query = 'SELECT * FROM usuario';
        let params = [];

        if (search) {
            query += ' WHERE Nombres LIKE ? OR Correo LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        const filas = await handleQuery(query, params);
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mostrar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const filas = await handleQuery('SELECT * FROM usuario', []);
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mostrar un solo usuario
router.get('/:IdUsuario', async (req, res) => {
    const { IdUsuario } = req.params;
    try {
        const fila = await handleQuery('SELECT * FROM usuario WHERE IdUsuario = ?', [IdUsuario]);
        if (fila.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(fila[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo usuario
router.post('/', upload.single('Imagen'), async (req, res) => {

    const { TipoRol, Nombres, Apellidos, TipoIdentificacion, NoIdentificacion, telefono, Correo } = req.body;

    const Usuario = String(NoIdentificacion);
    const ContraseñaSinEncriptar = `${Nombres}${NoIdentificacion.slice(-4)}`;
    const Contraseña = await bcryptjs.hash(ContraseñaSinEncriptar, 8);

    const Imagen = req.file ? req.file.path : null; // Ruta de la imagen

    const data = { TipoRol, Nombres, Apellidos, TipoIdentificacion, NoIdentificacion, telefono, Correo, Usuario, Contraseña, Imagen};

    try {
        const result = await handleQuery("INSERT INTO usuario SET ?", data);
        data.IdUsuario = result.insertId;
        delete data.Contraseña; // No enviar la contraseña en la respuesta
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar un usuario
router.put('/:IdUsuario', upload.single('Imagen'), async (req, res) => {
    const { IdUsuario } = req.params;
    const { TipoRol, Nombres, Apellidos, TipoIdentificacion, NoIdentificacion, telefono, Correo, Usuario } = req.body;

    // Normalizar la propiedad de Contraseña solo si se está editando
    const Contraseña = req.body['ContraseÃ±a'] || req.body['Contraseña'] || undefined;

    const updates = [TipoRol, Nombres, Apellidos, TipoIdentificacion, NoIdentificacion, telefono, Correo, Usuario];
    const updateParams = [];
    
    if (Contraseña) {
        updates.push(await bcryptjs.hash(Contraseña, 8)); // Encriptar la nueva contraseña
    } else {
        updates.push(undefined); // Si no hay contraseña, agrega undefined
    }

    const Imagen = req.file ? req.file.path : undefined; // Nueva imagen si se subió

    let sql = "UPDATE usuario SET TipoRol = ?, Nombres = ?, Apellidos = ?, TipoIdentificacion = ?, NoIdentificacion = ?, telefono = ?, Correo = ?, Usuario = ?";
    
    if (Contraseña) sql += ", Contraseña = ?";
    if (Imagen) sql += ", Imagen = ?";
    sql += " WHERE IdUsuario = ?";

    updateParams.push(Imagen, IdUsuario);

    try {
        const results = await handleQuery(sql, updates.concat(updateParams).filter(Boolean));
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Eliminar un usuario
router.delete('/:IdUsuario', async (req, res) => {
    const { IdUsuario } = req.params;
    try {
        // Obtener la ruta de la imagen para eliminarla del sistema
        const usuario = await handleQuery('SELECT Imagen FROM usuario WHERE IdUsuario = ?', [IdUsuario]);
        if (usuario.length > 0) {
            const imagePath = usuario[0].Imagen;
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Eliminar archivo
            }
        }

        const filas = await handleQuery('DELETE FROM usuario WHERE IdUsuario = ?', [IdUsuario]);
        if (filas.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inactivar usuario
router.put('/inactivar/:IdUsuario', async (req, res) => {
    const { IdUsuario } = req.params;
    try {
        const result = await handleQuery("UPDATE usuario SET Estado = 'inactivo' WHERE IdUsuario = ?", [IdUsuario]);
        res.json({ message: 'Usuario inactivado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activar usuario
router.put('/activar/:IdUsuario', async (req, res) => {
    const { IdUsuario } = req.params;
    try {
        const result = await handleQuery("UPDATE usuario SET Estado = 'activo' WHERE IdUsuario = ?", [IdUsuario]);
        res.json({ message: 'Usuario activado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/hijos', authController.isAuthenticated, authController.hasRole(['Acudiente']), async (req, res) => {
    try {
        const idAcudiente = req.user.IdUsuario;

        // Aquí haces la consulta para obtener los estudiantes relacionados.
        const estudiantes = await connection.query(
            `SELECT e.*
             FROM estudiante AS e
             INNER JOIN estudianteusuario AS eu ON e.IdEstudiante = eu.IdEstudiante
             WHERE eu.IdUsuario = ?`,
            [idAcudiente]
        );

        res.json(estudiantes);
    } catch (error) {
        console.error('Error al obtener los hijos:', error);
        res.status(500).json({ error: 'Error al obtener los hijos.' });
    }
});

module.exports = router;
