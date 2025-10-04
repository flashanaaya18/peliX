document.addEventListener('DOMContentLoaded', async () => {
    // --- Protección de Ruta ---
    const user = auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Seleccionar elementos del DOM
    const profileNameDisplay = document.getElementById('profile-name-display');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar-img');
    const profileNameInput = document.getElementById('profile-name-input');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const avatarUploadInput = document.getElementById('avatar-upload');
    const favoritesCount = document.getElementById('favorites-count');
    const favoritesGrid = document.getElementById('profile-favorites-grid');
    const listaVaciaMsg = document.getElementById('profile-lista-vacia');
    const topGenreEl = document.getElementById('top-genre');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const recentlyViewedContainer = document.getElementById('recently-viewed-carousel');

    // Rellenar la información del perfil
    if (profileNameDisplay) profileNameDisplay.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileNameInput) profileNameInput.value = user.name;
    if (user.avatar_url) {
        profileAvatar.src = user.avatar_url;
    }

    // --- Lógica para editar perfil ---
    editBtn.addEventListener('click', () => {
        profileNameDisplay.style.display = 'none';
        profileNameInput.style.display = 'inline-block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    saveBtn.addEventListener('click', () => {
        const newName = profileNameInput.value.trim();
        if (newName) {
            auth.updateUser({ ...user, name: newName });
            profileNameDisplay.textContent = newName;
        }
        profileNameDisplay.style.display = 'inline-block';
        profileNameInput.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
    });

    // --- Lógica para cambiar avatar ---
    avatarUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAvatarUrl = event.target.result; // Esto es una URL de datos (base64)
                profileAvatar.src = newAvatarUrl;
                auth.updateUser({ ...user, avatar_url: newAvatarUrl });
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Lógica para Estadísticas y Vista Previa de "Mi Lista" ---
    const miLista = await getFavorites(user.id);

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

    // --- Lógica para "Vistos Recientemente" ---
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    if (recentlyViewed.length > 0 && recentlyViewedContainer) {
        const carouselHtml = `
            <button role="button" class="flecha-izquierda"><i class="fa-solid fa-angle-left"></i></button>
            <div class="contenedor-carousel"></div>
            <button role="button" class="flecha-derecha"><i class="fa-solid fa-angle-right"></i></button>
        `;
        recentlyViewedContainer.innerHTML = carouselHtml;
        const carouselContent = recentlyViewedContainer.querySelector('.contenedor-carousel');

        // Usamos un Set para evitar duplicados en la vista, manteniendo el más reciente
        const uniqueRecent = [...new Map(recentlyViewed.map(item => [item.id, item])).values()].reverse();

        uniqueRecent.slice(0, 10).forEach(pelicula => { // Mostramos hasta 10
            const peliculaElement = document.createElement('div');
            peliculaElement.classList.add('pelicula');
            const posterUrl = getMovieImageUrl(pelicula.poster);
            const url = `pelicula.html?id=${pelicula.id}&video=${pelicula.videoId}&bg=${encodeURIComponent(pelicula.background)}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.description)}&poster=${encodeURIComponent(pelicula.poster)}`;
            
            peliculaElement.innerHTML = `
                <a href="${url}">
                    <img src="${posterUrl}" alt="${decodeURIComponent(pelicula.title)}">
                </a>
            `;
            carouselContent.appendChild(peliculaElement);
        });
    } else if (recentlyViewedContainer) {
        recentlyViewedContainer.innerHTML = '<p class="mensaje-vacio" style="text-align: left; margin-top: 0;">No has visto ninguna película recientemente.</p>';
    }

    // --- Lógica para Ajustes de Cuenta ---
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // En una app real, aquí llamarías a un endpoint del backend para cambiar la contraseña.
            alert('Funcionalidad de cambio de contraseña no implementada en el backend aún.');
            changePasswordForm.reset();
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
                // En una app real, se llamaría a un endpoint para eliminar al usuario de la DB.
                auth.logout(); // Por ahora, solo cerramos sesión.
            }
        });
    }
});