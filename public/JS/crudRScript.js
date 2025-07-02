// Definición de variables
const url = 'http://localhost:3000/api/ruta0';
const contenedor = document.querySelector('tbody');
let resultados = '';

const modalRuta = new bootstrap.Modal(document.getElementById('modalRuta'));
const formRuta = document.getElementById('formRuta');
const placaRuta = document.getElementById('placaRuta');
const direccionParadas = document.getElementById('direccionParadas');
const numeroParadas = document.getElementById('numeroParadas');
const btnCrear = document.getElementById('btnCrear');
let opcion = '';
let idForm = '';

// Manejar la búsqueda
document.getElementById('busqueda').addEventListener('input', (e) => {
    const query = e.target.value;
    buscarRutas(query);
});

// Función para buscar rutas
const buscarRutas = (query) => {
    fetch(`http://localhost:3000/api/ruta0/buscar?placa=${query}`) // Cambiado de "query" a "placa"
        .then(response => response.json())
        .then(data => mostrar(data)) // Mostrar resultados de la búsqueda
        .catch(error => console.log('Error al buscar rutas:', error));
};

// Función para mostrar las rutas
const mostrar = (rutas) => {
    resultados = ''; // Limpiar resultados anteriores

    // Separar estudiantes activos e inactivos
    const activos = rutas.filter(ruta => ruta.Estado === 'activo');
    const inactivos = rutas.filter(ruta => ruta.Estado === 'inactivo');
    
    // Combinar las listas
    const todos = [...activos, ...inactivos];

    todos.forEach(ruta => {
        // Usar la clase fila-inactiva si el estado es inactivo
        const filaClass = ruta.Estado === 'inactivo' ? 'fila-inactiva' : ''; // Clase para inactivo
        // Determinar los botones a mostrar
        const btnEditar = ruta.Estado === 'activo' ? '<a class="btnEditar btn btn-primary" style="color: white;">Editar</a>' : '';
        const btnInactivar = ruta.Estado === 'activo' 
        ? '<a class="btnInactivar btn btn-danger" style="color: white;">Inactivar</a>' 
        : '<a class="btnActivar btn btn-success" style="color: white;">Activar</a>';

        resultados += `<tr class="${filaClass}">
                            <td>${ruta.IdRuta}</td>
                            <td>${ruta.PlacaRuta}</td>
                            <td>${ruta.DireccionParadas}</td>
                            <td>${ruta.NumeroParadas}</td>
                            <td class="text-center">
                                ${btnEditar}
                                ${btnInactivar}
                            </td>
                       </tr>`;
    });
    contenedor.innerHTML = resultados;
}

// Mostrar las rutas al cargar la página
fetch(url)
    .then(response => response.json())
    .then(data => mostrar(data))
    .catch(error => console.log(error));

// Manejo de eventos delegados
const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e);
        }
    });
}

// Evento para crear nueva ruta
btnCrear.addEventListener('click', () => {
    // Limpiar los campos del formulario
    placaRuta.value = '';
    direccionParadas.value = '';
    numeroParadas.value = '';

    modalRuta.show();
    opcion = 'crear';
});

// Procedimiento Inactivar
on(document, 'click', '.btnInactivar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText; // Obtener el ID de la fila

    // Mostrar el swal.fire de confirmación
    Swal.fire({
        title: "Inactivar Ruta",
        text: "¿Estás seguro de que deseas inactivar esta ruta?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Inactivar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            // Si el usuario confirma, procede con la inactivación
            fetch(`${url}/inactivar/${id}`, { method: 'PUT' })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Error en la solicitud: ' + res.statusText);
                    }
                    return res.json();
                })
                .then(response => {
                    console.log('Respuesta del servidor:', response);
                    fila.classList.add('fila-inactiva'); // Cambiar el color de la fila a gris
                    // Ocultar el botón de editar
                    fila.querySelector('.btnEditar').style.display = 'none';
                    // Cambiar el botón de inactivar a activar
                    const btnInactivar = fila.querySelector('.btnInactivar');
                    btnInactivar.classList.remove('btn-danger');
                    btnInactivar.classList.add('btn-success');
                    btnInactivar.innerText = 'Activar';

                    // Mostrar swal de éxito
                    Swal.fire({
                        title: "¡Inactivado!",
                        text: "Ruta inactivado con éxito.",
                        icon: "success"
                    });
                })
                .catch(error => {
                    console.error('Error al inactivar el ruta:', error);
                    // Mostrar swal de error
                    Swal.fire({
                        title: "Error",
                        text: "Error al inactivar el ruta.",
                        icon: "error"
                    });
                })
                .finally(() => {
                    // Volver a cargar la lista de usuarios después de la inactivación
                    fetch(url)
                        .then(response => response.json())
                        .then(data => mostrar(data))
                        .catch(error => console.log(error));
                });
        } else {
            // Mostrar swal de operación cancelada
            Swal.fire({
                title: "Operación cancelada",
                text: "No se realizó ninguna acción",
                icon: "info"
            });
        }
    });
});

