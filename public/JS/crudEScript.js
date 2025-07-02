const url = 'http://localhost:3000/api/estudiante';
const contenedor = document.querySelector('tbody');
let resultados = '';

const registerStudent = new bootstrap.Modal(document.getElementById('registerStudent'));
const formStudent = document.querySelector('#studentForm');
const NombreEst = document.getElementById('NombreEst');
const ApellidosEst = document.getElementById('ApellidosEst');
const TipoIdentificacion = document.getElementById('TipoIdentificacion');
const NoIdentificacion = document.getElementById('NoIdentificacion');
const FechaNacimiento = document.getElementById('FechaNacimiento');
const cursoSelect = document.getElementById('cursoSelect'); 
const btnRegisterStudent = document.getElementById('btnRegisterStudent');

let opcion = ''; 
let idForm = ''; 

btnRegisterStudent.addEventListener('click', () => {
    NombreEst.value = '';
    ApellidosEst.value = '';
    TipoIdentificacion.value = '';
    NoIdentificacion.value = '';
    FechaNacimiento.value = '';

    // Limpiar el select de cursos antes de llenarlo
    cursoSelect.innerHTML = `
        <option value="">Seleccione un curso</option>
        <option value="101">101</option>
        <option value="102">102</option>
        <option value="103">103</option>
        <option value="201">201</option>
        <option value="202">202</option>
        <option value="203">203</option>
        <option value="301">301</option>
        <option value="302">302</option>
        <option value="303">303</option>
        <option value="401">401</option>
        <option value="402">402</option>
        <option value="403">403</option>
        <option value="501">501</option>
        <option value="502">502</option>
        <option value="503">503</option>
        <option value="601">601</option>
        <option value="602">602</option>
        <option value="603">603</option>
        <option value="701">701</option>
        <option value="702">702</option>
        <option value="703">703</option>
        <option value="801">801</option>
        <option value="802">802</option>
        <option value="803">803</option>
        <option value="901">901</option>
        <option value="902">902</option>
        <option value="903">903</option>
        `;

    opcion = 'crear'; // Indica que se va a crear un nuevo estudiante

    registerStudent.show();
});


// Manejar la búsqueda
document.getElementById('busqueda').addEventListener('input', (e) => {
    const query = e.target.value;
    buscarEstudiantes(query);  
});

// Función para buscar estudiantes
const buscarEstudiantes = (query) => {
    fetch(`http://localhost:3000/api/estudiante/buscar?query=${query}`)
        .then(response => response.json())
        .then(data => mostrar(data)) // Mostrar resultados de la búsqueda
        .catch(error => console.log('Error al buscar estudiantes:', error));
};

// Mostrar estudiantes al cargar la página
fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }
        return response.json();
    })
    .then(estudiantes => {
        // Para cada estudiante, también obtén el curso
        return Promise.all(estudiantes.map(estudiante => {
            return fetch(`http://localhost:3000/api/cursoestudiante/${estudiante.IdEstudiante}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Error al obtener el curso: ' + res.statusText);
                    }
                    return res.json();
                })
                .then(curso => ({ ...estudiante, curso: curso.NumeroCurso }));
        }));
    })
    .then(estudiantesConCursos => {
        // Mostrar estudiantesConCursos en la tabla
        mostrar(estudiantesConCursos);
    })
    .catch(error => console.log('Error al obtener los estudiantes:', error));
    

// Función para mostrar los resultados
const mostrar = (estudiantes) => {
    resultados = ''; // Resetear resultados

    // Separar estudiantes activos e inactivos
    const activos = estudiantes.filter(estudiante => estudiante.Estado === 'activo');
    const inactivos = estudiantes.filter(estudiante => estudiante.Estado === 'inactivo');

    // Combinar las listas, asegurando que los inactivos estén al final
    const todos = [...activos, ...inactivos];

    todos.forEach(estudiante => {
        const fechaFormateada = new Date(estudiante.FechaNacimiento).toISOString().split('T')[0];
        
        // Aplicar fondo gris y letras negras si está inactivo
        const estiloFila = estudiante.Estado === 'inactivo' ? 'background-color: gray; color: black;' : '';
        
        const estado = estudiante.Estado === 'inactivo' ? 'Activar' : 'Inactivar';
        const claseBoton = estudiante.Estado === 'inactivo' ? 'btn-success' : 'btn-danger';
        
        resultados += 
            `<tr style="${estiloFila}">
                <td>${estudiante.IdEstudiante}</td>
                <td>${estudiante.NombreEst}</td>
                <td>${estudiante.ApellidosEst}</td>
                <td>${estudiante.TipoIdentificacion}</td>
                <td>${estudiante.NoIdentificacion}</td>
                <td>${fechaFormateada}</td>
                <td>${estudiante.edad}</td>  <!-- Mostrar la edad calculada -->
                <td>${estudiante.NumeroCurso || 'Sin curso'}</td>  <!-- Mostrar curso -->
                <td class="text-center">
                    <a class="btnEditar btn btn-primary" style="display: ${estudiante.Estado === 'inactivo' ? 'none' : 'inline-block'}; color: white;">Editar</a>
                    <a class="btnInactivar btn ${claseBoton}" style="color: white;">${estado}</a>
                </td>
            </tr>`;
    });

    contenedor.innerHTML = resultados;
};

// Al enviar el formulario para manejar tanto creación como edición
formStudent.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
        NombreEst: NombreEst.value,
        ApellidosEst: ApellidosEst.value,
        TipoIdentificacion: TipoIdentificacion.value,
        NoIdentificacion: NoIdentificacion.value,
        FechaNacimiento: FechaNacimiento.value,
        NumeroCurso: cursoSelect.value
    };

    try {
        let response;
        if (opcion === 'crear') {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
        } else if (opcion === 'editar') {
            response = await fetch(`${url}/${idForm}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
        }

        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            registerStudent.hide();
            
            // Actualizar la tabla
            fetch(url)
                .then(response => response.json())
                .then(data => mostrar(data));

            // Mostrar mensaje de éxito
            Swal.fire({
                title: opcion === 'crear' ? '¡Registrado!' : '¡Actualizado!',
                text: result.message,
                icon: 'success'
            });
        } else {
            const error = await response.json();
            console.error('Error:', error.message);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud',
            icon: 'error'
        });
    }
});

