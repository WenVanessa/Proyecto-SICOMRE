document.addEventListener('DOMContentLoaded', function() {
    const routeSelect = document.getElementById('placa');
    const routeInfo = document.getElementById('rutaInfo');
    let selectedRouteId = null; // Variable para almacenar el ID de la ruta seleccionada
    const horaInicio = document.getElementById('horaInicio');
    const horaFinal = document.getElementById('horaFinal');
    const tiempoRecorrido = document.getElementById('tiempoRecorrido');
    const estudiantesTabla = document.getElementById('estudiantesTabla');
    const asistenciaEstado = {};

    // Cargar rutas activas desde el servidor
    fetch('http://localhost:3000/api/ruta0/rutas/activas')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                data.forEach(ruta => {
                    const option = document.createElement('option');
                    option.value = ruta.IdRuta; // Guardamos el ID en el valor
                    option.textContent = ruta.PlacaRuta; // Mostramos la placa
                    routeSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No hay rutas activas disponibles";
                routeSelect.appendChild(option);
            }
        })
        .catch(error => console.error('Error al cargar las rutas:', error));

    // Manejar la selección de ruta
    routeSelect.addEventListener('change', function() {
        selectedRouteId = this.value; // Guardar el ID de la ruta seleccionada
        const selectedPlaca = this.options[this.selectedIndex].textContent;

        if (selectedRouteId) {
            fetch(`http://localhost:3000/api/ruta0/id/${selectedRouteId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    routeInfo.textContent = JSON.stringify(data);
                })
                .catch(error => console.error('Error al obtener la ruta:', error));
        } else {
            routeInfo.textContent = '';
        }
    });

    // Calcular tiempo recorrido
    function calcularTiempoRecorrido() {
        const horaInicioValue = horaInicio.value;
        const horaFinalValue = horaFinal.value;

        if (horaInicioValue && horaFinalValue) {
            const [horasInicio, minutosInicio, segundosInicio] = horaInicioValue.split(':').map(Number);
            const [horasFinal, minutosFinal, segundosFinal] = horaFinalValue.split(':').map(Number);

            const tiempoInicio = new Date();
            tiempoInicio.setHours(horasInicio, minutosInicio, segundosInicio);

            const tiempoFinal = new Date();
            tiempoFinal.setHours(horasFinal, minutosFinal, segundosFinal);

            const diferencia = (tiempoFinal - tiempoInicio) / 1000; // Diferencia en segundos

            const horas = Math.floor(diferencia / 3600);
            const minutos = Math.floor((diferencia % 3600) / 60);
            const segundos = diferencia % 60;

            const tiempoFormateado = 
                String(horas).padStart(2, '0') + ':' + 
                String(minutos).padStart(2, '0') + ':' + 
                String(segundos).padStart(2, '0');
            tiempoRecorrido.value = tiempoFormateado;
        } else {
            tiempoRecorrido.value = '';
        }
    }

    horaInicio.addEventListener('change', calcularTiempoRecorrido);
    horaFinal.addEventListener('change', calcularTiempoRecorrido);

    function cargarCursos() {
        fetch('http://localhost:3000/api/curso')
            .then(response => response.json())
            .then(cursos => {
                const selectCurso = document.getElementById('curso');
                cursos.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso.IdCurso; // Asumiendo que tienes un campo IdCurso
                    option.textContent = curso.NumeroCurso; // Cambia esto si el nombre del curso está en otro campo
                    selectCurso.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar los cursos:', error));
    }

    document.getElementById('curso').addEventListener('change', function() {
        const cursoId = this.value;
        cargarEstudiantes(cursoId); // Pasar cursoId para filtrar estudiantes
    });

    function cargarEstudiantes(cursoId) {
        let url = 'http://localhost:3000/api/curso/estudiantes';
        if (cursoId) {
            url += `?cursoId=${cursoId}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                estudiantesTabla.innerHTML = ''; // Limpiar tabla antes de agregar nuevos datos
                data.forEach(estudiante => {
                    const checked = asistenciaEstado[estudiante.IdEstudiante] || false;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${estudiante.NombreEst}</td>
                        <td>${estudiante.ApellidosEst}</td>
                        <td>${estudiante.NumeroCurso || 'Sin Curso'}</td>
                        <td><input type="checkbox" class="asistencia" data-id="${estudiante.IdEstudiante}" ${checked ? 'checked' : ''}></td>
                    `;
                    estudiantesTabla.appendChild(row);
                });

                document.querySelectorAll('.asistencia').forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const estudianteId = this.dataset.id;
                        asistenciaEstado[estudianteId] = this.checked; // Guardar el estado
                    });
                });
            })
            .catch(error => console.error('Error al cargar estudiantes:', error));
    }

    cargarEstudiantes();
    cargarCursos();

    document.getElementById('guardarBtn').addEventListener('click', async function() {
        try {
            const idRuta = document.getElementById('placa').value;
            const fechaViaje = new Date().toISOString().split('T')[0];
            const horaInicioValue = horaInicio.value;
            const horaFinalValue = horaFinal.value;
            const tiempoRecorridoValue = tiempoRecorrido.value;
    
            const estudiantesPresentes = Array.from(document.querySelectorAll('.asistencia:checked'));
            const cantidadEstudiantes = estudiantesPresentes.length;
    
            const viajeData = {
                IdRuta: idRuta,
                FechaViaje: fechaViaje,
                HoraInicio: horaInicioValue,
                HoraFinal: horaFinalValue,
                TiempoRecorrido: tiempoRecorridoValue,
                NumEstudiantes: cantidadEstudiantes
            };
    
            const responseViaje = await fetch('http://localhost:3000/api/viaje', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(viajeData)
            });
    
            if (!responseViaje.ok) {
                const errorData = await responseViaje.json().catch(e => null);
                console.error('Respuesta del servidor:', errorData);
                throw new Error(`Error al guardar el viaje: ${errorData?.message || responseViaje.statusText}`);
            }
    
            const viaje = await responseViaje.json();
            const viajeId = viaje.id;
    
            const todosLosEstudiantes = document.querySelectorAll('.asistencia');
    
            const promesasAsistencia = Array.from(todosLosEstudiantes).map(async (checkbox) => {
                const estudianteId = checkbox.dataset.id;
                const estaPresente = checkbox.checked;
    
                const asistenciaData = {
                    IdViaje: viajeId,
                    IdEstudiante: estudianteId,
                    DescripcionViaje: estaPresente ? "Asiste a la ruta" : "No asistió a la ruta"
                };
    
                const responseAsistencia = await fetch('http://localhost:3000/api/asistencia', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(asistenciaData)
                });
    
                if (!responseAsistencia.ok) {
                    throw new Error('Error al guardar asistencia');
                }
    
                return responseAsistencia.json();
            });
    
            await Promise.all(promesasAsistencia);
    
            // Mostrar alerta de éxito
            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: 'El viaje y las asistencias se han guardado correctamente.',
                confirmButtonText: 'Entendido'
            });
    
            // Limpiar campos del formulario
            document.getElementById('placa').value = '';
            horaInicio.value = '';
            horaFinal.value = '';
            tiempoRecorrido.value = '';
    
            // Volver a cargar la lista de estudiantes después de guardar
            const cursoId = document.getElementById('curso').value; // Obtener el ID del curso seleccionado
            cargarEstudiantes(cursoId); // Cargar estudiantes nuevamente
    
            // Limpiar estado de asistencia
            Object.keys(asistenciaEstado).forEach(estudianteId => {
                asistenciaEstado[estudianteId] = false;
            });
    
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al guardar los datos.',
                confirmButtonText: 'Entendido'
            });
        }
    });
});
