-- Plantilla para añadir nuevas películas a la base de datos de Pelix
-- Script de volcado de datos para la tabla `movies` y `movie_genres` de la aplicación Pelix.
-- Este archivo contiene los datos iniciales de las películas para las categorías principales.
--
-- INSTRUCCIONES:
-- 1. Asegúrate de haber ejecutado `base.sql` para crear la estructura de las tablas.
-- 2. Ejecuta el contenido de este archivo en tu gestor de base de datos (como phpMyAdmin)
--    para poblar la tabla `movies` y `movie_genres`.
--

--
-- Volcado de datos para la tabla `movies`
--

INSERT INTO `movies` (`id`, `title`, `overview`, `poster_path`, `backdrop_path`, `youtube_id`, `category`) VALUES
-- Estrenos (now_playing)
(653346, 'El reino del planeta de los simios', 'Años después del reinado de César, un joven simio emprende un viaje que le llevará a cuestionar todo lo que le han enseñado sobre el pasado y a tomar decisiones que definirán el futuro de simios y humanos por igual.', '/o6hV7tLd4FBB6s2kYq5Yk9T2y7L.jpg', '/fqv8v6AycXqGmsCDzS3c8s0g3iK.jpg', 'W_7C-3S2_yA', 'now_playing'),
(786892, 'Furiosa: de la saga Mad Max', 'Al caer el mundo, la joven Furiosa es arrebatada del Lugar Verde de Muchas Madres y cae en manos de una gran Horda de Motociclistas liderada por el Señor de la Guerra Dementus. Navegando por el Páramo, se topan con la Ciudadela presidida por El Inmortan Joe. Mientras los dos Tiranos luchan por el dominio, Furiosa debe sobrevivir a muchas pruebas mientras reúne los medios para encontrar el camino a casa.', '/iADOJ8ZG0pNJhLX42wQeDeS6Sg.jpg', '/xRd1eJc52gA41c3M3x3x6b16z4A.jpg', 'jgyt0_y4E3I', 'now_playing'),
(1011985, 'Kung Fu Panda 4', 'Po se prepara para ser el líder espiritual del Valle de la Paz, buscando un sucesor como Guerrero Dragón. Mientras entrena a un nuevo practicante de kung fu, enfrenta a una malvada hechicera que planea robar su Báculo de la Sabiduría.', '/5gzzkR7y3hnY8AD1wXjCnVlHba5.jpg', '/s9YTxwaByYeoSqugYjJJtZjMRAG.jpg', '1vOfr_63-wM', 'now_playing'),

