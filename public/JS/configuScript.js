// Definición de variables
const url = 'http://localhost:3000/api/usuarios';
const formAdministrador = document.getElementById('formAdministrador');
const avatar = document.getElementById('avatar');
const nombre = document.getElementById('nombre');
const apellidos = document.getElementById('apellidos');
const tipoIdentificacion = document.getElementById('tipoIdentificacion');
const noIdentificacion = document.getElementById('noIdentificacion');
const telefono = document.getElementById('telefono');
const correo = document.getElementById('correo');
const usuario = document.getElementById('usuario');
const contraseña = document.getElementById('contraseña');
const imagen = document.getElementById('imagen');
const adminId = document.getElementById('idUsuario').value; 
const tipoRol = document.getElementById('tipoRol');
const btnCrear = document.getElementById('btnCrear');
let idForm = '';
// Función para mostrar un administrador en el formulario
const mostrarAdministrador = (administrador) => {
    idForm = administrador.IdUsuario;
    nombre.value = administrador.Nombres;
    apellidos.value = administrador.Apellidos;
    tipoIdentificacion.value = administrador.TipoIdentificacion;
    noIdentificacion.value = administrador.NoIdentificacion;
    telefono.value = administrador.telefono;
    correo.value = administrador.Correo;
    usuario.value = administrador.Usuario;
    contraseña.value = ''; // Limpiar el campo de contraseña para evitar mostrarlo
    avatar.src = administrador.Imagen ? administrador.Imagen : 'img/sinfoto.jpg'; // Asignar imagen o imagen predeterminada
};

// Cargar datos del administrador
const cargarAdministrador = (id) => {
    fetch(`${url}/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el administrador');
            }
            return response.json();
        })
        .then(data => mostrarAdministrador(data))
        .catch(error => console.log(error));
};

// Evento para crear o editar el administrador
btnCrear.addEventListener('click', () => {
    Swal.fire({
        title: "Confirmación",
        text: "¿Estás seguro de que deseas guardar los cambios?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
    }).then(result => {
        if (result.isConfirmed) {
            const data = new FormData();
            data.append('TipoRol', tipoRol.value);
            data.append('Nombres', nombre.value);
            data.append('Apellidos', apellidos.value);
            data.append('TipoIdentificacion', tipoIdentificacion.value);
            data.append('NoIdentificacion', noIdentificacion.value);
            data.append('telefono', telefono.value);
            data.append('Correo', correo.value);
            data.append('Usuario', usuario.value);

            if (contraseña.value) {
                data.append('Contraseña', contraseña.value);
            }
            if (imagen.files.length > 0) {
                data.append('Imagen', imagen.files[0]);
            }

            const requestUrl = `${url}/${idForm}`;
            const requestOptions = {
                method: 'PUT',
                body: data
            };

            fetch(requestUrl, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la respuesta del servidor');
                    }
                    return response.json();
                })
                .then(() => {
                    Swal.fire('Actualizado', 'Administrador actualizado con éxito', 'success');
                })
                .catch(error => {
                    console.log(error);
                    Swal.fire('Error', 'Error al actualizar el administrador', 'error');
                });
        }
    });
    
});

cargarAdministrador(adminId); 
setInterval(cargarAdministrador, 10000);