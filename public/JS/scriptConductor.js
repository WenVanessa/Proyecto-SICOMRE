document.addEventListener('DOMContentLoaded', () => {

    // Inicialización del mapa
    const map = L.map('map').setView([4.60971, -74.08175], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Datos de ejemplo para las paradas
    const paradas = [
        { nombre: "Casa 1", coords: [4.610, -74.080], icon: 'fas fa-user', direccion: 'Calle 131c #126-62' },
        { nombre: "Casa 2", coords: [4.611, -74.081], icon: 'fas fa-user', direccion: 'Calle 132d #140a-17' },
        { nombre: "Casa 3", coords: [4.60971, -74.08175], icon: 'fas fa-user', direccion: 'Calle 132bis #136-85' },
        { nombre: "Casa 4", coords: [4.624335, -74.063644], icon: 'fas fa-user', direccion: 'Calle 132 #140a-12' }
    ];

    // Agregar paradas al mapa y a la lista
    paradas.forEach(parada => {
        // Crear marcador en el mapa
        const marker = L.marker(parada.coords).addTo(map);
    
        // Popup del marcador
        marker.bindPopup(`
            <b>${parada.nombre}</b><br>
            Dirección: ${parada.direccion}
        `);
    
        // Agregar parada a la lista lateral
        const rutaLista = document.getElementById('ruta-lista');
        const paradaItem = document.createElement('li');
        paradaItem.classList.add('list-group-item');
        paradaItem.innerHTML = `${parada.nombre} - ${parada.direccion}`;
        rutaLista.appendChild(paradaItem);
    });

    const comentarioInput = document.getElementById('comentarios');
    const guardarComentarioBtn = document.querySelector('button');

    guardarComentarioBtn.addEventListener('click', async () => {
        const descripcion = comentarioInput.value.trim();

        if (!descripcion) {
            Swal.fire({
                title: "Error",
                text: "Por favor, escribe un comentario antes de guardar.",
                icon: "error",
                confirmButtonText: "Entendido"
            });
            return;
        }

        Swal.fire({
            title: "Guardar Comentario",
            text: "¿Estás seguro de que deseas guardar este comentario?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('http://localhost:3000/api/novedades', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ Descripcion: descripcion }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        Swal.fire({
                            title: "¡Guardado!",
                            text: "Comentario guardado con éxito.",
                            icon: "success",
                            confirmButtonText: "Entendido"
                        });
                        comentarioInput.value = ''; // Limpiar el campo después de guardar
                    } else {
                        const errorData = await response.json();
                        Swal.fire({
                            title: "Error",
                            text: `Error al guardar el comentario: ${errorData.error}`,
                            icon: "error",
                            confirmButtonText: "Entendido"
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "Ocurrió un error al guardar el comentario.",
                        icon: "error",
                        confirmButtonText: "Entendido"
                    });
                    console.error(error);
                }
            }
        });
    });
});
