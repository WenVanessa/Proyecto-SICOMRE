// Definición de variables
const url = 'http://localhost:3000/api/usuarios';
const contenedor = document.querySelector('tbody');
let resultados = '';

const modalAdministrador = new bootstrap.Modal(document.getElementById('modalAdministrador'));
constddministrador = document.getElementById('formAdministrador');
const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
const nombre = document.getElementById('nombre');
const apellidos = document.getElementById('apellidos');
const tipoIdentificacion = document.getElementById('tipoIdentificacion');
const noIdentificacion = document.getElementById('noIdentificacion');
const telefono = document.getElementById('telefono');
const correo = document.getElementById('correo');
const usuario = document.getElementById('usuario');
const contraseña = document.getElementById('contraseña');
const imagen = document.getElementById('imagen');
const btnCrear = document.getElementById('btnCrear');
const usuarioContainer = document.getElementById('usuarioContainer');
const contraseñaContainer = document.getElementById('contraseñaContainer');
let opcion = '';
let idForm = '';

// Función para mostrar los resultados solo para el tipo de rol "administrador"
const mostrar = (administradores) => {
    resultados = ''; // Limpiar resultados anteriores
    administradores.sort((a, b) => a.IdEstudiante - b.IdEstudiante);
    
    // Separar estudiantes activos e inactivos
    const activos = administradores.filter(administrador => administrador.Estado === 'activo');
    const inactivos = administradores.filter(administrador => administrador.Estado === 'inactivo');

    // Combinar las listas
    const todos = [...activos, ...inactivos];
    todos.filter(administrador => administrador.TipoRol === 'Administrador').forEach(administrador => {
        // Usar la clase fila-inactiva si el estado es inactivo
        const filaClass = administrador.Estado === 'inactivo' ? 'fila-inactiva' : ''; // Clase para inactivo
        // Determinar los botones a mostrar
        const btnEditar = administrador.Estado === 'activo' ? '<a class="btnEditar btn btn-primary" style="color: white;">Editar</a>' : '';
        const btnInactivar = administrador.Estado === 'activo' 
        ? '<a class="btnInactivar btn btn-danger" style="color: white;">Inactivar</a>' 
        : '<a class="btnActivar btn btn-success" style="color: white;">Activar</a>';
        
        resultados += `<tr class="${filaClass}">
                            <td>${administrador.IdUsuario}</td>
                            <td>${administrador.Imagen ? `<img src="${administrador.Imagen}" alt="Imagen" width="50" height="50">` : `<img src="img/sinfoto.jpg" alt="Imagen no disponible" width="50" height="50">`}</td>
                            <td>${administrador.Nombres}</td>
                            <td>${administrador.Apellidos}</td>
                            <td>${administrador.TipoIdentificacion}</td>
                            <td>${administrador.NoIdentificacion}</td>
                            <td>${administrador.telefono}</td>
                            <td>${administrador.Correo}</td>
                            <td>${administrador.Usuario ? administrador.Usuario : 'No disponible'}</td>
                            <td>****</td> <!-- Ocultar la contraseña -->
                            <td class="text-center">
                                ${btnEditar}
                                ${btnInactivar}
                            </td>
                       </tr>`;
    });
    contenedor.innerHTML = resultados;
}

 // Función para buscar administradores
 const buscarAdministradores = (query) => {
    fetch(`${url}?search=${query}`)
        .then(response => response.json())
        .then(data => mostrar(data))
        .catch(error => console.log(error));
};

// Mostrar los usuarios tipo "administrador" al cargar la página
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

// Manejar la búsqueda
document.getElementById('busqueda').addEventListener('input', (e) => {
    const query = e.target.value;
    buscarAdministradores(query);
});

// Evento de clic en las imágenes de la tabla
document.querySelector('tbody').addEventListener('click', (e) => {
    const img = e.target.closest('img'); 

    if (img) {
        const fila = img.closest('tr');
        const idUsuario = fila.children[0].innerText; 
        const nombre = fila.children[2].innerText;
        const apellidos = fila.children[3].innerText; 
        const tipoIdentificacion = fila.children[4].innerText; 
        const noIdentificacion = fila.children[5].innerText; 
        const telefono = fila.children[6].innerText; 
        const correo = fila.children[7].innerText; 
        const imagenSrc = fila.children[1].querySelector('img').src; 

        // Llenar el modal con la información correspondiente
        document.getElementById('modalImagen').querySelector('img').src = imagenSrc;
        document.getElementById('modalNombre').innerText = nombre;
        document.getElementById('modalApellidos').innerText = apellidos;
        document.getElementById('modalTipoIdentificacion').innerText = tipoIdentificacion;
        document.getElementById('modalNoIdentificacion').innerText = noIdentificacion;
        document.getElementById('modalTelefono').innerText = telefono;
        document.getElementById('modalCorreo').innerText = correo;

        // Mostrar el modal con los detalles
        modalDetalle.show();
    }
});

// Evento para crear nuevo usuario
btnCrear.addEventListener('click', () => {
    // Limpiar los campos deldlario
    nombre.value = '';
    apellidos.value = '';
    tipoIdentificacion.value = '';
    noIdentificacion.value = '';
    telefono.value = '';
    correo.value = '';
    usuario.value = '';
    contraseña.value = '';
    imagen.value = '';

    // Ocultar los campos de usuario y contraseña al crear
    usuarioContainer.classList.add('d-none');
    contraseñaContainer.classList.add('d-none');

    modalAdministrador.show();
    opcion = 'crear';
});

