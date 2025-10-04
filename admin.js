document.addEventListener('DOMContentLoaded', async () => {
    // --- Seguridad Básica ---
    const password = prompt("Por favor, ingresa la contraseña de administrador:");
    if (password !== "admin123") { // Puedes cambiar esta contraseña
        alert("Contraseña incorrecta. Acceso denegado.");
        window.location.href = 'principal.html';
        return;
    }

    const form = document.getElementById('add-movie-form');
    const genresContainer = document.getElementById('genres-checkbox-container');
    const adminMessage = document.getElementById('admin-message');
    const movieListContainer = document.getElementById('movie-list-container');

    // Cargar géneros para los checkboxes
    const genres = await fetchGenres();
    genres.forEach(genre => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.classList.add('checkbox-item');
        checkboxWrapper.innerHTML = `
            <input type="checkbox" id="genre-${genre.id}" name="genres" value="${genre.id}">
            <label for="genre-${genre.id}">${genre.name}</label>
        `;
        genresContainer.appendChild(checkboxWrapper);
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminMessage.style.display = 'none';

        const selectedGenres = Array.from(document.querySelectorAll('input[name="genres"]:checked'))
                                    .map(cb => parseInt(cb.value));

        const newMovie = {
            id: Date.now(), // Generamos un ID único basado en la fecha actual
            title: document.getElementById('title').value,
            overview: document.getElementById('overview').value,
            poster_path: document.getElementById('poster_path').value,
            backdrop_path: document.getElementById('backdrop_path').value,
            youtube_id: document.getElementById('youtube_id').value,
            category: document.getElementById('category').value,
            genres: selectedGenres
        };

        try {
            const response = await fetch(`${BACKEND_URL}/api/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // En una app real, aquí iría un token de autenticación
                },
                body: JSON.stringify(newMovie)
            });

            if (!response.ok) {
                throw new Error('Error del servidor al añadir la película.');
            }

            const result = await response.json();
            adminMessage.textContent = result.message;
            adminMessage.style.color = 'lightgreen';
            adminMessage.style.display = 'block';
            form.reset();

        } catch (error) {
            adminMessage.textContent = error.message;
            adminMessage.style.color = 'tomato';
            adminMessage.style.display = 'block';
        }
    });

    // --- Cargar y mostrar películas existentes ---
    const loadExistingMovies = async () => {
        const movies = await fetchFromBackend('/api/movies'); // Usamos el endpoint que ya existe
        movieListContainer.innerHTML = '';

        const movieList = document.createElement('ul');
        movieList.classList.add('admin-movie-list');

        movies.forEach(movie => {
            const movieItem = document.createElement('li');
            movieItem.innerHTML = `
                <span>${movie.title}</span>
                <button class="delete-btn" data-id="${movie.id}">Eliminar</button>
            `;
            movieList.appendChild(movieItem);
        });

        movieListContainer.appendChild(movieList);
    };

    // --- Manejar la eliminación de películas ---
    movieListContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const movieId = e.target.dataset.id;
            const movieTitle = e.target.previousElementSibling.textContent;

            if (confirm(`¿Estás seguro de que quieres eliminar la película "${movieTitle}"? Esta acción no se puede deshacer.`)) {
                try {
                    await deleteMovie(movieId);
                    alert('Película eliminada con éxito.');
                    loadExistingMovies(); // Recargar la lista
                } catch (error) {
                    alert('Error al eliminar la película.');
                }
            }
        }
    });

    // Carga inicial de películas
    loadExistingMovies();
});