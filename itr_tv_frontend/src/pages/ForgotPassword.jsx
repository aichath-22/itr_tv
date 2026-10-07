import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as api from "../api/endpoints";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessayez dans un instant.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <Link to="/connexion" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-itr-blue mb-8">
        <ArrowLeft size={15} /> Retour à la connexion
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-2">Mot de passe oublié</h1>

      {sent ? (
        <p className="text-sm text-gray-500 leading-relaxed mt-6">
          Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé.
          Vérifiez votre boîte mail (et vos spams).
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">
            Indiquez l'email de votre compte, nous vous envoyons un lien pour choisir un nouveau mot de passe.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email" required placeholder="Ex : nom@exemple.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass}
            />
            {error && <p className="text-sm text-itr-red">{error}</p>}
            <button
              disabled={sending}
              className="w-full bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
            >
              {sending ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
