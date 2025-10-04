import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 3001; // Usaremos un puerto diferente al del frontend

app.use(cors());
app.use(express.json());

// --- Configuración de la Base de Datos ---
// Asegúrate de cambiar estos valores para que coincidan con tu configuración de MySQL.
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Pon tu contraseña de MySQL aquí si tienes una
    database: 'pelix_db' // El nombre de la base de datos que creaste
};

let connection;

async function handleDisconnect() {
    connection = await mysql.createConnection(dbConfig);

    connection.on('error', (err) => {
        console.error('Error de base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// --- Helper para Control de Edad ---
const isUserAdult = (birthDate) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
};

// --- Endpoints de la API ---

// Endpoint para obtener todas las películas de una categoría
app.get('/api/movies/:category', async (req, res) => {
    const { category } = req.params;
    const { userId } = req.query;
    let query = 'SELECT * FROM movies WHERE category = ?';
    const params = [category];

    if (userId) {
        const [userRows] = await connection.execute('SELECT birth_date FROM users WHERE id = ?', [userId]);
        if (userRows.length > 0 && !isUserAdult(userRows[0].birth_date)) {
            query += ' AND adult = false';
        }
    } else { // Si no hay usuario, no mostrar contenido de adulto
        query += ' AND adult = false';
    }

    try {
        const [rows] = await connection.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener películas' });
    }
});

// Endpoint para obtener todos los géneros
app.get('/api/genres', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM genres ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener géneros' });
    }
});

// Endpoint para añadir un nuevo género
app.post('/api/genres', async (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ error: 'Se requiere ID y nombre para el género.' });
    }
    try {
        await connection.execute('INSERT INTO genres (id, name) VALUES (?, ?)', [id, name]);
        res.status(201).json({ message: 'Género añadido con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir el género.' });
    }
});

// Endpoint para eliminar un género
app.delete('/api/genres/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await connection.execute('DELETE FROM genres WHERE id = ?', [id]);
        res.status(200).json({ message: 'Género eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el género. Asegúrate de que no esté en uso por alguna película.' });
    }
});

// Endpoint para obtener películas por género
app.get('/api/genres/:genreId/movies', async (req, res) => {
    const { genreId } = req.params;
    const { userId } = req.query;

    let query = 'SELECT m.* FROM movies m JOIN movie_genres mg ON m.id = mg.movie_id WHERE mg.genre_id = ?';
    const params = [genreId];

    if (userId) {
        const [userRows] = await connection.execute('SELECT birth_date FROM users WHERE id = ?', [userId]);
        if (userRows.length > 0 && !isUserAdult(userRows[0].birth_date)) {
            query += ' AND m.adult = false';
        }
    } else {
        query += ' AND m.adult = false';
    }

    try {
        const [rows] = await connection.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener películas por género' });
    }
});

// Endpoint para buscar películas por título
app.get('/api/search/movies', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'El término de búsqueda es requerido' });
    }
    try {
        const searchTerm = `%${query}%`; // Prepara el término para una búsqueda LIKE
        const [rows] = await connection.execute(
            'SELECT * FROM movies WHERE title LIKE ?',
            [searchTerm]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar películas' });
    }
});

// Endpoint para obtener TODAS las películas (útil para una página de "Explorar todo")
app.get('/api/movies', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM movies ORDER BY title');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener todas las películas' });
    }
});

// Endpoint para añadir una nueva película
app.post('/api/movies', async (req, res) => {
    const { id, title, overview, poster_path, backdrop_path, youtube_id, category, genres, adult } = req.body;

    // En una app real, aquí habría validación de datos y autenticación de admin

    try {
        // Insertar en la tabla `movies`
        await connection.execute(
            'INSERT INTO movies (id, title, overview, poster_path, backdrop_path, youtube_id, category, adult) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, overview, poster_path, backdrop_path, youtube_id, category, adult || false]
        );

        // Insertar en la tabla `movie_genres`
        if (genres && genres.length > 0) {
            const genreValues = genres.map(genreId => [id, genreId]);
            await connection.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ?', [genreValues]);
        }

        res.status(201).json({ message: `Película "${title}" añadida con éxito.` });
    } catch (error) {
        console.error('Error al añadir película:', error);
        res.status(500).json({ error: 'Error interno del servidor al añadir la película.' });
    }
});

