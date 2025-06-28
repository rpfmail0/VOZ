import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Crearemos este archivo después
import App from './App'; // Crearemos este componente después

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);