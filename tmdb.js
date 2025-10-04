// Reemplaza 'TU_API_KEY' con la clave que obtuviste de TMDb.
const API_KEY = 'TU_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';

const apiFetch = async (endpoint) => {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=es-ES`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en la petición a la API');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchMovies = async (endpoint) => {
  const data = await apiFetch(endpoint);
  return data ? data.results : [];
};

export const fetchMovieDetail = async (movieId) => {
  return await apiFetch(`/movie/${movieId}`);
};

export const fetchMovieVideos = async (movieId) => {
  const data = await apiFetch(`/movie/${movieId}/videos`);
  return data ? data.results : [];
};

export const searchMoviesAPI = async (query) => {
  const data = await apiFetch(`/search/movie?query=${encodeURIComponent(query)}`);
  return data ? data.results : [];
};