// Procedimiento Activar Conductor
on(document, 'click', '.btnActivar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText; // Obtener el ID de la fila

    Swal.fire({
        title: "Activar Ruta",
        text: "¿Estás seguro de que deseas activar esta ruta?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Activar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`${url}/activar/${id}`, { method: 'PUT' })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Error en la solicitud: ' + res.statusText);
                    }
                    return res.json();
                })
                .then(response => {
                    console.log('Respuesta del servidor:', response);
                    
                    // Cambiar el color de la fila a su color original
                    fila.classList.remove('fila-inactiva'); // Remover la clase de inactiva
                    fila.style.backgroundColor = ''; // Restaurar el color original de la fila

                    // Cambiar el botón a "Inactivar"
                    const btnActivar = fila.querySelector('.btnActivar');
                    if (btnActivar) {
                        btnActivar.classList.remove('btn-success');
                        btnActivar.classList.add('btn-danger');
                        btnActivar.textContent = 'Inactivar';
                        btnActivar.classList.remove('btnActivar'); // Opcional: Remover clase de botón de activar
                        btnActivar.classList.add('btnInactivar'); // Opcional: Agregar clase de botón de inactivar
                    }

                    // Asegúrate de mostrar nuevamente el botón de editar
                    const btnEditar = fila.querySelector('.btnEditar');
                    if (btnEditar) {
                        btnEditar.style.display = 'inline-block';
                    }

                    // Mostrar swal de éxito
                    Swal.fire({
                        title: "¡Activado!",
                        text: "Ruta activada con éxito.",
                        icon: "success"
                    });
                })
                .catch(error => {
                    console.error('Error al activar la ruta:', error);
                    alertify.error('Error al activar la ruta');
                })
                .finally(() => {
                    // Volver a cargar la lista de usuarios después de la activación
                    fetch(url)
                        .then(response => response.json())
                        .then(data => mostrar(data))
                        .catch(error => console.log(error));
                });
        }
            // Mostrar swal de operación cancelada
            Swal.fire({
                title: "Operación cancelada",
                text: "No se realizó ninguna acción",
                icon: "info"
            });
    });
});

// Procedimiento Editar
on(document, 'click', '.btnEditar', e => {
    const fila = e.target.closest('tr');
    idForm = fila.children[0].innerText;
    placaRuta.value = fila.children[1].innerText;
    direccionParadas.value = fila.children[2].innerText;
    numeroParadas.value = fila.children[3].innerText;

    opcion = 'editar';
    modalRuta.show();
});

// Procedimiento para Crear y Editar
formRuta.addEventListener('submit', (e) => {
    e.preventDefault();

    Swal.fire({
        title: "Confirmación",
        text: opcion === 'crear' ? "¿Estás seguro de que deseas crear esta ruta?" : "¿Estás seguro de que deseas actualizar esta ruta?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
    }).then(result => {
        if (result.isConfirmed) {
            const data = {
                PlacaRuta: placaRuta.value,
                DireccionParadas: direccionParadas.value,
                NumeroParadas: parseInt(numeroParadas.value)
            };

            if (opcion === 'crear') {
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(() => {
                    fetch(url)
                        .then(response => response.json())
                        .then(data => mostrar(data))
                        .catch(error => console.log(error));
                    Swal.fire('Creado', 'Ruta creada con éxito', 'success');
                })
                .catch(error => {
                    console.log(error);
                    Swal.fire('Error', 'Error al crear la ruta', 'error');
                });
            } else if (opcion === 'editar') {
                fetch(`${url}/${idForm}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(() => {
                    fetch(url)
                        .then(response => response.json())
                        .then(data => mostrar(data))
                        .catch(error => console.log(error));
                    Swal.fire('Actualizado', 'Ruta actualizada con éxito', 'success');
                })
                .catch(error => {
                    console.log(error);
                    Swal.fire('Error', 'Error al actualizar la ruta', 'error');
                });
            }

            modalRuta.hide();
        } else {
            Swal.fire('Cancelado', 'Operación cancelada', 'info');
        }
    });
});
