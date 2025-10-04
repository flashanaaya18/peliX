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

// --- Endpoints de la API ---

// Endpoint para obtener todas las películas de una categoría
app.get('/api/movies/:category', async (req, res) => {
    const { category } = req.params;
    try {
        const [rows] = await connection.execute('SELECT * FROM movies WHERE category = ?', [category]);
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

// Endpoint para obtener películas por género
app.get('/api/genres/:genreId/movies', async (req, res) => {
    const { genreId } = req.params;
    try {
        const [rows] = await connection.execute(
            'SELECT m.* FROM movies m JOIN movie_genres mg ON m.id = mg.movie_id WHERE mg.genre_id = ?',
            [genreId]
        );
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
    const { id, title, overview, poster_path, backdrop_path, youtube_id, category, genres } = req.body;

    // En una app real, aquí habría validación de datos y autenticación de admin

    try {
        // Insertar en la tabla `movies`
        await connection.execute(
            'INSERT INTO movies (id, title, overview, poster_path, backdrop_path, youtube_id, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, title, overview, poster_path, backdrop_path, youtube_id, category]
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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Backend de Pelix escuchando en http://localhost:${port}`);
});