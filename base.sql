-- Base de datos para la aplicación Pelix
-- Versión 2.0: Mejorada con géneros, índices y mayor integridad de datos.

-- Versión 2.1: Añadidas columnas de perfil y estado de usuario.

--
-- Estructura de la tabla `users`
--

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `avatar_url` TEXT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `verification_pending` BOOLEAN DEFAULT FALSE,
  `profile_visibility` ENUM('public', 'friends_only', 'private') DEFAULT 'public',
  `birth_date` DATE DEFAULT NULL
);

--
-- Estructura de la tabla `genres`
--

CREATE TABLE `genres` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE
);

--
-- Estructura de la tabla `movies`
--

CREATE TABLE `movies` (
  `id` INT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `overview` TEXT,
  `poster_path` VARCHAR(255),
  `backdrop_path` VARCHAR(255),
  `youtube_id` VARCHAR(50),
  `category` ENUM('now_playing', 'popular', 'top_rated') NOT NULL,
  `adult` BOOLEAN DEFAULT FALSE,
  INDEX `idx_title` (`title`),
  INDEX `idx_category` (`category`)
);

--
-- Estructura de la tabla `movie_genres` (unión)
--

CREATE TABLE `movie_genres` (
  `movie_id` INT,
  `genre_id` INT,
  PRIMARY KEY (`movie_id`, `genre_id`),
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE
);

--
-- Estructura de la tabla `user_favorites` (Películas Favoritas o "Mi Lista")
-- Esta es una tabla de unión que registra qué películas ha guardado cada usuario.
--

CREATE TABLE `user_favorites` (
  `user_id` INT NOT NULL,
  `movie_id` INT NOT NULL,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `movie_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE
);

--
-- Estructura de la tabla `user_wishlist` (Lista de Deseos)
--

CREATE TABLE `user_wishlist` (
  `user_id` INT NOT NULL,
  `movie_id` INT NOT NULL,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `movie_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE
);


--
-- Estructura de la tabla `friendships` (Amistades)
--

CREATE TABLE `friendships` (
  `user_one_id` INT NOT NULL,
  `user_two_id` INT NOT NULL,
  `status` ENUM('pending', 'accepted', 'blocked') NOT NULL,
  `action_user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_one_id`, `user_two_id`),
  FOREIGN KEY (`user_one_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_two_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`action_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CHECK (user_one_id < user_two_id)
);

--
-- Estructura de la tabla `movie_comments` (Comentarios)
--

CREATE TABLE `movie_comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `movie_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

--
-- Volcado de datos para la tabla `genres`
--

INSERT INTO `genres` (`id`, `name`) VALUES
(28, 'Acción'),
(12, 'Aventura'),
(16, 'Animación'),
(35, 'Comedia'),
(80, 'Crimen'),
(18, 'Drama'),
(878, 'Ciencia ficción'),
(27, 'Terror'),
(14, 'Fantasía'),
(10749, 'Romance');

--
-- Volcado de datos para la tabla `movies` (basado en db.json)
--

INSERT INTO `movies` (`id`, `title`, `overview`, `poster_path`, `backdrop_path`, `youtube_id`, `category`, `adult`) VALUES
-- now_playing
(653346, 'El reino del planeta de los simios', 'Años después del reinado de César, un joven simio emprende un viaje que le llevará a cuestionar todo lo que le han enseñado sobre el pasado y a tomar decisiones que definirán el futuro de simios y humanos por igual.', '/o6hV7tLd4FBB6s2kYq5Yk9T2y7L.jpg', '/fqv8v6AycXqGmsCDzS3c8s0g3iK.jpg', 'W_7C-3S2_yA', 'now_playing', FALSE),
(786892, 'Furiosa: de la saga Mad Max', 'Al caer el mundo, la joven Furiosa es arrebatada del Lugar Verde de Muchas Madres y cae en manos de una gran Horda de Motociclistas liderada por el Señor de la Guerra Dementus. Navegando por el Páramo, se topan con la Ciudadela presidida por El Inmortan Joe. Mientras los dos Tiranos luchan por el dominio, Furiosa debe sobrevivir a muchas pruebas mientras reúne los medios para encontrar el camino a casa.', '/iADOJ8ZG0pNJhLX42wQeDeS6Sg.jpg', '/xRd1eJc52gA41c3M3x3x6b16z4A.jpg', 'jgyt0_y4E3I', 'now_playing', TRUE),
(1011985, 'Kung Fu Panda 4', 'Po se prepara para ser el líder espiritual del Valle de la Paz, buscando un sucesor como Guerrero Dragón. Mientras entrena a un nuevo practicante de kung fu, enfrenta a una malvada hechicera que planea robar su Báculo de la Sabiduría.', '/5gzzkR7y3hnY8AD1wXjCnVlHba5.jpg', '/s9YTxwaByYeoSqugYjJJtZjMRAG.jpg', '1vOfr_63-wM', 'now_playing', FALSE),

