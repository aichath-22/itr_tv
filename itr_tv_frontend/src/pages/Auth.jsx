import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(form.username, form.password);
      } else {
        await signUp(form);
      }
      navigate("/");
    } catch {
      setError(
        mode === "login"
          ? "Identifiants incorrects. Vérifie ton nom d'utilisateur et ton mot de passe."
          : "Impossible de créer le compte. Vérifie les informations saisies."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex mb-8 rounded-full bg-itr-paper p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full text-sm font-condensed font-bold uppercase transition-colors ${
              mode === "login" ? "bg-itr-blue text-white" : "text-itr-ink"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-full text-sm font-condensed font-bold uppercase transition-colors ${
              mode === "register" ? "bg-itr-blue text-white" : "text-itr-ink"
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                name="first_name"
                placeholder="Prénom"
                onChange={handleChange}
                className="rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
              />
              <input
                name="last_name"
                placeholder="Nom"
                onChange={handleChange}
                className="rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
              />
            </div>
          )}
          <input
            name="username"
            placeholder="Nom d'utilisateur"
            required
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
          />
          {mode === "register" && (
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
            />
          )}
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            required
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
          />

          {error && <p className="text-sm text-itr-red">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Un instant..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          <Link to="/" className="hover:text-itr-blue">Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}
