document.addEventListener('DOMContentLoaded', async () => {
    // --- Protección de Ruta ---
    const user = auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const wishlistGrid = document.getElementById('wishlist-grid');
    const listaVaciaMsg = document.getElementById('lista-vacia-mensaje');

    const cargarWishlist = async () => {
        const wishlist = await getWishlist(user.id);

        if (wishlist.length === 0) {
            listaVaciaMsg.style.display = 'block';
            wishlistGrid.innerHTML = '';
        } else {
            listaVaciaMsg.style.display = 'none';
            wishlistGrid.innerHTML = ''; // Limpiar antes de añadir

            // Obtener el estado de favoritos y de la lista de deseos para todos los items a la vez
            const favoriteMovies = await getFavorites(user.id);
            const favoriteIds = new Set(favoriteMovies.map(m => m.id));
            const wishlistIds = new Set(wishlist.map(m => m.id));

            wishlist.forEach(pelicula => {
                const peliculaElement = document.createElement('div');
                peliculaElement.classList.add('pelicula');
                const posterUrl = getMovieImageUrl(pelicula.poster_path);
                const url = `pelicula.html?id=${pelicula.id}&video=${pelicula.youtube_id || pelicula.id}&bg=https://image.tmdb.org/t/p/original${pelicula.backdrop_path}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.overview)}&poster=${encodeURIComponent(posterUrl)}`;

                const isFavorited = favoriteIds.has(pelicula.id);
                const isWished = wishlistIds.has(pelicula.id);

                peliculaElement.innerHTML = `
                    <button class="wishlist-btn ${isWished ? 'wished' : ''}" data-id="${pelicula.id}"><i class="fa-solid fa-star"></i></button>
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${pelicula.id}"><i class="fa-solid fa-heart"></i></button>
                    <a href="${url}">
                        <img src="${posterUrl}" alt="${pelicula.title}">
                    </a>
                `;
                wishlistGrid.appendChild(peliculaElement);
            });
        }
    };

    cargarWishlist();
});