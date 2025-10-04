import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { MyListProvider } from './context/MyListContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MyListProvider>
        <App />
      </MyListProvider>
    </BrowserRouter>
  </React.StrictMode>
);