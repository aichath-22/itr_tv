import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import * as api from "../../api/endpoints";

const inputClass = "rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";
const STATUS_OPTIONS = [
  { value: "scheduled", label: "Programmé" },
  { value: "live", label: "En direct" },
  { value: "ended", label: "Terminé" },
];
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const toDatetimeLocal = (iso) => (iso ? iso.slice(0, 16) : "");

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`font-condensed font-bold uppercase text-sm px-4 py-2 rounded-full transition-colors ${
        active ? "bg-itr-blue text-white" : "bg-white text-gray-500 hover:text-itr-blue"
      }`}
    >
      {children}
    </button>
  );
}

function ProgramsTab({ programs, reload }) {
  const EMPTY = { name: "", description: "", thumbnail: "", presenter: "" };
  const [form, setForm] = useState(EMPTY);
  const [editingSlug, setEditingSlug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = (p) => {
    setEditingSlug(p.slug);
    setForm({ name: p.name, description: p.description || "", thumbnail: p.thumbnail || "", presenter: p.presenter || "" });
  };
  const cancelEdit = () => { setEditingSlug(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingSlug) {
        await api.updateProgram(editingSlug, form);
      } else {
        await api.createProgram({ ...form, slug: slugify(form.name) });
      }
      cancelEdit();
      reload();
    } catch {
      setError("Enregistrement impossible (nom déjà utilisé ?).");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Supprimer cette émission ?")) return;
    await api.deleteProgram(slug);
    reload();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 mb-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" required placeholder="Nom de l'émission" value={form.name} onChange={handleChange} className={inputClass} />
          <input name="presenter" placeholder="Présentateur (optionnel)" value={form.presenter} onChange={handleChange} className={inputClass} />
        </div>
        <input name="thumbnail" type="url" placeholder="Miniature (URL, optionnel)" value={form.thumbnail} onChange={handleChange} className={`w-full ${inputClass}`} />
        <textarea name="description" rows={2} placeholder="Description (optionnel)" value={form.description} onChange={handleChange} className={`w-full ${inputClass}`} />
        {error && <p className="text-sm text-itr-red">{error}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors disabled:opacity-50">
            {saving ? "Enregistrement..." : editingSlug ? "Enregistrer" : "Créer l'émission"}
          </button>
          {editingSlug && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-itr-ink">Annuler</button>}
        </div>
      </form>

      <div className="space-y-3">
        {programs.length === 0 && <p className="text-gray-400 text-sm bg-white rounded-xl p-6">Aucune émission pour le moment.</p>}
        {programs.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-condensed font-semibold text-itr-ink">{p.name}</p>
              {p.presenter && <p className="text-xs text-gray-400">Présenté par {p.presenter}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-itr-blue p-1.5" aria-label="Modifier"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(p.slug)} className="text-gray-400 hover:text-itr-red p-1.5" aria-label="Supprimer"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveStreamsTab({ liveStreams, programs, reload }) {
  const EMPTY = { title: "", program: "", description: "", stream_url: "", thumbnail: "", scheduled_at: "", status: "scheduled" };
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = (l) => {
    setEditingId(l.id);
    setForm({
      title: l.title, program: l.program?.id || "", description: l.description || "",
      stream_url: l.stream_url || "", thumbnail: l.thumbnail || "",
      scheduled_at: toDatetimeLocal(l.scheduled_at), status: l.status,
    });
  };
  const cancelEdit = () => { setEditingId(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, program: form.program ? Number(form.program) : null };
    try {
      if (editingId) await api.updateLiveStream(editingId, payload);
      else await api.createLiveStream(payload);
      cancelEdit();
      reload();
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce direct ?")) return;
    await api.deleteLiveStream(id);
    reload();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 mb-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="title" required placeholder="Titre du direct" value={form.title} onChange={handleChange} className={inputClass} />
          <select name="program" value={form.program} onChange={handleChange} className={inputClass}>
            <option value="">— Émission (optionnel) —</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <input name="stream_url" type="url" required placeholder="URL du flux (HLS .m3u8 ou YouTube Live)" value={form.stream_url} onChange={handleChange} className={`w-full ${inputClass}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="scheduled_at" type="datetime-local" required value={form.scheduled_at} onChange={handleChange} className={inputClass} />
          <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        {error && <p className="text-sm text-itr-red">{error}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors disabled:opacity-50">
            {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer le direct"}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-itr-ink">Annuler</button>}
        </div>
      </form>

      <div className="space-y-3">
        {liveStreams.length === 0 && <p className="text-gray-400 text-sm bg-white rounded-xl p-6">Aucun direct pour le moment.</p>}
        {liveStreams.map((l) => (
          <div key={l.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-condensed font-semibold text-itr-ink">{l.title}</p>
              <p className="text-xs text-gray-400">
                {STATUS_OPTIONS.find((s) => s.value === l.status)?.label} · {l.program?.name || "Sans émission"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => startEdit(l)} className="text-gray-400 hover:text-itr-blue p-1.5" aria-label="Modifier"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(l.id)} className="text-gray-400 hover:text-itr-red p-1.5" aria-label="Supprimer"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideosTab({ videos, programs, categories, liveStreams, reload }) {
  const EMPTY = { title: "", program: "", category: "", video_url: "", thumbnail: "", duration_seconds: "", source_live: "" };
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = (v) => {
    setEditingId(v.id);
    setForm({
      title: v.title, program: v.program?.id || "", category: v.category || "",
      video_url: v.video_url, thumbnail: v.thumbnail || "",
      duration_seconds: v.duration_seconds || "", source_live: v.source_live || "",
    });
  };
  const cancelEdit = () => { setEditingId(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      program: form.program ? Number(form.program) : null,
      category: form.category ? Number(form.category) : null,
      source_live: form.source_live ? Number(form.source_live) : null,
      duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : 0,
    };
    try {
      if (editingId) await api.updateVideo(editingId, payload);
      else await api.createVideo(payload);
      cancelEdit();
      reload();
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette vidéo ?")) return;
    await api.deleteVideo(id);
    reload();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 mb-5 space-y-3">
        <input name="title" required placeholder="Titre de la vidéo" value={form.title} onChange={handleChange} className={`w-full ${inputClass}`} />
        <input name="video_url" type="url" required placeholder="URL de la vidéo (YouTube ou hébergée)" value={form.video_url} onChange={handleChange} className={`w-full ${inputClass}`} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select name="program" value={form.program} onChange={handleChange} className={inputClass}>
            <option value="">— Émission —</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            <option value="">— Catégorie —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="duration_seconds" type="number" min="0" placeholder="Durée (secondes)" value={form.duration_seconds} onChange={handleChange} className={inputClass} />
        </div>
        <select name="source_live" value={form.source_live} onChange={handleChange} className={`w-full ${inputClass}`}>
          <option value="">— Rediffusion d'un direct (optionnel) —</option>
          {liveStreams.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        {error && <p className="text-sm text-itr-red">{error}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors disabled:opacity-50">
            {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter la vidéo"}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-itr-ink">Annuler</button>}
        </div>
      </form>

      <div className="space-y-3">
        {videos.length === 0 && <p className="text-gray-400 text-sm bg-white rounded-xl p-6">Aucune vidéo pour le moment.</p>}
        {videos.map((v) => (
          <div key={v.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-condensed font-semibold text-itr-ink">{v.title}</p>
              <p className="text-xs text-gray-400">{v.program?.name || "Sans émission"} · {v.views_count} vues</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => startEdit(v)} className="text-gray-400 hover:text-itr-blue p-1.5" aria-label="Modifier"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-itr-red p-1.5" aria-label="Supprimer"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminWebTV() {
  const [tab, setTab] = useState("programs");
  const [programs, setPrograms] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.getPrograms(), api.getLiveStreams(), api.getVideos(), api.getCategories()])
      .then(([p, l, v, c]) => {
        setPrograms(p.data.results || p.data);
        setLiveStreams(l.data.results || l.data);
        setVideos(v.data.results || v.data);
        setCategories(c.data.results || c.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-6">Web TV</h1>

      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "programs"} onClick={() => setTab("programs")}>Émissions</TabButton>
        <TabButton active={tab === "live"} onClick={() => setTab("live")}>Directs</TabButton>
        <TabButton active={tab === "videos"} onClick={() => setTab("videos")}>Vidéos</TabButton>
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : (
        <>
          {tab === "programs" && <ProgramsTab programs={programs} reload={load} />}
          {tab === "live" && <LiveStreamsTab liveStreams={liveStreams} programs={programs} reload={load} />}
          {tab === "videos" && <VideosTab videos={videos} programs={programs} categories={categories} liveStreams={liveStreams} reload={load} />}
        </>
      )}
    </div>
  );
}
