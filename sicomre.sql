-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-11-2024 a las 23:09:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sicomre`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `insertarCursoEstudiante` (`_IdCurso` INT, `_IdEstudiante` INT, `_Estado` BOOLEAN)   begin
	insert into CursoEstudiante(IdCurso, IdEstudiante, Estado)
    values(_IdCurso, _IdEstudiante, _Estado);
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertarRuta` (`_PlacaRuta` VARCHAR(8), `_DireccionParadas` VARCHAR(30), `_NumeroParadas` INT)   begin
insert into Ruta(PlacaRuta, DireccionParadas, NumeroParadas)
values (_PlacaRuta, _DireccionParadas, _NumeroParadas); 
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertarViaje` (`_IdRuta` INT, `_IdUsuario` INT, `_TiempoRecorrido` TIME, `_FechaViaje` DATE, `_HoraInicio` TIME, `_HoraFinal` TIME, `_NumEstudiantes` INT)   begin 
insert into Viaje(IdRuta,IdUsuario,TiempoRecorrido,FechaViaje,HoraInicio,HoraFinal,NumEstudiantes)
values (_IdRuta,_IdUsuario,_TiempoRecorrido,_FechaViaje,_HoraInicio,_HoraFinal,_NumEstudiantes); 
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Insertar_Asiste` (`_IdViaje` INT, `_IdEstudiante` INT, `_DescripcionViaje` VARCHAR(100))   begin
    insert into Asistencia (IdViaje, IdEstudiante, DescripcionViaje)
    values (_IdViaje,_IdEstudiante,_DescripcionViaje);
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Insertar_autorizacion` (`_IdEstudiante` INT, `_TipoAutorizacion` VARCHAR(50), `_FechaInicioAutorizacion` DATE, `_FechaFinAutorizacion` DATE, `_Direccion` VARCHAR(70))   begin
    insert into Autorizacion (IdEstudiante, TipoAutorizacion, FechaInicioAutorizacion, FechaFinAutorizacion, Direccion)
    values (_IdEstudiante, _TipoAutorizacion, _FechaInicioAutorizacion, _FechaFinAutorizacion, _Direccion);
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Insertar_curso` (`_IdEstudiante` INT, `_IdDirectora` INT, `_NumeroCurso` INT, `_Descripcion` VARCHAR(255), `_AnoVigencia` YEAR)   begin
    insert into Curso (IdEstudiante, IdDirectora, NumeroCurso, Descripcion, AnoVigencia)
    values (_IdEstudiante, _IdDirectora, _NumeroCurso, _Descripcion, _AnoVigencia);
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Insertar_Estudiante` (`_IdRuta` INT, `_IdViaje` INT, `_NombreEst` VARCHAR(20), `_ApellidosEst` VARCHAR(20), `_TipoIdentificacion` VARCHAR(20), `_NoIdentificacion` INT, `_FechaNacimiento` DATETIME)   begin
    insert into Estudiante(IdRuta, IdViaje, NombreEst, ApellidosEst, TipoIdentificacion, NoIdentificacion, FechaNacimiento)
    values (_IdRuta, _IdViaje, _NombreEst, _ApellidosEst, _TipoIdentificacion, _NoIdentificacion, _FechaNacimiento);
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Insertar_EstudianteUsuario` (IN `_IdAcudiente` INT, IN `_IdEstudiante` INT, IN `_Parentesco` VARCHAR(20))   BEGIN
    IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = _IdAcudiente) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario especificado como acudiente no existe.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM Estudiante WHERE IdEstudiante = _IdEstudiante) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estudiante especificado no existe.';
    END IF;
    INSERT INTO EstudianteUsuario (IdAcudiente, IdEstudiante, Parentesco)
    VALUES (_IdAcudiente, _IdEstudiante, _Parentesco);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_Novedades` (`_IdViaje` INT, `_FechaNovedad` DATE, `_Descripcion` VARCHAR(100))   begin
	insert into Novedades(IdViaje, FechaNovedad, Descripcion)
    values(_IdViaje, _FechaNovedad, _Descripcion);
end$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `Insertar_Usuari` (`_TipoRol` ENUM('Administrador','Monitora','Conductor','Acudiente'), `_Nombres` VARCHAR(20), `_Apellidos` VARCHAR(20), `_TipoIdentificacion` VARCHAR(20), `_NoIdentificacion` INT, `_telefono` INT, `_Correo` VARCHAR(50))   begin
	declare _Usuario varchar(20);
	declare _Contraseña varchar(20);
    -- cast= sirve para convertir un valor de un tipo de datos a otro tipo de datos.
    set _Usuario = cast(_NoIdentificacion as char);
    -- right= sirve para extraer los últimos caracteres de una cadena de texto y con "4" decimos cuantos datos necesitamos en este caso los ultimos 4
    set _Contraseña = concat(_Nombres, right(cast(_NoIdentificacion as char), 4));
    
    insert into Usuario(TipoRol, Nombres, Apellidos, TipoIdentificacion, NoIdentificacion, telefono, Correo, Usuario, Contraseña)
    values(_TipoRol,_Nombres, _Apellidos,_TipoIdentificacion, _NoIdentificacion, _telefono,_Correo,_Usuario,_Contraseña);
end$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `IdViaje` int(11) NOT NULL,
  `IdEstudiante` int(11) NOT NULL,
  `DescripcionViaje` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`IdViaje`, `IdEstudiante`, `DescripcionViaje`) VALUES
(3, 2, 'Asiste a la ruta'),
(3, 2, 'Asiste a la ruta'),
(1, 3, 'Asiste a la ruta'),
(2, 4, 'Asiste a la ruta'),
(5, 2, 'No asiste a la ruta'),
(6, 6, 'Asiste a la ruta'),
(6, 8, 'No asistió a la ruta'),
(6, 4, 'No asistió a la ruta'),
(6, 5, 'No asistió a la ruta'),
(6, 3, 'No asistió a la ruta'),
(6, 3, 'No asistió a la ruta'),
(6, 2, 'No asistió a la ruta'),
(6, 10, 'No asistió a la ruta'),
(6, 9, 'No asistió a la ruta'),
(6, 7, 'Asiste a la ruta'),
(7, 6, 'No asistió a la ruta'),
(7, 8, 'Asiste a la ruta'),
(7, 4, 'Asiste a la ruta'),
(7, 5, 'Asiste a la ruta'),
(7, 3, 'Asiste a la ruta'),
(7, 3, 'Asiste a la ruta'),
(7, 2, 'Asiste a la ruta'),
(7, 10, 'Asiste a la ruta'),
(7, 9, 'Asiste a la ruta'),
(7, 7, 'No asistió a la ruta'),
(8, 8, 'Asiste a la ruta'),
(8, 2, 'Asiste a la ruta'),
(8, 9, 'Asiste a la ruta'),
(8, 4, 'Asiste a la ruta'),
(9, 8, 'Asiste a la ruta'),
(9, 2, 'No asistió a la ruta'),
(9, 4, 'No asistió a la ruta'),
(9, 9, 'Asiste a la ruta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `autorizacion`
--

CREATE TABLE `autorizacion` (
  `IdAutorizacion` int(11) NOT NULL,
  `IdEstudiante` int(11) NOT NULL,
  `TipoAutorizacion` varchar(70) NOT NULL,
  `FechaInicioAutorizacion` date NOT NULL,
  `FechaFinAutorizacion` date NOT NULL,
  `Direccion` varchar(50) NOT NULL,
  `pdfAutorizacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `autorizacion`
