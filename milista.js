document.addEventListener('DOMContentLoaded', async () => {
    const miListaGrid = document.getElementById('mi-lista-grid');
    const mensajeVacio = document.getElementById('lista-vacia-mensaje');

    // --- Protección de Ruta ---
    const user = auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Obtener la lista desde el backend
    const miLista = await getFavorites(user.id);

    if (miLista.length === 0) {
        mensajeVacio.style.display = 'block';
    } else {
        miListaGrid.innerHTML = ''; // Limpiar por si acaso
        miLista.forEach(pelicula => {
            const peliculaElement = document.createElement('div');
            peliculaElement.classList.add('pelicula');
            
            const posterUrl = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
            const url = `pelicula.html?id=${pelicula.id}&video=${pelicula.youtube_id || pelicula.id}&bg=https://image.tmdb.org/t/p/original${pelicula.backdrop_path}&title=${encodeURIComponent(pelicula.title)}&desc=${encodeURIComponent(pelicula.overview)}&poster=${encodeURIComponent(posterUrl)}`;

            peliculaElement.innerHTML = `
                <a href="${url}">
                    <img src="${posterUrl}" alt="${pelicula.title}">
                </a>
            `;
            miListaGrid.appendChild(peliculaElement);
        });
    }
});