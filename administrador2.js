document.addEventListener('DOMContentLoaded', function() {
    const usersTbody = document.getElementById('users-tbody');
    const noUsersMessage = document.getElementById('no-users-message');

    function getSpecialUsers() {
        return JSON.parse(localStorage.getItem('specialUsers')) || ['admin@tiendapelix.com', 'vip@tiendapelix.com'];
    }

    function saveSpecialUsers(users) {
        localStorage.setItem('specialUsers', JSON.stringify(users));
    }

    function renderUsers() {
        // Recolectar todos los emails de diferentes partes de la app
        const userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        const userAchievements = JSON.parse(localStorage.getItem('userAchievements')) || {};
        
        const emailSet = new Set([
            ...Object.keys(userBalances),
            ...Object.keys(userPreferences),
            ...Object.keys(userAchievements)
        ]);

        const allEmails = Array.from(emailSet);
        usersTbody.innerHTML = '';

        if (allEmails.length === 0) {
            noUsersMessage.classList.remove('d-none');
            document.getElementById('users-container').classList.add('d-none');
        } else {
            noUsersMessage.classList.add('d-none');
            document.getElementById('users-container').classList.remove('d-none');
            
            const specialUsers = getSpecialUsers();

            allEmails.forEach(email => {
                const isSpecial = specialUsers.includes(email.toLowerCase());
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${email}</td>
                    <td>
                        ${isSpecial 
                            ? '<span class="badge bg-warning text-dark">Verificado</span>' 
                            : '<span class="badge bg-secondary">Común</span>'}
                    </td>
                    <td class="text-center">
                        <button class="btn btn-info btn-sm me-2" data-email="${email}" data-action="toggle">
                            <i class="bi bi-arrow-repeat"></i> Cambiar Estado
                        </button>
                        <button class="btn btn-danger btn-sm" data-email="${email}" data-action="delete">
                            <i class="bi bi-trash3-fill"></i> Eliminar
                        </button>
                    </td>
                `;
                usersTbody.appendChild(tr);
            });
        }
    }

    function handleUserAction(email, action) {
        if (action === 'toggle') {
            let specialUsers = getSpecialUsers();
            const emailLower = email.toLowerCase();
            const index = specialUsers.indexOf(emailLower);

            if (index > -1) {
                specialUsers.splice(index, 1); // Quitar de verificados
            } else {
                specialUsers.push(emailLower); // Añadir a verificados
            }
            saveSpecialUsers(specialUsers);
        }

        if (action === 'delete') {
            if (!confirm(`¿Estás seguro de que quieres eliminar a ${email} y todos sus datos? Esta acción es irreversible.`)) {
                return;
            }
            
            // Eliminar de todas las bases de datos simuladas
            let userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
            delete userBalances[email];
            localStorage.setItem('userBalances', JSON.stringify(userBalances));

            let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
            delete userPreferences[email];
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

            let userAchievements = JSON.parse(localStorage.getItem('userAchievements')) || {};
            delete userAchievements[email];
            localStorage.setItem('userAchievements', JSON.stringify(userAchievements));

            // Eliminar de la lista de verificados si existe
            let specialUsers = getSpecialUsers();
            const index = specialUsers.indexOf(email.toLowerCase());
            if (index > -1) {
                specialUsers.splice(index, 1);
                saveSpecialUsers(specialUsers);
            }
        }

        renderUsers(); // Volver a renderizar la lista para reflejar los cambios
    }

    usersTbody.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const email = button.dataset.email;
        const action = button.dataset.action;
        handleUserAction(email, action);
    });

    renderUsers();
});