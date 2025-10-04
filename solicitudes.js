document.addEventListener('DOMContentLoaded', () => {
    // --- Protección de Ruta de Administrador ---
    const currentUser = auth.getUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Acceso denegado. Debes ser administrador para ver esta página.');
        window.location.href = 'principal.html';
        return;
    }

    const requestsList = document.getElementById('requests-list');
    const noRequestsMessage = document.getElementById('no-requests-message');

    const renderRequests = () => {
        const users = JSON.parse(localStorage.getItem('users_db')) || [];
        const pendingUsers = users.filter(user => user.verification_pending && !user.is_verified);

        requestsList.innerHTML = '';

        if (pendingUsers.length === 0) {
            noRequestsMessage.style.display = 'block';
            return;
        }
        
        noRequestsMessage.style.display = 'none';

        pendingUsers.forEach(user => {
            const userItem = document.createElement('li');
            userItem.style.backgroundColor = '#2c2c2c';
            userItem.innerHTML = `
                <span>${user.name} (${user.email})</span>
                <span>
                    <button class="action-btn approve" data-id="${user.id}" data-action="approve">Aprobar</button>
                    <button class="action-btn deny" data-id="${user.id}" data-action="deny">Rechazar</button>
                </span>
            `;
            requestsList.appendChild(userItem);
        });
    };

    requestsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('action-btn')) {
            const userId = e.target.dataset.id;
            const action = e.target.dataset.action;
            const users = JSON.parse(localStorage.getItem('users_db')) || [];
            const userIndex = users.findIndex(u => u.id == userId);

            if (userIndex !== -1) {
                if (action === 'approve') {
                    users[userIndex].is_verified = true;
                    users[userIndex].verification_pending = false;
                } else if (action === 'deny') {
                    users[userIndex].verification_pending = false;
                }
                
                localStorage.setItem('users_db', JSON.stringify(users));
                renderRequests(); // Volver a renderizar la lista para reflejar el cambio
            }
        }
    });

    // Carga inicial
    renderRequests();
});