// Endpoint para eliminar una película
app.delete('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Usamos una transacción para asegurar que ambas operaciones se completen
        await connection.beginTransaction();

        // 1. Eliminar las asociaciones de género
        await connection.execute('DELETE FROM movie_genres WHERE movie_id = ?', [id]);

        // 2. Eliminar la película
        await connection.execute('DELETE FROM movies WHERE id = ?', [id]);

        await connection.commit();
        res.status(200).json({ message: 'Película eliminada con éxito' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al eliminar la película' });
    }
});

// Endpoint para obtener los géneros de una lista de películas
app.post('/api/movies/genres', async (req, res) => {
    const { movieIds } = req.body;
    if (!movieIds || movieIds.length === 0) {
        return res.json([]);
    }
    try {
        const [rows] = await connection.query(
            'SELECT mg.movie_id, g.name FROM movie_genres mg JOIN genres g ON mg.genre_id = g.id WHERE mg.movie_id IN (?)',
            [movieIds]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener géneros de las películas' });
    }
});

// --- Endpoints para Amistades ---

// Obtener el estado de amistad entre dos usuarios
app.get('/api/friendship-status/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;
    const [u1, u2] = [Math.min(userId1, userId2), Math.max(userId1, userId2)];

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM friendships WHERE user_one_id = ? AND user_two_id = ?',
            [u1, u2]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json(null); // No existe relación
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estado de amistad' });
    }
});

// Enviar una solicitud de amistad
app.post('/api/friends/request', async (req, res) => {
    const { requesterId, recipientId } = req.body;
    const [user_one_id, user_two_id] = [Math.min(requesterId, recipientId), Math.max(requesterId, recipientId)];

    try {
        await connection.execute(
            'INSERT INTO friendships (user_one_id, user_two_id, status, action_user_id) VALUES (?, ?, ?, ?)',
            [user_one_id, user_two_id, 'pending', requesterId]
        );
        res.status(201).json({ message: 'Solicitud de amistad enviada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar la solicitud' });
    }
});

// Aceptar una solicitud de amistad
app.put('/api/friends/accept', async (req, res) => {
    const { requesterId, recipientId } = req.body;
    const [user_one_id, user_two_id] = [Math.min(requesterId, recipientId), Math.max(requesterId, recipientId)];

    try {
        await connection.execute(
            'UPDATE friendships SET status = ?, action_user_id = ? WHERE user_one_id = ? AND user_two_id = ? AND status = "pending"',
            ['accepted', recipientId, user_one_id, user_two_id]
        );
        res.status(200).json({ message: 'Amistad aceptada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al aceptar la amistad' });
    }
});

// Rechazar o cancelar una solicitud de amistad
app.delete('/api/friends/request', async (req, res) => {
    const { userId1, userId2 } = req.body;
    const [user_one_id, user_two_id] = [Math.min(userId1, userId2), Math.max(userId1, userId2)];

    try {
        await connection.execute(
            'DELETE FROM friendships WHERE user_one_id = ? AND user_two_id = ?',
            [user_one_id, user_two_id]
        );
        res.status(200).json({ message: 'Solicitud eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la solicitud' });
    }
});

// Endpoint para actualizar el nombre de un usuario
app.put('/api/users/:id/name', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }
    try {
        await connection.execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
        res.status(200).json({ message: 'Nombre actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el nombre' });
    }
});

// Endpoint para actualizar el avatar de un usuario
app.put('/api/users/:id/avatar', async (req, res) => {
    const { id } = req.params;
    const { avatar_url } = req.body;
    try {
        await connection.execute(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [avatar_url, id]
        );
        res.status(200).json({ message: 'Avatar actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el avatar' });
    }
});

// Endpoint para actualizar la biografía de un usuario
app.put('/api/users/:id/bio', async (req, res) => {
    const { id } = req.params;
    const { bio } = req.body;
    // En una app real, verificar que el usuario logueado es el que está actualizando su bio
    try {
        await connection.execute(
            'UPDATE users SET bio = ? WHERE id = ?',
            [bio, id]
        );
        res.status(200).json({ message: 'Biografía actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la biografía' });
    }
});

