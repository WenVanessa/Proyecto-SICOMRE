// auth.js
const jwt = require('jsonwebtoken');
const connection = require('../models/db'); 
require('dotenv').config();

exports.isAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt; 

    if (!token) {
        return res.redirect('/'); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRETO);
        const query = 'SELECT * FROM usuario WHERE IdUsuario = ?';

        connection.query(query, [decoded.id], (err, results) => {
            if (err || results.length === 0) {
                return res.redirect('/'); 
            }
            req.user = results[0]; 
            next();
        });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.redirect('/');
    }
};

// Middleware para verificar roles
exports.hasRole = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.TipoRol)) {
            return next(); 
        }
        
        switch (req.user.TipoRol) {
            case 'Administrador':
                return res.redirect('/administrador');
            case 'Acudiente':
                return res.redirect('/acudiente');
            case 'Conductor':
                return res.redirect('/conductor');
            case 'Monitora':
                return res.redirect('/monitora');
            default:
                return res.redirect('/'); 
        }
    };
};


exports.logout = (req, res) => {
    res.clearCookie('jwt');
    return res.redirect('/');
};
