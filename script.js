let products = [];

// Script para las partículas del fondo (movido desde peliX.html)
function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Posición aleatoria
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Tamaño aleatorio
        const size = Math.random() * 8 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Animación aleatoria
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        container.appendChild(particle);
    }
}

function initializeProducts() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Si no hay productos en localStorage, usamos los de por defecto.
        // Los precios están en MXN y se convertirán a USD.
        const mxnRate = 17; // Tasa de cambio de MXN a USD
        products = [
            { _countries: { "AR": { name: "Argentina", currency: "ARS", rate: 900 }, "BO": { name: "Bolivia", currency: "BOB", rate: 6.9 }, "CL": { name: "Chile", currency: "CLP", rate: 980 }, "CO": { name: "Colombia", currency: "COP", rate: 3900 }, "CR": { name: "Costa Rica", currency: "CRC", rate: 515 }, "CU": { name: "Cuba", currency: "CUP", rate: 24 }, "EC": { name: "Ecuador", currency: "USD", rate: 1 }, "SV": { name: "El Salvador", currency: "USD", rate: 1 }, "GT": { name: "Guatemala", currency: "GTQ", rate: 7.8 }, "HN": { name: "Honduras", currency: "HNL", rate: 24.7 }, "MX": { name: "México", currency: "MXN", rate: mxnRate }, "NI": { name: "Nicaragua", currency: "NIO", rate: 36.6 }, "PA": { name: "Panamá", currency: "PAB", rate: 1 }, "PY": { name: "Paraguay", currency: "PYG", rate: 7300 }, "PE": { name: "Perú", currency: "PEN", rate: 3.7 }, "PR": { name: "Puerto Rico", currency: "USD", rate: 1 }, "DO": { name: "República Dominicana", currency: "DOP", rate: 59 }, "UY": { name: "Uruguay", currency: "UYU", rate: 39 }, "VE": { name: "Venezuela", currency: "VES", rate: 36 } } },
            { id: 1, name: "Nexflix perfil", price: 45 / mxnRate, featured: true, description: "Acceso ilimitado a películas, series y documentales galardonados. Disfruta en 4K en todos tus dispositivos." },
            { id: 2, name: "nexflix completa", price: 70 / mxnRate, featured: true, description: "El plan premium de Nexflix. Incluye 4 pantallas simultáneas, calidad Ultra HD y descargas en 6 dispositivos." },
            { id: 3, name: "Diseney perfil", price: 50 / mxnRate, featured: true, description: "Todo el catálogo de Disney, Pixar, Marvel, Star Wars y National Geographic en un solo lugar. Ideal para toda la familia." },
            { id: 4, name: "disney completa", price: 35 / mxnRate, featured: true, description: "Una selección curada de los mejores estrenos de cine y series aclamadas por la crítica. Calidad HD." },
            { id: 5, name: "hbo max perfil", price: 45 / mxnRate, featured: true, description: "El paquete definitivo para cinéfilos. Acceso a un vasto archivo de cine clásico, de culto e independiente de todo el mundo." },
            { id: 6, name: "hbo max completa", price: 65 / mxnRate, featured: false, description: "Contenido exclusivo de nuestros estudios asociados, con estrenos semanales y acceso anticipado." },
            { id: 7, name: "youtube preimium individual", price: 25 / mxnRate, featured: false, description: "Una plataforma social para ver películas con amigos. Incluye chat de video y sincronización de reproducción." },
            { id: 8, name: "crunchyroll perfil", price: 35 / mxnRate, featured: true, description: "contenido de meganfan"},
            { id: 9, name: "crunchyroll cuenta completa", price: 60 / mxnRate, featured: true, description: "contenido de meganfan cuenta completa"},
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Función para renderizar productos
function renderProducts(productsArray, containerId, showFeaturedOnly = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Obtener preferencias de moneda del usuario actual
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
    const userCountryCode = currentUserEmail ? (userPreferences[currentUserEmail]?.country || '') : '';
    const countries = products[0]._countries;
    const countryInfo = userCountryCode ? countries[userCountryCode] : null;

    const filteredProducts = showFeaturedOnly 
        ? productsArray.filter(product => product.featured && product.id)
        : productsArray.filter(p => p.id); // Filtramos el objeto de países

    container.innerHTML = filteredProducts.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 col-6">
            <div class="product-card h-100" data-id="${product.id}" data-bs-toggle="modal" data-bs-target="#productDetailModal" style="cursor: pointer;">
                <i class="bi ${isFavorite(product.id) ? 'bi-heart-fill' : 'bi-heart'} favorite-icon" onclick="event.stopPropagation(); toggleFavorite(${product.id});"></i>
                <div class="product-card-content">
                    <h4>${product.name}</h4>
                    <div class="price">
                        ${countryInfo 
                            ? `${(product.price * countryInfo.rate).toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}`
                            : `$${product.price.toFixed(2)} <span class="fs-6 text-white-50">USD</span>`
                        }
                    </div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id});">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initializeCountrySelector() {
    const dropdown = document.getElementById('country-selector-dropdown');
    const flagDisplay = document.getElementById('country-flag-display');
    const dropdownMobile = document.getElementById('country-selector-dropdown-mobile');
    const currencyDisplay = document.getElementById('country-currency-display');

    if (!dropdown || !products[0]?._countries) return;

    const countries = products[0]._countries;

    // Añadir opción por defecto (USD)
    dropdown.innerHTML += `<li><a class="dropdown-item" href="#" data-country-code="">Predeterminado (USD)</a></li>`;
    if (dropdownMobile) dropdownMobile.innerHTML += `<li><a class="dropdown-item" href="#" data-country-code="">Predeterminado (USD)</a></li>`;

    // Poblar el dropdown con países
    for (const code in countries) {
        dropdown.innerHTML += `<li><a class="dropdown-item" href="#" data-country-code="${code}">${countries[code].name}</a></li>`;
        if (dropdownMobile) dropdownMobile.innerHTML += `<li><a class="dropdown-item" href="#" data-country-code="${code}">${countries[code].name}</a></li>`;
    }

    // Función para actualizar la UI del selector
    function updateSelectorUI(countryCode) {
        if (countryCode && countries[countryCode]) {
            const countryInfo = countries[countryCode];
            flagDisplay.innerHTML = `<img src="https://flagcdn.com/w20/${countryCode.toLowerCase()}.png" alt="${countryCode}">`;
            currencyDisplay.textContent = countryInfo.currency;
        } else {
            flagDisplay.innerHTML = `<i class="bi bi-globe"></i>`;
            currencyDisplay.textContent = 'USD';
        }
    }

    // Cargar preferencia guardada al iniciar
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
    const savedCountryCode = currentUserEmail ? (userPreferences[currentUserEmail]?.country || '') : '';
    updateSelectorUI(savedCountryCode);

    // Event listener para el cambio de país
    function handleCountryChange(e) {
        e.preventDefault();
        const target = e.target;
        if (target.tagName === 'A') {
            const countryCode = target.dataset.countryCode;
            const email = localStorage.getItem('currentUserEmail');
            if (email) {
                if (!userPreferences[email]) userPreferences[email] = {};
                userPreferences[email].country = countryCode;
                localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            }
            updateSelectorUI(countryCode);
            // Volver a renderizar los productos con la nueva moneda
            if (document.getElementById('featured-products')) renderProducts(products, 'featured-products', true);
            if (document.getElementById('all-products')) renderProducts(products, 'all-products', false);
        }
    }

    dropdown.addEventListener('click', handleCountryChange);
    if (dropdownMobile) dropdownMobile.addEventListener('click', handleCountryChange);
}

