import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : "https://learn2trade-production.up.railway.app/api/v1";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setUser(data?.status === "ok" ? data.user : null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <main className="bg-white dark:bg-gray-900">
      <section className="text-center px-6 pt-20 pb-8 text-slate-900 dark:text-slate-100">
        <h1 className="text-4xl sm:text-6xl font-extrabold">
          Apprenez à trader, simplement.
        </h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">
          Forex + Crypto. Simulation. Temps réel. Zéro risque.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {!loading && user ? (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Aller au Dashboard
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/learn")}
            >
              Commencer maintenant
            </button>
          )}

          <Link className="btn btn-outline" to="/landingpage">
            En savoir plus
          </Link>
        </div>
      </section>

      {/* Vidéo en dessous du texte */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <video
            className="w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 object-cover"
            src="/videoHomepage_faststart.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </section>
    </main>
  );
}
