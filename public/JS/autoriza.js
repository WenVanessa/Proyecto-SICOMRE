// URL de la API para las autorizaciones
const urlAutorizaciones = 'http://localhost:3000/api/autorizaciones';
const urlEstudiantes = 'http://localhost:3000/api/estudiante'; 
const contenedor = document.querySelector('tbody');
let resultados = '';

// Modal y Formulario de autorización
const modalAutorizacion = new bootstrap.Modal(document.getElementById('modalAutorizacion'));
const formAutorizacion = document.getElementById('formAutorizacion');
const idEstudiante = document.getElementById('idEstudiante');
const tipoAutorizacion = document.getElementById('tipoAutorizacion');
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');
const direccion = document.getElementById('direccion');
const pdfAutorizacion = document.getElementById('pdfAutorizacion');
const btnCrear = document.getElementById('btnCrear');
let opcion = '';
let idForm = '';

// Buscar en la tabla de autorizaciones
const busquedaInput = document.getElementById('busqueda');

busquedaInput.addEventListener('input', function () {
    const busquedaTexto = busquedaInput.value.toLowerCase(); 
    const autorizacionesFiltradas = autorizaciones.filter(autorizacion => {
        const nombreEstudiante = estudiantesCache[autorizacion.IdEstudiante] || 'Estudiante inactivo';
        return nombreEstudiante.toLowerCase().includes(busquedaTexto);
    });

    mostrarAutorizaciones(autorizacionesFiltradas);
});

let estudiantesCache = {};

const formatearFecha = (fecha) => {

    if (!fecha || isNaN(new Date(fecha).getTime())) {
        return 'Sin fecha';
    }
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0'); 
    return `${year}-${month}-${day}`;
};

let autorizaciones = [];

// Función para mostrar las autorizaciones en la tabla
const mostrarAutorizaciones = (autorizacionesMostrar) => {
    resultados = '';
    
    autorizacionesMostrar.forEach(autorizacion => {
        const idEstudiante = autorizacion.IdEstudiante;
        let nombreEstudiante = estudiantesCache[idEstudiante];

        if (!nombreEstudiante) {
            fetch(`${urlEstudiantes}/${idEstudiante}`)
                .then(response => response.json())
                .then(estudiante => {
                    if (!estudiante || estudiante.Estado.toLowerCase() !== 'activo') {
                        estudiantesCache[idEstudiante] = 'Estudiante inactivo';
                        nombreEstudiante = 'Estudiante inactivo';
                    } else {
                        estudiantesCache[idEstudiante] = `${estudiante.NombreEst} ${estudiante.ApellidosEst}`;
                        nombreEstudiante = estudiantesCache[idEstudiante];
                    }

                    mostrarAutorizaciones(autorizaciones); // Recursión para mostrar las autorizaciones después de actualizar el nombre
                })
                .catch(error => {
                    console.error('Error al cargar el estudiante:', error);
                    estudiantesCache[idEstudiante] = 'Estudiante inactivo';
                    nombreEstudiante = 'Estudiante inactivo';
                    mostrarAutorizaciones(autorizaciones);
                });
        } else {
            nombreEstudiante = estudiantesCache[idEstudiante];
        }

        const fechaInicioFormateada = formatearFecha(autorizacion.FechaInicioAutorizacion);
        const fechaFinFormateada = formatearFecha(autorizacion.FechaFinAutorizacion);
        const pdfAutorizacion = autorizacion.pdfAutorizacion ? `<a href="${autorizacion.pdfAutorizacion}" target="_blank">Ver PDF</a>` : 'No hay autorizaciones';

        resultados += `<tr>
                            <td>${autorizacion.IdAutorizacion}</td>
                            <td>${nombreEstudiante}</td>
                            <td>${autorizacion.TipoAutorizacion}</td>
                            <td>${fechaInicioFormateada}</td>
                            <td>${fechaFinFormateada}</td>
                            <td>${autorizacion.Direccion}</td>
                            <td>${pdfAutorizacion}</td>
                            <td class="text-center">
                                <a class="btnEditar btn btn-primary">Editar</a>
                                <a class="btnBorrar btn btn-danger">Borrar</a>
                            </td>
                       </tr>`;
    });
    contenedor.innerHTML = resultados;
};

fetch(urlAutorizaciones)
    .then(response => response.json())
    .then(data => {
        autorizaciones = data;  
        mostrarAutorizaciones(autorizaciones); 
    })
    .catch(error => console.log(error));

// Función para cargar los estudiantes en el select del formulario
const cargarEstudiantes = () => {
    fetch(urlEstudiantes)
        .then(response => response.json())
        .then(estudiantes => {
            idEstudiante.innerHTML = '<option value="">Seleccionar Estudiante</option>';
            estudiantesActivos = estudiantes.filter(estudiante => estudiante.Estado.toLowerCase() === 'activo');
            estudiantesActivos.forEach(estudiante => {
                const option = document.createElement('option');
                option.value = estudiante.IdEstudiante;
                option.textContent = `${estudiante.NombreEst} ${estudiante.ApellidosEst}`; 
                idEstudiante.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar los estudiantes:', error);
        });
};

// Mostrar las autorizaciones al cargar la página
fetch(urlAutorizaciones)
    .then(response => response.json())
    .then(data => mostrarAutorizaciones(data))
    .catch(error => console.log(error));

// Manejo de eventos delegados
const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e);
        }
    });
};

// Evento para crear nueva autorización
btnCrear.addEventListener('click', () => {
    idEstudiante.value = '';  
    tipoAutorizacion.value = '';
    fechaInicio.value = '';
    fechaFin.value = '';
    direccion.value = '';

    modalAutorizacion.show();
    opcion = 'crear';
});

