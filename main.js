document.addEventListener('DOMContentLoaded', () => {
    const btnMenu = document.getElementById('btn-menu');
    const sideMenu = document.getElementById('side-menu');
    const closeBtn = document.querySelector('.close-btn');
    const overlay = document.getElementById('overlay');
    const btnLogout = document.getElementById('btn-logout');
    const miListaLink = document.getElementById('mi-lista-link');
    const genresLinkContainer = document.getElementById('genres-link-container');
    const userHeaderAvatar = document.getElementById('user-header-avatar');

    // --- Lógica para el Menú Lateral ---
    const openMenu = () => {
        if (sideMenu) sideMenu.style.width = '250px';
        if (overlay) overlay.style.display = 'block';
    };

    const closeMenu = () => {
        if (sideMenu) sideMenu.style.width = '0';
        if (overlay) overlay.style.display = 'none';
    };

    // --- Lógica de Autenticación ---
    if (auth.getUser()) {
        // Si el usuario está logueado, mostramos el botón de cerrar sesión
        if(btnLogout) btnLogout.style.display = 'block';
        const user = auth.getUser();
        if (userHeaderAvatar) {
            // Cargar géneros dinámicamente
            const loadGenres = async () => {
                const genres = await fetchGenres();
                if (genresLinkContainer) {
                    genres.forEach(genre => {
                        const link = document.createElement('a');
                        link.href = `category.html?genreId=${genre.id}&title=${genre.name}`;
                        link.textContent = genre.name;
                        genresLinkContainer.appendChild(link);
                    });
                }
            };
            loadGenres();

            userHeaderAvatar.style.display = 'block';
            userHeaderAvatar.innerHTML = `<a href="perfil.html"><img src="${user.avatar_url || '/peliX.png'}" alt="Mi Perfil"></a>`;
            const logo = document.querySelector('.logo');
            if(logo) logo.style.display = 'none'; // Ocultamos el logo de texto
        }
    } else {
        // Si no, lo ocultamos y hacemos que "Mi Lista" lleve al login
        if(btnLogout) btnLogout.style.display = 'none';
        if(miListaLink) miListaLink.href = 'login.html';
    }

    if (btnMenu) btnMenu.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    if (btnLogout) btnLogout.addEventListener('click', auth.logout);

    // --- Lógica para Flechas de Carousel (Event Delegation) ---
    document.addEventListener('click', e => {
        if (e.target.matches('.flecha-derecha, .flecha-derecha *')) {
            const carousel = e.target.closest('.contenedor-principal').querySelector('.contenedor-carousel');
            if (carousel) carousel.scrollLeft += carousel.offsetWidth;
        }
        if (e.target.matches('.flecha-izquierda, .flecha-izquierda *')) {
            const carousel = e.target.closest('.contenedor-principal').querySelector('.contenedor-carousel');
            if (carousel) carousel.scrollLeft -= carousel.offsetWidth;
        }

        // --- Lógica para el botón de Favoritos (Corazón) ---
        if (e.target.matches('.favorite-btn, .favorite-btn *')) {
            e.preventDefault();
            const user = auth.getUser();
            if (!user) {
                window.location.href = 'login.html'; // Si no está logueado, va al login
                return;
            }

            const button = e.target.closest('.favorite-btn');
            const movieId = button.dataset.id;

            if (button.classList.contains('favorited')) {
                // Si ya está, la quitamos
                removeFavorite(user.id, movieId);
                button.classList.remove('favorited');
            } else {
                // Si no está, la añadimos
                addFavorite(user.id, movieId);
                button.classList.add('favorited');
            }
        }
    });
});