-- popular
(823464, 'Godzilla y Kong: El nuevo imperio', 'Una aventura cinematográfica completamente nueva, que enfrentará al todopoderoso Kong y al temible Godzilla contra una colosal amenaza desconocida escondida dentro de nuestro mundo.', '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', '/k0ucFBBgSDTXYU8fVHXJM41K30f.jpg', 'Q0E1-g_T5U0', 'popular', FALSE),
(929590, 'Dune: Parte Dos', 'Paul Atreides se une a la tribu de los Fremen y comienza un viaje espiritual y marcial para convertirse en mesías, mientras intenta evitar el horrible pero inevitable futuro que ha presenciado.', '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', '/v1QQKq8M0fWxMgSdGOX1aCv8qMB.jpg', 'Ua-iDa_c91k', 'popular', FALSE),
(385687, 'Interestelar', 'Narra las aventuras de un grupo de exploradores que hacen uso de un agujero de gusano recientemente descubierto para superar las limitaciones de los viajes espaciales tripulados y vencer las inmensas distancias que tiene un viaje interestelar.', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/gJL5kp5FMopB2sN4WZY2PAaxzM8.jpg', 'zSWdZVtXT7E', 'popular', FALSE),

-- top_rated
(238, 'El Padrino', 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone, barely survives an attempt on his life, his youngest son, Michael, steps in to take care of the would-be killers, launching a campaign of bloody revenge.', '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', '/tmU7GeKVybMWFButWEGl2M42AzU.jpg', 'UaVTIH8mujA', 'top_rated', TRUE),
(278, 'Cadena perpetua', 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.', '/uD8i3e2pP4t5a0hC5aB3tVzTfW.jpg', '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', '6hB3S9bIaco', 'top_rated', TRUE),
(424, 'La lista de Schindler', 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.', '/sF1U4EUQS8Ycpynlax4a4dfj80k.jpg', '/loRmRzQXZeqG78TqZuyvSlqf伯.jpg', 'M5FpB60jM0o', 'top_rated', TRUE);

--
-- Volcado de datos para la tabla `movie_genres`
--

INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(653346, 878), (653346, 28), (653346, 12), -- El reino del planeta de los simios
(786892, 28), (786892, 878), (786892, 12), -- Furiosa
(1011985, 16), (1011985, 28), (1011985, 35), -- Kung Fu Panda 4
(823464, 28), (823464, 878), -- Godzilla y Kong
(929590, 878), (929590, 12), -- Dune: Parte Dos
(385687, 878), (385687, 18), (385687, 12), -- Interestelar
(238, 18), (238, 80), -- El Padrino
(278, 18), (278, 80), -- Cadena perpetua
(424, 18); -- La lista de Schindler

--
-- Ejemplo de inserción de un usuario (la contraseña debe ser hasheada en una aplicación real)
--

INSERT INTO `users` (`email`, `password`, `name`) VALUES
('user@pelix.com', 'hashed_password_here', 'Usuario Pelix');

-- Ejemplo de cómo añadir una película a la lista de un usuario
-- Esto guardaría la película "Dune: Parte Dos" (ID 929590) como favorita para el usuario con ID 1.
--

-- INSERT INTO `user_favorites` (`user_id`, `movie_id`) VALUES (1, 929590);