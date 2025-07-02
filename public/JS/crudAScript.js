// Definición de variables
const url = 'http://localhost:3000/api/usuarios';
const contenedor = document.querySelector('tbody');
let resultados = '';

const modalAcudiente = new bootstrap.Modal(document.getElementById('modalAcudiente'));
const formAcudiente = document.getElementById('formAcudiente');
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
const parentesco = document.getElementById('parentesco');
const btnCrear = document.getElementById('btnCrear');
const usuarioContainer = document.getElementById('usuarioContainer');
const contraseñaContainer = document.getElementById('contraseñaContainer');
const selectEstudiante = document.getElementById('selectEstudiante');
let opcion = '';
let idForm = '';

// Función para mostrar los resultados solo para el tipo de rol "Acudiente"
const mostrar = (acudientes) => {
    resultados = ''; // Limpiar resultados anteriores
    acudientes.sort((a, b) => a.IdEstudiante - b.IdEstudiante);
    
    // Separar estudiantes activos e inactivos
    const activos = acudientes.filter(estudiante => estudiante.Estado === 'activo');
    const inactivos = acudientes.filter(estudiante => estudiante.Estado === 'inactivo');

    // Combinar las listas
    const todos = [...activos, ...inactivos];
    todos.filter(acudiente => acudiente.TipoRol === 'Acudiente').forEach(acudiente => {
        // Usar la clase fila-inactiva si el estado es inactivo
        const filaClass = acudiente.Estado === 'inactivo' ? 'fila-inactiva' : ''; // Clase para inactivo
        // Determinar los botones a mostrar
        const btnEditar = acudiente.Estado === 'activo' ? '<a class="btnEditar btn btn-primary" style="color: white;">Editar</a>' : '';
        const btnInactivar = acudiente.Estado === 'activo' 
        ? '<a class="btnInactivar btn btn-danger" style="color: white;">Inactivar</a>' 
        : '<a class="btnActivar btn btn-success" style="color: white;">Activar</a>';

        
        resultados += `<tr class="${filaClass}">
                            <td>${acudiente.IdUsuario}</td>
                            <td>${acudiente.Imagen ? `<img src="${acudiente.Imagen}" alt="Imagen" width="50" height="50">` : 'null'}</td>
                            <td>${acudiente.Nombres}</td>
                            <td>${acudiente.Apellidos}</td>
                            <td>${acudiente.TipoIdentificacion}</td>
                            <td>${acudiente.NoIdentificacion}</td>
                            <td>${acudiente.telefono}</td>
                            <td>${acudiente.Correo}</td>
                            <td>${acudiente.Usuario ? acudiente.Usuario : 'No disponible'}</td>
                            <td>****</td> <!-- Ocultar la contraseña -->
                            <td class="text-center">
                                ${btnEditar}
                                ${btnInactivar}
                            </td>
                       </tr>`;
    });
    contenedor.innerHTML = resultados;
}

 // Función para buscar Acudientes
const buscarAcudientes = (query) => {
    fetch(`${url}?search=${query}`)
        .then(response => response.json())
        .then(data => mostrar(data))
        .catch(error => console.log(error));
};

// Mostrar los usuarios tipo "Acudiente" al cargar la página
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
    buscarAcudientes(query);
});

// Función para cargar estudiantes activos en el selector
const cargarEstudiantesActivos = () => {
    const selectEstudiante = document.getElementById('selectEstudiante');

    fetch('http://localhost:3000/api/estudiante?Estado=activo') // Cambiar el filtro a Estado=activo
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then(estudiantes => {
            // Limpiar opciones previas
            selectEstudiante.innerHTML = '<option value="">Seleccione un estudiante</option>';

            // Poblar el select con los estudiantes activos
            estudiantes.forEach(estudiante => {
                const option = document.createElement('option');
                option.value = estudiante.IdEstudiante;
                option.textContent = `${estudiante.NombreEst} ${estudiante.ApellidosEst}`;
                selectEstudiante.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar estudiantes activos:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los estudiantes activos. Por favor, inténtalo más tarde.',
                icon: 'error',
            });
        });
};

