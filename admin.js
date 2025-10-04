document.addEventListener('DOMContentLoaded', () => {
    // --- Protección de Ruta de Administrador ---
    const currentUser = auth.getUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Acceso denegado. Debes ser administrador para ver esta página.');
        window.location.href = 'principal.html';
        return;
    }

    // --- Lógica para el contador de notificaciones ---
    const requestsCountBadge = document.getElementById('requests-count-badge');
    if (requestsCountBadge) {
        const users = JSON.parse(localStorage.getItem('users_db')) || [];
        const pendingCount = users.filter(user => user.verification_pending && !user.is_verified).length;

        if (pendingCount > 0) {
            requestsCountBadge.textContent = pendingCount;
            requestsCountBadge.style.display = 'flex';
        }
    }
});