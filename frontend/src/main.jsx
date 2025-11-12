import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import { IndicatorsPage } from "./pages/IndicatorsPage.jsx";
import History from "./pages/History.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Trades from "./pages/Trades.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";


const router = createBrowserRouter([
  // ----------- LANDING PAGE (standalone) -----------
  {
    path: "/landingpage",
    element: <LandingPage />,
  },

  // ----------- PUBLIC (with header/footer) -----------
  {
    element: <App variant="public" />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },

  // ----------- PROTÉGÉ -----------
  {
    element: (
      <ProtectedRoute>
        <App variant="app" />
      </ProtectedRoute>
    ),
    children: [
      { path: "news", element: <NewsPage /> },
      { path: "learn", element: <IndicatorsPage /> },
      { path: "trades", element: <Trades /> },
      { path: "history", element: <History /> },
      { path: "dashboard", element: <Dashboard /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
