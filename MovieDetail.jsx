import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovieDetail, fetchMovieVideos } from '../api/tmdb';
import { MyListContext } from '../context/MyListContext';

const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const { myList, toggleMyList } = useContext(MyListContext);

  useEffect(() => {
    const getDetails = async () => {
      const movieDetails = await fetchMovieDetail(id);
      const videos = await fetchMovieVideos(id);
      setMovie(movieDetails);
      const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      setTrailer(officialTrailer);
    };
    getDetails();
  }, [id]);

  if (!movie) return <div>Cargando...</div>;

  const backgroundUrl = `${IMG_BASE_URL}original${movie.backdrop_path}`;
  const isInMyList = myList.some(item => item.id === movie.id);

  const handlePlay = () => {
    if (trailer) setShowPlayer(true);
    else alert('No hay trailer disponible para esta película.');
  };

  return (
    <div className="detalle-pelicula" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, .7) 0%, rgba(0,0,0,.7) 100%), url(${backgroundUrl})` }}>
      <div className="contenedor-detalle">
        <Link to="/" className="boton-volver"><i className="fa-solid fa-arrow-left"></i> Volver</Link>
        
        {!showPlayer ? (
          <>
            <h1 className="titulo-detalle">{movie.title}</h1>
            <p className="descripcion-detalle">{movie.overview}</p>
            <div className="botones-detalle">
              <button onClick={handlePlay} className="boton-reproducir"><i className="fa-solid fa-play"></i></button>
              <button onClick={() => toggleMyList(movie)} className="boton-mi-lista">
                <i className={`fa-solid ${isInMyList ? 'fa-check' : 'fa-plus'}`}></i>
              </button>
            </div>
          </>
        ) : (
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;