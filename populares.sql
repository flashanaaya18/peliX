-- Plantilla para añadir nuevas películas a la categoría "Populares" en Pelix
--
-- INSTRUCCIONES:
-- 1. Copia la plantilla de INSERT de abajo.
-- 2. Reemplaza los datos de ejemplo con la información de tu película.
-- 3. Ejecuta este comando en tu gestor de base de datos (como phpMyAdmin) para añadir la película.
--
-- ESTRUCTURA DE LA TABLA `movies`:
-- `id`: Un número único para cada película. ¡No lo repitas!
-- `title`: El título de la película.
-- `overview`: La descripción o sinopsis.
-- `poster_path`: La ruta de la imagen del póster (ej: /mi_poster.jpg o una URL completa).
-- `backdrop_path`: La ruta de la imagen de fondo (ej: /mi_fondo.jpg o una URL completa).
-- `youtube_id`: El ID del video de YouTube para el tráiler.
-- `category`: Para esta sección, debe ser siempre 'popular'.

-- PLANTILLA:
INSERT INTO `movies` (`id`, `title`, `overview`, `poster_path`, `backdrop_path`, `youtube_id`, `category`) VALUES (999006, 'Mi Nueva Película Popular', 'Descripción de la película que es tendencia en Pelix.', '/poster_popular.jpg', '/fondo_popular.jpg', 'ID_VIDEO_YOUTUBE', 'popular');