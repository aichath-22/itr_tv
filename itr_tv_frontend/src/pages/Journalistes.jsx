import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import * as api from "../api/endpoints";

export default function Journalistes() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTeam()
      .then(({ data }) => {
        const list = data.results || data;
        setMembers(list.filter((m) => m.role === "journaliste"));
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Link to="/redaction" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-itr-blue mb-8">
        <ArrowLeft size={15} /> Retour à la rédaction
      </Link>

      <h1 className="font-display text-3xl text-itr-ink mb-3">Nos journalistes</h1>
      <p className="text-gray-500 leading-relaxed mb-10">
        L'équipe qui produit l'actualité ITR TV au quotidien, sous la supervision du rédacteur en chef.
      </p>

      {loading && <p className="text-gray-400">Chargement...</p>}

      {!loading && members.length === 0 && (
        <p className="text-gray-400">Aucun journaliste à afficher pour le moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-xl p-5 flex gap-4">
            <div className="h-16 w-16 rounded-full bg-itr-paper overflow-hidden shrink-0">
              {m.avatar ? (
                <img src={m.avatar} alt={m.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-lg font-display text-gray-300">
                  {m.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-itr-blue text-[11px] font-condensed font-bold uppercase tracking-wide mb-1">
                <PenLine size={12} /> Journaliste
              </span>
              <h2 className="font-display text-base text-itr-ink mb-1">{m.full_name}</h2>
              <p className="text-sm text-gray-500 leading-snug">
                {m.bio || "Aucune biographie renseignée pour le moment."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
