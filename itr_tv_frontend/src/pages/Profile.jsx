import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as api from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-condensed font-bold uppercase text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", bio: "" });
  const [username, setUsername] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .getMe()
      .then(({ data }) => {
        setUsername(data.username);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
        });
        setCurrentAvatar(data.avatar || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("phone", form.phone);
      fd.append("bio", form.bio);
      if (avatarFile) fd.append("avatar", avatarFile);
      const { data } = await api.updateMe(fd);
      setCurrentAvatar(data.avatar || "");
      setAvatarFile(null);
      setSuccess(true);
      refreshUser?.();
    } catch (err) {
      setError(err.response?.data?.phone?.[0] || "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 animate-pulse text-gray-400">Chargement...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-1">Mon profil</h1>
      <p className="text-sm text-gray-500 mb-6">Connecté en tant que <strong>{username}</strong></p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-condensed font-bold uppercase text-gray-500 mb-1.5">Photo</label>
          {(avatarFile || currentAvatar) && (
            <img
              src={avatarFile ? URL.createObjectURL(avatarFile) : currentAvatar}
              alt="Aperçu"
              className="h-20 w-20 rounded-full object-cover mb-2 bg-gray-100"
            />
          )}
          <input
            type="file" accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-3 file:rounded-full file:border-0 file:bg-itr-blue/10 file:text-itr-blue file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom">
            <input name="first_name" value={form.first_name} onChange={handleChange} className={inputClass} />
          </Field>
          <Field label="Nom">
            <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} />
          </Field>
        </div>

        <Field label="Téléphone">
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Ex : +229 01 00 00 00 00" className={inputClass} />
        </Field>

        <Field label="Bio (affichée sur la page Rédaction si vous êtes journaliste/admin)">
          <textarea name="bio" rows={5} value={form.bio} onChange={handleChange} className={`${inputClass} resize-none`} />
        </Field>

        {error && <p className="text-sm text-itr-red">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">✓ Profil mis à jour.</p>}

        <button
          disabled={saving}
          className="bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
