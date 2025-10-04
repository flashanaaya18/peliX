// --- SERVICIO DE AUTENTICACIÓN SIMULADO ---
// Versión 2.0: Simula una base de datos de usuarios en localStorage.

const USERS_DB_KEY = 'users_db';
const CURRENT_USER_KEY = 'current_user';

// Inicializa la base de datos de usuarios si no existe
const initializeDB = () => {
    if (!localStorage.getItem(USERS_DB_KEY)) {
        // Añadimos un usuario admin por defecto para pruebas
        const adminUser = { id: 1, email: 'admin@pelix.com', password: '123', name: 'Admin', is_verified: true, role: 'admin' };
        localStorage.setItem(USERS_DB_KEY, JSON.stringify([adminUser]));
    }
};
initializeDB();

const auth = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
      const user = users.find(u => u.email === email);

      setTimeout(() => {
        if (user && user.password === password) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Email o contraseña incorrectos.'));
        }
      }, 500);
    });
  },

  register: (email, password) => {
    return new Promise((resolve, reject) => {
        const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
        if (users.some(u => u.email === email)) {
            return reject(new Error('Este correo electrónico ya está registrado.'));
        }

        const newUser = {
            id: Date.now(), // ID único simple
            email,
            password, // En una app real, esto debería estar hasheado
            name: email.split('@')[0],
            is_verified: false,
            avatar_url: null,
            verification_message: '', // Nuevo campo para el mensaje
            verification_pending: false, // Nuevo campo para la solicitud
            role: 'user'
        };

        users.push(newUser);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        resolve(newUser);
    });
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  },

  updateUser: (userData) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    // También actualizamos la "base de datos"
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
    const userIndex = users.findIndex(u => u.id === userData.id);
    if (userIndex !== -1) {
        users[userIndex] = userData;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
  }
};