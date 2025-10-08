document.addEventListener('DOMContentLoaded', function() {
    const usersTbody = document.getElementById('users-tbody');
    const noUsersMessage = document.getElementById('no-users-message');
    const searchInput = document.getElementById('search-users-input');

    let allUsersData = [];

    function loadUsers() {
        // Recopilar correos de todas las fuentes posibles para tener una lista completa
        const userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
        const userDetails = JSON.parse(localStorage.getItem('userDetails')) || {};
        const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || {};
        const transactions = JSON.parse(localStorage.getItem('transactions')) || {};
        const specialUsers = JSON.parse(localStorage.getItem('specialUsers')) || [];

        const allEmails = new Set([
            ...Object.keys(userBalances),
            ...Object.keys(userDetails),
            ...Object.keys(purchaseHistory),
            ...Object.keys(transactions),
            ...specialUsers
        ]);

        if (allEmails.size === 0) {
            noUsersMessage.classList.remove('d-none');
            usersTbody.innerHTML = '';
            return;
        }

        noUsersMessage.classList.add('d-none');
        
        allUsersData = Array.from(allEmails).map(email => {
            const name = userDetails[email]?.name || 'N/A';
            const balance = userBalances[email] || 0;
            
            // Intentar encontrar la fecha de la primera transacción como fecha de registro
            const userTransactions = transactions[email] || [];
            const firstTransactionDate = userTransactions.length > 0 
                ? new Date(userTransactions[0].date) 
                : null;

            return {
                email,
                name,
                balance,
                registered: firstTransactionDate ? firstTransactionDate.toLocaleDateString() : 'N/A'
            };
        }).sort((a, b) => a.email.localeCompare(b.email)); // Ordenar alfabéticamente

        renderUsers(allUsersData);
    }

    function renderUsers(users) {
        usersTbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>${user.name}</td>
                <td class="text-end text-success fw-bold">$${user.balance.toFixed(2)}</td>
                <td>${user.registered}</td>
            </tr>
        `).join('');
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredUsers = allUsersData.filter(user => 
            user.email.toLowerCase().includes(query) || 
            user.name.toLowerCase().includes(query)
        );
        renderUsers(filteredUsers);
    });

    // Carga inicial
    loadUsers();
});