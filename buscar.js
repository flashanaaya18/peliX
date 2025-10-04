document.addEventListener('DOMContentLoaded', async () => {
    const inputBusqueda = document.getElementById('input-busqueda');
    const resultadosContainer = document.getElementById('resultados-busqueda');
    const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';
    const mensajeNoResultados = document.getElementById('mensaje-no-resultados');
    const loader = document.getElementById('loader-busqueda');
    let searchTimeout;

    const buscarPeliculas = async () => {
        const terminoBusqueda = inputBusqueda.value.trim();
        resultadosContainer.innerHTML = '';
        mensajeNoResultados.style.display = 'none'; // Ocultar mensaje al iniciar nueva búsqueda

        if (terminoBusqueda.length < 2) {
            loader.style.display = 'none';
            return;
        }

        loader.style.display = 'block'; // Mostrar el loader

        const peliculasFiltradas = await searchMoviesAPI(terminoBusqueda);
        loader.style.display = 'none'; // Ocultar el loader después de la búsqueda

        if (peliculasFiltradas.length === 0) {
            mensajeNoResultados.style.display = 'block'; // Mostrar mensaje si no hay resultados
            return;
        }

        const user = auth.getUser();
        const userFavorites = user ? await getFavorites(user.id) : [];

        peliculasFiltradas.forEach(pelicula => {
            if (!pelicula.poster_path) return; // Omitir resultados sin póster

            const peliculaElement = document.createElement('div');
            peliculaElement.classList.add('pelicula');
            
            const esFavorito = userFavorites.some(fav => fav.id === pelicula.id);
            const posterUrl = getMovieImageUrl(pelicula.poster_path);
            const backgroundUrl = getMovieImageUrl(pelicula.backdrop_path, 'original');
            const videoIdPlaceholder = pelicula.youtube_id || pelicula.id;

            const url = `pelicula.html?id=${pelicula.id}&video=${videoIdPlaceholder}&bg=${encodeURIComponent(backgroundUrl)}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.overview)}&poster=${encodeURIComponent(posterUrl)}`;

            peliculaElement.innerHTML = `
                <a href="${url}"><img src="${posterUrl}" alt="${pelicula.title}"></a>
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
            resultadosContainer.appendChild(peliculaElement);
        });
    };

    // Buscar al escribir con un pequeño retraso (debounce) para no saturar la API
    inputBusqueda.addEventListener('keyup', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(buscarPeliculas, 500);
    });
});