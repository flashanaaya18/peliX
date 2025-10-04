// --- API Frontend ---
// Este archivo ahora hace peticiones a nuestro propio backend.

// Reemplaza '192.168.X.X' con la dirección IP de tu computadora en la red Wi-Fi.
const BACKEND_URL = 'http://192.168.1.108:3001'; // <-- ¡RECUERDA CAMBIAR ESTA IP POR LA TUYA!

if (BACKEND_URL.includes('192.168.X.X')) {
    console.error("¡ERROR! No has configurado la IP del backend en api.js. Reemplaza '192.168.X.X' con la IP de tu computadora.");
    alert("¡CONFIGURACIÓN REQUERIDA! Revisa la consola (F12) para ver las instrucciones y configurar la conexión al backend.");
}

/**
 * Construye la URL de una imagen de película.
 * Si la ruta comienza con '/', asume que es una imagen local en la carpeta 'public'.
 * De lo contrario, construye la URL completa de TMDb.
 * @param {string} path - La ruta del póster o del fondo.
 * @param {string} [size='w500'] - El tamaño de la imagen de TMDb a usar.
 * @returns {string} La URL completa de la imagen.
 */
const getMovieImageUrl = (path, size = 'w500') => {
    if (!path) return '/peliX.png'; // Devuelve un placeholder si no hay ruta
    if (path.startsWith('/')) {
        // Si la ruta ya empieza con '/', es una imagen local o una URL completa guardada.
        // O si ya es una URL completa.
        if (path.startsWith('http')) return path;
        return path; // La sirve desde la carpeta 'public'
    }
    // Si no, es una ruta de TMDb
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

const fetchFromBackend = async (endpoint) => {
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`);
        if (!response.ok) throw new Error('Error en la petición al backend');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

const fetchMovies = async (category) => {
    return fetchFromBackend(`/api/movies/${category}`);
};

const fetchGenres = async () => {
    return fetchFromBackend('/api/genres');
};

const searchMoviesAPI = async (query) => {
    // La búsqueda ahora se hace en el backend
    return fetchFromBackend(`/api/search/movies?query=${encodeURIComponent(query)}`);
};

// --- API para Favoritos ---

const getFavorites = async (userId) => {
    return fetchFromBackend(`/api/users/${userId}/favorites`);
};

const addFavorite = async (userId, movieId) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId }),
    });
};

const removeFavorite = async (userId, movieId) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/favorites/${movieId}`, {
        method: 'DELETE',
    });
};

const deleteMovie = async (movieId) => {
    return fetch(`${BACKEND_URL}/api/movies/${movieId}`, {
        method: 'DELETE',
    });
};

const getGenresForMovies = async (movieIds) => {
    return fetch(`${BACKEND_URL}/api/movies/genres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieIds }),
    }).then(res => res.json());
};