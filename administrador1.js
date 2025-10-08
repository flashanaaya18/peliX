document.addEventListener('DOMContentLoaded', function() {
    const achievementForm = document.getElementById('achievement-form');
    const successMessage = document.getElementById('success-message');

    achievementForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const icon = document.getElementById('icon').value;

        if (!email || !title || !description || !icon) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Obtener los logros existentes o crear un objeto nuevo
        let userAchievements = JSON.parse(localStorage.getItem('userAchievements')) || {};

        // Si el usuario no tiene logros, crear un array para él
        if (!userAchievements[email]) {
            userAchievements[email] = [];
        }

        // Añadir el nuevo logro
        userAchievements[email].push({
            id: Date.now(),
            title,
            description,
            icon
        });

        // Guardar de vuelta en localStorage
        localStorage.setItem('userAchievements', JSON.stringify(userAchievements));

        // Mostrar mensaje de éxito y resetear el formulario
        successMessage.classList.remove('d-none');
        achievementForm.reset();
        setTimeout(() => successMessage.classList.add('d-none'), 4000);
    });
});