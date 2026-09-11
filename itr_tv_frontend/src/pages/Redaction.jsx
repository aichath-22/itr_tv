import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, PenLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";

function MemberCard({ member, href }) {
  const isChief = member.role === "admin";
  return (
    <div className="bg-white rounded-xl p-5 text-center">
      <div className="h-20 w-20 rounded-full bg-itr-paper overflow-hidden mx-auto mb-4">
        {member.avatar ? (
          <img src={member.avatar} alt={member.full_name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl font-display text-gray-300">
            {member.full_name.charAt(0)}
          </div>
        )}
      </div>
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2 ${
          isChief ? "bg-itr-blue/10 text-itr-blue" : "bg-gray-100 text-gray-500"
        }`}
      >
        {isChief ? <ShieldCheck size={12} /> : <PenLine size={12} />}
        {isChief ? "Rédacteur en chef" : "Journaliste"}
      </span>
      <h3 className="font-display text-base text-itr-ink mb-2">{member.full_name}</h3>
      <Link to={href} className="text-itr-blue text-sm font-semibold hover:text-itr-blue-dark">
        En savoir plus →
      </Link>
    </div>
  );
}

export default function Redaction() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTeam()
      .then(({ data }) => setTeam(data.results || data))
      .catch(() => setTeam([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl text-itr-ink mb-4">Salle de rédaction</h1>
      <p className="text-gray-500 leading-relaxed mb-10">
        ITR TV s'appuie sur une équipe de journalistes et d'un rédacteur en chef pour produire une information
        fiable et vérifiée, avec un circuit de validation avant chaque publication.
      </p>

      {loading && <p className="text-gray-400 mb-10">Chargement de l'équipe...</p>}

      {!loading && team.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {team.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              href={member.role === "admin" ? `/redaction/${member.username}` : "/redaction/journalistes"}
            />
          ))}
        </div>
      )}

      {!user && (
        <div className="bg-itr-blue-deep text-white rounded-xl p-6 text-center">
          <p className="font-display text-lg mb-3">Vous êtes journaliste chez ITR TV ?</p>
          <Link to="/connexion" className="inline-block bg-white text-itr-blue-deep font-semibold rounded-full px-6 py-2 text-sm hover:bg-itr-paper transition-colors">
            Accéder à mon espace
          </Link>
        </div>
      )}
    </div>
  );
}
