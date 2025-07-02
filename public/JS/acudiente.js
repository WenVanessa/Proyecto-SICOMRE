const adminId = document.getElementById('idUsuario').value; 

function openModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.style.display = 'block';

    modalBody.innerHTML = '';

    switch(type) {

        case 'hijos':
            modalTitle.textContent = 'Información de mis Hijos';

            // Verificamos si adminId está disponible antes de hacer la solicitud
            if (!adminId) {
                console.error('No se encontró adminId');
                modalBody.innerHTML = '<p>Error: No se encontró el ID de administrador.</p>';
                return; // Detenemos la ejecución si no hay adminId
            }

            // Hacemos la solicitud con el adminId para obtener la lista de estudiantes
            fetch(`/api/estudianteusuario/${adminId}`)
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        // Si no fue exitosa la respuesta
                        modalBody.innerHTML = `<p>${data.message}</p>`;
                        return;
                    }

                    // Verificamos si hay estudiantes en la respuesta
                    if (data.data.length === 0) {
                        modalBody.insertAdjacentHTML('beforeend', '<div class="no-data-message">No hay estudiantes registrados.</div>');
                    } else {
                        // Suponemos que solo hay un estudiante o tomamos el primero de la lista
                        const idEstudiante = data.data[0].IdEstudiante;

                        // Realizamos la segunda solicitud para obtener los detalles del estudiante
                        fetch(`/api/estudiante/${idEstudiante}`)
                            .then(response => response.json())
                            .then(estudiante => {
                                if (estudiante) { // Aseguramos que el estudiante no es undefined o nulo
                                    // Ahora accedes directamente a las propiedades del objeto estudiante
                                    modalBody.innerHTML = `
                                        <div class="card-info estudiante">
                                            <h5>${estudiante.NombreEst} ${estudiante.ApellidosEst}</h5>
                                            <p><strong>Tipo de Identificación:</strong> ${estudiante.TipoIdentificacion}</p>
                                            <p><strong>Número de Identificación:</strong> ${estudiante.NoIdentificacion}</p>
                                            <p><strong>Fecha de Nacimiento:</strong> ${new Date(estudiante.FechaNacimiento).toLocaleDateString()}</p>
                                            <p><strong>Edad:</strong> ${estudiante.edad}</p>
                                        </div>
                                    `;
                                } else {
                                    modalBody.innerHTML = '<p>No se encontró el estudiante.</p>';
                                }
                            })
                            .catch(error => {
                                console.error('Error al cargar la información del estudiante:', error);
                                modalBody.innerHTML = '<p>Error al cargar la información del estudiante.</p>';
                            });

                    }
                })
                .catch(error => {
                    console.error('Error al cargar los estudiantes:', error);
                    modalBody.innerHTML = '<p>Error al cargar la información de los estudiantes.</p>';
                });
            break;


        case 'rutas':
            modalTitle.textContent = 'Rutas, Monitoras y Conductores';

            fetch('/api/ruta0') 
                .then(response => response.json())
                .then(rutas => {
                    const rutasActivas = rutas.filter(ruta => ruta.Estado.toLowerCase() === 'activo');
                    modalBody.innerHTML = ''; 

                    modalBody.insertAdjacentHTML('beforeend', '<h4>Rutas</h4>');

                    if (rutasActivas.length === 0) {
                        modalBody.insertAdjacentHTML('beforeend', '<div class="no-data-message">No hay rutas activas disponibles.</div>');
                    } else {
                        let rutasHtml = '<div class="modal-body-content">';
                        rutasActivas.forEach(ruta => {
                            rutasHtml += `
                                <div class="card-info">
                                    <h5>Ruta con el Id ${ruta.IdRuta}</h5>
                                    <p>Placa: ${ruta.PlacaRuta}</p>
                                    <p>Número de paradas: ${ruta.NumeroParadas}</p>
                                </div>
                            `;
                        });
                        rutasHtml += '</div>';
                        modalBody.insertAdjacentHTML('beforeend', rutasHtml);
                    }

                    fetch('/api/usuarios') 
                        .then(response => response.json())
                        .then(monitoras => {
                            const rolMonitora = monitoras.filter(monitoras => monitoras.TipoRol === 'Monitora' && monitoras.Estado.toLowerCase() === 'activo');
                            
                            modalBody.insertAdjacentHTML('beforeend', '<h4>Monitoras</h4>');

                            if (rolMonitora.length === 0) {
                                modalBody.insertAdjacentHTML('beforeend', '<div class="no-data-message">No hay monitoras disponibles.</div>');
                            } else {
                                let monitorasHtml = '<div class="monitoras">';
                                rolMonitora.forEach(monitora => {
                                    monitorasHtml += `
                                        <div class="card-info">
                                            <img src="${monitora.Imagen || 'img/sinfoto.jpg'}" alt="Foto Monitora">
                                            <h5>${monitora.Nombres} ${monitora.Apellidos}</h5>
                                            <p>Teléfono: ${monitora.telefono}</p>
                                        </div>
                                    `;
                                });
                                monitorasHtml += '</div>';
                                modalBody.insertAdjacentHTML('beforeend', monitorasHtml);
                            }
                        })
                        .catch(error => {
                            console.error('Error cargando las monitoras:', error);
                        });

                    fetch('/api/usuarios')  
                        .then(response => response.json())
                        .then(conductores => {
                            const rolConductor = conductores.filter(conductores => conductores.TipoRol === 'Conductor' && conductores.Estado.toLowerCase() === 'activo');
                            modalBody.insertAdjacentHTML('beforeend', '<h4>Conductores</h4>');
                            
                            let conductoresHtml = '<h4>Conductores</h4><div class="conductores">';

                            if (rolConductor.length === 0) {
                                modalBody.insertAdjacentHTML('beforeend', '<div class="no-data-message">No hay conductores disponibles.</div>');
                            } else {
                                let conductoresHtml = '<div class="conductores">';
                                rolConductor.forEach(conductor => {
                                    conductoresHtml += `
                                        <div class="card-info">
                                            <img src="${conductor.Imagen || 'img/sinfoto.jpg'}" alt="Foto Conductor">
                                            <h5>${conductor.Nombres} ${conductor.Apellidos}</h5>
                                            <p>Teléfono: ${conductor.telefono}</p>
                                        </div>
                                    `;
                                });
                                conductoresHtml += '</div>';
                                modalBody.insertAdjacentHTML('beforeend', conductoresHtml);
                            }
                        })
                        .catch(error => {
                            console.error('Error cargando los conductores:', error);
                        });
                })
                .catch(error => {
                    modalBody.innerHTML = '<p>Error al cargar las rutas</p>';
                    console.error('Error cargando las rutas:', error);
                });
            break;

        case 'novedades':
            modalTitle.textContent = 'Novedades';
            fetch('/api/novedades', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(novedades => {
                modalBody.innerHTML = ''; 
        
                if (novedades.length === 0) {
                    modalBody.insertAdjacentHTML('beforeend', '<div class="no-data-message">No hay novedades disponibles.</div>');
                } else {
                    let novedadesHtml = '<div class="novedades-container">';
                    novedades.forEach(novedad => {
                        novedadesHtml += `
                            <div class="card-info novedad">
                                <h5>ID: ${novedad.IdNovedad}</h5>
                                <p><strong>Fecha:</strong> ${new Date(novedad.FechaNovedad).toLocaleDateString()}</p>
                                <p><strong>Descripción:</strong> ${novedad.Descripcion}</p>
                            </div>
                        `;
                    });
                    novedadesHtml += '</div>';
                    modalBody.insertAdjacentHTML('beforeend', novedadesHtml);
                }
            })
            .catch(error => {
                console.error('Error al cargar las novedades:', error);
                modalBody.innerHTML = '<p>Error al cargar las novedades.</p>';
            });
            break;

        case 'autorizacion':
            modalTitle.textContent = 'Subir Autorización';
            modalBody.innerHTML = `
                <form id="autorizacionForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="estudiante">Estudiante</label>
                        <select id="estudiante" name="IdEstudiante" required>
                            <option value="">Seleccione el estudiante</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="tipoAutorizacion">Tipo de Autorización</label>
                        <select id="tipoAutorizacion" name="TipoAutorizacion" required>
                            <option value="">Seleccione el tipo</option>
                            <option value="Autorización para la recogida por parte de un familiar">Autorización para la recogida por parte de un familiar</option>
                            <option value="Autorización para la recogida por parte de un tutor">Autorización para la recogida por parte de un tutor</option>
                            <option value="Autorización para la recogida por una persona no registrada">Autorización para la recogida por una persona no registrada</option>
                            <option value="Autorización para la recogida en ruta escolar">Autorización para la recogida en ruta escolar</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="fechaInicio">Fecha de Inicio</label>
                        <input type="date" id="fechaInicio" name="FechaInicioAutorizacion" required>
                    </div>
                    <div class="form-group">
                        <label for="fechaFin">Fecha Fin</label>
                        <input type="date" id="fechaFin" name="FechaFinAutorizacion" required disabled>
                    </div>
                    <div class="form-group">
                        <label for="direccion">Dirección</label>
                        <input type="text" id="direccion" name="Direccion" placeholder="Ingrese la dirección" required>
                    </div>
                    <div class="form-group">
                        <label for="archivo">Subir Archivo</label>
                        <input type="file" id="archivo" name="pdfAutorizacion" accept="application/pdf" required>
                    </div>
                    <button type="submit" class="btn">Enviar Autorización</button>
                </form>
            `;

            function cargarEstudiantes() {
                fetch('api/estudiante?Estado=activo') 
                    .then(response => response.json())
                    .then(estudiantes => {
                        console.log(estudiantes); 

                        const estudianteSelect = document.getElementById('estudiante');
                        estudiantes.forEach(estudiante => {
                            const option = document.createElement('option');
                            option.value = estudiante.IdEstudiante;
                            option.textContent = `${estudiante.NombreEst} ${estudiante.ApellidosEst}`; 
                            estudianteSelect.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error al obtener los estudiantes:', error);
                        Swal.fire({
                            icon: 'warning',
                            title: 'Campos incompletos',
                            text: `Hubo un error al cargar la lista de estudiantes.`
                        });
                    });
            }

            cargarEstudiantes(); 

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
                }
            });

            document.getElementById('autorizacionForm').onsubmit = function(e) {
                e.preventDefault();

                const estudiante = document.getElementById('estudiante').value;
                const tipoAutorizacion = document.getElementById('tipoAutorizacion').value;
                const fechaInicio = document.getElementById('fechaInicio').value;
                const fechaFin = document.getElementById('fechaFin').value;
                const direccion = document.getElementById('direccion').value;
                const archivo = document.getElementById('archivo').files[0];

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
                

                const formData = new FormData(e.target);

                fetch('/api/autorizaciones', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data && data.IdAutorizacion) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: 'Autorización enviada exitosamente'
                        }).then(() => {
                            closeModal();
                        });
                    } else {
                        Swal.fire({
                            icon: 'warninig',
                            title: 'Error',
                            text: 'Hubo un error al enviar la autorización'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error al enviar la autorización:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al enviar la autorización'
                    });
                });
                
            };
            break;
    }
}


function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('modal')) {
        closeModal();
    }
}


