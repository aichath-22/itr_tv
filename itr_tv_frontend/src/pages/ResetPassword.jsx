import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as api from "../api/endpoints";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    try {
      await api.confirmPasswordReset(uid, token, form.password);
      setDone(true);
      setTimeout(() => navigate("/connexion"), 2500);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
          data?.new_password?.[0] ||
          "Ce lien est invalide ou a expiré. Redemandez un nouveau lien."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <Link to="/connexion" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-itr-blue mb-8">
        <ArrowLeft size={15} /> Retour à la connexion
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-6">Nouveau mot de passe</h1>

      {done ? (
        <p className="text-sm text-green-600 leading-relaxed">
          Mot de passe mis à jour. Redirection vers la connexion...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="password" type="password" required placeholder="Nouveau mot de passe (8 caractères minimum)"
            value={form.password} onChange={handleChange} className={inputClass}
          />
          <input
            name="confirm_password" type="password" required placeholder="Confirmer le nouveau mot de passe"
            value={form.confirm_password} onChange={handleChange} className={inputClass}
          />
          {error && <p className="text-sm text-itr-red">{error}</p>}
          <button
            disabled={saving}
            className="w-full bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
      )}
    </div>
  );
}
