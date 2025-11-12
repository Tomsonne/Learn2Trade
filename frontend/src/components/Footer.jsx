
// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <nav className="mb-2 flex items-center justify-center gap-6">
          <a className="hover:text-slate-700 dark:hover:text-slate-200" href="#">Conditions d’utilisation</a>
          <a className="hover:text-slate-700 dark:hover:text-slate-200" href="#">Confidentialité</a>
          <a className="hover:text-slate-700 dark:hover:text-slate-200" href="#">Contact</a>
        </nav>
        <p>© {new Date().getFullYear()} SkillVest. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
