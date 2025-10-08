document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos del DOM para el perfil ---
    const viewProfileBtn = document.getElementById('view-profile-btn');
    const profileEmailInput = document.getElementById('profile-email');
    const profileInfoContainer = document.getElementById('profile-info-container');
    const profileBalanceEl = document.getElementById('profile-balance');
    const profileFavoritesContainer = document.getElementById('profile-favorites-list');
    const userEmailDisplay = document.getElementById('user-email-display');
    const userNameDisplay = document.getElementById('user-name-display');
    const userBadgeIcon = document.getElementById('user-badge-icon');
    const countryFlagContainer = document.getElementById('country-flag-container');
    const profilePurchasesContainer = document.getElementById('profile-purchases-list');
    const profileHistoryContainer = document.getElementById('profile-history-list');
    const profileAchievementsContainer = document.getElementById('profile-achievements-list');
    const userCountrySelect = document.getElementById('user-country');
    // Elementos de Ajustes (movidos aquí)
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const notificationsSwitch = document.getElementById('notificationsSwitch');
    const animationsSwitch = document.getElementById('animationsSwitch');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameInput = document.getElementById('user-name-input');
    const saveDetailsBtn = document.getElementById('save-details-btn');
    // Nuevos elementos de la pestaña Saldo
    const redeemGiftCodeBtn = document.getElementById('redeem-gift-code-btn');
    const giftCodeInput = document.getElementById('gift-code-input');
    const transactionHistoryContainer = document.getElementById('transaction-history-container');
    // Nuevos elementos para Puntos de Lealtad
    const loyaltyPointsBalanceEl = document.getElementById('loyalty-points-balance');
    const redeemPointsBtn = document.getElementById('redeem-points-btn');
    // Nuevos elementos para Novedades
    const announcementsContainer = document.getElementById('announcements-container');
    // Nuevos elementos para Recompensas Diarias
    const claimDailyRewardBtn = document.getElementById('claim-daily-reward-btn');
    const dailyStreakDisplay = document.getElementById('daily-streak-display');
    // Nuevo elemento para Historial de Sesiones
    const loginHistoryContainer = document.getElementById('login-history-container');


    // --- Lógica de recarga de saldo (movida desde saldo.js) ---
    // Elementos del formulario de soporte
    const supportForm = document.getElementById('support-form');
    const supportNameInput = document.getElementById('support-name');
    const supportAccountSelect = document.getElementById('support-account');
    const supportSuccessMessage = document.getElementById('support-success-message');
    const solvedTicketsList = document.getElementById('solved-tickets-list');

    const countries = {
        "AR": { name: "Argentina", currency: "ARS", rate: 900 }, "BO": { name: "Bolivia", currency: "BOB", rate: 6.9 }, "CL": { name: "Chile", currency: "CLP", rate: 980 }, "CO": { name: "Colombia", currency: "COP", rate: 3900 }, "CR": { name: "Costa Rica", currency: "CRC", rate: 515 }, "CU": { name: "Cuba", currency: "CUP", rate: 24 }, "EC": { name: "Ecuador", currency: "USD", rate: 1 }, "SV": { name: "El Salvador", currency: "USD", rate: 1 }, "GT": { name: "Guatemala", currency: "GTQ", rate: 7.8 }, "HN": { name: "Honduras", currency: "HNL", rate: 24.7 }, "MX": { name: "México", currency: "MXN", rate: 17 }, "NI": { name: "Nicaragua", currency: "NIO", rate: 36.6 }, "PA": { name: "Panamá", currency: "PAB", rate: 1 }, "PY": { name: "Paraguay", currency: "PYG", rate: 7300 }, "PE": { name: "Perú", currency: "PEN", rate: 3.7 }, "PR": { name: "Puerto Rico", currency: "USD", rate: 1 }, "DO": { name: "República Dominicana", currency: "DOP", rate: 59 }, "UY": { name: "Uruguay", currency: "UYU", rate: 39 }, "VE": { name: "Venezuela", currency: "VES", rate: 36 }
    };
    const countrySelect = document.getElementById('country');
    const currencySymbolEl = document.getElementById('currency-symbol');
    const saldoForm = document.getElementById('saldo-form');
    const successMessage = document.getElementById('success-message');

    // Poblar el selector de países
    if (countrySelect) {
        for (const code in countries) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = countries[code].name;
            countrySelect.appendChild(option);
        }
    }

    function updateCurrencySymbol() {
        if (!countrySelect || !currencySymbolEl) return;
        const selectedCountryCode = countrySelect.value;
        currencySymbolEl.textContent = countries[selectedCountryCode].currency;
    }

    // Poblar el selector de país de preferencias de usuario
    if (userCountrySelect) {
        userCountrySelect.innerHTML = countrySelect.innerHTML; // Copiamos las opciones
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Predeterminado (USD)";
        userCountrySelect.prepend(defaultOption);
    }

    function updateFlag(countryCode) {
        if (!countryFlagContainer) return;

        if (countryCode) {
            // Usamos un CDN para obtener las banderas
            countryFlagContainer.innerHTML = `<img src="https://flagcdn.com/w20/${countryCode.toLowerCase()}.png" alt="${countryCode}">`;
        } else {
            countryFlagContainer.innerHTML = `<i class="bi bi-globe"></i>`; // Icono de globo por defecto
        }
    }

    // --- FUNCIONES DE FAVORITOS (necesarias para renderizar) ---
    function isFavorite(productId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.includes(productId);
    }

    window.toggleFavorite = function(productId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.indexOf(productId);
        if (index > -1) {
            favorites.splice(index, 1); // Quitar de favoritos
        } else {
            favorites.push(productId); // Añadir a favoritos
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    viewProfileBtn.addEventListener('click', function() {
        const email = profileEmailInput.value.trim().toLowerCase();
        if (!email) {
            alert('Por favor, introduce un correo electrónico.');
            return;
        }

        // "Iniciamos sesión" guardando el email del usuario actual
        localStorage.setItem('currentUserEmail', email); // Guardamos en minúsculas

        // Registrar el inicio de sesión
        addLoginRecord(email);

        // Mostrar la información del perfil
        displayProfileInfo(email);
    });

    function displayProfileInfo(email) {
        // Pre-rellenar el campo de email en el formulario de recarga
        const formEmailInput = document.getElementById('email');
        if(formEmailInput) formEmailInput.value = email;
        
        // Mostrar email, nombre e insignia
        const userDetails = JSON.parse(localStorage.getItem('userDetails')) || {};
        const name = userDetails[email]?.name || 'Usuario';
        
        userNameDisplay.textContent = name;
        userEmailDisplay.textContent = email;
        supportNameInput.value = name;
        userNameInput.value = name;

        // Leer la lista de usuarios especiales desde localStorage
        const specialUsers = JSON.parse(localStorage.getItem('specialUsers')) || ['admin@tiendapelix.com', 'vip@tiendapelix.com'];

        if (specialUsers.map(u => u.toLowerCase()).includes(email.toLowerCase())) {
            userBadgeIcon.innerHTML = `<i class="bi bi-patch-check-fill badge-icon badge-golden"></i>`;
            userBadgeIcon.title = "Usuario Verificado";
        } else {
            userBadgeIcon.innerHTML = `<i class="bi bi-patch-check-fill badge-icon text-success"></i>`;
            userBadgeIcon.title = "Usuario";
        }

        // 1. Mostrar Saldo
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        const userPref = userPreferences[email] || {};
        const animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';
        const notificationsEnabled = localStorage.getItem('purchaseNotificationsEnabled') !== 'false';
        const savedTheme = localStorage.getItem('theme') || 'dark';

        const userCountryCode = userPref.country || "";
        const countryInfo = userCountryCode ? countries[userCountryCode] : null;

        updateFlag(userCountryCode);
        const userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
        const balanceUSD = userBalances[email] || 0;

        if (countryInfo) {
            const localBalance = balanceUSD * countryInfo.rate;
            profileBalanceEl.innerHTML = `${localBalance.toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}`;
        } else {
            profileBalanceEl.innerHTML = `$${parseFloat(balanceUSD).toFixed(2)} <span class="fs-5 text-white-50">USD</span>`;
        }

        // 1.5. Mostrar Puntos de Lealtad (con verificación de existencia de elementos)
        if (loyaltyPointsBalanceEl && redeemPointsBtn) {
            const loyaltyPoints = JSON.parse(localStorage.getItem('loyaltyPoints')) || {};
            const userPoints = loyaltyPoints[email] || 0;
            loyaltyPointsBalanceEl.textContent = Math.floor(userPoints);
            redeemPointsBtn.disabled = userPoints < 1;
        }

        // 2. Cargar y mostrar preferencia de país
        if (userCountrySelect) {
            userCountrySelect.value = userPref.country || "";
        }

        // Cargar preferencias de apariencia y rendimiento
        document.querySelector(`input[value="${savedTheme}"]`).checked = true;
        animationsSwitch.checked = animationsEnabled;
        notificationsSwitch.checked = notificationsEnabled;
        
        // 3. Mostrar Favoritos
        const favoriteProducts = products.filter(p => isFavorite(p.id));

        if (favoriteProducts.length === 0) {
            profileFavoritesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-white-50">No tienes productos favoritos.</p>
                    <a href="tienda.html" class="btn btn-outline-light btn-sm">Explorar Tienda</a>
                </div>`;
        } else {
            // Reutilizamos la función renderProducts de script.js, pero la adaptamos aquí
            // para no depender de que el usuario navegue a otra página.
            profileFavoritesContainer.innerHTML = favoriteProducts.map(product => `
                <div class="col-lg-4 col-md-6 col-12">
                    <div class="product-card h-100" data-id="${product.id}">
                        <i class="bi ${isFavorite(product.id) ? 'bi-heart-fill' : 'bi-heart'} favorite-icon" onclick="toggleFavorite(${product.id}); displayProfileInfo('${email}');"></i>
                        <div class="product-card-content">
                            <h4>${product.name}</h4>
                            <div class="price">$${product.price.toFixed(2)}</div>
                            <button class="add-to-cart" onclick="addToCart(${product.id})">Añadir al Carrito</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // 4. Mostrar Logros
        const userAchievements = JSON.parse(localStorage.getItem('userAchievements')) || {};
        const achievements = userAchievements[email] || [];

        if (achievements.length === 0) {
            profileAchievementsContainer.innerHTML = `<p class="text-white-50 text-center">Aún no has desbloqueado ningún logro.</p>`;
        } else {
            profileAchievementsContainer.innerHTML = achievements.map(ach => `
                <div class="d-flex align-items-center mb-3">
                    <div class="achievement-icon me-3">
                        <i class="${ach.icon}"></i>
                    </div>
                    <div>
                        <h5 class="mb-0">${ach.title}</h5>
                        <p class="text-white-50 mb-0">${ach.description}</p>
                    </div>
                </div>
            `).join('<hr class="my-3 border-secondary">');
        }

        // 5. Mostrar Cuentas Compradas
        const userPurchases = JSON.parse(localStorage.getItem('userPurchases')) || {};
        const purchases = userPurchases[email] || [];

        if (purchases.length === 0) {
            profilePurchasesContainer.innerHTML = `<p class="text-white-50 text-center">Aún no has comprado ninguna cuenta.</p>`;
        } else {
            profilePurchasesContainer.innerHTML = purchases.map(pur => `
                <div class="mb-3">
                    <h5 class="mb-1">${pur.productName}</h5>
                    <div class="input-group input-group-sm mb-1">
                        <span class="input-group-text">Correo:</span>
                        <input type="text" class="form-control" value="${pur.email}" readonly>
                    </div>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">Clave:</span>
                        <input type="text" class="form-control" value="${pur.pass}" readonly>
                    </div>
                </div>
            `).join('<hr class="my-3 border-secondary">');
        }

        // Poblar el dropdown de cuentas para reportar problemas
        supportAccountSelect.innerHTML = '<option value="" selected disabled>Selecciona una cuenta...</option>';
        if (purchases.length > 0) {
            purchases.forEach((pur, index) => {
                const option = document.createElement('option');
                // Guardamos el índice para encontrar la cuenta fácilmente
                option.value = index;
                option.textContent = `${pur.productName} (${pur.email})`;
                supportAccountSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.textContent = "No tienes cuentas compradas";
            option.disabled = true;
            supportAccountSelect.appendChild(option);
        }

        // Mostrar reportes solucionados
        const solvedTickets = JSON.parse(localStorage.getItem('solvedTickets')) || {};
        const userSolvedTickets = solvedTickets[email] || [];

        if (userSolvedTickets.length === 0) {
            solvedTicketsList.innerHTML = `<p class="text-white-50 text-center">No tienes reportes solucionados.</p>`;
        } else {
            solvedTicketsList.innerHTML = userSolvedTickets.map(ticket => `
                <div class="mb-4 p-3" style="background: rgba(255,255,255,0.05); border-radius: 15px;">
                    <p class="mb-2"><strong>Problema reportado:</strong><br><small class="text-white-50">${ticket.descripcion}</small></p>
                    <p class="mb-1 text-success fw-bold">Solución proporcionada:</p>
                    <div class="input-group input-group-sm mb-1">
                        <span class="input-group-text">Nuevo Correo:</span>
                        <input type="text" class="form-control" value="${ticket.newEmail}" readonly>
                    </div>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">Nueva Clave:</span>
                        <input type="text" class="form-control" value="${ticket.newPassword}" readonly>
                    </div>
                </div>
            `).join('');
        }



        // 6. Mostrar Historial de Compras (en pestaña Pedidos)
        const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || {};
        const history = purchaseHistory[email] || [];

        if (history.length === 0) {
            profileHistoryContainer.innerHTML = `<p class="text-white-50 text-center">No tienes compras en tu historial.</p>`;
        } else {
            profileHistoryContainer.innerHTML = `
                <table class="table table-dark table-sm">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                        <th>Tipo</th>
                            <th>Descripción</th>
                            <th class="text-end">Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.reverse().map(entry => {
                            const description = entry.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
                            const localCost = countryInfo ? entry.totalCostUSD * countryInfo.rate : entry.totalCostUSD;
                            const currency = countryInfo ? countryInfo.currency : 'USD';
                            return `
                                <tr>
                                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                                    <td>${description}</td>
                                    <td class="text-end">${localCost.toLocaleString('es-AR', { style: 'currency', currency: currency, minimumFractionDigits: countryInfo ? 0 : 2 })}</td>
                                </tr>`;
                        }).join('')}
                    </tbody>
                </table>`;
        }

        // Cargar historial de transacciones para el modal
        renderTransactionHistory(email, countryInfo);

        // Comprobar y mostrar el estado de la recompensa diaria
        checkDailyReward(email);

        // Cargar anuncios y novedades
        renderAnnouncements(email);

        // Cargar historial de sesiones
        renderLoginHistory(email);

        // 7. Mostrar el contenedor principal
        profileInfoContainer.classList.remove('d-none');
    }

    // Event listener para el cambio de país en el form de recarga
    if (countrySelect) {
        countrySelect.addEventListener('change', updateCurrencySymbol);
    }

    // Event listener para guardar la preferencia de país del usuario
    if (userCountrySelect) {
        userCountrySelect.addEventListener('change', function() {
            const email = localStorage.getItem('currentUserEmail');
            if (!email) return;

            let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
            if (!userPreferences[email]) userPreferences[email] = {};
            userPreferences[email].country = userCountrySelect.value;
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            updateFlag(userCountrySelect.value);
            alert('Preferencia de país guardada. Los precios se actualizarán en toda la tienda.');
        });
    }

    // Event listener para el envío del formulario de recarga
    if (saldoForm) {
        saldoForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevenimos el envío normal del formulario
            
            const formData = new FormData(this);
            formData.append('form-name', 'recarga-saldo');
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                // --- AÑADIDO: Guardar la solicitud en localStorage para el admin ---
                const requests = JSON.parse(localStorage.getItem('topUpRequests')) || [];
                const countryCode = formData.get('pais');
                const countryInfo = countries[countryCode];
                const newRequest = {
                    id: Date.now(),
                    email: formData.get('email').trim().toLowerCase(),
                    amount: formData.get('monto'),
                    country: countryInfo.name,
                    currency: countryInfo.currency,
                    countryCode: countryCode
                };
                requests.push(newRequest);
                localStorage.setItem('topUpRequests', JSON.stringify(requests));
                // Disparamos un evento para que el panel de admin se actualice en tiempo real
                localStorage.setItem('newRechargeRequest', Date.now());
                // ----------------------------------------------------------------

                // Éxito en el envío
                successMessage.classList.remove('d-none');
                saldoForm.reset();
                updateCurrencySymbol();

                // Ocultar el mensaje después de unos segundos
                setTimeout(() => {
                    successMessage.classList.add('d-none');
                    // Recargamos la info del perfil para que el email se vuelva a rellenar
                    const email = localStorage.getItem('currentUserEmail');
                    if (email) displayProfileInfo(email);
                }, 5000);
            })
            .catch((error) => alert("Hubo un error al enviar la solicitud: " + error));
        });
    }

    // --- Lógica para las nuevas funciones de Saldo ---

    // 2. Canjear Código de Regalo
    if (redeemGiftCodeBtn) {
        redeemGiftCodeBtn.addEventListener('click', function() {
            const email = localStorage.getItem('currentUserEmail'); // Ya está en minúsculas
            const code = giftCodeInput.value.trim().toUpperCase();

            if (!email || !code) {
                alert('Por favor, inicia sesión e introduce un código.');
                return;
            }

            // Simulación de códigos de regalo. En una app real, esto vendría de un backend.
            let giftCodes = JSON.parse(localStorage.getItem('giftCodes')) || {};

            const gift = giftCodes[code];

            if (!gift) {
                alert('El código introducido no es válido.');
                return;
            }
            if (gift.usedBy || gift.used) { // Compatibilidad con sistema anterior
                alert('Este código ya ha sido canjeado.');
                return;
            }

            // Procesar recompensa según el tipo
            switch (gift.type) {
                case 'saldo':
                    let userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
                    userBalances[email] = (userBalances[email] || 0) + gift.value;
                    localStorage.setItem('userBalances', JSON.stringify(userBalances));
                    addTransaction(email, 'gift_redeem', gift.value, `Código de saldo: ${code}`);
                    alert(`¡Felicidades! Has canjeado un código por $${gift.value.toFixed(2)} USD.`);
                    break;
                
                case 'logro':
                    // Suponemos que existe una función para otorgar logros
                    grantAchievement(email, gift.value);
                    addTransaction(email, 'gift_redeem', 0, `Logro desbloqueado: ${gift.value}`);
                    alert(`¡Felicidades! Has desbloqueado un nuevo logro: ${gift.value}.`);
                    break;

                case 'nada':
                    alert('Este código no contenía ninguna recompensa. ¡Más suerte la próxima vez!');
                    break;

                default:
                    alert('Este código tiene un tipo de recompensa no reconocido.');
                    return; // No marcar como usado si no se reconoce
            }

            // Marcar código como usado
            gift.used = true; // Mantenemos por compatibilidad
            gift.usedBy = email;
            gift.usedDate = new Date().toISOString();
            localStorage.setItem('giftCodes', JSON.stringify(giftCodes));

            displayProfileInfo(email);
            giftCodeInput.value = '';
        });
    }

    // Función auxiliar para otorgar logros (debe existir o ser creada)
    function grantAchievement(email, achievementId) {
        // Esta es una implementación de ejemplo. La lógica real puede variar.
        console.log(`Otorgando logro '${achievementId}' a ${email}`);
        // Aquí iría la lógica para añadir el logro al perfil del usuario en localStorage.
    }

    // 3. Historial de Transacciones
    function addTransaction(email, type, amount, description) {
        let allTransactions = JSON.parse(localStorage.getItem('transactions')) || {};
        if (!allTransactions[email]) {
            allTransactions[email] = [];
        }
        allTransactions[email].push({
            date: new Date().toISOString(),
            type: type, // 'purchase', 'recharge', 'points_redeem', 'gift_redeem'
            amount: amount, // Siempre en USD
            description: description
        });
        localStorage.setItem('transactions', JSON.stringify(allTransactions));
    }

    // Lógica de Inversión (Staking)
    if (redeemPointsBtn) redeemPointsBtn.addEventListener('click', () => {
        const email = localStorage.getItem('currentUserEmail'); // Ya está en minúsculas
        let loyaltyPoints = JSON.parse(localStorage.getItem('loyaltyPoints')) || {};
        const userPoints = Math.floor(loyaltyPoints[email] || 0);

        if (userPoints < 1) {
            alert('No tienes suficientes puntos para canjear.');
            return;
        }

        const valueInUSD = userPoints * 0.01; // 1 punto = $0.01 USD

        // Añadir saldo al usuario
        let userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
        userBalances[email] = (userBalances[email] || 0) + valueInUSD;
        localStorage.setItem('userBalances', JSON.stringify(userBalances));

        // Resetear puntos del usuario
        loyaltyPoints[email] = 0;
        localStorage.setItem('loyaltyPoints', JSON.stringify(loyaltyPoints));

        addTransaction(email, 'points_redeem', valueInUSD, `Canje de ${userPoints} puntos`);
        alert(`¡Has canjeado ${userPoints} puntos por $${valueInUSD.toFixed(2)} USD!`);
        displayProfileInfo(email);
    });

    // --- Lógica de Novedades/Anuncios ---
    function renderAnnouncements(email) {
        const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        let userReadAnnouncements = JSON.parse(localStorage.getItem('userReadAnnouncements')) || {};
        const readIds = userReadAnnouncements[email] || [];

        if (announcements.length === 0) {
            announcementsContainer.innerHTML = '<p class="text-white-50">No hay anuncios por el momento.</p>';
            return;
        }

        // Marcar todos los anuncios visibles como leídos para este usuario
        announcements.forEach(ann => {
            if (!readIds.includes(ann.id)) {
                readIds.push(ann.id);
            }
        });
        userReadAnnouncements[email] = readIds;
        localStorage.setItem('userReadAnnouncements', JSON.stringify(userReadAnnouncements));

        // Re-renderizar el indicador de la campana (asumiendo que está en script.js)
        if (typeof updateNotificationBell === 'function') {
            updateNotificationBell();
        }

        announcementsContainer.innerHTML = announcements
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Más recientes primero
            .map(ann => `
                <div class="mb-4 p-3" style="background: rgba(0,0,0,0.2); border-left: 3px solid var(--primary); border-radius: 8px;">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-1">${ann.title}</h5>
                        <small class="text-white-50">${new Date(ann.date).toLocaleDateString()}</small>
                    </div>
                    <p class="text-white-50 mb-0">${ann.body}</p>
                </div>
            `).join('');
    }



    // Función para renderizar el historial de transacciones en el modal
    function renderTransactionHistory(email, countryInfo) {
        const allTransactions = JSON.parse(localStorage.getItem('transactions')) || {};
        const userTransactions = (allTransactions[email] || []).sort((a, b) => new Date(b.date) - new Date(a.date));

        const typeInfo = {
            purchase: { icon: 'bi-bag-dash-fill', color: 'text-danger' },
            recharge: { icon: 'bi-plus-circle-fill', color: 'text-primary' },
            points_redeem: { icon: 'bi-award-fill', color: 'text-warning' },
            gift_redeem: { icon: 'bi-gift-fill', color: 'text-success' },
            daily_reward: { icon: 'bi-calendar-check-fill', color: 'text-info' },
        };
        if (userTransactions.length === 0) {
            transactionHistoryContainer.innerHTML = `<p class="text-white-50 text-center">No hay transacciones en tu historial.</p>`;
            return;
        }

        transactionHistoryContainer.innerHTML = `
            <table class="table table-dark table-sm table-hover">
                <thead>
                    <tr>
                            <th>Fecha</th>
                        <th>Descripción</th>
                        <th class="text-end">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${userTransactions.map(tx => {
                        const info = typeInfo[tx.type] || { icon: 'bi-question-circle', color: '' };
                        const localAmount = countryInfo ? tx.amount * countryInfo.rate : tx.amount;
                        const currency = countryInfo ? countryInfo.currency : 'USD'; 
                        const isNegative = ['purchase'].includes(tx.type);
                        
                        return `
                            <tr> 
                                <td>${new Date(tx.date).toLocaleDateString()}</td>
                                <td><i class="${info.icon} ${info.color} me-2" title="${tx.type}"></i></td>
                                <td>${tx.description}</td>
                                <td class="text-end fw-bold ${isNegative ? 'text-danger' : 'text-success'}">
                                    ${isNegative ? '-' : '+'}
                                    ${localAmount.toLocaleString('es-AR', { style: 'currency', currency: currency, minimumFractionDigits: countryInfo ? 0 : 2 })}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // --- Lógica para Recompensas por Racha Diaria ---
    function checkDailyReward(email) {
        let loginData = JSON.parse(localStorage.getItem('userLoginStreaks')) || {};
        let userData = loginData[email] || { streak: 0, lastClaim: null };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Si el último reclamo no fue hoy ni ayer, se rompió la racha.
        if (userData.lastClaim && userData.lastClaim !== today && userData.lastClaim !== yesterday) {
            userData.streak = 0;
        }

        // Mostrar la racha actual
        dailyStreakDisplay.innerHTML = `🔥 ${userData.streak}`;

        // Habilitar el botón si no se ha reclamado hoy
        if (userData.lastClaim !== today) {
            claimDailyRewardBtn.disabled = false;
            claimDailyRewardBtn.textContent = 'Reclamar Recompensa';
        } else {
            claimDailyRewardBtn.disabled = true;
            claimDailyRewardBtn.textContent = 'Recompensa Reclamada';
        }

        loginData[email] = userData;
        localStorage.setItem('userLoginStreaks', JSON.stringify(loginData));
    }

    if (claimDailyRewardBtn) {
        claimDailyRewardBtn.addEventListener('click', () => {
            const email = localStorage.getItem('currentUserEmail');
            if (!email) return;

            let loginData = JSON.parse(localStorage.getItem('userLoginStreaks')) || {};
            let userData = loginData[email] || { streak: 0, lastClaim: null };
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            if (userData.lastClaim === today) {
                alert("Ya has reclamado tu recompensa de hoy.");
                return;
            }

            // Incrementar la racha si el último reclamo fue ayer, si no, resetear a 1.
            userData.streak = (userData.lastClaim === yesterday) ? userData.streak + 1 : 1;
            userData.lastClaim = today;

            // Calcular recompensa
            const basePoints = 5;
            const bonus = (userData.streak % 7 === 0) ? 50 : 0; // Bono cada 7 días
            const pointsEarned = basePoints * userData.streak + bonus;

            // Añadir puntos al usuario
            let loyaltyPoints = JSON.parse(localStorage.getItem('loyaltyPoints')) || {};
            loyaltyPoints[email] = (loyaltyPoints[email] || 0) + pointsEarned;
            localStorage.setItem('loyaltyPoints', JSON.stringify(loyaltyPoints));

            // Registrar transacción
            addTransaction(email, 'daily_reward', pointsEarned, `Recompensa diaria (Racha x${userData.streak})`);

            // Actualizar localStorage y UI
            loginData[email] = userData;
            localStorage.setItem('userLoginStreaks', JSON.stringify(loginData));
            
            alert(`¡Has ganado ${pointsEarned} puntos! Tu racha es ahora de ${userData.streak} días.`);
            displayProfileInfo(email); // Refrescar toda la info del perfil
        });
    }

    // --- Lógica para Historial de Sesiones ---
    function addLoginRecord(email) {
        let loginHistory = JSON.parse(localStorage.getItem('loginHistory')) || {};
        if (!loginHistory[email]) {
            loginHistory[email] = [];
        }

        // Añadir nuevo registro al principio del array
        loginHistory[email].unshift({
            date: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // Limitar el historial a las últimas 10 entradas
        if (loginHistory[email].length > 10) {
            loginHistory[email].pop();
        }

        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    }

    function renderLoginHistory(email) {
        if (!loginHistoryContainer) return;

        let loginHistory = JSON.parse(localStorage.getItem('loginHistory')) || {};
        const userHistory = loginHistory[email] || [];

        if (userHistory.length === 0) {
            loginHistoryContainer.innerHTML = '<p class="text-white-50 text-center">No hay registros de inicio de sesión.</p>';
            return;
        }

        loginHistoryContainer.innerHTML = `
            <table class="table table-dark table-sm">
                <tbody>
                    ${userHistory.map(record => `
                        <tr>
                            <td><i class="bi bi-box-arrow-in-right text-success me-2"></i>${new Date(record.date).toLocaleString()}</td>
                            <td class="text-white-50 text-end"><small>${record.userAgent.substring(0, 40)}...</small></td>
                        </tr>`).join('')}
                </tbody>
            </table>`;
    }

    // Inicializar
    // Si hay un usuario "logueado", mostramos su perfil directamente
    const loggedInUser = localStorage.getItem('currentUserEmail');
    if (loggedInUser && profileEmailInput) {
        profileEmailInput.value = loggedInUser;
        displayProfileInfo(loggedInUser);
    }

    // Event listener para guardar detalles de la cuenta
    if (saveDetailsBtn) {
        saveDetailsBtn.addEventListener('click', () => {
            const email = localStorage.getItem('currentUserEmail');
            if (!email) return;

            let userDetails = JSON.parse(localStorage.getItem('userDetails')) || {};
            if (!userDetails[email]) userDetails[email] = {};
            userDetails[email].name = userNameInput.value;
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            displayProfileInfo(email); // Actualizar la vista
            alert('¡Detalles de la cuenta guardados!');
        });
    }

    // Event listener para el formulario de soporte
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // --- CORRECCIÓN CRÍTICA ---
            // Nos aseguramos de que los detalles de la cuenta seleccionada se guarden
            // en los campos ocultos justo antes de crear el FormData.
            const selectedIndex = parseInt(supportAccountSelect.value, 10);
            const userPurchases = JSON.parse(localStorage.getItem('userPurchases')) || {};
            const email = localStorage.getItem('currentUserEmail'); // Ya está en minúsculas
            const purchases = userPurchases[email] || [];

            if (!isNaN(selectedIndex) && purchases[selectedIndex]) {
                const selectedAccount = purchases[selectedIndex];
                document.getElementById('support-product-name').value = selectedAccount.productName;
                document.getElementById('support-account-email').value = selectedAccount.email;
                document.getElementById('support-account-password').value = selectedAccount.pass;
            }

            const formData = new FormData(supportForm);
            // Añadir el email del usuario actual al formulario
            formData.append('email_usuario', email);

            // Guardar una copia del reporte en localStorage para el panel de admin
            const supportTickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
            const newTicket = Object.fromEntries(formData.entries());
            newTicket.id = Date.now();
            newTicket.status = 'pending';
            supportTickets.push(newTicket);
            localStorage.setItem('supportTickets', JSON.stringify(supportTickets));

            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            })
            .then(() => {
                supportSuccessMessage.classList.remove('d-none');
                supportForm.reset();
                setTimeout(() => supportSuccessMessage.classList.add('d-none'), 5000);
            })
            .catch((error) => alert("Hubo un error al enviar el reporte: " + error));
        });
    }

    // --- Lógica de Ajustes (movida desde ajustes.js) ---
    const body = document.body;

    // Cargar y aplicar preferencias guardadas
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';

    body.setAttribute('data-theme', savedTheme);
    document.querySelector(`input[value="${savedTheme}"]`).checked = true;

    animationsSwitch.checked = animationsEnabled;
    if (!animationsEnabled) {
        body.classList.add('animations-disabled');
    }

    // Event listener para el cambio de tema
    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    });

    // Event listener para el switch de animaciones
    animationsSwitch.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        localStorage.setItem('animationsEnabled', enabled);
        body.classList.toggle('animations-disabled', !enabled);
    });

    // Event listener para el switch de notificaciones
    notificationsSwitch.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        localStorage.setItem('purchaseNotificationsEnabled', enabled);
        alert(`Notificaciones ${enabled ? 'activadas' : 'desactivadas'}.`);
    });

    // Event listener para limpiar datos
    clearDataBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos locales? Esta acción no se puede deshacer.')) {
            localStorage.clear();
            alert('Datos locales borrados. El carrito está ahora vacío.');
            window.location.reload();
        }
    });

    // Event listener para cerrar sesión
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUserEmail');
        alert('Has cerrado sesión.');
        window.location.href = 'peliX.html';
    });

    // Lógica de Exportar/Importar
    const dataKeysToBackup = ['cart', 'favorites', 'userBalances', 'userPreferences', 'userAchievements', 'purchaseHistory', 'currentUserEmail', 'theme', 'animationsEnabled', 'purchaseNotificationsEnabled', 'userDetails', 'transactions', 'giftCodes', 'loyaltyPoints'];

    exportDataBtn.addEventListener('click', () => {
        const backupData = {};
        dataKeysToBackup.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                // No parseamos y re-stringify, solo tomamos el string
                backupData[key] = JSON.parse(data);
            }
        });
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tiendapelix-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    importDataBtn.addEventListener('click', () => importFileInput.click());

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                if (confirm('¿Estás seguro de que quieres importar estos datos? Se sobrescribirán tus datos actuales.')) {
                    Object.keys(importedData).forEach(key => {
                        localStorage.setItem(key, JSON.stringify(importedData[key]));
                    });
                    alert('¡Datos importados con éxito! La página se recargará.');
                    window.location.reload();
                }
            } catch (error) { alert('Error al leer el archivo.'); }
        };
        reader.readAsText(file);
        importFileInput.value = '';
    });

    updateCurrencySymbol();
    updateCartCount();
});