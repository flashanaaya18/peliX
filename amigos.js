document.addEventListener('DOMContentLoaded', async () => {
    // --- Protección de Ruta ---
    const loggedInUser = auth.getUser();
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    const userList = document.getElementById('user-list');
    const searchInput = document.getElementById('search-user-id');
    const searchButton = document.getElementById('btn-search-user');
    const searchError = document.getElementById('search-error');
    const robotMessage = document.getElementById('robot-message');
    const robotActions = document.getElementById('robot-actions');

    // --- Lógica del Robot-X ---
    if (robotMessage) {
        robotMessage.textContent = `¡Hola, ${loggedInUser.name}! Soy Robot-X. Estoy aquí para ayudarte a conectar. ¿Qué te gustaría hacer?`;
    }

    if (robotActions) {
        robotActions.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'focus-search') {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                robotMessage.textContent = '¡Genial! Escribe el ID del usuario que buscas en el campo de arriba y presiona Enter o el botón de la lupa.';
            } else if (action === 'explain-page') {
                robotMessage.textContent = 'En esta página puedes encontrar a otros usuarios. Usa la barra de búsqueda para encontrar a alguien por su ID, o explora la lista de abajo para descubrir nuevos amigos.';
            }
            // Ocultar los botones después de una acción para una interfaz más limpia
            robotActions.style.display = 'none';
        });
    }

    // --- Lógica de Búsqueda por ID ---
    const handleSearch = () => {
        // Restablecer mensaje del robot si se realiza una búsqueda
        robotMessage.textContent = `¡Hola, ${loggedInUser.name}! Soy Robot-X. ¿Necesitas más ayuda?`;
        robotActions.style.display = 'flex';

        const userId = searchInput.value.trim();
        if (userId && !isNaN(userId)) {
            // Limpiar error
            searchError.style.display = 'none';
            searchError.textContent = '';
            // Redirigir al perfil del usuario
            window.location.href = `perfil.html?id=${userId}`;
        } else {
            // Mostrar error
            searchError.textContent = 'Por favor, introduce un ID de usuario válido.';
            searchError.style.display = 'block';
        }
    };

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    async function loadUsers() {
        const users = await getAllUsers(); // Función de api.js que llama a /api/users
        userList.innerHTML = ''; // Limpiar la lista

        if (!users || users.length === 0) {
            userList.innerHTML = '<p>No se encontraron usuarios.</p>';
            return;
        }

        users.forEach(user => {
            // No mostrar al usuario actual en la lista de amigos
            if (user.id === loggedInUser.id) return;

            const userItem = document.createElement('li');
            userItem.className = 'admin-movie-item';
            userItem.innerHTML = `
                <div class="user-info-container">
                    <img src="${user.avatar_url || '/peliX.png'}" alt="Avatar de ${user.name}" class="user-list-avatar">
                    <   <span>${user.name} ${user.is_verified ? '<i class="fa-solid fa-circle-check verified-badge-small"></i>' : ''}</span>
                        <span class="user-list-id">ID: ${user.id}</span>
                    </div>
                </div>
                <a href="perfil.html?id=${user.id}" class="auth-button">Ver Perfil</a>
            `;
            userList.appendChild(userItem);
        });
    }

    loadUsers();
});