function initializeWelcomeModal() {
    const welcomeModalEl = document.getElementById('welcomeModal');
    if (!welcomeModalEl) return;

    const welcomeModal = new bootstrap.Modal(welcomeModalEl);
    const welcomeForm = document.getElementById('welcome-form');
    const welcomeCountrySelect = document.getElementById('welcome-country');

    // Si el usuario no está "logueado", mostramos el modal
    if (!localStorage.getItem('currentUserEmail')) {
        // Poblar el selector de país en el modal
        const countries = products[0]._countries;
        welcomeCountrySelect.innerHTML = '<option value="" selected disabled>Selecciona tu país...</option>';
        for (const code in countries) {
            welcomeCountrySelect.innerHTML += `<option value="${code}">${countries[code].name}</option>`;
        }
        welcomeModal.show();
    }

    // Guardar la información del usuario
    welcomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('welcome-email').value.trim().toLowerCase();
        const countryCode = welcomeCountrySelect.value;

        if (!email || !countryCode) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Guardar email y preferencia de país
        localStorage.setItem('currentUserEmail', email);
        let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        if (!userPreferences[email]) userPreferences[email] = {};
        userPreferences[email].country = countryCode;
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

        // Recargar la página para que todos los componentes se actualicen
        window.location.reload();
    });
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos desde localStorage o usar los de por defecto
    initializeProducts();

    // Crear partículas del fondo
    createParticles();

    // Renderizar productos destacados en index.html
    if (document.getElementById('featured-products')) {
        renderProducts(products, 'featured-products', true);
    }
    
    // Renderizar todos los productos en tienda.html
    if (document.getElementById('all-products')) {
        renderProducts(products, 'all-products', false);
    }

    // Lógica para la barra de búsqueda en tienda.html
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.getElementById('category-filters'); // PC

    if (searchInput && categoryFilters) {
        let currentFilter = 'all';
        let currentSearchTerm = '';

        function applyFilters() {
            let filtered = products.filter(p => p.id); // Empezar con todos los productos reales

            // Aplicar filtro de categoría
            if (currentFilter !== 'all') {
                if (currentFilter === 'featured') {
                    filtered = filtered.filter(p => p.featured);
                } else {
                    filtered = filtered.filter(p => p.name.toLowerCase().includes(currentFilter));
                }
            }

            // Aplicar filtro de búsqueda
            if (currentSearchTerm) {
                filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearchTerm));
            }

            renderProducts(filtered, 'all-products', false);
        }

        function handleSearch(e) { currentSearchTerm = e.target.value.toLowerCase(); applyFilters(); }
        function handleFilter(e) {
            if (e.target.tagName === 'BUTTON') {
                document.querySelectorAll('.filter-group button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                applyFilters();
            }
        }

        searchInput.addEventListener('input', handleSearch);
        categoryFilters.addEventListener('click', handleFilter);
    }

    // Renderizar favoritos en favoritos.html
    if (document.getElementById('favorites-list')) {
        renderFavorites();
    }
    
    // Inicializar el nuevo selector de país
    initializeCountrySelector();

    // Inicializar el modal de bienvenida si es necesario
    initializeWelcomeModal();

    // Lógica para el modal de detalles del producto
    const productDetailModal = document.getElementById('productDetailModal');
    if (productDetailModal) {
        productDetailModal.addEventListener('show.bs.modal', function (event) {
            const card = event.relatedTarget; // La tarjeta de producto que activó el modal
            const productId = parseInt(card.dataset.id);
            const product = products.find(p => p.id === productId);

            if (!product) return;

            // Obtener preferencias de moneda
            const currentUserEmail = localStorage.getItem('currentUserEmail');
            const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
            const userCountryCode = currentUserEmail ? (userPreferences[currentUserEmail]?.country || '') : '';
            const countryInfo = userCountryCode ? products[0]._countries[userCountryCode] : null;

            // Poblar el modal con la información del producto
            document.getElementById('modalProductTitle').textContent = product.name;
            document.getElementById('modalProductDescription').textContent = product.description;
            
            const priceEl = document.getElementById('modalProductPrice');
            priceEl.innerHTML = countryInfo 
                ? `${(product.price * countryInfo.rate).toLocaleString('es-AR', { style: 'currency', currency: countryInfo.currency, minimumFractionDigits: 0 })}`
                : `$${product.price.toFixed(2)} <span class="fs-6 text-white-50">USD</span>`;

            const addToCartBtn = document.getElementById('modalAddToCartBtn');
            addToCartBtn.onclick = () => addToCart(productId);
        });
    }

    // Actualizar contador del carrito
    updateCartCount();
});

function renderFavorites() {
    const container = document.getElementById('favorites-list');
    if (!container) return;

    const favoriteProducts = products.filter(p => isFavorite(p.id));

    if (favoriteProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="cart-section p-5">
                    <h4>Aún no tienes favoritos</h4>
                    <p class="text-white-50">Haz clic en el corazón de los productos que te gusten para guardarlos aquí.</p>
                    <a href="tienda.html" class="btn btn-primary cta-button mt-3">Explorar Tienda</a>
                </div>
            </div>`;
        return;
    }

    renderProducts(favoriteProducts, 'favorites-list', false);
}