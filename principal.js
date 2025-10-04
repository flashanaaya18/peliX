document.addEventListener('DOMContentLoaded', () => {
    const botonPrincipal = document.querySelector('.pelicula-principal .boton');
    const peliculaPrincipal = document.querySelector('.pelicula-principal');
    const tituloPrincipal = peliculaPrincipal.querySelector('.titulo');
    const descripcionPrincipal = peliculaPrincipal.querySelector('.descripcion');
    const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';

    // --- Lógica de Carga Dinámica ---
    const CATEGORIES = [
        { title: 'Recientes', endpoint: '/api/movies/now_playing', id: 'recientes' },
        { title: 'Populares', endpoint: '/api/movies/popular', id: 'populares' },
        { title: 'Mejor Calificadas', endpoint: '/api/movies/top_rated', id: 'top_rated' },
        { title: 'Acción', endpoint: '/api/genres/28/movies', id: 'accion' },
        { title: 'Aventura', endpoint: '/api/genres/12/movies', id: 'aventura' },
        { title: 'Animación', endpoint: '/api/genres/16/movies', id: 'animacion' },
        { title: 'Comedia', endpoint: '/api/genres/35/movies', id: 'comedia' },
        { title: 'Crimen', endpoint: '/api/genres/80/movies', id: 'crimen' },
        { title: 'Drama', endpoint: '/api/genres/18/movies', id: 'drama' },
        { title: 'Fantasía', endpoint: '/api/genres/14/movies', id: 'fantasia' },
        { title: 'Terror', endpoint: '/api/genres/27/movies', id: 'terror' },
        { title: 'Romance', endpoint: '/api/genres/10749/movies', id: 'romance' },
    ];

    const cargarPeliculas = async () => {
        const carouselsContainer = document.getElementById('carousels-container');
        carouselsContainer.innerHTML = ''; // Limpiar

        // 1. Obtenemos los favoritos del usuario UNA SOLA VEZ al principio.
        const user = auth.getUser();
        const userFavorites = user ? await getFavorites(user.id) : [];

        // Cargar la película principal primero
        const peliculasPrincipales = await fetchFromBackend(CATEGORIES[0].endpoint);
        establecerPeliculaPrincipal(peliculasPrincipales);

        // Cargar todos los carruseles
        for (const category of CATEGORIES) {
            const carouselHtml = `
                <div class="peliculas-recomendadas contenedor">
                    <div class="contenedor-titulo-controles">
                        <h3>${category.title}</h3>
                        <a href="${
                            category.id === 'recientes' ? 'recientes.html' :
                            category.id === 'populares' ? 'populares.html' :
                            category.id === 'top_rated' ? 'mejor_calificadas.html' :
                            `category.html?endpoint=${encodeURIComponent(category.endpoint)}&title=${encodeURIComponent(category.title)}`
                        }" class="ver-mas">
                            Ver más <i class="fa-solid fa-chevron-right"></i>
                        </a>
                    </div>
                    <div class="contenedor-principal" id="carousel-${category.id}">
                        <button role="button" class="flecha-izquierda"><i class="fa-solid fa-angle-left"></i></button>
                        <div class="contenedor-carousel">
                            <div class="skeleton-carousel">
                                <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
                            </div>
                        </div>
                        <button role="button" class="flecha-derecha"><i class="fa-solid fa-angle-right"></i></button>
                    </div>
                </div>
            `;
            carouselsContainer.insertAdjacentHTML('beforeend', carouselHtml);
            
            // Cargar las películas para este carrusel
            const movies = await fetchFromBackend(category.endpoint);
            // 2. Pasamos la lista de favoritos ya cargada a la función.
            crearCarousel(`carousel-${category.id}`, movies, userFavorites);
        }
    };

    const crearCarousel = (carouselId, peliculas, userFavorites) => {
        const carouselContainer = document.getElementById(carouselId);
        if (!carouselContainer) return;
        const contenedor = carouselContainer.querySelector('.contenedor-carousel');
        
        if (peliculas.length === 0) {
            contenedor.innerHTML = '<p class="mensaje-vacio" style="text-align: left; margin-top: 0;">No hay películas en esta categoría.</p>';
            return;
        }

        contenedor.innerHTML = ''; // Limpiar esqueleto

        peliculas.forEach(pelicula => {
            // En el backend, la columna se llama youtube_id, pero aquí la recibimos como youtubeId
            if (!pelicula.poster_path) return; 

            const peliculaDiv = document.createElement('div');
            peliculaDiv.classList.add('pelicula');

            // Comprobar si la película ya está en favoritos
            const esFavorito = userFavorites.some(fav => fav.id === pelicula.id);

            const posterUrl = getMovieImageUrl(pelicula.poster_path);
            const backgroundUrl = getMovieImageUrl(pelicula.backdrop_path, 'original');
            const videoIdPlaceholder = pelicula.youtube_id || pelicula.id;

            const url = `pelicula.html?id=${pelicula.id}&video=${videoIdPlaceholder}&bg=${encodeURIComponent(backgroundUrl)}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.overview)}&poster=${encodeURIComponent(posterUrl)}`;

            peliculaDiv.innerHTML = `
                <a href="${url}">
                    <img src="${posterUrl}" alt="${pelicula.title}">
                </a>
                <button class="favorite-btn ${esFavorito ? 'favorited' : ''}" 
                        data-id="${pelicula.id}" 
                        data-video-id="${videoIdPlaceholder}" 
                        data-background="${backgroundUrl}" 
                        data-title="${(pelicula.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" 
                        data-description="${(pelicula.overview || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" 
                        data-poster="${posterUrl}">
                    <i class="fa-solid fa-heart"></i>
                </button>
            `;

            contenedor.appendChild(peliculaDiv);
        });
    };

    const establecerPeliculaPrincipal = (peliculas) => {
        if (!peliculaPrincipal || peliculas.length === 0) return;

        const peliculaAleatoria = peliculas[Math.floor(Math.random() * peliculas.length)];
        const backgroundUrl = getMovieImageUrl(peliculaAleatoria.backdrop_path, 'original');
        const posterUrl = getMovieImageUrl(peliculaAleatoria.poster_path);
        const videoIdPlaceholder = peliculaAleatoria.youtube_id || peliculaAleatoria.id;

        peliculaPrincipal.style.background = `linear-gradient(rgba(0, 0, 0, .50) 0%, rgba(0,0,0,.50) 100%), url(${backgroundUrl})`;
        tituloPrincipal.textContent = peliculaAleatoria.title;
        descripcionPrincipal.textContent = peliculaAleatoria.overview;

        peliculaPrincipal.dataset.videoId = videoIdPlaceholder;
        peliculaPrincipal.dataset.background = backgroundUrl;
        peliculaPrincipal.dataset.title = peliculaAleatoria.title;
        peliculaPrincipal.dataset.description = peliculaAleatoria.overview;
        peliculaPrincipal.dataset.poster = posterUrl;
    };

    // Event Listener para el botón de la película principal
    if (botonPrincipal) {
        botonPrincipal.addEventListener('click', (e) => {
            e.preventDefault();
            const videoId = peliculaPrincipal.dataset.videoId;
            const background = peliculaPrincipal.dataset.background;
            const title = peliculaPrincipal.dataset.title;
            const description = peliculaPrincipal.dataset.description;
            const poster = peliculaPrincipal.dataset.poster;
            const url = `pelicula.html?id=${peliculaPrincipal.dataset.id || ''}&video=${videoId}&bg=${encodeURIComponent(background)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}&poster=${encodeURIComponent(poster)}`;
            window.location.href = url;
        });
    }

    // Iniciar la carga de películas
    cargarPeliculas();
});