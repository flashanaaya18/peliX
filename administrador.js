import { database } from './firebase-config.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    const manualRechargeForm = document.getElementById('manual-recharge-form');
    const emailInput = document.getElementById('email');
    const countrySelect = document.getElementById('country');
    const amountInput = document.getElementById('amount');
    const currencySymbolEl = document.getElementById('currency-symbol');
    const successMessage = document.getElementById('success-message');
    const stockToastEl = document.getElementById('stock-toast');
    const stockToast = new bootstrap.Toast(stockToastEl);
    const requestsContainer = document.getElementById('recharge-requests-container');
    const noRequestsMessage = document.getElementById('no-requests-message');

    const countries = {
        "AR": { name: "Argentina", currency: "ARS", rate: 900 }, "BO": { name: "Bolivia", currency: "BOB", rate: 6.9 }, "CL": { name: "Chile", currency: "CLP", rate: 980 }, "CO": { name: "Colombia", currency: "COP", rate: 3900 }, "CR": { name: "Costa Rica", currency: "CRC", rate: 515 }, "CU": { name: "Cuba", currency: "CUP", rate: 24 }, "EC": { name: "Ecuador", currency: "USD", rate: 1 }, "SV": { name: "El Salvador", currency: "USD", rate: 1 }, "GT": { name: "Guatemala", currency: "GTQ", rate: 7.8 }, "HN": { name: "Honduras", currency: "HNL", rate: 24.7 }, "MX": { name: "México", currency: "MXN", rate: 17 }, "NI": { name: "Nicaragua", currency: "NIO", rate: 36.6 }, "PA": { name: "Panamá", currency: "PAB", rate: 1 }, "PY": { name: "Paraguay", currency: "PYG", rate: 7300 }, "PE": { name: "Perú", currency: "PEN", rate: 3.7 }, "PR": { name: "Puerto Rico", currency: "USD", rate: 1 }, "DO": { name: "República Dominicana", currency: "DOP", rate: 59 }, "UY": { name: "Uruguay", currency: "UYU", rate: 39 }, "VE": { name: "Venezuela", currency: "VES", rate: 36 }
    };

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

    // --- Lógica de Recargas ---

    function loadRechargeRequests() {
        const requests = JSON.parse(localStorage.getItem('topUpRequests')) || [];
        if (requests.length === 0) {
            noRequestsMessage.classList.remove('d-none');
            requestsContainer.innerHTML = '';
            return;
        }

        noRequestsMessage.classList.add('d-none');
        requestsContainer.innerHTML = `
            <table class="table table-dark table-sm table-hover">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Correo</th>
                        <th>País</th>
                        <th class="text-end">Monto</th>
                        <th class="text-center">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(req => `
                        <tr>
                            <td>${new Date(req.id).toLocaleString()}</td>
                            <td>${req.email}</td>
                            <td>${req.country}</td>
                            <td class="text-end">${req.amount} ${req.currency}</td>
                            <td class="text-center">
                                <button class="btn btn-success btn-sm approve-btn" 
                                    data-id="${req.id}" 
                                    data-email="${req.email}" 
                                    data-amount="${req.amount}" 
                                    data-country="${req.countryCode}">
                                    Aprobar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    manualRechargeForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const localAmount = parseFloat(amountInput.value);
        const countryCode = countrySelect.value;

        if (!email || !localAmount || localAmount <= 0) {
            alert('Por favor, completa todos los campos con valores válidos.');
            return;
        }

        // 1. Convertir el monto a USD
        const countryInfo = countries[countryCode];
        const amountInUSD = countryInfo ? localAmount / countryInfo.rate : localAmount;

        // 2. Actualizar saldo en Firebase (fuente de verdad)
        const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
        const userRef = ref(database, 'users/' + userId);

        try {
            const snapshot = await get(userRef);
            if (!snapshot.exists()) {
                alert(`Error: El usuario ${email} no existe en la base de datos.`);
                return;
            }
            const currentBalance = snapshot.val().balance || 0;
            const newBalance = currentBalance + amountInUSD;
            await update(userRef, { balance: newBalance });

            // 3. Sincronizar con localStorage para consistencia en el cliente
            let userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
            userBalances[email] = newBalance;
            localStorage.setItem('userBalances', JSON.stringify(userBalances));

        } catch (error) {
            console.error("Error al actualizar saldo en Firebase:", error);
            alert("Ocurrió un error al conectar con la base de datos. Inténtalo de nuevo.");
            return;
        }

        // 4. Si la recarga vino de una solicitud, eliminarla de la lista
        const requestId = this.dataset.requestId;
        if (requestId) {
            let requests = JSON.parse(localStorage.getItem('topUpRequests')) || [];
            requests = requests.filter(req => req.id != requestId);
            localStorage.setItem('topUpRequests', JSON.stringify(requests));
            delete this.dataset.requestId; // Limpiar el ID
            loadRechargeRequests(); // Volver a cargar la lista
        }

        // Mostrar mensaje de éxito y resetear el formulario
        successMessage.textContent = `¡Recarga aprobada! Se acreditaron $${amountInUSD.toFixed(2)} USD a ${email}.`;
        successMessage.classList.remove('d-none');
        manualRechargeForm.reset();
        updateCurrencySymbol();

        setTimeout(() => successMessage.classList.add('d-none'), 5000);
    });

    // --- Event Listeners ---

    if(countrySelect) countrySelect.addEventListener('change', updateCurrencySymbol);

    requestsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('approve-btn')) {
            const button = e.target;
            emailInput.value = button.dataset.email;
            amountInput.value = button.dataset.amount;
            countrySelect.value = button.dataset.country;
            updateCurrencySymbol();

            // Guardar el ID de la solicitud en el formulario para poder eliminarla después
            manualRechargeForm.dataset.requestId = button.dataset.id;
            emailInput.focus(); // Poner el foco en el formulario
        }
    });

    // --- Lógica de Notificaciones en Tiempo Real ---
    function showStockNotification(data) {
        const toastBody = document.getElementById('stock-toast-body');
        toastBody.textContent = `¡El producto "${data.productName}" se ha agotado!`;
        stockToast.show();
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'stockNotification' && e.newValue) {
            const notificationData = JSON.parse(e.newValue);
            showStockNotification(notificationData);
            // Opcional: podríamos recargar las estadísticas si fuera necesario y estuviéramos en la página de productos
        }
        // Escuchar si llega una nueva solicitud de recarga
        if (e.key === 'newRechargeRequest' && e.newValue) {
            loadRechargeRequests();
        }
    });

    // Inicializar
    if(countrySelect) updateCurrencySymbol();
    loadRechargeRequests();
});