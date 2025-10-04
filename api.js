// --- API Frontend ---
// Este archivo ahora hace peticiones a nuestro propio backend.

// IP de tu red local para que tu celular pueda conectarse.
const BACKEND_URL = 'http://192.168.1.16:3001'; // <-- ¡Esta es la IP de tu PC!

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
    const userId = auth.getUser()?.id;
    return fetchFromBackend(`/api/movies/${category}?userId=${userId || ''}`);
};

const fetchGenres = async () => {
    return fetchFromBackend('/api/genres');
};

const addGenre = async (genreData) => {
    return fetch(`${BACKEND_URL}/api/genres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(genreData),
    });
};

const deleteGenre = async (genreId) => {
    return fetch(`${BACKEND_URL}/api/genres/${genreId}`, {
        method: 'DELETE',
    });
};


const searchMoviesAPI = async (query) => {
    // La búsqueda ahora se hace en el backend
    const userId = auth.getUser()?.id;
    return fetchFromBackend(`/api/search/movies?query=${encodeURIComponent(query)}&userId=${userId || ''}`);
};

const getAllMovies = async () => {
    return fetchFromBackend('/api/movies');
};

// --- API para Favoritos ---

const getFavorites = async (userId) => {
    return fetchFromBackend(`/api/users/${userId}/favorites`);
};

const getUserById = async (userId) => {
    const requesterId = auth.getUser()?.id;
    return fetchFromBackend(`/api/users/${userId}?requesterId=${requesterId}`);
};

const updateUserName = async (userId, name) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
};

const updateUserAvatar = async (userId, avatar_url) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url }),
    });
};

const updateUserBio = async (userId, bio) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/bio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
    });
};

const updateUserBirthDate = async (userId, birth_date) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/birthdate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date }),
    });
};

const updateUserPrivacy = async (userId, visibility) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility }),
    });
};

const getFriends = async (userId) => {
    return fetchFromBackend(`/api/users/${userId}/friends`);
};

const getPendingRequests = async (userId) => {
    return fetchFromBackend(`/api/users/${userId}/pending-requests`);
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

const addMovie = async (movieData) => {
    return fetch(`${BACKEND_URL}/api/movies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
    });
};

const deleteMovie = async (movieId) => {
    return fetch(`${BACKEND_URL}/api/movies/${movieId}`, {
        method: 'DELETE',
    });
};

// --- API para Lista de Deseos ---

const getWishlist = async (userId) => {
    return fetchFromBackend(`/api/users/${userId}/wishlist`);
};

const addToWishlist = async (userId, movieId) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId }),
    });
};

const removeFromWishlist = async (userId, movieId) => {
    return fetch(`${BACKEND_URL}/api/users/${userId}/wishlist/${movieId}`, {
        method: 'DELETE',
    });
};

const getWishlistSummary = async () => {
    return fetchFromBackend('/api/wishlist/summary');
};

// --- API para Comentarios ---

const getMovieComments = async (movieId) => {
    return fetchFromBackend(`/api/movies/${movieId}/comments`);
};

const postMovieComment = async (movieId, userId, comment) => {
    return fetch(`${BACKEND_URL}/api/movies/${movieId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, comment }),
    });
};

// --- API para el Robot de Recomendaciones ---

const getRecommendations = async (userId) => {
    return fetchFromBackend(`/api/users/${userId}/recommendations`);
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

// --- API para Amistades ---

const getAllUsers = async () => {
    return fetchFromBackend('/api/users');
};

const getFriendshipStatus = async (userId1, userId2) => {
    return fetchFromBackend(`/api/friendship-status/${userId1}/${userId2}`);
};

const sendFriendRequest = async (requesterId, recipientId) => {
    return fetch(`${BACKEND_URL}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId, recipientId }),
    });
};

const acceptFriendRequest = async (requesterId, recipientId) => {
    return fetch(`${BACKEND_URL}/api/friends/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId, recipientId }),
    });
};

const rejectFriendRequest = async (userId1, userId2) => {
    return fetch(`${BACKEND_URL}/api/friends/request`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId1, userId2 }),
    });
};