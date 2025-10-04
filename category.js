document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const endpoint = params.get('endpoint'); // Cambiamos a endpoint para ser más genérico
    const genreId = params.get('genreId');
    const title = params.get('title');

    const categoryTitleEl = document.getElementById('category-title');
    const categoryGridEl = document.getElementById('category-grid');

    if (title) {
        categoryTitleEl.textContent = decodeURIComponent(title);
        document.title = `${decodeURIComponent(title)} - Pelix`;
    }

    let movies = [];
    if (endpoint) {
        movies = await fetchFromBackend(decodeURIComponent(endpoint));
    }

    if (movies.length > 0) {
        categoryGridEl.innerHTML = ''; // Limpiar el esqueleto de carga

        const user = auth.getUser();
        const userFavorites = user ? await getFavorites(user.id) : [];

        movies.forEach(pelicula => {
            if (!pelicula.poster_path) return;

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
            categoryGridEl.appendChild(peliculaElement);
        });
    }
});