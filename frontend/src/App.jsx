import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import SidebarLayout from "./components/Sidebar.jsx";

/**
 * App layout unique, piloté par le prop `variant`:
 * - "public" → sans sidebar (/, /login, /signup)
 * - "app"    → avec sidebar (news, learn, trades, history, dashboard)
 */
export default function App({ variant = "public" }) {
  const withSidebar = variant === "app";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1">
        {withSidebar ? (
          <SidebarLayout>
            <Outlet />
          </SidebarLayout>
        ) : (
          <div className="p-5">
            <Outlet />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
