import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth, logout } from '../api.js'; // pour gérer la session

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
})();

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/images/skillvest.png"
        alt="SkillVest"
        className="h-32 w-auto"
      />
    </Link>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    async function verify() {
      const res = await checkAuth();
      if (res.status === 'ok') {
        setUser(res.user);
      } else {
        setUser(null);
      }
    }
    verify();
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Basculer thème"
            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="size-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
            </svg>
          </button>

          {user ? (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-300">Connecté : {user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-full bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
