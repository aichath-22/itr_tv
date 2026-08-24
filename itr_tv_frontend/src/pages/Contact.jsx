import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
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
            <Mail size={18} className="text-itr-blue" /> contact@itrtv.bj
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-itr-blue" /> +229 00 00 00 00
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-itr-blue" /> Cotonou, Bénin
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
            <input required placeholder="Nom complet" className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none" />
            <input required type="email" placeholder="Email" className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none" />
            <textarea required placeholder="Votre message" rows={5} className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none resize-none" />
            <button className="w-full bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-lg py-2.5 transition-colors">
              Envoyer
            </button>
          </>
        )}
      </form>
    </div>
  );
}
