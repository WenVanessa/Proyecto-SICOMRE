const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración del motor de plantillas
app.set('view engine', 'ejs');

// Carpeta para archivos estáticos
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Procesar datos enviados desde formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Cambia esto al dominio de tu frontend
    credentials: true // Permitir el envío de cookies
}));
app.use(cookieParser()); // Para trabajar con cookies

// Configuración de las variables de entorno
dotenv.config({ path: './env/.env' });

// Llamar al router
app.use('/', require('./routes/router'));

// Middleware para eliminar la caché
app.use((req, res, next) => {
    if (!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }
    next();
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno del servidor.' });
});

// Configuración del puerto y arranque del servidor
const puerto = process.env.PUERTO || 3000;
app.listen(puerto, () => {
    console.log(`Servidor corriendo en el puerto: ${puerto} = http://localhost:${puerto}`);
});