--

INSERT INTO `autorizacion` (`IdAutorizacion`, `IdEstudiante`, `TipoAutorizacion`, `FechaInicioAutorizacion`, `FechaFinAutorizacion`, `Direccion`, `pdfAutorizacion`) VALUES
(4, 2, 'Permiso para dejar el estudiante en un punto espec', '2022-02-01', '0000-00-00', 'cll 52', NULL),
(5, 3, 'Permiso para dejar el estudiante en un punto espec', '2022-02-01', '0000-00-00', 'cll 52', NULL),
(6, 4, 'Permiso para dejar el estudiante en un punto espec', '2022-02-01', '0000-00-00', 'cll 52', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso`
--

CREATE TABLE `curso` (
  `IdCurso` int(11) NOT NULL,
  `IdEstudiante` int(11) DEFAULT NULL,
  `IdDirectora` int(11) DEFAULT NULL,
  `NumeroCurso` int(11) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `AnoVigencia` year(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `curso`
--

INSERT INTO `curso` (`IdCurso`, `IdEstudiante`, `IdDirectora`, `NumeroCurso`, `Descripcion`, `AnoVigencia`) VALUES
(2, 2, 1, 302, 'Curso compuesto por 33 estudiantes y 1 directora', '2023'),
(3, 3, 1, 502, 'Curso compuesto por 34 estudiantes y 1 directora', '2024'),
(4, 4, 1, 101, 'Curso compuesto por 35 estudiantes y 1 directora', '2021'),
(5, 5, 1, 703, 'Curso compuesto por 36 estudiantes y 1 directora', '2020'),
(6, NULL, NULL, 402, NULL, NULL),
(7, NULL, NULL, 303, NULL, NULL),
(8, NULL, NULL, 202, NULL, NULL),
(9, NULL, NULL, 803, NULL, NULL),
(10, NULL, NULL, 401, NULL, NULL),
(11, NULL, NULL, 503, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cursoestudiante`
--

CREATE TABLE `cursoestudiante` (
  `IdCurso` int(11) NOT NULL,
  `IdEstudiante` int(11) NOT NULL,
  `Estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cursoestudiante`
--

INSERT INTO `cursoestudiante` (`IdCurso`, `IdEstudiante`, `Estado`) VALUES
(2, 5, 1),
(3, 4, 0),
(4, 3, 1),
(5, 2, 0),
(6, 7, 1),
(7, 8, 1),
(8, 9, 1),
(9, 10, 1),
(10, 6, 1),
(11, 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiante`
--

CREATE TABLE `estudiante` (
  `IdEstudiante` int(11) NOT NULL,
  `IdRuta` int(11) DEFAULT NULL,
  `IdViaje` int(11) DEFAULT NULL,
  `NombreEst` varchar(20) NOT NULL,
  `ApellidosEst` varchar(20) NOT NULL,
  `TipoIdentificacion` varchar(20) NOT NULL,
  `NoIdentificacion` int(11) NOT NULL,
  `FechaNacimiento` date NOT NULL,
  `Estado` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiante`
--

INSERT INTO `estudiante` (`IdEstudiante`, `IdRuta`, `IdViaje`, `NombreEst`, `ApellidosEst`, `TipoIdentificacion`, `NoIdentificacion`, `FechaNacimiento`, `Estado`) VALUES
(2, 1, 1, 'Juan', 'Perez', 'T.I', 5046695, '2007-05-14', 'activo'),
(3, 3, 5, 'Maria Salome', 'Guarin Martinez', 'T.I', 45632581, '2012-12-04', 'inactivo'),
(4, 4, 3, 'Ulises', 'Espitia', 'T.I', 48510147, '2007-08-30', 'activo'),
(5, 5, 2, 'Tatiana', 'Gonzalez Paez', 'T.I', 450369414, '2007-06-18', 'inactivo'),
(6, 2, 1, 'Manolo', 'Ariza Sarmiento', 'T.I', 41859602, '2009-10-15', 'inactivo'),
(7, NULL, NULL, 'Wendy ', 'Vanessa', 'C.C', 1019026158, '2010-06-28', 'inactivo'),
(8, NULL, NULL, 'Manolo', 'Ariza Sarmiento', 'T.I', 41859602, '2009-10-15', 'activo'),
(9, NULL, NULL, 'David', 'Rubio', 'R.C', 1092302, '2015-05-25', 'activo'),
(10, NULL, NULL, 'Juan', 'Perez', 'T.I', 5046695, '2007-05-14', 'inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudianteusuario`
--

CREATE TABLE `estudianteusuario` (
  `IdAcudiente` int(11) NOT NULL,
  `IdEstudiante` int(11) NOT NULL,
  `Parentesco` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudianteusuario`
--

INSERT INTO `estudianteusuario` (`IdAcudiente`, `IdEstudiante`, `Parentesco`) VALUES
(2, 5, 'Madre'),
(3, 2, 'Madre'),
(4, 3, 'Madre');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedades`
--

CREATE TABLE `novedades` (
  `IdNovedad` int(11) NOT NULL,
  `IdViaje` int(11) NOT NULL,
  `FechaNovedad` date NOT NULL,
  `Descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `novedades`
--

INSERT INTO `novedades` (`IdNovedad`, `IdViaje`, `FechaNovedad`, `Descripcion`) VALUES
(1, 1, '2021-10-14', 'En el camino se pincho una llanta'),
(2, 1, '2022-11-15', 'Ninguno'),
(3, 1, '2023-12-16', 'En el camino se pincho una llanta'),
(4, 1, '2024-01-17', 'Ninguno'),
(5, 1, '2020-02-18', 'En el camino se pincho una llanta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ruta`
--

CREATE TABLE `ruta` (
  `IdRuta` int(11) NOT NULL,
  `PlacaRuta` varchar(8) NOT NULL,
  `DireccionParadas` varchar(30) NOT NULL,
  `NumeroParadas` int(11) NOT NULL,
  `Estado` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ruta`
--

INSERT INTO `ruta` (`IdRuta`, `PlacaRuta`, `DireccionParadas`, `NumeroParadas`, `Estado`) VALUES
(1, 'PMA-159', 'Calle 123 #45-09', 5, 'activo'),
(2, 'GUR-853', 'Cra 7 #40-02', 10, 'activo'),
(3, 'LPA-942', 'Cra 10 #50-20', 12, 'activo'),
(4, 'SEV-593', 'Calle 140 #10-55', 8, 'activo'),
(5, 'GYU', 'Cra 2 #65-93', 15, 'inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `IdUsuario` int(11) NOT NULL,
  `Imagen` varchar(255) DEFAULT NULL,
  `TipoRol` enum('Administrador','Monitora','Conductor','Acudiente') NOT NULL,
  `Nombres` varchar(20) NOT NULL,
  `Apellidos` varchar(20) NOT NULL,
  `TipoIdentificacion` varchar(20) NOT NULL,
  `NoIdentificacion` int(11) NOT NULL,
  `telefono` int(11) NOT NULL,
  `Correo` varchar(50) NOT NULL,
  `Usuario` varchar(20) NOT NULL,
  `Contraseña` varchar(255) NOT NULL,
  `Estado` enum('activo','inactivo') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`IdUsuario`, `Imagen`, `TipoRol`, `Nombres`, `Apellidos`, `TipoIdentificacion`, `NoIdentificacion`, `telefono`, `Correo`, `Usuario`, `Contraseña`, `Estado`) VALUES
(1, NULL, 'Monitora', 'Andrea', 'Pineda', 'C.C', 1234598, 3118286, 'mon@gmail.com', '1234598', 'Andrea4598', 'activo'),
(2, NULL, 'Conductor', 'Angel', 'Calderón Espitia', 'C.C', 596246, 32547165, 'angel24@gmail.com', '596246', 'Angel6246', 'activo'),
(3, NULL, 'Acudiente', 'Daniel', 'Lopez Espinosa', 'CC', 2469874, 345951743, 'danlie@gmail.com', 'dani', '$2a$08$.PgROjP/AU3qb9PVzziz/OV.SheHmygUxT1Pj3roXurUQc2myaghi', 'activo'),
(4, NULL, 'Administrador', 'Esperanza', 'Chinchilla', 'CC', 45668122, 369412015, 'chinchillae23@gmail.com', 'elsuperpro', '$2a$08$.Kt3E5HnCaDRW', 'activo'),
(5, NULL, 'Monitora', 'Nidia', 'Santamaria', 'C.C', 416952, 2147483647, 'nidiasanta67@gmail', '416952', 'Nidia6952', 'activo'),
(6, NULL, 'Monitora', 'Carolina', 'Pinzon', 'C.C', 1234599, 3118285, 'caropin@gmail.com', '1234599', 'Carolina4599', 'activo'),
(7, 'uploads\\1729088582325-images.png', 'Administrador', 'Israel', 'Camargo', 'CC', 4565414, 48454, 'israel98@gmail.com', 'camargo', '$2a$08$EYITgoQO9rCdHmcfNC4zVeSG8bM1lkRe82VeoBi.a.F7MTPssMO7G', 'activo'),
(8, 'uploads\\1729633840322-Captura de pantalla (38).png', 'Monitora', 'Paula', 'Calderón', 'CC', 7492021, 7439893, 'paula123@gmail.com', 'paula', '$2a$08$W8obHFUNLbDoNoQYIgDjb.HgzCOF4QWZwT/UfHnYkQlRGSZIxT.oW', 'activo'),
(9, NULL, 'Administrador', 'andres', 'perez', 'CC', 10122333, 9876543, 'perro@gmail.com', 'hola', '$2a$08$BRvQ505OxMVFVf3v9lvqJ.WEJzOxQv.JV9eiKHf4.WhajMPYNBF46', 'activo'),
(10, NULL, 'Acudiente', 'perro', 'mundo', 'CC', 753357, 321123, 'jk@j.com', 'perro', '$2a$08$ctzMa.bZTo8vn.ef3kCCluzYlNIvwCrrQkWKuFwJryQJUgs9SIiei', 'activo'),
(11, NULL, 'Monitora', 'florez', 'mundo', 'CC', 10122333, 987654321, 'g@g.com', 'pop', '$2a$08$Y3orZph2jSYa2TsS4Gh7Wucppx8BuEr9UctnSelKdMWisUx5waE0e', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `viaje`
--

CREATE TABLE `viaje` (
  `IdViaje` int(11) NOT NULL,
  `IdRuta` int(11) NOT NULL,
  `IdUsuario` int(11) DEFAULT NULL,
  `TiempoRecorrido` time NOT NULL,
  `FechaViaje` date NOT NULL,
  `HoraInicio` time NOT NULL,
  `HoraFinal` time NOT NULL,
  `NumEstudiantes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `viaje`
--

INSERT INTO `viaje` (`IdViaje`, `IdRuta`, `IdUsuario`, `TiempoRecorrido`, `FechaViaje`, `HoraInicio`, `HoraFinal`, `NumEstudiantes`) VALUES
(1, 1, 3, '01:15:00', '2022-03-05', '05:45:00', '07:00:00', 10),
(2, 4, 1, '01:10:00', '2022-01-07', '05:45:00', '06:50:00', 11),
(3, 3, 2, '01:00:00', '2022-10-08', '05:45:00', '06:45:00', 7),
(4, 3, 1, '01:15:00', '2022-12-09', '05:45:00', '07:00:00', 11),
(5, 1, 2, '01:05:00', '2022-11-10', '05:45:00', '06:50:00', 11),
(6, 1, NULL, '02:00:03', '2024-10-23', '12:58:40', '14:58:43', 2),
(7, 2, NULL, '00:40:00', '2024-10-23', '05:50:00', '06:30:00', 8),
(8, 3, NULL, '02:00:03', '2024-10-23', '13:11:19', '15:11:22', 4),
(9, 4, NULL, '01:00:04', '2024-10-23', '13:14:35', '14:14:39', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD KEY `fk_IdViaje2` (`IdViaje`),
  ADD KEY `fk_IdEstudi` (`IdEstudiante`);

--
-- Indices de la tabla `autorizacion`
--
ALTER TABLE `autorizacion`
  ADD PRIMARY KEY (`IdAutorizacion`),
  ADD KEY `fk_IdEstudiante` (`IdEstudiante`);

--
-- Indices de la tabla `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`IdCurso`),
  ADD KEY `fk_Estudiante` (`IdEstudiante`),
  ADD KEY `fk_Directora` (`IdDirectora`);

--
-- Indices de la tabla `cursoestudiante`
--
ALTER TABLE `cursoestudiante`
  ADD KEY `fk_Curso` (`IdCurso`),
  ADD KEY `fk_Estudiante2` (`IdEstudiante`);

--
-- Indices de la tabla `estudiante`
--
ALTER TABLE `estudiante`
  ADD PRIMARY KEY (`IdEstudiante`),
  ADD KEY `fk_Ruta` (`IdRuta`),
  ADD KEY `fk_IdViaje` (`IdViaje`);

--
-- Indices de la tabla `estudianteusuario`
--
ALTER TABLE `estudianteusuario`
  ADD KEY `fk_IdAcudiente` (`IdAcudiente`),
  ADD KEY `fk_IdEst` (`IdEstudiante`);

--
-- Indices de la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD PRIMARY KEY (`IdNovedad`),
  ADD KEY `fk_IdViaje3` (`IdViaje`);

--
-- Indices de la tabla `ruta`
--
ALTER TABLE `ruta`
  ADD PRIMARY KEY (`IdRuta`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`IdUsuario`);

--
-- Indices de la tabla `viaje`
--
ALTER TABLE `viaje`
  ADD PRIMARY KEY (`IdViaje`),
  ADD KEY `fk_IdRuta` (`IdRuta`),
  ADD KEY `fk_IdUsuario` (`IdUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `autorizacion`
--
ALTER TABLE `autorizacion`
  MODIFY `IdAutorizacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `curso`
--
ALTER TABLE `curso`
  MODIFY `IdCurso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `estudiante`
--
ALTER TABLE `estudiante`
  MODIFY `IdEstudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `novedades`
--
ALTER TABLE `novedades`
  MODIFY `IdNovedad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ruta`
--
ALTER TABLE `ruta`
  MODIFY `IdRuta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `IdUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `viaje`
--
ALTER TABLE `viaje`
  MODIFY `IdViaje` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `fk_IdEstudi` FOREIGN KEY (`IdEstudiante`) REFERENCES `estudiante` (`IdEstudiante`),
  ADD CONSTRAINT `fk_IdViaje2` FOREIGN KEY (`IdViaje`) REFERENCES `viaje` (`IdViaje`);

--
-- Filtros para la tabla `autorizacion`
--
ALTER TABLE `autorizacion`
  ADD CONSTRAINT `fk_IdEstudiante` FOREIGN KEY (`IdEstudiante`) REFERENCES `estudiante` (`IdEstudiante`);

--
-- Filtros para la tabla `curso`
--
ALTER TABLE `curso`
  ADD CONSTRAINT `fk_Directora` FOREIGN KEY (`IdDirectora`) REFERENCES `usuario` (`IdUsuario`),
  ADD CONSTRAINT `fk_Estudiante` FOREIGN KEY (`IdEstudiante`) REFERENCES `estudiante` (`IdEstudiante`);

--
-- Filtros para la tabla `cursoestudiante`
--
ALTER TABLE `cursoestudiante`
  ADD CONSTRAINT `fk_Curso` FOREIGN KEY (`IdCurso`) REFERENCES `curso` (`IdCurso`),
  ADD CONSTRAINT `fk_Estudiante2` FOREIGN KEY (`IdEstudiante`) REFERENCES `estudiante` (`IdEstudiante`);

--
-- Filtros para la tabla `estudiante`
--
ALTER TABLE `estudiante`
  ADD CONSTRAINT `fk_IdViaje` FOREIGN KEY (`IdViaje`) REFERENCES `viaje` (`IdViaje`),
  ADD CONSTRAINT `fk_Ruta` FOREIGN KEY (`IdRuta`) REFERENCES `ruta` (`IdRuta`);

--
-- Filtros para la tabla `estudianteusuario`
--
ALTER TABLE `estudianteusuario`
  ADD CONSTRAINT `fk_IdAcudiente` FOREIGN KEY (`IdAcudiente`) REFERENCES `usuario` (`IdUsuario`),
  ADD CONSTRAINT `fk_IdEst` FOREIGN KEY (`IdEstudiante`) REFERENCES `estudiante` (`IdEstudiante`);

--
-- Filtros para la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD CONSTRAINT `fk_IdViaje3` FOREIGN KEY (`IdViaje`) REFERENCES `viaje` (`IdViaje`);

--
-- Filtros para la tabla `viaje`
--
ALTER TABLE `viaje`
  ADD CONSTRAINT `fk_IdRuta` FOREIGN KEY (`IdRuta`) REFERENCES `ruta` (`IdRuta`),
  ADD CONSTRAINT `fk_IdUsuario` FOREIGN KEY (`IdUsuario`) REFERENCES `usuario` (`IdUsuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
