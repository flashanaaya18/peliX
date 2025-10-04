window.addEventListener('DOMContentLoaded', async () => {
    // Obtener los parámetros de la URL
    const params = new URLSearchParams(window.location.search);

    const id = params.get('id'); // El ID único de la película
    const title = params.get('title');
    const description = params.get('desc');
    const background = params.get('bg');
    const videoId = params.get('video');
    const poster = params.get('poster'); // Necesitamos el poster para guardarlo

    // Seleccionar los elementos del DOM
    const detalleContainer = document.querySelector('.detalle-pelicula');
    const tituloElemento = document.querySelector('.titulo-detalle');
    const descripcionElemento = document.querySelector('.descripcion-detalle');
    const botonReproducir = document.querySelector('.boton-reproducir');
    const btnMiLista = document.getElementById('btn-mi-lista');

    // Actualizar el contenido de la página
    document.title = title; // Actualiza el título de la pestaña del navegador
    detalleContainer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, .7) 0%, rgba(0,0,0,.7) 100%), url(${background})`;
    tituloElemento.textContent = title;
    descripcionElemento.textContent = description;
    
    // --- Lógica para "Vistos Recientemente" ---
    const peliculaActual = { id, videoId, background, title, description, poster };
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    // Eliminar si ya existe para volver a añadirlo al final (más reciente)
    recentlyViewed = recentlyViewed.filter(p => p.id !== id);
    recentlyViewed.push(peliculaActual);
    // Limitar la lista a las últimas 20 vistas, por ejemplo
    if (recentlyViewed.length > 20) {
        recentlyViewed.shift();
    }
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));

    const user = auth.getUser();

    // --- Lógica de Mi Lista ---
    let userFavorites = user ? await getFavorites(user.id) : [];
    
    const actualizarBotonMiLista = () => {
        if (!user) {
            btnMiLista.style.display = 'none'; // Ocultar si no hay usuario
            return;
        }
        if (userFavorites.some(p => p.id == id)) { // Usamos == porque el id de la URL es string
            btnMiLista.innerHTML = '<i class="fa-solid fa-check"></i>'; // Ya está en la lista
        } else {
            btnMiLista.innerHTML = '<i class="fa-solid fa-plus"></i>'; // No está en la lista
        }
    };

    btnMiLista.addEventListener('click', async () => {
        if (!user) return; // No hacer nada si no hay usuario

        const isFavorited = userFavorites.some(p => p.id == id);

        if (isFavorited) {
            // Si ya está, la quitamos
            await removeFavorite(user.id, id);
        } else {
            // Si no está, la añadimos
            await addFavorite(user.id, id);
        }
        // Recargamos los favoritos para actualizar el estado del botón
        userFavorites = await getFavorites(user.id);
        actualizarBotonMiLista();
    });

    // Estado inicial del botón al cargar la página
    actualizarBotonMiLista();

    // Evento para reproducir el video
    botonReproducir.addEventListener('click', () => {
        if (videoId) {
            // Ocultar la información y el botón
            tituloElemento.style.display = 'none';
            descripcionElemento.style.display = 'none';
            botonReproducir.style.display = 'none';
            btnMiLista.style.display = 'none';

            // Crear el iframe y añadirlo al contenedor
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.title = "YouTube video player";
            iframe.frameborder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowfullscreen = true;
            document.querySelector('.video-container').appendChild(iframe);
        }
    });
});