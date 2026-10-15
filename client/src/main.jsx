// src/main.jsx — Application Entry Point
// Mounts the React application into the DOM with BrowserRouter for client-side routing.
//
// React DOM createRoot: https://react.dev/reference/react-dom/client/createRoot
// React Router BrowserRouter: https://reactrouter.com/en/main/router-components/browser-router
// React StrictMode: https://react.dev/reference/react/StrictMode

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
