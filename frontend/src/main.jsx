import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';                    // ← ici UNIQUEMENT
import App from './App.jsx';
import HomePage from './pages/Homepage.jsx';
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";


const router = createBrowserRouter([
  { path: '/', element: <App />, children: [{ index: true, element: <HomePage /> },{ path: "login", element: <Login /> }] },
  { path: "signup", element: <Signup /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
