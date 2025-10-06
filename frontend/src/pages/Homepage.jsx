export default function HomePage() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <section className="text-center py-20 text-slate-900 dark:text-slate-100">
        <h1 className="text-4xl sm:text-6xl font-extrabold">
          Apprenez à trader, simplement.
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Forex + Crypto. Simulation. Temps réel. Zéro risque.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium">
            Commencer maintenant
          </button>
          <a
            href="#"
            className="rounded-full px-6 py-3 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            En savoir plus
          </a>
        </div>
      </section>
    </main>
  );
}