// Evento de clic en las imágenes de la tabla
document.querySelector('tbody').addEventListener('click', (e) => {
    const img = e.target.closest('img'); 

    if (img) {
        // Obtener la fila correspondiente al clic en la imagen
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
    // Limpiar los campos del formulario
    nombre.value = '';
    apellidos.value = '';
    tipoIdentificacion.value = '';
    noIdentificacion.value = '';
    telefono.value = '';
    correo.value = '';
    usuario.value = '';
    contraseña.value = '';
    imagen.value = '';
    parentesco.value = ''; 
    
    // Ocultar campos de usuario y contraseña
    usuarioContainer.classList.add('d-none');
    contraseñaContainer.classList.add('d-none');
     
    // Cargar estudiantes activos
    cargarEstudiantesActivos();
  
    // Mostrar el modal
    modalAcudiente.show();
    opcion = 'crear';
});

// Procedimiento Inactivar
on(document, 'click', '.btnInactivar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText; // Obtener el ID de la fila

    // Mostrar el swal.fire de confirmación
    Swal.fire({
        title: "Inactivar Acudiente",
        text: "¿Estás seguro de que deseas inactivar este acudiente?",
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
                        text: "Acudiente inactivado con éxito.",
                        icon: "success"
                    });
                })
                .catch(error => {
                    console.error('Error al inactivar el acudiente:', error);
                    // Mostrar swal de error
                    Swal.fire({
                        title: "Error",
                        text: "Error al inactivar el acudiente.",
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
        title: "Activar Acudiente",
        text: "¿Estás seguro de que deseas activar este acudiente?",
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
                        text: "Acudiente activado con éxito.",
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

// Deshabilitar campos 
const deshabilitarCampos = () => {
    selectEstudiante.disabled = true;
    parentesco.disabled = true;
    // Puedes deshabilitar otros campos si es necesario
};

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
    contraseña.value = ''; // Limpiar el campo de contraseña
    

    // Mostrar los campos de usuario y contraseña en caso de que estén ocultos
    usuarioContainer.classList.remove('d-none');
    contraseñaContainer.classList.remove('d-none');

    
    // Cargar estudiantes activos
    cargarEstudiantesActivos();
    modalAcudiente.show();
    opcion = 'editar';
});

// Procedimiento para Crear y Editar
formAcudiente.addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Validar tipo de imagen si es necesario
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (imagen.files.length > 0 && !allowedTypes.includes(imagen.files[0].type)) {
      Swal.fire('Error', 'Solo se permiten imágenes en formato JPEG o PNG.', 'error');
      return;
    }
  
    Swal.fire({
      title: "Confirmación",
      text: opcion === 'crear' ? "¿Estás seguro de que deseas crear este Acudiente?" : "¿Estás seguro de que deseas actualizar este Acudiente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No"
    }).then(result => {
      if (result.isConfirmed) {
        const data = new FormData();
        data.append('TipoRol', 'Acudiente');
        data.append('Nombres', nombre.value);
        data.append('Apellidos', apellidos.value);
        data.append('TipoIdentificacion', tipoIdentificacion.value);
        data.append('NoIdentificacion', noIdentificacion.value);
        data.append('telefono', telefono.value);
        data.append('Correo', correo.value);
        data.append('Usuario', usuario.value);
        
        // Add parentesco to the form data
        data.append('Parentesco', parentesco.value);
        const selectedEstudianteId = document.getElementById('selectEstudiante').value;
        data.append('IdEstudiante', selectedEstudianteId);

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
  
  
        const metodo = opcion === 'crear' ? 'POST' : 'PUT';
        const endpoint = opcion === 'crear' ? url : `${url}/${idForm}`;
  
        fetch(endpoint, {
          method: metodo,
          body: data
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en la solicitud');
            }
            return response.json();
          })
          .then(responseData => {
            // Check if this is a new creation
            if (opcion === 'crear') {
              // Assuming the server returns the newly created user's ID
              const nuevoAcudienteId = responseData.IdUsuario;
              
              // Prepare data for estudianteusuario table
              const estudianteUsuarioData = {
                IdAcudiente: nuevoAcudienteId,
                IdEstudiante: selectedEstudianteId,
                Parentesco: parentesco.value
              };

              // Send a separate request to save estudianteusuario data
              return fetch('http://localhost:3000/api/estudianteusuario', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(estudianteUsuarioData)
              });
            }
            return Promise.resolve();
          })
          .then(() => {
            Swal.fire('Éxito', 'Acudiente registrado exitosamente', 'success');
            modalAcudiente.hide();
            fetch(url)
              .then(response => response.json())
              .then(data => mostrar(data))
              .catch(error => console.log(error));
          })
          .catch(error => {
            console.error('Error al registrar acudiente:', error);
            Swal.fire('Error', 'Ocurrió un problema al registrar el acudiente', 'error');
          });
      }
    });
});