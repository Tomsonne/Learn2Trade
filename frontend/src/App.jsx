// App.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import SidebarLayout from "./components/Sidebar.jsx";

const NO_SIDEBAR = new Set(["/", "/login", "/signup"]);

export default function App() {
  const { pathname } = useLocation();
  const hideSidebar = NO_SIDEBAR.has(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1">
        {hideSidebar ? (
          // pas de sidebar sur /, /login, /signup
          <div className="p-5">
            <Outlet />
          </div>
        ) : (
          // layout avec sidebar pour le reste
          <SidebarLayout>
            <Outlet />
          </SidebarLayout>
        )}
      </main>
      <Footer />
    </div>
  );
}
