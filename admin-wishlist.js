document.addEventListener('DOMContentLoaded', async () => {
    // --- Protección de Ruta ---
    const user = auth.getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    const summaryList = document.getElementById('wishlist-summary-list');

    async function loadWishlistSummary() {
        const summary = await getWishlistSummary();
        summaryList.innerHTML = '';

        if (!summary || summary.length === 0) {
            summaryList.innerHTML = '<p>Aún no hay películas en las listas de deseos de los usuarios.</p>';
            return;
        }

        summary.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'admin-movie-item';
            const posterUrl = getMovieImageUrl(item.poster_path);

            listItem.innerHTML = `
                <div class="user-info-container">
                    <img src="${posterUrl}" alt="Poster de ${item.title}" class="user-list-avatar" style="border-radius: 4px;">
                    <span>${item.title}</span>
                </div>
                <span style="font-weight: bold; font-size: 1.2em;">${item.wish_count} <i class="fa-solid fa-star" style="color: #ffc107;"></i></span>
            `;
            summaryList.appendChild(listItem);
        });
    }

    loadWishlistSummary();
});