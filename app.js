// Espera a que todo el contenido del DOM esté cargado
window.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.splash');

    // Función para decidir a dónde redirigir
    const redirect = () => {
        if (auth.getUser()) {
            // Si hay un usuario, vamos a la página principal
            window.location.href = 'principal.html';
        } else {
            // Si no, vamos a la página de login
            window.location.href = 'login.html';
        }
    };

    // Después de la animación, decidimos a dónde ir
    setTimeout(() => {
        redirect();
    }, 2500); // Esperamos 2.5 segundos para que la animación se vea
});