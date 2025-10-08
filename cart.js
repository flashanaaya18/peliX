let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Añadir producto al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    // Solo mostrar notificación si el usuario lo tiene activado
    if (localStorage.getItem('purchaseNotificationsEnabled') !== 'false') {
        showNotification(`${product.name} añadido al carrito`);
    }
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
}

// Vaciar el carrito
function emptyCart() {
    if (confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
        cart = [];
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

function saveProductStock(stock) {
    localStorage.setItem('productStock', JSON.stringify(stock));
}

// Pagar con saldo
function payWithBalance() {
    const email = document.getElementById('pay-with-balance-email').value.trim().toLowerCase();
    if (!email) {
        alert('Por favor, introduce tu correo electrónico para pagar con saldo.');
        return;
    }

    if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    // Obtener preferencias de moneda del usuario actual para mostrar precios
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
    const userCountryCode = userPreferences[email]?.country || '';
    // Suponemos que 'products' está disponible globalmente desde script.js
    const countries = products[0]._countries;
    const countryInfo = userCountryCode ? countries[userCountryCode] : null;

    let userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
    let userBalance = userBalances[email] || 0;

    const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (userBalance < totalCost) {
        alert(`Saldo insuficiente. Tu saldo es de $${userBalance.toFixed(2)} USD y el total es de $${totalCost.toFixed(2)} USD.`);
        return;
    }

    // --- Lógica de asignación de cuentas ---
    let productStock = JSON.parse(localStorage.getItem('productStock')) || {};
    let accountsToAssign = [];
    let purchasePossible = true;

    for (const item of cart) {
        const stockForProduct = productStock[item.id] || [];
        const availableAccounts = stockForProduct.filter(acc => acc.status === 'available');
        
        if (availableAccounts.length < item.quantity) {
            alert(`¡Lo sentimos! No hay suficiente stock para "${item.name}". Solo quedan ${availableAccounts.length} disponibles.`);
            purchasePossible = false;
            break;
        }
        
        // Reservar las cuentas para este item
        for (let i = 0; i < item.quantity; i++) {
            const accountToSell = availableAccounts[i];
            accountsToAssign.push({ ...accountToSell, productName: item.name });
            // Marcamos como 'sold' temporalmente
            const originalAccount = stockForProduct.find(acc => acc.id === accountToSell.id);
            originalAccount.status = 'sold';
        }
    }

    if (!purchasePossible) {
        return; // Detener la compra si no hay stock
    }

    // --- Mensajes en moneda local ---
    let confirmationMessage;
    if (countryInfo) {
        const localTotal = totalCost * countryInfo.rate;
        const localBalanceLeft = (userBalance - totalCost) * countryInfo.rate;
        confirmationMessage = `Confirmas la compra por un total de ${localTotal.toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}?\n\nTu saldo restante será de ${localBalanceLeft.toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}`;
    } else {
        confirmationMessage = `Confirmas la compra por un total de $${totalCost.toFixed(2)} USD? Tu saldo restante será de $${(userBalance - totalCost).toFixed(2)} USD.`;
    }

    if (!confirm(confirmationMessage)) {
        // Si el usuario cancela, revertimos el estado de las cuentas a 'available'
        accountsToAssign.forEach(assignedAcc => {
            const originalAccount = productStock[assignedAcc.productName.id]?.find(acc => acc.id === assignedAcc.id);
            if(originalAccount) originalAccount.status = 'available';
        });
        return;
    }

    // --- Confirmar la transacción ---
    saveProductStock(productStock); // Guardar el stock actualizado con las cuentas vendidas

    userBalance -= totalCost;
    userBalances[email] = userBalance;
    localStorage.setItem('userBalances', JSON.stringify(userBalances));

    // Guardar las cuentas compradas en el historial del usuario
    let userPurchases = JSON.parse(localStorage.getItem('userPurchases')) || {};
    if (!userPurchases[email]) userPurchases[email] = [];
    userPurchases[email].push(...accountsToAssign);
    localStorage.setItem('userPurchases', JSON.stringify(userPurchases));

    // Guardar la transacción en el historial de compras
    let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || {};
    if (!purchaseHistory[email]) purchaseHistory[email] = [];
    purchaseHistory[email].push({
        date: new Date().toISOString(),
        items: cart.map(item => ({ name: item.name, quantity: item.quantity })),
        totalCostUSD: totalCost
    });
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));

    // Notificar si algún producto se agota
    for (const item of cart) {
        const stockForProduct = productStock[item.id] || [];
        const availableStock = stockForProduct.filter(acc => acc.status === 'available').length;
        if (availableStock === 0) {
            const notificationData = { productId: item.id, productName: item.name };
            // Usamos localStorage para notificar a otras pestañas (como el panel de admin)
            localStorage.setItem('stockNotification', JSON.stringify(notificationData));
        }
    }

    // Otorgar puntos de lealtad (10% del valor en puntos, 1 punto = $0.01)
    let loyaltyPoints = JSON.parse(localStorage.getItem('loyaltyPoints')) || {};
    const pointsEarned = totalCost * 10; // 1 USD = 10 puntos
    loyaltyPoints[email] = (loyaltyPoints[email] || 0) + pointsEarned;
    localStorage.setItem('loyaltyPoints', JSON.stringify(loyaltyPoints));

    // --- Alerta de éxito en moneda local ---
    const accountsDetails = accountsToAssign.map(acc => `Producto: ${acc.productName}\nCorreo: ${acc.email}\nContraseña: ${acc.pass}`).join('\n\n');
    let successAlertMessage;
    if (countryInfo) {
        const localTotal = totalCost * countryInfo.rate;
        const localBalance = userBalance * countryInfo.rate;
        successAlertMessage = `¡Compra exitosa! Se ha descontado ${localTotal.toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}.\nTu nuevo saldo es: ${localBalance.toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}.`;
    } else {
        successAlertMessage = `¡Compra exitosa! Se han descontado $${totalCost.toFixed(2)} USD.\nTu nuevo saldo es: $${userBalance.toFixed(2)} USD.`;
    }
    alert(`${successAlertMessage}\n\nTus cuentas:\n\n${accountsDetails}`);

    // Vaciar el carrito y actualizar la UI
    cart = [];
    saveCart();
    renderCartItems();
    updateCartCount();
}

