import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-compact.jpeg";

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
    <div className="flex flex-col lg:flex-row lg:min-h-[85vh]">
      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-itr-ink mb-1">
            {mode === "login" ? "Bienvenue" : "Créer un compte"}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {mode === "login"
              ? "Connectez-vous à votre espace ITR TV."
              : "Rejoignez ITR TV pour commenter, aimer et partager l'actualité."}
          </p>

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

          <p className="text-sm text-gray-500 text-center mt-6">
            {mode === "login" ? (
              <>Pas encore de compte ?{" "}
                <button onClick={() => switchMode("register")} className="text-itr-blue font-semibold hover:text-itr-blue-dark">
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button onClick={() => switchMode("login")} className="text-itr-blue font-semibold hover:text-itr-blue-dark">
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Panneau de marque */}
      <div className="hidden lg:block lg:w-[46%] relative overflow-hidden bg-itr-blue-deep">
        <div
          className="absolute inset-0 bg-itr-blue-deep"
          style={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)" }}
        />
        <div
          className="absolute inset-0 bg-itr-blue opacity-25"
          style={{ clipPath: "polygon(32% 0, 100% 0, 100% 100%, 14% 100%)" }}
        />
        <div className="relative h-full flex flex-col justify-center px-14 py-16 text-white">
          <img src={logo} alt="ITR TV" className="h-12 w-auto object-contain bg-white rounded-lg p-2 mb-10 self-start" />
          <span className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
            InfosEnTempsRéel
          </span>
          <h2 className="font-display text-4xl leading-tight mb-4 text-balance">
            L'info en temps réel.
          </h2>
          <p className="text-white/70 max-w-xs leading-relaxed">
            Articles, directs et reportages béninois — un seul endroit pour suivre, commenter et partager l'actualité qui compte.
          </p>
          <div className="mt-10 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-fit">
            <span className="h-2 w-2 rounded-full bg-itr-red animate-pulse" />
            <span className="font-condensed text-xs uppercase tracking-wide">En continu · Bénin &amp; Afrique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
