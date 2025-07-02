const express = require('express');
const router = express.Router();
const usuariosRoutes = require('../controllers/usuarioController');
const estudianteRoutes = require('../controllers/estudianteController');
const rutaRoutes = require('../controllers/rutaController');
const authController = require('../controllers/auth');
const cursoRouter = require('../controllers/cursoController');
const cursoestudianteController = require('../controllers/cursoestudianteController');
const viajeController = require('../controllers/viajeController'); 
const asistenciaController = require('../controllers/asistenciaController'); 
const autorizacion = require('../controllers/autorisaController'); 
const estudianusuaController = require('../controllers/estudianteusuarioController');
const acudienteController = require('../controllers/acudienteController');  
const novedadesController = require('../controllers/novedadesController');



// Rutas de API
router.use('/api/login', require('../controllers/loginController'));
router.use('/api/usuarios', usuariosRoutes);
router.use('/api/estudiante', estudianteRoutes);
router.use('/api/ruta0', rutaRoutes);
router.use('/api/curso', cursoRouter);
router.use('/api/cursoestudiante', cursoestudianteController);
router.use('/api/viaje', viajeController); 
router.use('/api/asistencia',asistenciaController); 
router.use('/api/autorizaciones', autorizacion);
router.use('/api/estudianteusuario', estudianusuaController);
router.use('/api/usuario', acudienteController); 
router.use('/api/novedades',novedadesController); 


// Rutas para las vistas
router.get('/', (req, res) => {    
    res.render('index'); // Renderiza la vista "index"
});

router.get('/contactanos', (req, res) => {    
    res.render('contactanos'); // Renderiza la vista "contactanos"
});

router.get('/nosotros', (req, res) => {    
    res.render('nosotros'); // Renderiza la vista "nosotros"
});

router.get('/login', (req, res) => {    
    res.render('login'); // Renderiza la vista "login"
});

// Rutas que requieren autenticación
router.get('/perfil', authController.isAuthenticated, (req, res) => {
    res.render('perfil', { user: req.user });
});

router.get('/configuracion', authController.isAuthenticated, (req, res) => {
    res.render('configuracion', { user: req.user });
});

router.get('/acudiente', authController.isAuthenticated, authController.hasRole(['Acudiente']), (req, res) => {
    res.render('acudiente', { user: req.user });
});

router.get('/administrador-crud-conductor', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) => {
    res.render('administrador-crud-conductor', { user: req.user });
});

router.get('/administrador-crud-estudiantes', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) => {
    res.render('administrador-crud-estudiantes', { user: req.user });
});

router.get('/administrador-crud-monitor', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) => {
    res.render('administrador-crud-monitor', { user: req.user });
});

router.get('/administrador-crud-administrador', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) =>{
    res.render('administrador-crud-administrador', {user: req.use});
});

router.get('/administrador-crud-ruta', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) =>{
    res.render('administrador-crud-ruta', {user: req.user});
});

router.get('/administrador', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) => {
    res.render('administrador', { user: req.user });
});

router.get('/administrador-crud-acudiente', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) => {
    res.render('administrador-crud-acudiente', { user: req.user });
});

router.get('/administrador-crud-autorizacion', authController.isAuthenticated, authController.hasRole(['Administrador']), (req, res) => {
    res.render('administrador-crud-autorizacion', { user: req.user });
});

router.get('/conductor', authController.isAuthenticated, authController.hasRole(['Conductor']), (req, res) => {
    res.render('conductor', { user: req.user });
});

router.get('/monitora', authController.isAuthenticated, authController.hasRole(['Monitora']), (req, res) => {
    res.render('monitora', { user: req.user });
});

// Ruta de logout
router.get('/logout', authController.logout); 

// Manejo de rutas no encontradas
router.use((req, res) => {
    res.status(404).render('404'); 
});

module.exports = router;


