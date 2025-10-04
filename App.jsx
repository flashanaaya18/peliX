import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SearchPage from './pages/SearchPage';
import MyListPage from './pages/MyListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieDetail />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="mylist" element={<MyListPage />} />
      </Route>
    </Routes>
  );
}

export default App;