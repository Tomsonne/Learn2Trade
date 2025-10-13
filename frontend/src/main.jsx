import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";

import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import { IndicatorsPage } from "./pages/IndicatorsPage.jsx";
import History from "./pages/History.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Trades from "./pages/Trades.jsx";

const router = createBrowserRouter([
  // Groupe SANS sidebar
  {
    element: <App variant="public" />,
    children: [
      { index: true, element: <Homepage /> },   // "/"
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },
  // Groupe AVEC sidebar
  {
    element: <App variant="app" />,
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
