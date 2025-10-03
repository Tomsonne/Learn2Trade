export default function HomePage() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <section className="text-center py-20">
        <h1 className="text-4xl sm:text-6xl font-extrabold">
          Apprenez à trader, simplement.
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Forex + Crypto. Simulation. Temps réel. Zéro risque.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium">
            Commencer maintenant
          </button>
          <a className="rounded-full px-6 py-3 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
            En savoir plus
          </a>
        </div>
      </section>
    </main>
  );
}
