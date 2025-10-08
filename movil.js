document.addEventListener('DOMContentLoaded', function() {
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const cartLinkMobile = document.querySelector('.mobile-menu-link[href="carrito.html"]');
    const countrySelectorContainer = document.getElementById('mobile-country-selector');
 
    if (openMenuBtn && closeMenuBtn && mobileMenuOverlay) {
        openMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.style.transform = 'translateX(0)';
            // Actualizar el contador del carrito al abrir el menú
            const totalItems = (JSON.parse(localStorage.getItem('cart')) || []).reduce((sum, item) => sum + item.quantity, 0);
            if (cartLinkMobile) {
                cartLinkMobile.innerHTML = `Carrito (<span id="cart-count-mobile">${totalItems}</span>)`;
            }
            // Clonar y añadir el selector de país si no existe
            if (countrySelectorContainer && countrySelectorContainer.childElementCount === 0) {
                const desktopDropdown = document.querySelector('.navbar .dropdown');
                if (desktopDropdown) {
                    const clonedDropdown = desktopDropdown.cloneNode(true);
                    clonedDropdown.id = 'mobile-country-dropdown';
                    countrySelectorContainer.appendChild(clonedDropdown);
                    // Re-inicializar el dropdown de bootstrap para el elemento clonado
                    const newDropdown = new bootstrap.Dropdown(clonedDropdown.querySelector('[data-bs-toggle="dropdown"]'));
                }
            }
        });
 
        closeMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.style.transform = 'translateX(100%)';
        });
    }
});