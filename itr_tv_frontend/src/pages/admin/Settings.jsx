import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Mail, MailOpen } from "lucide-react";
import * as api from "../../api/endpoints";

const inputClass = "w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

const FIELDS = [
  { name: "contact_email", label: "Email de contact", type: "email" },
  { name: "contact_phone", label: "Téléphone", type: "text" },
  { name: "contact_address", label: "Adresse", type: "text" },
];

const SOCIAL_FIELDS = [
  { name: "facebook_url", label: "Facebook" },
  { name: "instagram_url", label: "Instagram" },
  { name: "youtube_url", label: "YouTube" },
  { name: "whatsapp_url", label: "WhatsApp" },
  { name: "linkedin_url", label: "LinkedIn" },
  { name: "tiktok_url", label: "TikTok" },
  { name: "x_url", label: "X (Twitter)" },
];

function SettingsForm({ settings, onSaved }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const { data } = await api.updateSiteSettings(form);
      onSaved(data);
      setSuccess(true);
    } catch {
      setError("Enregistrement impossible. Vérifie les champs (email/URLs valides).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 space-y-5 mb-10">
      <div>
        <h2 className="font-display text-lg text-itr-ink mb-3">Contact & pied de page</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <label key={f.name} className="text-xs font-condensed font-bold uppercase text-gray-400">
              {f.label}
              <input
                name={f.name} type={f.type} value={form[f.name] || ""} onChange={handleChange}
                className={`mt-1 ${inputClass}`}
              />
            </label>
          ))}
        </div>
        <label className="block text-xs font-condensed font-bold uppercase text-gray-400 mt-3">
          Description du pied de page
          <textarea
            name="footer_description" rows={2} value={form.footer_description || ""} onChange={handleChange}
            className={`mt-1 resize-none ${inputClass}`}
          />
        </label>
      </div>

      <div>
        <h2 className="font-display text-lg text-itr-ink mb-3">Réseaux sociaux</h2>
        <p className="text-xs text-gray-400 mb-3">Laisse un champ vide pour masquer l'icône correspondante sur le site.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map((f) => (
            <label key={f.name} className="text-xs font-condensed font-bold uppercase text-gray-400">
              {f.label}
              <input
                name={f.name} type="url" placeholder="https://..." value={form[f.name] || ""} onChange={handleChange}
                className={`mt-1 ${inputClass}`}
              />
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-itr-red">{error}</p>}
      {success && <p className="text-sm text-green-600">Enregistré.</p>}

      <button
        disabled={saving}
        className="bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

function ContactMessages({ messages, onChange }) {
  const [busyId, setBusyId] = useState(null);

  const markRead = async (id) => {
    setBusyId(id);
    try {
      await api.markContactMessageRead(id);
      onChange();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    setBusyId(id);
    try {
      await api.deleteContactMessage(id);
      onChange();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2 className="font-display text-lg text-itr-ink mb-4">Messages reçus (formulaire de contact)</h2>
      {messages.length === 0 && (
        <p className="text-gray-400 text-sm bg-white rounded-xl p-6">Aucun message pour le moment.</p>
      )}
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`bg-white rounded-xl p-4 flex items-start justify-between gap-4 ${!m.is_read ? "border-l-4 border-itr-blue" : ""}`}>
            <div>
              <p className="font-condensed font-semibold text-itr-ink">{m.full_name} · <span className="text-gray-400 font-normal">{m.email}</span></p>
              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{m.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!m.is_read && (
                <button disabled={busyId === m.id} onClick={() => markRead(m.id)} className="text-gray-400 hover:text-itr-blue p-1.5 disabled:opacity-50" aria-label="Marquer comme lu">
                  <MailOpen size={15} />
                </button>
              )}
              {m.is_read && <Mail size={15} className="text-gray-300 p-0" />}
              <button disabled={busyId === m.id} onClick={() => remove(m.id)} className="text-gray-400 hover:text-itr-red p-1.5 disabled:opacity-50" aria-label="Supprimer">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.getSiteSettings(), api.getContactMessages()])
      .then(([s, m]) => {
        setSettings(s.data);
        setMessages(m.data.results || m.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-6">Paramètres du site</h1>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : (
        <>
          <SettingsForm settings={settings} onSaved={setSettings} />
          <ContactMessages messages={messages} onChange={load} />
        </>
      )}
    </div>
  );
}
