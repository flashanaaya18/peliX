import { Link } from 'react-router-dom';
import { useRef } from 'react';

const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const Carousel = ({ title, movies }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += direction * carouselRef.current.offsetWidth;
    }
  };

  return (
    <div className="peliculas-recomendadas">
      <div className="contenedor-titulo-controles"><h3>{title}</h3></div>
      <div className="contenedor-principal">
        <button onClick={() => scroll(-1)} role="button" className="flecha-izquierda"><i className="fa-solid fa-angle-left"></i></button>
        <div className="contenedor-carousel" ref={carouselRef}>
          {movies.map(movie => movie.poster_path && (
            <div key={movie.id} className="pelicula">
              <Link to={`/movie/${movie.id}`}><img src={`${IMG_BASE_URL}${movie.poster_path}`} alt={movie.title} /></Link>
            </div>
          ))}
        </div>
        <button onClick={() => scroll(1)} role="button" className="flecha-derecha"><i className="fa-solid fa-angle-right"></i></button>
      </div>
    </div>
  );
};

export default Carousel;