// Procedimiento Inactivar
on(document, 'click', '.btnInactivar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText; // Obtener el ID de la fila

    // Mostrar el swal.fire de confirmación
    Swal.fire({
        title: "Inactivar Administrador",
        text: "¿Estás seguro de que deseas inactivar este administrador?",
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
                        text: "Administrador inactivado con éxito.",
                        icon: "success"
                    });
                })
                .catch(error => {
                    console.error('Error al inactivar el administrador:', error);
                    // Mostrar swal de error
                    Swal.fire({
                        title: "Error",
                        text: "Error al inactivar el administrador.",
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

// Procedimiento Activar Acudiente
on(document, 'click', '.btnActivar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText; // Obtener el ID de la fila

    Swal.fire({
        title: "Activar Administrador",
        text: "¿Estás seguro de que deseas activar este administrador?",
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
                        text: "Administrador activado con éxito.",
                        icon: "success"
                    });
                })
                .catch(error => {
                    console.error('Error al activar el acudiente:', error);
                    alertify.error('Error al activar el acudiente');
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

// Función de vista del ojo
function togglePassword() {
    const passwordField = document.getElementById("contraseña");
    const eyeIcon = document.getElementById("togglePassword");

    // Cambiar el tipo del campo de entrada y el ícono
    if (passwordField.type === "password") {
        passwordField.type = "text"; // Mostrar contraseña
        eyeIcon.classList.remove('fa-eye'); // Cambiar ícono a ojo cerrado
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = "password"; // Ocultar contraseña
        eyeIcon.classList.remove('fa-eye-slash'); // Cambiar ícono a ojo abierto
        eyeIcon.classList.add('fa-eye');
    }
}

// Procedimiento Editar
on(document, 'click', '.btnEditar', e => {
    const fila = e.target.closest('tr');
    idForm = fila.children[0].innerText;
    nombre.value = fila.children[2].innerText;
    apellidos.value = fila.children[3].innerText;
    tipoIdentificacion.value = fila.children[4].innerText;
    noIdentificacion.value = fila.children[5].innerText;
    telefono.value = fila.children[6].innerText;
    correo.value = fila.children[7].innerText;
    usuario.value = fila.children[8].innerText;
    contraseña.value = ''; // Limpiar el campo de contraseña para evitar mostrarlo

    // Mostrar los campos de usuario y contraseña al editar
    usuarioContainer.classList.remove('d-none');
    contraseñaContainer.classList.remove('d-none');

    opcion = 'editar';
    modalAdministrador.show();
});

// Procedimiento para Crear y Editar
formAdministrador.addEventListener('submit', (e) => {
    e.preventDefault();

     // Validar tipo de imagen si es necesario
     const allowedTypes = ['image/jpeg', 'image/png'];
     if (imagen.files.length > 0 && !allowedTypes.includes(imagen.files[0].type)) {
         Swal.fire('Error', 'Solo se permiten imágenes en formato JPEG o PNG.', 'error');
         return;
     }

    Swal.fire({
        title: "Confirmación",
        text: opcion === 'crear' ? "¿Estás seguro de que deseas crear este administrador?" : "¿Estás seguro de que deseas actualizar este administrador?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
    }).then(result => {
        if (result.isConfirmed) {
            const data = new FormData();
            data.append('TipoRol', 'Administrador');
            data.append('Nombres', nombre.value);
            data.append('Apellidos', apellidos.value);
            data.append('TipoIdentificacion', tipoIdentificacion.value);
            data.append('NoIdentificacion', noIdentificacion.value);
            data.append('telefono', telefono.value);
            data.append('Correo', correo.value);
            data.append('Usuario', usuario.value);

            // Solo agregar Contraseña si el campo no está vacío
            if (contraseña.value) {
                data.append('Contraseña', contraseña.value);
            }

            // Agregar imagen si existe
            if (imagen.files.length > 0) {
                data.append('Imagen', imagen.files[0]);
            }

            const requestUrl = opcion === 'crear' ? url : `${url}/${idForm}`;
            const requestOptions = {
                method: opcion === 'crear' ? 'POST' : 'PUT',
                body: data // Enviar FormData directamente
            };

            fetch(requestUrl, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la respuesta del servidor');
                    }
                    return response.json();
                })
                .then(() => {
                    return fetch(url); // Obtener la lista actualizada
                })
                .then(response => response.json())
                .then(data => {
                    resultados = '';
                    mostrar(data);
                    Swal.fire(opcion === 'crear' ? 'Creado' : 'Actualizado', 
                              `administrador ${opcion === 'crear' ? 'creado' : 'actualizado'} con éxito`, 
                              'success');
                })
                .catch(error => {
                    console.log(error);
                    Swal.fire('Error', `Error al ${opcion === 'crear' ? 'crear' : 'actualizar'} el administrador`, 'error');
                });

            modalAdministrador.hide();
        } else {
            Swal.fire('Cancelado', 'Operación cancelada', 'info');
        }
    });
});

