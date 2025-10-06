// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Homepage from "./pages/Homepage.jsx";
import NewsPage from "./pages/NewsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,           // layout
    // errorElement: <ErrorPage />, // (optionnel) pour gérer joliment les erreurs
    children: [
      { index: true, element: <Homepage /> }, // route "/"
      { path: "news", element: <NewsPage /> } // route "/news"
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
