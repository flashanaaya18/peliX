-- Archivo de migración para añadir funcionalidades de perfil a la base de datos Pelix

-- Añadir una columna para la URL del avatar en la tabla de usuarios.
-- Esto permite a cada usuario tener una imagen de perfil personalizada.
ALTER TABLE `users`
ADD COLUMN `avatar_url` VARCHAR(255) DEFAULT '/peliX.png';

-- En una aplicación más compleja, se podría crear una tabla de perfiles separada
-- para almacenar más información, como biografía, ubicación, etc.
-- CREATE TABLE `user_profiles` (
--   `user_id` INT PRIMARY KEY,
--   `bio` TEXT,
--   `location` VARCHAR(100),
--   FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
-- );