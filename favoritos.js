let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

/**
 * Guarda la lista de favoritos en el localStorage.
 */
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

/**
 * Añade o quita un producto de la lista de favoritos.
 * @param {number} productId - El ID del producto.
 */
function toggleFavorite(productId) {
    const productIndex = favorites.indexOf(productId);
    
    if (productIndex > -1) {
        // Si ya es favorito, lo quitamos
        favorites.splice(productIndex, 1);
    } else {
        // Si no es favorito, lo añadimos
        favorites.push(productId);
    }
    
    saveFavorites();
    
    // Actualizamos la UI en la página de la tienda o inicio
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        updateFavoriteIcon(productId, productCard.querySelector('.favorite-icon'));
    }

    // Si estamos en la página de favoritos, la volvemos a renderizar
    if (document.getElementById('favorites-list')) {
        renderFavorites();
    }
}

/**
 * Comprueba si un producto está en la lista de favoritos.
 * @param {number} productId - El ID del producto.
 * @returns {boolean} - True si es favorito, false si no.
 */
function isFavorite(productId) {
    return favorites.includes(productId);
}

/**
 * Actualiza el icono de favorito en una tarjeta de producto.
 * @param {number} productId - El ID del producto.
 * @param {HTMLElement} iconElement - El elemento del icono.
 */
function updateFavoriteIcon(productId, iconElement) {
    iconElement.classList.toggle('bi-heart-fill', isFavorite(productId));
    iconElement.classList.toggle('bi-heart', !isFavorite(productId));
}