// --- SERVICIO DE AUTENTICACIÓN SIMULADO ---
// En una app real, esto haría peticiones a tu backend.

const auth = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulación: Aceptamos cualquier email, pero la contraseña debe ser '123'
        if (password === '123') {
          const user = { id: 1, email, name: email.split('@')[0] }; // Añadimos un ID de usuario de prueba
          localStorage.setItem('user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Contraseña incorrecta. Pista: es "123"'));
        }
      }, 500);
    });
  },

  register: (email, password) => {
    // En esta simulación, registrarse es lo mismo que iniciar sesión.
    return auth.login(email, password);
  },

  logout: () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};