-- Populares (popular)
(823464, 'Godzilla y Kong: El nuevo imperio', 'Una aventura cinematográfica completamente nueva, que enfrentará al todopoderoso Kong y al temible Godzilla contra una colosal amenaza desconocida escondida dentro de nuestro mundo.', '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', '/k0ucFBBgSDTXYU8fVHXJM41K30f.jpg', 'Q0E1-g_T5U0', 'popular'),
(929590, 'Dune: Parte Dos', 'Paul Atreides se une a la tribu de los Fremen y comienza un viaje espiritual y marcial para convertirse en mesías, mientras intenta evitar el horrible pero inevitable futuro que ha presenciado.', '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', '/v1QQKq8M0fWxMgSdGOX1aCv8qMB.jpg', 'Ua-iDa_c91k', 'popular'),
(385687, 'Interestelar', 'Narra las aventuras de un grupo de exploradores que hacen uso de un agujero de gusano recientemente descubierto para superar las limitaciones de los viajes espaciales tripulados y vencer las inmensas distancias que tiene un viaje interestelar.', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/gJL5kp5FMopB2sN4WZY2PAaxzM8.jpg', 'zSWdZVtXT7E', 'popular'),

-- Mejor Calificadas (top_rated)
(238, 'El Padrino', 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone, barely survives an attempt on his life, his youngest son, Michael, steps in to take care of the would-be killers, launching a campaign of bloody revenge.', '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', '/tmU7GeKVybMWFButWEGl2M42AzU.jpg', 'UaVTIH8mujA', 'top_rated'),
(278, 'Cadena perpetua', 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.', '/uD8i3e2pP4t5a0hC5aB3tVzTfW.jpg', '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', '6hB3S9bIaco', 'top_rated'),
(424, 'La lista de Schindler', 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.', '/sF1U4EUQS8Ycpynlax4a4dfj80k.jpg', '/loRmRzQXZeqG78TqZuyvSlqfCj.jpg', 'M5FpB60jM0o', 'top_rated'),
(155, 'The Dark Knight', 'Batman tiene que mantener el equilibrio entre el heroísmo y el vigilantismo para defender una ciudad que le odia y que está amenazada por un nuevo villano, el Joker.', '/82rCRkl3vR3a7iD2a0mI8lB6i4f.jpg', '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg', 'EXeTwQWrcwY', 'top_rated'),

-- Películas adicionales para géneros
(245891, 'John Wick', 'Un ex asesino a sueldo sale de su retiro para localizar a los mafiosos que le quitaron todo.', '/84eOa8iMo3CAlvWEc75i0Xm2c1L.jpg', '/f89SLAMbDD4lpc3s22eTj3SklA.jpg', 'C0BMx-qxsW4', 'popular'),
(76341, 'Mad Max: Furia en la carretera', 'En un mundo post-apocalíptico, Max se une a Furiosa, una comandante que huye de un tirano con sus cinco esposas.', '/i3aCFg1n0SAu0A4P6223i0g2ze.jpg', '/nlCHUWjY9XWbu1gQe3is6w1XUHO.jpg', 'hEJnMQG9ev8', 'popular'),
(85, 'En busca del arca perdida', 'El arqueólogo y aventurero Indiana Jones es contratado por el gobierno de EE.UU. para encontrar el Arca de la Alianza antes de que los nazis la obtengan.', '/4oJ6bL3w1m6a2u2D03y6i2d5s5.jpg', '/B0I5Lld3o325933tv5s0j4gdrg.jpg', '0xQSIdSRl5c', 'popular'),
(120, 'El Señor de los Anillos: La Comunidad del Anillo', 'Un joven hobbit, Frodo Bolsón, hereda un anillo que resulta ser el Anillo Único, un instrumento de poder absoluto que podría permitir a Sauron, el Señor Oscuro, gobernar la Tierra Media.', '/53Y0I3j5l5fL5o4v2J2xH1sYq2.jpg', '/p3o5oX2weVj88A7iw23d1U25S1g.jpg', 'V75dMMIW2B4', 'popular'),
(324857, 'Spider-Man: Un nuevo universo', 'Miles Morales se convierte en el Spider-Man de su realidad, cruzando su camino con cinco contrapartes de otras dimensiones para detener una amenaza para todas las realidades.', '/iZ8Hj5I1h2b0r2x6i3A3a3a3a3.jpg', '/7d6Jo澤5v3x3z3z3z3z3z3z3z3.jpg', 'g4Hbz2jLxvQ', 'popular'),
(129, 'El viaje de Chihiro', 'Durante la mudanza de su familia a los suburbios, una niña de 10 años deambula por un mundo gobernado por dioses, brujas y espíritus, y donde los humanos se convierten en bestias.', '/u5221i3aCFg1n0SAu0A4P6223i0.jpg', '/bSXfU4EUQS8Ycpynlax4a4dfj80k.jpg', 'ByXuk9QqQkk', 'popular'),
(680, 'Pulp Fiction', 'Las vidas de dos sicarios, un boxeador, la esposa de un gánster y un par de bandidos se entrelazan en cuatro historias de violencia y redención.', '/9p10i3aCFg1n0SAu0A4P6223i0.jpg', '/suaHqfOqfOqfOqfOqfOqfOqfOqf.jpg', 's7EdQ4FqPY8', 'top_rated'),
(769, 'Uno de los nuestros', 'La historia de Henry Hill y su vida en la mafia, cubriendo su relación con su esposa Karen Hill y sus socios mafiosos Jimmy Conway y Tommy DeVito.', '/i3aCFg1n0SAu0A4P6223i0g2ze.jpg', '/6V23i0g2ze.jpg', '2ilzidi_J8Q', 'top_rated'),
(13, 'Forrest Gump', 'Las presidencias de Kennedy y Johnson, el evento de Vietnam, el escándalo de Watergate y otros eventos históricos se desarrollan a través de la perspectiva de un hombre de Alabama con un coeficiente intelectual de 75.', '/iZ8Hj5I1h2b0r2x6i3A3a3a3a3.jpg', '/7d6Jo澤5v3x3z3z3z3z3z3z3z3.jpg', 'bLvqoHBptjg', 'popular'),
(496243, 'Parásitos', 'La codicia y la discriminación de clase amenazan la recién formada relación simbiótica entre la rica familia Park y el indigente clan Kim.', '/u5221i3aCFg1n0SAu0A4P6223i0.jpg', '/bSXfU4EUQS8Ycpynlax4a4dfj80k.jpg', '5xH0HfJHsaY', 'top_rated'),
(1417, 'El laberinto del fauno', 'En la España fascista de 1944, la joven hijastra de un sádico oficial del ejército se escapa a un inquietante pero cautivador mundo de fantasía.', '/9p10i3aCFg1n0SAu0A4P6223i0.jpg', '/suaHqfOqfOqfOqfOqfOqfOqfOqf.jpg', 'E7wG3i0g2ze', 'top_rated'),
(671, 'Harry Potter y la piedra filosofal', 'Un niño huérfano se inscribe en una escuela de magia, donde aprende la verdad sobre sí mismo, su familia y el terrible mal que acecha al mundo mágico.', '/i3aCFg1n0SAu0A4P6223i0g2ze.jpg', '/6V23i0g2ze.jpg', 'tA2CgG3i0g2ze', 'popular'),
(694, 'El resplandor', 'Una familia se dirige a un hotel aislado durante el invierno donde una presencia siniestra influye en la violencia del padre, mientras que su hijo psíquico ve horribles presagios tanto del pasado como del futuro.', '/iZ8Hj5I1h2b0r2x6i3A3a3a3a3.jpg', '/7d6Jo澤5v3x3z3z3z3z3z3z3z3.jpg', '5Cb3ik6zP2o', 'top_rated'),
(419430, '¡Huye!', 'Un joven afroamericano visita a la familia de su novia blanca, donde se da cuenta de que la verdadera razón de su invitación es más siniestra de lo que podría haber imaginado.', '/u5221i3aCFg1n0SAu0A4P6223i0.jpg', '/bSXfU4EUQS8Ycpynlax4a4dfj80k.jpg', 's9e-d_agW8Y', 'top_rated'),
(313369, 'La La Land', 'Mientras persiguen sus sueños en Los Ángeles, un pianista y una actriz se enamoran mientras exploran las alegrías y los dolores de perseguir sus pasiones.', '/9p10i3aCFg1n0SAu0A4P6223i0.jpg', '/suaHqfOqfOqfOqfOqfOqfOqfOqf.jpg', '0pdqfB9qfOq', 'popular'),
(4348, 'Orgullo y prejuicio', 'La chispeante historia de amor entre la joven Elizabeth Bennet y el apuesto Sr. Darcy en la Inglaterra georgiana.', '/i3aCFg1n0SAu0A4P6223i0g2ze.jpg', '/6V23i0g2ze.jpg', '1d_2s_4s_6s', 'popular');

--
-- Volcado de datos para la tabla `movie_genres`
--

INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(155, 28), (155, 80), (155, 18), -- The Dark Knight
(245891, 28), (245891, 80), -- John Wick
(76341, 28), (76341, 12), (76341, 878), -- Mad Max: Fury Road
(85, 12), (85, 28), -- En busca del arca perdida
(120, 12), (120, 14), (120, 28), -- El Señor de los Anillos
(324857, 16), (324857, 28), (324857, 12), -- Spider-Man: Un nuevo universo
(129, 16), (129, 14), -- El viaje de Chihiro
(680, 80), (680, 18), -- Pulp Fiction
(769, 80), (769, 18), -- Uno de los nuestros
(13, 18), (13, 35), (13, 10749), -- Forrest Gump
(496243, 35), (496243, 18), (496243, 27), -- Parásitos
(1417, 14), (1417, 18), (1417, 27), -- El laberinto del fauno
(671, 12), (671, 14), -- Harry Potter
(694, 27), -- El resplandor
(419430, 27), -- ¡Huye!
(313369, 10749), (313369, 35), (313369, 18), -- La La Land
(4348, 10749), (4348, 18); -- Orgullo y prejuicio