// Endpoint para obtener la lista de amigos de un usuario
app.get('/api/users/:userId/friends', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await connection.execute(`
            SELECT u.id, u.name, u.avatar_url FROM users u JOIN friendships f
            ON (u.id = f.user_one_id OR u.id = f.user_two_id)
            WHERE (f.user_one_id = ? OR f.user_two_id = ?)
            AND f.status = 'accepted' AND u.id != ?
        `, [userId, userId, userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la lista de amigos' });
    }
});

// Endpoint para obtener las solicitudes de amistad pendientes de un usuario
app.get('/api/users/:userId/pending-requests', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await connection.execute(`
            SELECT u.id, u.name, u.avatar_url FROM users u JOIN friendships f
            ON u.id = f.action_user_id
            WHERE (f.user_one_id = ? OR f.user_two_id = ?)
            AND f.status = 'pending' AND f.action_user_id != ?
        `, [userId, userId, userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las solicitudes pendientes' });
    }
});

// Endpoint para actualizar la privacidad del perfil de un usuario
app.put('/api/users/:id/privacy', async (req, res) => {
    const { id } = req.params;
    const { visibility } = req.body;
    if (!['public', 'friends_only', 'private'].includes(visibility)) {
        return res.status(400).json({ error: 'Valor de visibilidad no válido' });
    }
    try {
        await connection.execute(
            'UPDATE users SET profile_visibility = ? WHERE id = ?',
            [visibility, id]
        );
        res.status(200).json({ message: 'Privacidad actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la privacidad' });
    }
});

// Endpoint para actualizar la fecha de nacimiento
app.put('/api/users/:id/birthdate', async (req, res) => {
    const { id } = req.params;
    const { birth_date } = req.body;
    if (!birth_date) {
        return res.status(400).json({ error: 'La fecha de nacimiento es requerida' });
    }
    try {
        await connection.execute('UPDATE users SET birth_date = ? WHERE id = ?', [birth_date, id]);
        res.status(200).json({ message: 'Fecha de nacimiento actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la fecha de nacimiento' });
    }
});

// Endpoint para obtener un usuario por su ID
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params; // El ID del perfil que se quiere ver
    const requesterId = req.query.requesterId; // El ID del usuario que está haciendo la petición

    try {
        const [userRows] = await connection.execute(
            'SELECT id, name, email, avatar_url, is_verified, bio, profile_visibility, birth_date FROM users WHERE id = ?',
            [id]
        );

        if (userRows.length > 0) {
            const user = userRows[0];

            // Si el perfil es público o el usuario está viendo su propio perfil, se muestra.
            if (user.profile_visibility === 'public' || user.id == requesterId) {
                return res.json(user);
            }

            // Si el perfil es solo para amigos, verificar la amistad.
            if (user.profile_visibility === 'friends_only') {
                const [u1, u2] = [Math.min(id, requesterId), Math.max(id, requesterId)];
                const [friendshipRows] = await connection.execute('SELECT status FROM friendships WHERE user_one_id = ? AND user_two_id = ? AND status = "accepted"', [u1, u2]);
                if (friendshipRows.length > 0) return res.json(user); // Son amigos, se muestra el perfil.
            }

            // Si el perfil es privado o no son amigos (en caso de friends_only), se deniega el acceso.
            if (user.profile_visibility === 'private' && user.id != requesterId) {
                return res.status(403).json({ error: 'Este perfil es privado.' });
            }
            return res.status(403).json({ error: 'No tienes permiso para ver este perfil.' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

// Endpoint para obtener todos los usuarios (para la página de "buscar amigos")
app.get('/api/users', async (req, res) => {
    const [rows] = await connection.execute('SELECT id, name, email, avatar_url, is_verified FROM users');
    res.json(rows);
});

// --- Endpoints para Favoritos (Mi Lista) ---

// Obtener los favoritos de un usuario
app.get('/api/users/:userId/favorites', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await connection.execute(
            'SELECT m.* FROM movies m JOIN user_favorites uf ON m.id = uf.movie_id WHERE uf.user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener favoritos' });
    }
});

// Añadir un favorito
app.post('/api/users/:userId/favorites', async (req, res) => {
    const { userId } = req.params;
    const { movieId } = req.body;
    try {
        await connection.execute('INSERT INTO user_favorites (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
        res.status(201).json({ message: 'Favorito añadido' });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir favorito' });
    }
});

// Eliminar un favorito
app.delete('/api/users/:userId/favorites/:movieId', async (req, res) => {
    const { userId, movieId } = req.params;
    await connection.execute('DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
    res.status(200).json({ message: 'Favorito eliminado' });
});

// --- Endpoints para Lista de Deseos (Wishlist) ---

// Obtener la lista de deseos de un usuario
app.get('/api/users/:userId/wishlist', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await connection.execute(
            'SELECT m.* FROM movies m JOIN user_wishlist uw ON m.id = uw.movie_id WHERE uw.user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la lista de deseos' });
    }
});