// Procedimiento Borrar
on(document, 'click', '.btnBorrar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText;

    Swal.fire({
        title: "Eliminar Registro",
        text: "¿Estás seguro de que deseas eliminar esta autorización?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`${urlAutorizaciones}/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => {
                    fila.remove();
                    Swal.fire({
                        title: "¡Registro eliminado!",
                        text: "Registro eliminado con éxito",
                        icon: 'success'
                    });
                })
                .catch(error => {
                    Swal.fire({
                        title: "Error",
                        text: "Error al eliminar el registro",
                        icon: 'error'
                    });
                });
        }
    });
});

// Procedimiento Editar
on(document, 'click', '.btnEditar', e => {
    const fila = e.target.closest('tr');
    idForm = fila.children[0].innerText;
    idEstudiante.value = fila.children[1].innerText;  
    tipoAutorizacion.value = fila.children[2].innerText;
    fechaInicio.value = fila.children[3].innerText;
    fechaFin.value = fila.children[4].innerText;
    direccion.value = fila.children[5].innerText;

    opcion = 'editar';
    modalAutorizacion.show();
});

function calcularFechaFin(fechaInicio) {
    const fecha = new Date(fechaInicio);
    const año = fecha.getFullYear();
    const fechaFin = new Date(año, 11, 31); 
    return fechaFin.toISOString().split('T')[0]; 
}

document.getElementById('fechaInicio').addEventListener('change', function () {
    const fechaInicio = this.value;
    if (fechaInicio) {
        const fechaFin = calcularFechaFin(fechaInicio);
        document.getElementById('fechaFin').value = fechaFin; 
        document.getElementById('fechaFin').disabled = false;  
    } else {
        document.getElementById('fechaFin').disabled = true;  
    }
});


function calcularFechaFin(fechaInicio) {
    const fecha = new Date(fechaInicio);
    const año = fecha.getFullYear();
    const fechaFin = new Date(año, 11, 31); 
    return fechaFin.toISOString().split('T')[0]; 
}

document.getElementById('fechaInicio').addEventListener('change', function () {
    const fechaInicio = this.value;
    if (fechaInicio) {
        const fechaFin = calcularFechaFin(fechaInicio);
        document.getElementById('fechaFin').value = fechaFin; 
        document.getElementById('fechaFin').disabled = true; 
    } else {
        document.getElementById('fechaFin').disabled = true;  
    }
});

// Procedimiento Editar
on(document, 'click', '.btnEditar', e => {
    const fila = e.target.closest('tr');
    idForm = fila.children[0].innerText;
    idEstudiante.value = fila.children[1].innerText;  
    tipoAutorizacion.value = fila.children[2].innerText;
    fechaInicio.value = fila.children[3].innerText;

    const fechaInicioValor = new Date(fechaInicio.value);
    const fechaFinValor = new Date(fechaInicioValor.getFullYear(), 11, 31); 
    fechaFin.value = fechaFinValor.toISOString().split('T')[0]; 

    direccion.value = fila.children[5].innerText;

    document.getElementById('fechaFin').disabled = true;

    opcion = 'editar';
    modalAutorizacion.show();
});

document.getElementById('formAutorizacion').onsubmit = function(e) {
    e.preventDefault();

    const estudiante = document.getElementById('idEstudiante').value;
    const tipoAutorizacion = document.getElementById('tipoAutorizacion').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value; 
    const direccion = document.getElementById('direccion').value;
    const archivo = document.getElementById('pdfAutorizacion').files[0]; 

    // Validar que todos los campos estén completos
    if (!estudiante || !tipoAutorizacion || !fechaInicio || !fechaFin || !direccion || !archivo) {
        let camposFaltantes = [];
        
        if (!estudiante) camposFaltantes.push('Estudiante');
        if (!tipoAutorizacion) camposFaltantes.push('Tipo de Autorización');
        if (!fechaInicio) camposFaltantes.push('Fecha de inicio');
        if (!fechaFin) camposFaltantes.push('Fecha de fin');
        if (!direccion) camposFaltantes.push('Dirección');
        if (!archivo) camposFaltantes.push('Archivo');
        
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: `Por favor, complete los siguientes campos: ${camposFaltantes.join(', ')}.`
        });
        return;
    }

    const data = new FormData();
    data.append('IdEstudiante', estudiante);
    data.append('TipoAutorizacion', tipoAutorizacion);
    data.append('FechaInicioAutorizacion', fechaInicio);
    data.append('FechaFinAutorizacion', fechaFin);  
    data.append('Direccion', direccion);

    if (archivo) {
        data.append('pdfAutorizacion', archivo);
    }

    
    const requestUrl = opcion === 'crear' ? urlAutorizaciones : `${urlAutorizaciones}/${idForm}`;
    const requestOptions = {
        method: opcion === 'crear' ? 'POST' : 'PUT',
        body: data
    };

    fetch(requestUrl, requestOptions)
        .then(response => response.json())
        .then(() => fetch(urlAutorizaciones))
        .then(response => response.json())
        .then(data => {
            mostrarAutorizaciones(data);
            Swal.fire(opcion === 'crear' ? 'Creado' : 'Actualizado', 
                      `Autorización ${opcion === 'crear' ? 'creada' : 'actualizada'} con éxito`, 
                      'success');
        })
        .catch(error => {
            Swal.fire('Error', `Error al ${opcion === 'crear' ? 'crear' : 'actualizar'} la autorización`, 'error');
        });

    modalAutorizacion.hide();
};

window.onload = cargarEstudiantes;
