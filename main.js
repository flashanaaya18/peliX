document.addEventListener('DOMContentLoaded', () => {
    const btnMenu = document.getElementById('btn-menu');
    const sideMenu = document.getElementById('side-menu');
    const headerMenuBtn = document.getElementById('header-menu-btn');
    const closeBtn = document.querySelector('.close-btn');
    const overlay = document.getElementById('overlay');
    const btnLogout = document.getElementById('btn-logout');
    const miListaLink = document.getElementById('mi-lista-link');
    const accountLinksContainer = document.getElementById('account-links-container');
    const mainLinksContainer = document.getElementById('main-links-container'); // Contenedor para enlaces principales
    const genresLinkContainer = document.getElementById('genres-link-container');
    const userHeaderAvatar = document.getElementById('user-header-avatar');

    // --- Lógica para el Menú Lateral ---
    const openMenu = () => {
        if (window.innerWidth <= 800) { // Solo se ejecuta en móvil
            if (sideMenu) sideMenu.style.width = '250px';
            if (overlay) overlay.style.display = 'block';
        }
    };

    const closeMenu = () => {
        if (window.innerWidth <= 800) { // Solo se ejecuta en móvil
            if (sideMenu) sideMenu.style.width = '0';
            if (overlay) overlay.style.display = 'none';
        }
    };

    // --- Lógica de Autenticación ---
    if (auth.getUser()) {
        const user = auth.getUser();

        // Si el usuario está logueado, mostramos el botón de cerrar sesión
        if (mainLinksContainer) {
            let mainLinksHTML = `
                <a href="principal.html"><i class="fa-solid fa-house fa-fw"></i> Inicio</a>
                <a href="buscar.html"><i class="fa-solid fa-magnifying-glass fa-fw"></i> Buscar</a>
            `;
            // Comprobar si el modo admin está activado (es true por defecto si no existe)
            const isAdminModeEnabled = localStorage.getItem('admin_mode') !== 'false';
            if (user.role === 'admin' && isAdminModeEnabled) {
            }
            mainLinksHTML += `
                <a href="milista.html" id="mi-lista-link"><i class="fa-solid fa-heart fa-fw"></i> Mi Lista</a>
                <a href="lista-deseos.html"><i class="fa-solid fa-star fa-fw"></i> Lista de Deseos</a>
                <a href="populares.html"><i class="fa-solid fa-fire fa-fw"></i> Populares</a>
                <a href="mejor_calificadas.html"><i class="fa-solid fa-star fa-fw"></i> Mejor Calificadas</a>
                <a href="amigos.html"><i class="fa-solid fa-user-group fa-fw"></i> Amigos</a>
                <a href="perfil.html"><i class="fa-solid fa-user fa-fw"></i> Mi Perfil</a>
            `;
            // Limpiar por si acaso y añadir enlaces principales
            mainLinksContainer.innerHTML = mainLinksHTML;
        }

        if (accountLinksContainer) {
            accountLinksContainer.innerHTML = `
                <a href="configuracion.html"><i class="fa-solid fa-gear fa-fw"></i> Configuración</a>
                <a href="#" id="btn-logout"><i class="fa-solid fa-right-from-bracket fa-fw"></i> Cerrar Sesión</a>
            `;
            // Volvemos a buscar el botón de logout porque lo acabamos de crear
            document.getElementById('btn-logout').addEventListener('click', auth.logout);
        }
        if (userHeaderAvatar) {
            // Cargar géneros dinámicamente solo si el contenedor existe
            if (genresLinkContainer) {
                const loadGenres = async () => {
                    const genres = await fetchGenres();
                    if (genresLinkContainer) {
                        genresLinkContainer.innerHTML = ''; // Limpiar antes de añadir
                        genres.forEach(genre => {
                            const link = document.createElement('a');
                            link.href = `category.html?genreId=${genre.id}&title=${genre.name}`;
                            link.textContent = genre.name;
                            genresLinkContainer.appendChild(link);
                        });
                    }
                }
                loadGenres();
            }

            userHeaderAvatar.style.display = 'block';
            userHeaderAvatar.innerHTML = `<a href="perfil.html"><img src="${user.avatar_url || '/peliX.png'}" alt="Mi Perfil"></a>`;
        }
    } else {
        // Si no, lo ocultamos y hacemos que "Mi Lista" lleve al login
        if (mainLinksContainer) {
            // Enlaces para usuarios no logueados
            mainLinksContainer.innerHTML = `
                <a href="principal.html"><i class="fa-solid fa-house fa-fw"></i> Inicio</a>
                <a href="buscar.html"><i class="fa-solid fa-magnifying-glass fa-fw"></i> Buscar</a>
                <a href="populares.html"><i class="fa-solid fa-fire fa-fw"></i> Populares</a>
                <a href="mejor_calificadas.html"><i class="fa-solid fa-star fa-fw"></i> Mejor Calificadas</a>
            `;
        }
        if (accountLinksContainer) accountLinksContainer.innerHTML = ''; // Limpiar si no está logueado
        if(miListaLink) miListaLink.href = 'login.html';
    }

    if (btnMenu) btnMenu.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (headerMenuBtn) headerMenuBtn.addEventListener('click', openMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

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

        // --- Lógica para el botón de Lista de Deseos (Estrella) ---
        if (e.target.matches('.wishlist-btn, .wishlist-btn *')) {
            e.preventDefault();
            const user = auth.getUser();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            const button = e.target.closest('.wishlist-btn');
            const movieId = button.dataset.id;

            if (button.classList.contains('wished')) {
                removeFromWishlist(user.id, movieId).then(() => button.classList.remove('wished'));
            } else {
                addToWishlist(user.id, movieId).then(() => button.classList.add('wished'));
            }
        }
    });
});