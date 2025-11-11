import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api.js";
import { useAuthStore } from "../store";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const data = await login(email, password);

      //  nouvelle logique : cookie géré par le backend
      if (data.status === "ok") {
        navigate("/learn"); // redirection
      } else {
        setError(data.message || "Identifiants invalides");
      }
    } catch (err) {
      console.error("Erreur login:", err);
      setError("Erreur serveur");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Connexion</h2>
        <p className="text-center text-gray-500 mb-6">
          Connectez-vous à votre compte SkillVest
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium"
          >
            Se connecter
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-200 dark:bg-gray-600"></div>
          <span className="px-2 text-gray-400 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-200 dark:bg-gray-600"></div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
