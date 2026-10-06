import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import * as api from "../api/endpoints";

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSiteSettings().then(({ data }) => setSettings(data)).catch(() => setSettings(null));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.sendContactMessage(form);
      setSent(true);
    } catch {
      setError("Impossible d'envoyer le message pour le moment. Réessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display text-3xl text-itr-ink mb-6">Contact</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Une question, une information à nous transmettre, ou une proposition de partenariat ?
          Écrivez-nous.
        </p>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-itr-blue" /> {settings?.contact_email || "contact@itrtv.bj"}
          </div>
          {settings?.contact_phone && (
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-itr-blue" /> {settings.contact_phone}
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-itr-blue" /> {settings?.contact_address || "Cotonou, Bénin"}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        {sent ? (
          <p className="text-itr-blue-dark font-semibold py-8 text-center">
            Message envoyé. Merci, nous revenons vers vous rapidement.
          </p>
        ) : (
          <>
            <input
              name="full_name" required placeholder="Nom complet" value={form.full_name} onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
            />
            <input
              name="email" required type="email" placeholder="Email" value={form.email} onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
            />
            <textarea
              name="message" required placeholder="Votre message" rows={5} value={form.message} onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none resize-none"
            />
            {error && <p className="text-sm text-itr-red">{error}</p>}
            <button
              disabled={sending}
              className="w-full bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
            >
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
