import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchMoviesAPI } from '../api/tmdb';

const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const search = async () => {
      const movies = await searchMoviesAPI(query);
      setResults(movies);
    };

    const timeoutId = setTimeout(search, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="contenedor">
      <div className="barra-busqueda">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título..." />
      </div>
      <div className="grid-resultados">
        {results.map(movie => movie.poster_path && (
          <div key={movie.id} className="pelicula">
            <Link to={`/movie/${movie.id}`}><img src={`${IMG_BASE_URL}${movie.poster_path}`} alt={movie.title} /></Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;