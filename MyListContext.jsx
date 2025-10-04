import { createContext, useState, useEffect } from 'react';

export const MyListContext = createContext();

export const MyListProvider = ({ children }) => {
  const [myList, setMyList] = useState(() => {
    const localData = localStorage.getItem('myList');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('myList', JSON.stringify(myList));
  }, [myList]);

  const toggleMyList = (movie) => {
    setMyList(prevList => {
      const isMovieInList = prevList.some(item => item.id === movie.id);
      if (isMovieInList) {
        return prevList.filter(item => item.id !== movie.id);
      } else {
        return [...prevList, movie];
      }
    });
  };

  return (
    <MyListContext.Provider value={{ myList, toggleMyList }}>
      {children}
    </MyListContext.Provider>
  );
};