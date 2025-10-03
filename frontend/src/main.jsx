import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';                    // ← ici UNIQUEMENT
import App from './App.jsx';
import HomePage from './pages/Homepage.jsx';

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [{ index: true, element: <HomePage /> }] },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