// Mostrar los usuarios al cargar la página
fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => mostrar(data))
    .catch(error => console.log('Error al obtener los estudiantes:', error));

// Manejo de eventos delegados
const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e);
        }
    });
};

// Función para inactivar o activar un estudiante
on(document, 'click', '.btnInactivar', e => {
    const fila = e.target.closest('tr');
    const id = fila.children[0].innerText;
    const btnInactivar = fila.querySelector('.btnInactivar');
    const btnEditar = fila.querySelector('.btnEditar');

    const estadoActual = btnInactivar.textContent.trim();

    if (estadoActual === 'Inactivar') {
        Swal.fire({
            title: "Inactivar Estudiante",
            text: "¿Estás seguro de que deseas inactivar este estudiante?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Inactivar",
            cancelButtonText: "Cancelar"
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`${url}/inactivar/${id}`, { method: 'PUT' })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Error en la solicitud: ' + res.statusText);
                        }
                        return res.json();
                    })
                    .then(() => {
                        return fetch(url)
                            .then(response => response.json())
                            .then(data => {
                                mostrar(data);
                                Swal.fire({
                                    title: "¡Inactivado!",
                                    text: "Estudiante inactivado con éxito.",
                                    icon: "success"
                                });
                            });
                    })
                    .catch(error => {
                        console.error('Error al inactivar el registro:', error);
                        Swal.fire({
                            title: "Error",
                            text: "Error al inactivar el registro.",
                            icon: "error"
                        });
                    });
            }
        });
    } else {
        Swal.fire({
            title: "Activar Estudiante",
            text: "¿Estás seguro de que deseas activar este estudiante?",
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
                    .then(() => {
                        return fetch(url)
                            .then(response => response.json())
                            .then(data => {
                                mostrar(data);
                                Swal.fire({
                                    title: "¡Activado!",
                                    text: "Estudiante activado con éxito.",
                                    icon: "success"
                                });
                            });
                    })
                    .catch(error => {
                        console.error('Error al activar el registro:', error);
                        Swal.fire({
                            title: "Error",
                            text: "Error al activar el registro.",
                            icon: "error"
                        });
                    });
            }
        });
    }
});

on(document, 'click', '.btnEditar', e => {
    const fila = e.target.closest('tr');
    idForm = fila.children[0].innerText;

    NombreEst.value = fila.children[1].innerText;
    ApellidosEst.value = fila.children[2].innerText;
    TipoIdentificacion.value = fila.children[3].innerText;
    NoIdentificacion.value = fila.children[4].innerText;
    FechaNacimiento.value = fila.children[5].innerText;
    
    // Obtener y establecer el curso actual
    const cursoActual = fila.children[7].innerText;
    if (cursoActual !== 'Sin curso') {
        cursoSelect.value = cursoActual;
    }

    opcion = 'editar';
    registerStudent.show();
});