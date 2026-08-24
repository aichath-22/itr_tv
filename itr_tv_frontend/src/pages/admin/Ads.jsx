import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import * as api from "../../api/endpoints";

const PLACEMENTS = [
  { value: "home_top", label: "Accueil — Haut" },
  { value: "home_sidebar", label: "Accueil — Latéral" },
  { value: "article_inline", label: "Article — Intégré" },
  { value: "webtv_preroll", label: "Web TV — Pré-roll" },
];

const inputClass = "rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";
const EMPTY_BANNER = {
  sponsor: "", placement: "home_top", image: "", target_url: "",
  start_date: "", end_date: "", is_active: true,
};

function SponsorManager({ sponsors, onChange }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.createSponsor({ name: name.trim(), logo });
      setName("");
      setLogo("");
      onChange();
    } catch {
      setError("Impossible de créer ce sponsor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce sponsor ? Ses bannières associées seront aussi supprimées.")) return;
    setDeletingId(id);
    try {
      await api.deleteSponsor(id);
      onChange();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="font-display text-lg text-itr-ink mb-4">Sponsors</h2>
      <div className="bg-white rounded-xl p-5">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du sponsor" className={`flex-1 min-w-[160px] ${inputClass}`} />
          <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="Logo (URL, optionnel)" className={`flex-1 min-w-[160px] ${inputClass}`} />
          <button disabled={saving} className="flex items-center gap-1 bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50">
            <Plus size={15} /> Ajouter
          </button>
        </form>
        {error && <p className="text-sm text-itr-red mb-3">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {sponsors.map((s) => (
            <span key={s.id} className="flex items-center gap-2 bg-itr-paper text-sm font-condensed px-3 py-1.5 rounded-full">
              {s.name}
              <button disabled={deletingId === s.id} onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-itr-red disabled:opacity-50" aria-label={`Supprimer ${s.name}`}>
                <Trash2 size={13} />
              </button>
            </span>
          ))}
          {sponsors.length === 0 && <p className="text-sm text-gray-400">Aucun sponsor pour le moment.</p>}
        </div>
      </div>
    </section>
  );
}

export default function AdminAds() {
  const [sponsors, setSponsors] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.getSponsors(), api.getBanners()])
      .then(([s, b]) => {
        setSponsors(s.data.results || s.data);
        setBanners(b.data.results || b.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const startEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      sponsor: banner.sponsor.id, placement: banner.placement, image: banner.image,
      target_url: banner.target_url, start_date: banner.start_date, end_date: banner.end_date,
      is_active: banner.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_BANNER);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, sponsor: Number(form.sponsor) };
    try {
      if (editingId) {
        await api.updateBanner(editingId, payload);
      } else {
        await api.createBanner(payload);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette bannière ?")) return;
    setDeletingId(id);
    try {
      await api.deleteBanner(id);
      load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-6">Publicité</h1>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : (
        <>
          <SponsorManager sponsors={sponsors} onChange={load} />

          <section>
            <h2 className="font-display text-lg text-itr-ink mb-4">Bannières</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 mb-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select name="sponsor" required value={form.sponsor} onChange={handleChange} className={inputClass}>
                  <option value="">— Sponsor —</option>
                  {sponsors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select name="placement" value={form.placement} onChange={handleChange} className={inputClass}>
                  {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="image" type="url" required placeholder="URL de l'image" value={form.image} onChange={handleChange} className={inputClass} />
                <input name="target_url" type="url" required placeholder="URL cible (clic)" value={form.target_url} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <input name="start_date" type="date" required value={form.start_date} onChange={handleChange} className={inputClass} />
                <input name="end_date" type="date" required value={form.end_date} onChange={handleChange} className={inputClass} />
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} /> Active
                </label>
              </div>
              {error && <p className="text-sm text-itr-red">{error}</p>}
              <div className="flex gap-3">
                <button disabled={saving} className="bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors disabled:opacity-50">
                  {saving ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Créer la bannière"}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-itr-ink">
                    Annuler
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {banners.length === 0 && <p className="text-gray-400 text-sm bg-white rounded-xl p-6">Aucune bannière pour le moment.</p>}
              {banners.map((b) => (
                <div key={b.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-condensed font-semibold text-itr-ink">
                      {b.sponsor.name} — {PLACEMENTS.find((p) => p.value === b.placement)?.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {b.start_date} → {b.end_date} · {b.is_active ? "Active" : "Inactive"} ·{" "}
                      {b.clicks_count} clic{b.clicks_count !== 1 ? "s" : ""} · {b.impressions_count} impression{b.impressions_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(b)} className="text-gray-400 hover:text-itr-blue p-1.5" aria-label="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button disabled={deletingId === b.id} onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-itr-red p-1.5 disabled:opacity-50" aria-label="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
