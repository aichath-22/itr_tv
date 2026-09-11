import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, IdCard } from "lucide-react";
import * as api from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

const ROLE_OPTIONS = [
  { value: "abonne", label: "Abonné" },
  { value: "journaliste", label: "Journaliste" },
  { value: "admin", label: "Administrateur" },
];

const inputClass = "rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

const EMPTY_JOURNALIST = { username: "", email: "", password: "", first_name: "", last_name: "" };

function CreateJournalistForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_JOURNALIST);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError("");
    setSuccess("");
    try {
      const { data } = await api.createJournalist(form);
      setSuccess(`Compte journaliste « ${data.username} » créé.`);
      setForm(EMPTY_JOURNALIST);
      onCreated();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") setFieldErrors(data);
      else setFormError("Impossible de créer ce compte.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="font-display text-lg text-itr-ink mb-4">Ajouter un journaliste</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input name="first_name" placeholder="Prénom" value={form.first_name} onChange={handleChange} className={`w-full ${inputClass}`} />
            {fieldErrors.first_name && <p className="text-xs text-itr-red mt-1">{fieldErrors.first_name[0]}</p>}
          </div>
          <div>
            <input name="last_name" placeholder="Nom" value={form.last_name} onChange={handleChange} className={`w-full ${inputClass}`} />
            {fieldErrors.last_name && <p className="text-xs text-itr-red mt-1">{fieldErrors.last_name[0]}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input name="username" required placeholder="Nom d'utilisateur" value={form.username} onChange={handleChange} className={`w-full ${inputClass}`} />
            {fieldErrors.username && <p className="text-xs text-itr-red mt-1">{fieldErrors.username[0]}</p>}
          </div>
          <div>
            <input name="email" type="email" required placeholder="Email" value={form.email} onChange={handleChange} className={`w-full ${inputClass}`} />
            {fieldErrors.email && <p className="text-xs text-itr-red mt-1">{fieldErrors.email[0]}</p>}
          </div>
        </div>
        <div>
          <input name="password" type="password" required placeholder="Mot de passe" value={form.password} onChange={handleChange} className={`w-full ${inputClass}`} />
          {fieldErrors.password && <p className="text-xs text-itr-red mt-1">{fieldErrors.password[0]}</p>}
        </div>
        {formError && <p className="text-sm text-itr-red">{formError}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <button
          disabled={saving}
          className="flex items-center gap-1.5 bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
        >
          <UserPlus size={15} /> {saving ? "Création..." : "Créer le compte journaliste"}
        </button>
      </form>
    </section>
  );
}

function ProfileEditor({ target, onSaved, onCancel }) {
  const [avatar, setAvatar] = useState(target.avatar || "");
  const [bio, setBio] = useState(target.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.updateUser(target.id, { avatar, bio });
      onSaved(data);
    } catch {
      setError("Impossible d'enregistrer le profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 bg-itr-paper rounded-lg p-3 space-y-2">
      <div>
        <label className="text-xs font-condensed font-bold uppercase text-gray-400">Photo (URL)</label>
        <input
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://..."
          className="w-full mt-1 rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-condensed font-bold uppercase text-gray-400">Bio (page Rédaction)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full mt-1 rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none resize-none"
        />
      </div>
      {error && <p className="text-xs text-itr-red">{error}</p>}
      <div className="flex gap-2">
        <button
          disabled={saving}
          onClick={handleSave}
          className="bg-itr-blue hover:bg-itr-blue-dark text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button onClick={onCancel} className="text-xs font-semibold text-gray-500 px-3 py-1.5">
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rowErrors, setRowErrors] = useState({});
  const [editingProfileId, setEditingProfileId] = useState(null);

  const load = () => {
    setLoading(true);
    api.getUsers(search).then(({ data }) => setUsers(data.results || data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (target, role) => {
    setBusyId(target.id);
    setRowErrors((e) => ({ ...e, [target.id]: null }));
    try {
      const { data } = await api.updateUser(target.id, { role });
      setUsers((list) => list.map((u) => (u.id === target.id ? data : u)));
    } catch (err) {
      setRowErrors((e) => ({ ...e, [target.id]: err.response?.data?.role?.[0] || "Modification refusée." }));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (target) => {
    setBusyId(target.id);
    try {
      const { data } = await api.updateUser(target.id, { is_active: !target.is_active });
      setUsers((list) => list.map((u) => (u.id === target.id ? data : u)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-6">Utilisateurs</h1>

      <CreateJournalistForm onCreated={load} />

      <h2 className="font-display text-lg text-itr-ink mb-4">Tous les utilisateurs</h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom d'utilisateur ou email..."
        className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none mb-5"
      />

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-condensed font-bold uppercase text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Profil (Rédaction)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-gray-400">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-gray-400">Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const showsOnRedaction = u.role === "admin" || u.role === "journaliste";
                  return (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-itr-ink">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={busyId === u.id || isSelf}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="rounded-lg px-2 py-1.5 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        {isSelf && <p className="text-xs text-gray-400 mt-1">Vous ne pouvez pas modifier votre propre rôle.</p>}
                        {rowErrors[u.id] && <p className="text-xs text-itr-red mt-1">{rowErrors[u.id]}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={busyId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs font-condensed font-bold uppercase px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                            u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {u.is_active ? "Actif" : "Désactivé"}
                        </button>
                      </td>
                      <td className="px-4 py-3 min-w-[220px]">
                        {showsOnRedaction ? (
                          editingProfileId === u.id ? (
                            <ProfileEditor
                              target={u}
                              onCancel={() => setEditingProfileId(null)}
                              onSaved={(data) => {
                                setUsers((list) => list.map((x) => (x.id === data.id ? { ...x, ...data } : x)));
                                setEditingProfileId(null);
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingProfileId(u.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-itr-blue hover:text-itr-blue-dark"
                            >
                              <IdCard size={13} /> {u.bio || u.avatar ? "Modifier le profil" : "Renseigner le profil"}
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
