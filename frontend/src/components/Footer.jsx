export default function Footer() {
  return (
    <footer className="mt-24 bg-gray-100 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
        <nav className="flex justify-center gap-8 mb-4">
          <a href="#" className="hover:underline">Conditions d'utilisation</a>
          <a href="#" className="hover:underline">Confidentialité</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
        <p>© {new Date().getFullYear()} Learn2Trade. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
