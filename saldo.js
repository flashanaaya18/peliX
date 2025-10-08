document.addEventListener('DOMContentLoaded', function() {
    const countries = {
        // Tasas de cambio aproximadas a 1 USD
        "AR": { name: "Argentina", currency: "ARS", rate: 900 },
        "BO": { name: "Bolivia", currency: "BOB", rate: 6.9 },
        "CL": { name: "Chile", currency: "CLP", rate: 980 },
        "CO": { name: "Colombia", currency: "COP", rate: 3900 },
        "CR": { name: "Costa Rica", currency: "CRC", rate: 515 },
        "CU": { name: "Cuba", currency: "CUP", rate: 24 },
        "EC": { name: "Ecuador", currency: "USD", rate: 1 },
        "SV": { name: "El Salvador", currency: "USD", rate: 1 },
        "GT": { name: "Guatemala", currency: "GTQ", rate: 7.8 },
        "HN": { name: "Honduras", currency: "HNL", rate: 24.7 },
        "MX": { name: "México", currency: "MXN", rate: 17 },
        "NI": { name: "Nicaragua", currency: "NIO", rate: 36.6 },
        "PA": { name: "Panamá", currency: "PAB", rate: 1 },
        "PY": { name: "Paraguay", currency: "PYG", rate: 7300 },
        "PE": { name: "Perú", currency: "PEN", rate: 3.7 },
        "PR": { name: "Puerto Rico", currency: "USD", rate: 1 },
        "DO": { name: "República Dominicana", currency: "DOP", rate: 59 },
        "UY": { name: "Uruguay", currency: "UYU", rate: 39 },
        "VE": { name: "Venezuela", currency: "VES", rate: 36 }
    };

    const countrySelect = document.getElementById('country');
    const currencySymbolEl = document.getElementById('currency-symbol');
    const saldoForm = document.getElementById('saldo-form');
    const successMessage = document.getElementById('success-message');
    const checkBalanceBtn = document.getElementById('check-balance-btn');
    const balanceDisplay = document.getElementById('balance-display');
    const userBalanceEl = document.getElementById('user-balance');

    // 1. Poblar el selector de países
    for (const code in countries) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = countries[code].name;
        countrySelect.appendChild(option);
    }

    // 2. Función para actualizar el símbolo de la moneda
    function updateCurrencySymbol() {
        const selectedCountryCode = countrySelect.value;
        currencySymbolEl.textContent = countries[selectedCountryCode].currency;
    }

    // 3. Event listener para el cambio de país
    countrySelect.addEventListener('change', updateCurrencySymbol);

    // 4. Event listener para el envío del formulario
    saldoForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evitar que la página se recargue

        const email = document.getElementById('email').value;
        const amount = document.getElementById('amount').value;
        const country = countrySelect.options[countrySelect.selectedIndex].text;
        const countryCode = countrySelect.value;
        const currency = currencySymbolEl.textContent;

        // Guardar la solicitud en localStorage para que el admin la vea
        const requests = JSON.parse(localStorage.getItem('topUpRequests')) || [];
        requests.push({
            id: Date.now(), // ID único basado en la fecha
            email,
            amount,
            country,
            currency,
            countryCode // Guardamos el código para la conversión
        });
        localStorage.setItem('topUpRequests', JSON.stringify(requests));
        
        // Mostrar mensaje de éxito y resetear el formulario
        successMessage.classList.remove('d-none');
        saldoForm.reset();
        updateCurrencySymbol(); // Resetear el símbolo de la moneda al valor por defecto
    });

    // 5. Event listener para consultar saldo
    checkBalanceBtn.addEventListener('click', function() {
        const email = document.getElementById('check-balance-email').value;
        if (!email) {
            alert('Por favor, introduce un correo electrónico.');
            return;
        }

        const userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
        const balance = userBalances[email] || 0;
        
        userBalanceEl.textContent = `$${parseFloat(balance).toFixed(2)}`;
        balanceDisplay.classList.remove('d-none');
    });

});