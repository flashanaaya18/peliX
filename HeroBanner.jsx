import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';

const HeroBanner = ({ movies }) => {
  const [randomMovie, setRandomMovie] = useState(null);

  useEffect(() => {
    if (movies && movies.length > 0) {
      const movie = movies[Math.floor(Math.random() * movies.length)];
      setRandomMovie(movie);
    }
  }, [movies]);

  if (!randomMovie) {
    return <div className="pelicula-principal" style={{ minHeight: '40.62em' }}></div>; // Placeholder
  }

  const backgroundUrl = `${IMG_BASE_URL}original${randomMovie.backdrop_path}`;

  return (
    <div className="pelicula-principal" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, .50) 0%, rgba(0,0,0,.50) 100%), url(${backgroundUrl})` }}>
      <div className="contenedor">
        <h3 className="titulo">{randomMovie.title}</h3>
        <p className="descripcion">{randomMovie.overview}</p>
        <Link to={`/movie/${randomMovie.id}`} role="button" className="boton">
          <i className="fa-solid fa-play"></i>Reproducir
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;