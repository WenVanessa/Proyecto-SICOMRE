const mysql = require('mysql');
require('dotenv').config(); // Cargar las variables de entorno desde .env

// Configuración de la conexión a MySQL
const conexion = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_DATABASE || 'test'
});

// Conexión a la base de datos
conexion.connect((error) => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // Terminar el proceso si falla la conexión
    } else {
        console.log("¡Conexión exitosa a la base de datos!");
    }
});

module.exports = conexion;
