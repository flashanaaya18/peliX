document.addEventListener('DOMContentLoaded', async () => {
    // --- Protección de Ruta ---
    const loggedInUser = auth.getUser();
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // --- Determinar qué perfil se está viendo ---
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');
    const isOwnProfile = !profileId || profileId == loggedInUser.id;

    let userToDisplay;
    if (isOwnProfile) {
        userToDisplay = loggedInUser;
    } else {
        // Llamada eficiente a la API para obtener solo los datos del usuario que se está viendo.
        userToDisplay = await getUserById(profileId);
        if (!userToDisplay || userToDisplay.error) {
            const errorMessage = userToDisplay?.error || 'Usuario no encontrado';
            document.body.innerHTML = `<main class="contenedor" style="text-align: center; padding-top: 50px;">
                                           <h1 style="color: #fff;">Acceso Denegado</h1>
                                           <p class="mensaje-vacio" style="display: block;">${errorMessage}</p>
                                       </main>`;
            return;
        }
    }

    // Seleccionar elementos del DOM
    const profileNameDisplay = document.getElementById('profile-name-display');
    const verifiedBadge = document.getElementById('verified-badge');
    const profileEmail = document.getElementById('profile-email');
    const profileBio = document.getElementById('profile-bio');
    const bioContainer = document.getElementById('bio-container');
    const bioEditContainer = document.getElementById('bio-edit-container');
    const bioTextarea = document.getElementById('bio-textarea');
    const birthdateDisplay = document.getElementById('profile-birthdate-display');
    const profileIdEl = document.getElementById('profile-id');
    const profileAvatar = document.getElementById('profile-avatar-img');
    const profileNameInput = document.getElementById('profile-name-input');
    const avatarUploadLabel = document.querySelector('.edit-avatar-btn');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const avatarUploadInput = document.getElementById('avatar-upload');
    const favoritesCount = document.getElementById('favorites-count');
    const favoritesGrid = document.getElementById('profile-favorites-grid');
    const listaVaciaMsg = document.getElementById('profile-lista-vacia');
    const topGenreEl = document.getElementById('top-genre');
    const friendActionsContainer = document.getElementById('friend-actions-container');
    const friendListSection = document.getElementById('friend-list-section');
    const friendList = document.getElementById('friend-list');
    const pendingRequestsSection = document.getElementById('pending-requests-section');
    const pendingRequestsList = document.getElementById('pending-requests-list');

    // Rellenar la información del perfil
    if (profileNameDisplay) profileNameDisplay.textContent = userToDisplay.name;
    if (profileEmail) profileEmail.textContent = userToDisplay.email;
    if (profileBio) profileBio.textContent = userToDisplay.bio || (isOwnProfile ? 'Haz clic en "Editar" para añadir una biografía.' : 'Este usuario aún no ha añadido una biografía.');
    if (bioTextarea) bioTextarea.value = userToDisplay.bio || '';
    if (birthdateDisplay) {
        if (userToDisplay.birth_date) {
            birthdateDisplay.textContent = new Date(userToDisplay.birth_date).toLocaleDateString();
        } else if (isOwnProfile) {
            birthdateDisplay.innerHTML = `<a href="configuracion.html" style="color: var(--primary-color);">Añadir en configuración</a>`;
        } else {
            birthdateDisplay.textContent = 'No especificada';
        }
    }
    if (profileIdEl) profileIdEl.textContent = userToDisplay.id;
    if (profileNameInput) profileNameInput.value = userToDisplay.name;
    if (userToDisplay.avatar_url) {
        profileAvatar.src = userToDisplay.avatar_url;
    }
    // Mostrar la paloma azul si el usuario está verificado
    if (userToDisplay.is_verified) {
        verifiedBadge.style.display = 'inline-block';
    }

    // --- Lógica de visualización y acciones ---
    if (isOwnProfile) {
        // Es mi perfil: mostrar botones de edición
        editBtn.style.display = 'inline-block';
        avatarUploadLabel.style.display = 'block';

        // --- Lógica para editar perfil ---
        editBtn.addEventListener('click', () => {
            profileNameDisplay.style.display = 'none';
            bioContainer.style.display = 'none';
            profileNameInput.style.display = 'inline-block';
            bioEditContainer.style.display = 'block';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        });

        saveBtn.addEventListener('click', async () => {
            const newName = profileNameInput.value.trim();
            const newBio = bioTextarea.value.trim();

            // Actualizar en el backend y luego en el frontend (en paralelo)
            await Promise.all([
                updateUserName(loggedInUser.id, newName),
                updateUserBio(loggedInUser.id, newBio)
            ]);
            auth.updateUser({ ...auth.getUser(), name: newName, bio: newBio });

            profileNameDisplay.textContent = newName;
            profileBio.textContent = newBio || 'Haz clic en "Editar" para añadir una biografía.';
            profileNameDisplay.style.display = 'inline-block';
            bioContainer.style.display = 'block';
            profileNameInput.style.display = 'none';
            bioEditContainer.style.display = 'none';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        });

        // --- Lógica para cambiar avatar ---
        avatarUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const newAvatarUrl = event.target.result; // Esto es una URL de datos (base64)
                    profileAvatar.src = newAvatarUrl;
                    await updateUserAvatar(loggedInUser.id, newAvatarUrl);
                    auth.updateUser({ ...auth.getUser(), avatar_url: newAvatarUrl });
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
        // Es el perfil de otro usuario: ocultar edición y mostrar botones de amistad
        editBtn.style.display = 'none';
        avatarUploadLabel.style.display = 'none';
        friendActionsContainer.style.display = 'block';
        renderFriendshipButtons();
    }

    // --- Lógica para Estadísticas y Vista Previa de "Mi Lista" ---
    const miLista = await getFavorites(userToDisplay.id);

    // Cargar amigos y solicitudes pendientes
    await loadFriends();
    if (isOwnProfile) {
        await loadPendingRequests();
        setupPendingRequestsListener(); // Configurar el listener una sola vez
    }

    // --- Lógica de Amistad ---
    async function renderFriendshipButtons() {
        const status = await getFriendshipStatus(loggedInUser.id, userToDisplay.id);
        friendActionsContainer.innerHTML = ''; // Limpiar botones anteriores

        if (!status) {
            // No son amigos, no hay solicitud pendiente
            const addButton = document.createElement('button');
            addButton.textContent = 'Agregar Amigo';
            addButton.className = 'auth-button';
            addButton.onclick = async () => {
                await sendFriendRequest(loggedInUser.id, userToDisplay.id);
                renderFriendshipButtons(); // Volver a renderizar
            };
            friendActionsContainer.appendChild(addButton);
        } else if (status.status === 'pending') {
            if (status.action_user_id === loggedInUser.id) {
                // Yo envié la solicitud
                friendActionsContainer.innerHTML = '<p class="friend-status">Solicitud pendiente</p>';
            } else {
                // Él/ella me envió la solicitud
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Aceptar Solicitud';
                acceptButton.className = 'auth-button';
                acceptButton.onclick = async () => {
                    await acceptFriendRequest(userToDisplay.id, loggedInUser.id);
                    renderFriendshipButtons();
                };

                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Rechazar';
                rejectButton.className = 'delete-btn';
                rejectButton.style.marginLeft = '10px';
                rejectButton.onclick = async () => {
                    await rejectFriendRequest(userToDisplay.id, loggedInUser.id);
                    renderFriendshipButtons();
                };

                friendActionsContainer.appendChild(acceptButton);
                friendActionsContainer.appendChild(rejectButton);
            }
        } else if (status.status === 'accepted') {
            // Ya son amigos
            friendActionsContainer.innerHTML = '<p class="friend-status"><i class="fa-solid fa-check"></i> Amigos</p>';
        }
    }

    async function loadFriends() {
        const friends = await getFriends(userToDisplay.id);
        if (friends && friends.length > 0) {
            friendListSection.style.display = 'block';
            friendList.innerHTML = '';
            friends.forEach(friend => {
                const friendItem = document.createElement('li');
                friendItem.className = 'friend-item';
                friendItem.innerHTML = `
                    <a href="perfil.html?id=${friend.id}">
                        <img src="${friend.avatar_url || '/peliX.png'}" alt="${friend.name}" class="friend-avatar">
                        <span>${friend.name}</span>
                    </a>
                `;
                friendList.appendChild(friendItem);
            });
        }
    }

    async function loadPendingRequests() {
        const requests = await getPendingRequests(loggedInUser.id);
        if (requests && requests.length > 0) {
            pendingRequestsSection.style.display = 'block';
            pendingRequestsList.innerHTML = '';
            requests.forEach(user => {
                const requestItem = document.createElement('li');
                requestItem.className = 'admin-movie-item';
                requestItem.innerHTML = `
                    <div class="user-info-container">
                        <img src="${user.avatar_url || '/peliX.png'}" alt="Avatar de ${user.name}" class="user-list-avatar">
                        <span>${user.name}</span>
                    </div>
                    <div>
                        <button class="action-btn approve" data-id="${user.id}">Aceptar</button>
                        <button class="action-btn deny" data-id="${user.id}" style="margin-left: 10px;">Rechazar</button>
                    </div>
                `;
                pendingRequestsList.appendChild(requestItem);
            });

        } else {
            pendingRequestsSection.style.display = 'none';
        }
    }

    function setupPendingRequestsListener() {
        pendingRequestsList.addEventListener('click', async (e) => {
            const button = e.target.closest('.action-btn');
            if (!button) return;

            const userId = button.dataset.id;
            if (button.classList.contains('approve')) {
                await acceptFriendRequest(userId, loggedInUser.id);
            } else if (button.classList.contains('deny')) {
                await rejectFriendRequest(userId, loggedInUser.id);
            }
            
            // Recargar ambas listas para reflejar los cambios
            await loadPendingRequests();
            await loadFriends();
        });
    }

    // Mostrar contador
    favoritesCount.textContent = miLista.length;

    // Mostrar vista previa de la lista
    if (miLista.length === 0) {
        listaVaciaMsg.style.display = 'block';
    } else {
        // --- Calcular Top Género (Funcional) ---
        const movieIds = miLista.map(movie => movie.id);
        const genresOfFavorites = await getGenresForMovies(movieIds);

        const genreCounts = {};
        genresOfFavorites.forEach(item => {
            genreCounts[item.name] = (genreCounts[item.name] || 0) + 1;
        });

        let topGenre = '-';
        let maxCount = 0;
        for (const genre in genreCounts) {
            if (genreCounts[genre] > maxCount) {
                maxCount = genreCounts[genre];
                topGenre = genre;
            }
        }
        topGenreEl.textContent = topGenre;

        // --- Vista Previa de "Mi Lista" ---
        const previewList = miLista.slice(-6).reverse();
        previewList.forEach(pelicula => {
            const peliculaElement = document.createElement('div');
            peliculaElement.classList.add('pelicula');
            const posterUrl = getMovieImageUrl(pelicula.poster_path);
            const url = `pelicula.html?id=${pelicula.id}&video=${pelicula.youtube_id || pelicula.id}&bg=https://image.tmdb.org/t/p/original${pelicula.backdrop_path}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.overview)}&poster=${encodeURIComponent(posterUrl)}`;

            peliculaElement.innerHTML = `
                <a href="${url}">
                    <img src="${posterUrl}" alt="${pelicula.title}">
                </a>
            `;
            favoritesGrid.appendChild(peliculaElement);
        });
    }
});