// Añadir a la lista de deseos
app.post('/api/users/:userId/wishlist', async (req, res) => {
    const { userId } = req.params;
    const { movieId } = req.body;
    try {
        await connection.execute('INSERT INTO user_wishlist (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
        res.status(201).json({ message: 'Añadido a la lista de deseos' });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir a la lista de deseos' });
    }
});

// Eliminar de la lista de deseos
app.delete('/api/users/:userId/wishlist/:movieId', async (req, res) => {
    const { userId, movieId } = req.params;
    await connection.execute('DELETE FROM user_wishlist WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
    res.status(200).json({ message: 'Eliminado de la lista de deseos' });
});

// Endpoint para que el admin vea las películas más deseadas
app.get('/api/wishlist/summary', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT m.id, m.title, m.poster_path, COUNT(uw.movie_id) as wish_count
            FROM user_wishlist uw JOIN movies m ON uw.movie_id = m.id
            GROUP BY uw.movie_id ORDER BY wish_count DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el resumen de la lista de deseos' });
    }
});

// --- Endpoints para Comentarios de Películas ---

// Obtener comentarios de una película
app.get('/api/movies/:movieId/comments', async (req, res) => {
    const { movieId } = req.params;
    try {
        const [rows] = await connection.execute(`
            SELECT c.id, c.comment, c.created_at, u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
            FROM movie_comments c JOIN users u ON c.user_id = u.id
            WHERE c.movie_id = ? ORDER BY c.created_at DESC
        `, [movieId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los comentarios' });
    }
});

// Publicar un nuevo comentario
app.post('/api/movies/:movieId/comments', async (req, res) => {
    const { movieId } = req.params;
    const { userId, comment } = req.body;

    if (!userId || !comment) {
        return res.status(400).json({ error: 'Se requiere usuario y comentario.' });
    }

    try {
        const [result] = await connection.execute(
            'INSERT INTO movie_comments (movie_id, user_id, comment) VALUES (?, ?, ?)',
            [movieId, userId, comment]
        );
        res.status(201).json({ message: 'Comentario publicado', commentId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al publicar el comentario' });
    }
});

// --- Endpoint del Robot de Recomendaciones ---

app.get('/api/users/:userId/recommendations', async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Obtener los IDs de las películas favoritas del usuario
        const [favoriteRows] = await connection.execute(
            'SELECT movie_id FROM user_favorites WHERE user_id = ?',
            [userId]
        );

        if (favoriteRows.length < 3) { // No recomendar si tiene muy pocos favoritos
            return res.json([]);
        }

        const favoriteMovieIds = favoriteRows.map(row => row.movie_id);

        // 2. Obtener los géneros de esas películas favoritas
        const [genreRows] = await connection.query(
            'SELECT genre_id FROM movie_genres WHERE movie_id IN (?)',
            [favoriteMovieIds]
        );

        // 3. Contar la frecuencia de cada género para encontrar los favoritos
        const genreCounts = genreRows.reduce((acc, row) => {
            acc[row.genre_id] = (acc[row.genre_id] || 0) + 1;
            return acc;
        }, {});

        // Ordenar los géneros por frecuencia y tomar los 2 más frecuentes
        const topGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a).slice(0, 2).map(([genreId]) => parseInt(genreId));

        // 4. Buscar otras películas de esos géneros que el usuario no tenga en favoritos
        const [recommendations] = await connection.query(`
            SELECT DISTINCT m.* FROM movies m JOIN movie_genres mg ON m.id = mg.movie_id
            WHERE mg.genre_id IN (?) AND m.id NOT IN (?)
            ORDER BY RAND() LIMIT 10
        `, [topGenres, favoriteMovieIds]);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar recomendaciones' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Backend de Pelix escuchando en http://localhost:${port}`);
});