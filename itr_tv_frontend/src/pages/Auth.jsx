import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-condensed font-bold uppercase text-gray-500 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-itr-red mt-1">{error}</p>}
    </div>
  );
}

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm_password: "", first_name: "", last_name: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (next) => {
    setMode(next);
    setFieldErrors({});
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    if (mode === "register" && form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: ["Les deux mots de passe ne correspondent pas."] });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(form.username, form.password);
      } else {
        const payload = { ...form };
        delete payload.confirm_password;
        await signUp(payload);
      }
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data.detail) {
          setFormError(data.detail);
        } else {
          setFieldErrors(data);
        }
      } else {
        setFormError(
          mode === "login"
            ? "Identifiants incorrects. Vérifie ton nom d'utilisateur et ton mot de passe."
            : "Impossible de créer le compte. Vérifie les informations saisies."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex mb-8 rounded-full bg-itr-paper p-1">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-full text-sm font-condensed font-bold uppercase transition-colors ${
              mode === "login" ? "bg-itr-blue text-white" : "text-itr-ink"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => switchMode("register")}
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
              <Field label="Prénom" error={fieldErrors.first_name?.[0]}>
                <input name="first_name" value={form.first_name} onChange={handleChange} className={inputClass} />
              </Field>
              <Field label="Nom" error={fieldErrors.last_name?.[0]}>
                <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} />
              </Field>
            </div>
          )}

          <Field label="Nom d'utilisateur" error={fieldErrors.username?.[0]}>
            <input name="username" required value={form.username} onChange={handleChange} className={inputClass} />
          </Field>

          {mode === "register" && (
            <Field label="Email" error={fieldErrors.email?.[0]}>
              <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
            </Field>
          )}

          <Field label="Mot de passe" error={fieldErrors.password?.[0]}>
            <input
              name="password" type="password" required value={form.password} onChange={handleChange}
              className={inputClass}
            />
          </Field>

          {mode === "register" && (
            <Field label="Confirmer le mot de passe" error={fieldErrors.confirm_password?.[0]}>
              <input
                name="confirm_password" type="password" required value={form.confirm_password}
                onChange={handleChange} className={inputClass}
              />
            </Field>
          )}

          {formError && <p className="text-sm text-itr-red">{formError}</p>}

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
