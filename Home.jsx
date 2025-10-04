import { useState, useEffect } from 'react';
import { fetchMovies } from '../api/tmdb';
import HeroBanner from '../components/HeroBanner';
import Carousel from '../components/Carousel';

const Home = () => {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      setNowPlaying(await fetchMovies('/movie/now_playing'));
      setPopular(await fetchMovies('/movie/popular'));
      setTopRated(await fetchMovies('/movie/top_rated'));
    };
    loadMovies();
  }, []);

  return (
    <>
      <HeroBanner movies={nowPlaying} />
      <div className="contenedor">
        <Carousel title="Estrenos" movies={nowPlaying} />
        <Carousel title="Populares" movies={popular} />
        <Carousel title="Mejor Calificadas" movies={topRated} />
      </div>
    </>
  );
};

export default Home;