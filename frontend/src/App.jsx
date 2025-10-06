// src/App.jsx
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <Header />
      {/* ici s’affichent les pages enfants déclarées dans le router */}
      <Outlet />
      <Footer />
    </>
  );
}

