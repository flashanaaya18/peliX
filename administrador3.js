document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('product-form');
    const giftCodeGeneratorForm = document.getElementById('gift-code-generator-form');
    const codeTypeSelect = document.getElementById('code-type');
    const codeValueContainer = document.getElementById('code-value-container');
    const generatedCodesContainer = document.getElementById('generated-codes-container');
    const generatedCodesOutput = document.getElementById('generated-codes-output');
    const productsTbody = document.getElementById('products-tbody');
    const stockModal = new bootstrap.Modal(document.getElementById('stockModal'));
    const addAccountForm = document.getElementById('add-account-form');
    const editAccountModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    const editAccountForm = document.getElementById('edit-account-form');
    const sendAccountModal = new bootstrap.Modal(document.getElementById('sendAccountModal'));
    const sendAccountForm = document.getElementById('send-account-form');
    const generateCredentialsBtn = document.getElementById('generate-credentials-btn');
    const stockToastEl = document.getElementById('stock-toast');
    const stockToast = new bootstrap.Toast(stockToastEl);
    let currentProductId = null;
    let currentAccountId = null;

    const defaultProducts = [
        { _countries: { "AR": { name: "Argentina", currency: "ARS", rate: 900 }, "BO": { name: "Bolivia", currency: "BOB", rate: 6.9 }, "CL": { name: "Chile", currency: "CLP", rate: 980 }, "CO": { name: "Colombia", currency: "COP", rate: 3900 }, "CR": { name: "Costa Rica", currency: "CRC", rate: 515 }, "CU": { name: "Cuba", currency: "CUP", rate: 24 }, "EC": { name: "Ecuador", currency: "USD", rate: 1 }, "SV": { name: "El Salvador", currency: "USD", rate: 1 }, "GT": { name: "Guatemala", currency: "GTQ", rate: 7.8 }, "HN": { name: "Honduras", currency: "HNL", rate: 24.7 }, "MX": { name: "México", currency: "MXN", rate: 17 }, "NI": { name: "Nicaragua", currency: "NIO", rate: 36.6 }, "PA": { name: "Panamá", currency: "PAB", rate: 1 }, "PY": { name: "Paraguay", currency: "PYG", rate: 7300 }, "PE": { name: "Perú", currency: "PEN", rate: 3.7 }, "PR": { name: "Puerto Rico", currency: "USD", rate: 1 }, "DO": { name: "República Dominicana", currency: "DOP", rate: 59 }, "UY": { name: "Uruguay", currency: "UYU", rate: 39 }, "VE": { name: "Venezuela", currency: "VES", rate: 36 } } },
        { id: 1, name: "Nexflix", price: 9.99, featured: true },
        { id: 2, name: "nexflix completa", price: 19.99, featured: true},
        { id: 3, name: "Diseney", price: 12.50, featured: true },
        { id: 4, name: "CineMax Basic", price: 7.99, featured: true },
        { id: 5, name: "FilmBox Ultimate", price: 15.99, featured: true },
        { id: 6, name: "StudioPlay", price: 10.00, featured: false },
        { id: 7, name: "MovieHub", price: 8.25, featured: false }
    ];
    let products = JSON.parse(localStorage.getItem('products')) || defaultProducts;

    function getProducts() {
        const products = localStorage.getItem('products');
        return products ? JSON.parse(products) : defaultProducts;
    }

    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function getProductStock() {
        const stock = localStorage.getItem('productStock');
        return stock ? JSON.parse(stock) : {};
    }

    function saveProductStock(stock) {
        localStorage.setItem('productStock', JSON.stringify(stock));
    }

    function renderProducts() {
        const products = getProducts();
        const stock = getProductStock();
        productsTbody.innerHTML = '';
        products.filter(p => p.id).forEach(product => {
            const productStock = stock[product.id] || [];
            const availableStock = productStock.filter(acc => acc.status === 'available').length;
            const soldStock = productStock.length - availableStock;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <span class="badge bg-success">${availableStock} Disp.</span>
                    <span class="badge bg-secondary">${soldStock} Vend.</span>
                </td>
                <td>
                    <button class="btn btn-info btn-sm me-2" data-id="${product.id}" data-action="manage-stock">Gestionar</button>
                    <button class="btn btn-danger btn-sm" data-id="${product.id}" data-action="delete-product">
                        <i class="bi bi-trash" title="Eliminar Producto"></i>
                    </button>
                </td>
            `;
            if (availableStock === 0) {
                tr.classList.add('table-danger');
                tr.title = 'Este producto está agotado';
            }
            productsTbody.appendChild(tr);
        });
    }

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const priceInMXN = parseFloat(document.getElementById('product-price').value);
        const featured = document.getElementById('product-featured').checked;

        // Convertir el precio de MXN a USD antes de guardarlo
        const mxnRate = defaultProducts[0]._countries.MX.rate; // Obtenemos la tasa de cambio
        const priceInUSD = priceInMXN / mxnRate;

        let products = getProducts();
        const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);

        const newProduct = {
            id: maxId + 1,
            name,
            price: priceInUSD, // Guardamos el precio convertido a USD
            featured
        };

        products.push(newProduct);
        saveProducts(products);
        renderProducts();
        productForm.reset();
        alert('¡Producto añadido con éxito!');
    });

    productsTbody.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const productId = parseInt(button.dataset.id);
        const action = button.dataset.action;

        if (action === 'delete-product') {
            if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${productId} y todo su stock?`)) {
                let products = getProducts();
                products = products.filter(p => p.id !== productId);
                saveProducts(products);

                let stock = getProductStock();
                delete stock[productId];
                saveProductStock(stock);

                renderProducts();
            }
        } else if (action === 'manage-stock') {
            currentProductId = productId;
            const products = getProducts();
            const productName = products.find(p => p.id === productId).name;
            document.getElementById('modal-product-name').textContent = productName;
            renderAccountsForModal(productId);
            stockModal.show();
            // Generar credenciales automáticamente al abrir el modal
            generateAndSetCredentials();
        }
    });

    function renderAccountsForModal(productId) {
        const stock = getProductStock();
        const accounts = stock[productId] || [];
        const container = document.getElementById('accounts-list');
        
        if (accounts.length === 0) {
            container.innerHTML = '<p class="text-white-50">No hay cuentas para este producto.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table table-dark table-sm">
                <thead><tr><th>Correo</th><th>Contraseña</th><th>Estado</th><th>Acción</th></tr></thead>
                <tbody>
                    ${accounts.map(acc => {
                        const isAvailable = acc.status === 'available';
                        return `
                        <tr>
                            <td>${acc.email}</td>
                            <td>${acc.pass}</td>
                            <td>${isAvailable ? '<span class="badge bg-success">Disponible</span>' : '<span class="badge bg-danger">Vendido</span>'}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" data-action="edit" data-acc-id="${acc.id}" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                                ${isAvailable ? `<button class="btn btn-success btn-sm ms-1" data-action="send" data-acc-id="${acc.id}" title="Enviar a Usuario"><i class="bi bi-send-fill"></i></button>` : `<button class="btn btn-warning btn-sm ms-1" data-action="reactivate" data-acc-id="${acc.id}" title="Reactivar"><i class="bi bi-arrow-clockwise"></i></button>`}
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        `;
    }

    addAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('account-email').value;
        const pass = document.getElementById('account-password').value;
        
        let stock = getProductStock();
        if (!stock[currentProductId]) {
            stock[currentProductId] = [];
        }
        stock[currentProductId].push({ id: Date.now(), email, pass, status: 'available' });
        saveProductStock(stock);
        renderAccountsForModal(currentProductId);
        renderProducts(); // Actualizar el contador de stock en la tabla principal
        addAccountForm.reset();
    });

    document.getElementById('accounts-list').addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const accountId = parseInt(button.dataset.accId);
        const action = button.dataset.action;
        currentAccountId = accountId; // Guardar el ID de la cuenta actual

        if (action === 'reactivate') {
            let stock = getProductStock();
            const account = stock[currentProductId]?.find(acc => acc.id === accountId);
            if (account && confirm(`¿Seguro que quieres reactivar la cuenta ${account.email}?`)) {
                account.status = 'available';
                saveProductStock(stock);
                renderAccountsForModal(currentProductId);
                renderProducts();
            }
        } else if (action === 'edit') {
            let stock = getProductStock();
            const account = stock[currentProductId]?.find(acc => acc.id === accountId);
            if (account) {
                document.getElementById('edit-account-id').value = accountId;
                document.getElementById('edit-account-email').value = account.email;
                document.getElementById('edit-account-password').value = account.pass;
                editAccountModal.show();
            }
        } else if (action === 'send') {
            sendAccountModal.show();
        }
    });

    editAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const accountId = parseInt(document.getElementById('edit-account-id').value);
        const newEmail = document.getElementById('edit-account-email').value;
        const newPassword = document.getElementById('edit-account-password').value;

        let stock = getProductStock();
        const account = stock[currentProductId]?.find(acc => acc.id === accountId);

        if (account) {
            account.email = newEmail;
            account.pass = newPassword;
            saveProductStock(stock);
            renderAccountsForModal(currentProductId);
            editAccountModal.hide();
            alert('¡Cuenta actualizada!');
        }
    });

    sendAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userEmail = document.getElementById('send-to-user-email').value.trim().toLowerCase();
        if (!userEmail) {
            alert('Por favor, introduce el correo del usuario.');
            return;
        }

        let stock = getProductStock();
        const account = stock[currentProductId]?.find(acc => acc.id === currentAccountId);

        if (account) {
            // Marcar la cuenta como vendida
            account.status = 'sold';
            saveProductStock(stock);

            // Añadir la cuenta al historial de compras del usuario
            let userPurchases = JSON.parse(localStorage.getItem('userPurchases')) || {};
            if (!userPurchases[userEmail]) {
                userPurchases[userEmail] = [];
            }
            const products = getProducts();
            const productName = products.find(p => p.id === currentProductId).name;
            userPurchases[userEmail].push({ ...account, productName });
            localStorage.setItem('userPurchases', JSON.stringify(userPurchases));

            // Actualizar vistas
            renderAccountsForModal(currentProductId);
            renderProducts();
            sendAccountModal.hide();
            sendAccountForm.reset();

            // Notificar si el stock llega a cero
            const newStock = getProductStock()[currentProductId] || [];
            if (newStock.filter(acc => acc.status === 'available').length === 0) {
                const notificationData = { productId: currentProductId, productName };
                localStorage.setItem('stockNotification', JSON.stringify(notificationData));
                showStockNotification(notificationData);
            }

            alert(`Cuenta enviada con éxito a ${userEmail}.`);
        }
    });

    // --- Lógica de Generador de Códigos ---

    codeTypeSelect.addEventListener('change', () => {
        if (codeTypeSelect.value === 'nada') {
            codeValueContainer.classList.add('d-none');
        } else {
            codeValueContainer.classList.remove('d-none');
        }
    });

    giftCodeGeneratorForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const quantity = parseInt(document.getElementById('code-quantity').value);
        const type = document.getElementById('code-type').value;
        const value = document.getElementById('code-value').value;

        if ((type === 'saldo' || type === 'logro') && !value) {
            alert('Por favor, introduce un valor para el tipo de recompensa seleccionado.');
            return;
        }

        let giftCodes = JSON.parse(localStorage.getItem('giftCodes')) || {};
        const newCodes = [];

        for (let i = 0; i < quantity; i++) {
            const code = generateRandomCode(12, 4);
            
            const codeData = {
                type: type,
                used: false
            };

            if (type === 'saldo') {
                codeData.value = parseFloat(value);
            } else if (type === 'logro') {
                codeData.value = value; // ID del logro
            }

            giftCodes[code] = codeData;
            newCodes.push(code);
        }

        localStorage.setItem('giftCodes', JSON.stringify(giftCodes));

        generatedCodesOutput.value = newCodes.join('\n');
        generatedCodesContainer.classList.remove('d-none');
        alert(`${quantity} códigos generados y guardados con éxito.`);
    });

    function generateRandomCode(length, groupSize) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            if (i > 0 && i % groupSize === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function generateAndSetCredentials() {
        const randomUser = Math.random().toString(36).substring(2, 10);
        const randomPass = Math.random().toString(36).substring(2, 12);
        document.getElementById('account-email').value = `${randomUser}@tiendapelix.com`;
        document.getElementById('account-password').value = randomPass;
    }

    generateCredentialsBtn.addEventListener('click', generateAndSetCredentials);

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
            renderProducts(); // Re-renderizar la tabla para resaltar el producto
        }
    });


    renderProducts();
});