document.addEventListener('DOMContentLoaded', async () => {
    // --- Protección de Ruta de Administrador ---
    const currentUser = auth.getUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Acceso denegado. Debes ser administrador para ver esta página.');
        window.location.href = 'principal.html';
        return;
    }

    // --- Selección de Elementos del DOM ---
    const addMovieForm = document.getElementById('add-movie-form');
    const movieList = document.getElementById('movie-list');
    const genresCheckboxContainer = document.getElementById('genres-checkbox-container');
    const adminMessage = document.getElementById('admin-movie-message');

    // --- Cargar Géneros en el Formulario ---
    const genres = await fetchGenres();
    if (genresCheckboxContainer) {
        genres.forEach(genre => {
            const checkboxItem = document.createElement('div');
            checkboxItem.classList.add('checkbox-item');
            checkboxItem.innerHTML = `
                <input type="checkbox" id="genre-${genre.id}" name="genres" value="${genre.id}">
                <label for="genre-${genre.id}">${genre.name}</label>
            `;
            genresCheckboxContainer.appendChild(checkboxItem);
        });
    }

    // --- Renderizar la Lista de Películas ---
    const renderMovies = async () => {
        const movies = await getAllMovies(); // Necesitamos esta nueva función en api.js
        movieList.innerHTML = '';
        movies.forEach(movie => {
            const movieItem = document.createElement('li');
            movieItem.innerHTML = `
                <span>${movie.title}</span>
                <button class="delete-btn" data-id="${movie.id}">Eliminar</button>
            `;
            movieList.appendChild(movieItem);
        });
    };

    // --- Lógica para Añadir Película ---
    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedGenres = Array.from(document.querySelectorAll('input[name="genres"]:checked'))
                                    .map(checkbox => parseInt(checkbox.value));

        const newMovie = {
            id: Date.now(), // ID único simple
            title: document.getElementById('movie-title').value,
            overview: document.getElementById('movie-overview').value,
            poster_path: document.getElementById('movie-poster').value,
            backdrop_path: document.getElementById('movie-backdrop').value,
            youtube_id: document.getElementById('movie-youtube').value,
            category: document.getElementById('movie-category').value,
            genres: selectedGenres
        };

        try {
            const response = await addMovie(newMovie); // Necesitamos esta nueva función en api.js
            if (!response.ok) throw new Error('Error al añadir la película');
            
            adminMessage.textContent = '¡Película añadida con éxito!';
            adminMessage.style.color = '#28a745';
            addMovieForm.reset();
            renderMovies(); // Refrescar la lista
        } catch (error) {
            adminMessage.textContent = `Error: ${error.message}`;
            adminMessage.style.color = '#e50914';
        }
    });

    // --- Lógica para Eliminar Película (Event Delegation) ---
    movieList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const movieId = e.target.dataset.id;
            if (confirm(`¿Estás seguro de que quieres eliminar la película con ID ${movieId}?`)) {
                try {
                    const response = await deleteMovie(movieId);
                    if (!response.ok) throw new Error('Error al eliminar la película');
                    renderMovies(); // Refrescar la lista
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
    });

    // --- Carga Inicial ---
    renderMovies();
});