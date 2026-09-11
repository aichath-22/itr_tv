import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import * as api from "../api/endpoints";

export default function RedacteurProfile() {
  const { username } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getTeam()
      .then(({ data }) => {
        const list = data.results || data;
        const found = list.find((m) => m.username === username && m.role === "admin");
        if (!found) {
          setError(true);
        } else {
          setMember(found);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 animate-pulse text-gray-400">Chargement du profil...</div>;
  }

  if (error || !member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-2xl text-itr-ink mb-2">Profil introuvable</p>
        <Link to="/redaction" className="text-itr-blue font-semibold">Retour à la rédaction</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link to="/redaction" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-itr-blue mb-8">
        <ArrowLeft size={15} /> Retour à la rédaction
      </Link>

      <div className="bg-white rounded-2xl p-8 flex flex-col sm:flex-row gap-6 items-start">
        <div className="h-28 w-28 rounded-full bg-itr-paper overflow-hidden shrink-0 mx-auto sm:mx-0">
          {member.avatar ? (
            <img src={member.avatar} alt={member.full_name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl font-display text-gray-300">
              {member.full_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 bg-itr-blue/10 text-itr-blue text-xs font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3">
            <ShieldCheck size={13} /> Rédacteur en chef
          </span>
          <h1 className="font-display text-3xl text-itr-ink mb-3">{member.full_name}</h1>
          <p className="text-gray-500 leading-relaxed">
            {member.bio || "Aucune biographie renseignée pour le moment."}
          </p>
        </div>
      </div>
    </div>
  );
}