// Actualizar cantidad
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Actualizar contador del carrito
function updateCartCount() {
    const countElements = document.querySelectorAll('#cart-count');
    const countMobile = document.getElementById('cart-count-mobile');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    countElements.forEach(element => {
        element.textContent = totalItems;
    });

    if (countMobile) {
        countMobile.textContent = totalItems;
    }
}

// Renderizar items del carrito
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalPriceEl = document.getElementById('total-price');
    const subtotalPriceEl = document.getElementById('subtotal-price');

    // Obtener preferencias de moneda del usuario actual para mostrar precios
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
    const userCountryCode = currentUserEmail ? (userPreferences[currentUserEmail]?.country || '') : '';
    // Suponemos que 'products' está disponible globalmente desde script.js
    const countries = products[0]._countries;
    const countryInfo = userCountryCode ? countries[userCountryCode] : null;


    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-section p-5 text-center">
                <h4>Tu carrito está vacío</h4>
                <p class="text-white-50">Parece que aún no has añadido ningún producto. ¡Explora nuestra tienda!</p>
                <a href="tienda.html" class="btn btn-primary cta-button mt-3">Ir a la Tienda</a>
            </div>
        `;
        if (totalPriceEl) totalPriceEl.textContent = '$0.00';
        if (subtotalPriceEl) subtotalPriceEl.textContent = '$0.00';
        return;
    }

    const itemsHTML = cart.map(item => {
        const localPrice = countryInfo ? item.price * countryInfo.rate : item.price;
        const localTotal = countryInfo ? (item.price * item.quantity) * countryInfo.rate : (item.price * item.quantity);
        const currency = countryInfo ? countryInfo.currency : 'USD';

        return `
            <div class="cart-item d-flex justify-content-between align-items-center p-3 mb-3">
                <div class="flex-grow-1">
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="text-white-50 mb-0">${localPrice.toLocaleString('es-AR', { style: 'currency', currency: currency, minimumFractionDigits: countryInfo ? 0 : 2 })} c/u</p>
                </div>
                <div class="quantity-controls d-flex align-items-center mx-4">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="mx-3 fs-5">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="item-total fs-5 fw-bold mx-4" style="min-width: 120px; text-align: right;">
                    ${localTotal.toLocaleString('es-AR', { style: 'currency', currency: currency, minimumFractionDigits: countryInfo ? 0 : 2 })}
                </div>
                <button class="btn btn-outline-danger" onclick="removeFromCart(${item.id})"><i class="bi bi-trash3-fill"></i></button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="cart-section p-4">
            ${itemsHTML}
            <div class="text-end mt-3">
                <button class="btn btn-danger" onclick="emptyCart()">Vaciar Carrito</button>
            </div>
        </div>
    `;

    // Actualizar total
    const totalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalLocal = countryInfo ? totalUSD * countryInfo.rate : totalUSD;
    const currency = countryInfo ? countryInfo.currency : 'USD';
    const formattedTotal = totalLocal.toLocaleString('es-AR', { style: 'currency', currency: currency, minimumFractionDigits: countryInfo ? 0 : 2 });

    if (totalPriceEl) totalPriceEl.textContent = formattedTotal;
    if (subtotalPriceEl) subtotalPriceEl.textContent = formattedTotal;
}

// Notificación
function showNotification(message) {
    // Crear notificación simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Finalizar compra
document.addEventListener('DOMContentLoaded', function() {
    const payWithBalanceBtn = document.getElementById('pay-with-balance-btn');
    if (payWithBalanceBtn) {
        payWithBalanceBtn.addEventListener('click', payWithBalance);
    }
    
    // Renderizar carrito si estamos en la página del carrito
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
    
    // Pre-rellenar el email para pagar con saldo si el usuario ya "inició sesión"
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const payWithBalanceEmailInput = document.getElementById('pay-with-balance-email');
    if (currentUserEmail && payWithBalanceEmailInput) {
        payWithBalanceEmailInput.value = currentUserEmail;
    }

    updateCartCount();
});