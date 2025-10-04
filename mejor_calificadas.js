document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('mejor-calificadas-grid');

    // Obtener las películas de la categoría 'top_rated'
    const movies = await fetchMovies('top_rated');

    // Obtener los favoritos del usuario para saber qué corazones marcar
    const user = auth.getUser();
    const userFavorites = user ? await getFavorites(user.id) : [];
    
    grid.innerHTML = ''; // Limpiar el esqueleto de carga

    if (movies.length > 0) {
        movies.forEach(pelicula => {
            if (!pelicula.poster_path) return;

            const peliculaElement = document.createElement('div');
            peliculaElement.classList.add('pelicula');

            // Comprobar si la película ya está en favoritos
            const esFavorito = userFavorites.some(fav => fav.id === pelicula.id);

            const posterUrl = getMovieImageUrl(pelicula.poster_path);
            const backgroundUrl = getMovieImageUrl(pelicula.backdrop_path, 'original');
            const videoIdPlaceholder = pelicula.youtube_id || pelicula.id;

            const url = `pelicula.html?id=${pelicula.id}&video=${videoIdPlaceholder}&bg=${encodeURIComponent(backgroundUrl)}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.overview)}&poster=${encodeURIComponent(posterUrl)}`;

            peliculaElement.innerHTML = `
                <a href="${url}"><img src="${posterUrl}" alt="${pelicula.title}"></a>
                <button class="favorite-btn ${esFavorito ? 'favorited' : ''}" 
                        data-id="${pelicula.id}" 
                        data-title="${(pelicula.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">
                    <i class="fa-solid fa-heart"></i>
                </button>
            `;
            grid.appendChild(peliculaElement);
        });
    }
});