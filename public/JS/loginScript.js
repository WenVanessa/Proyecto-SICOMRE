document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault(); 

            
            const formData = new FormData(loginForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            console.log('Enviando datos de login:', data);

            try {
                const response = await fetch('/api/login', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json(); 
                console.log('Respuesta del servidor de login:', result);

                if (response.ok && result.status === 'success') {
                    
                    const redirectMap = {
                        'Administrador': '/administrador',
                        'Monitora': '/monitora',
                        'Conductor': '/conductor',
                        'Acudiente': '/acudiente',
                    };

                    const redirectUrl = redirectMap[result.role];
                    if (redirectUrl) {
                        Swal.fire({
                            title: 'Éxito',
                            text: 'Inicio de sesión exitoso.',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1100
                        }).then(() => {
                            window.location.href = redirectUrl;
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: 'Rol desconocido.',
                            icon: 'error',
                            showConfirmButton: true
                        });
                    }
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: result.error || 'Error al iniciar sesión.',
                        icon: 'error',
                        showConfirmButton: true
                    });
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al realizar la solicitud.',
                    icon: 'error',
                    showConfirmButton: true
                });
            }
        });
    }
});
