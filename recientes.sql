-- Plantilla para añadir nuevas películas a la categoría "Recientes" en Pelix
--
-- INSTRUCCIONES:
-- 1. Copia una de las líneas de INSERT de abajo para usarla como plantilla.
-- 2. Reemplaza los datos con la información de tu nueva película.
-- 3. Ejecuta este comando en tu gestor de base de datos (como phpMyAdmin) para añadir la película.
--
-- ESTRUCTURA DE LA TABLA `movies`:
-- `id`: Un número único para cada película. ¡No lo repitas!
-- `title`: El título de la película.
-- `overview`: La descripción o sinopsis.
-- `poster_path`: La ruta de la imagen del póster (ej: /mi_poster.jpg o una URL completa).
-- `backdrop_path`: La ruta de la imagen de fondo (ej: /mi_fondo.jpg o una URL completa).
-- `youtube_id`: El ID del video de YouTube para el tráiler.
-- `category`: Para esta sección, debe ser siempre 'now_playing'.

-- Película "Cars" añadida con la portada que solicitaste:
INSERT INTO `movies` (`id`, `title`, `overview`, `poster_path`, `backdrop_path`, `youtube_id`, `category`) VALUES (920, 'Cars', 'El aspirante a campeón de carreras Rayo McQueen parece que está a punto de conseguir el éxito. Su actitud arrogante, sin embargo, se desvanece cuando llega a una pequeña comunidad olvidada, Radiator Springs, que le enseña el verdadero significado de la amistad, la familia y el amor.', '/wA3oP5jpk53URb2i43u73tAK9uz.jpg', 'https://www.filmpost.it/wp-content/uploads/2019/09/cars-movie-wallpaper-2560x1440jpg.jpeg', 'SbXIj2T-_uk', 'now_playing');

-- Conexión de "Cars" con sus géneros (Aventura, Animación, Comedia):
INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES (920, 12), (920, 16), (920, 35);