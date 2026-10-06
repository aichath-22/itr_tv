import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, PenLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";

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

  const chief = team.find((m) => m.role === "admin");

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl text-itr-ink mb-4">Salle de rédaction</h1>
      <p className="text-gray-500 leading-relaxed mb-10">
        ITR TV s'appuie sur une équipe de journalistes et d'un rédacteur en chef pour produire une information
        fiable et vérifiée, avec un circuit de validation avant chaque publication.
      </p>

      {loading && <p className="text-gray-400 mb-10">Chargement de l'équipe...</p>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <div className="bg-white rounded-xl p-6 text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-itr-paper overflow-hidden mb-4">
              {chief?.avatar ? (
                <img src={chief.avatar} alt={chief.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-display text-gray-300">
                  {chief?.full_name?.charAt(0) || <ShieldCheck size={28} />}
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2 bg-itr-blue/10 text-itr-blue">
              <ShieldCheck size={12} /> Rédacteur en chef
            </span>
            <h3 className="font-display text-base text-itr-ink mb-2">{chief?.full_name || "Rédacteur en chef"}</h3>
            <p className="text-sm text-gray-500 leading-snug mb-3">
              Supervise la ligne éditoriale d'ITR TV et valide chaque publication avant sa mise en ligne.
            </p>
            {chief && (
              <Link to={`/redaction/${chief.username}`} className="text-itr-blue text-sm font-semibold hover:text-itr-blue-dark">
                En savoir plus →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-itr-paper overflow-hidden mb-4 flex items-center justify-center text-gray-300">
              <PenLine size={28} />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2 bg-gray-100 text-gray-500">
              <PenLine size={12} /> Journalistes
            </span>
            <h3 className="font-display text-base text-itr-ink mb-2">Nos journalistes</h3>
            <p className="text-sm text-gray-500 leading-snug mb-3">
              Rigueur, curiosité, sens de l'écoute et réactivité : nos journalistes vérifient, recoupent et
              rédigent chaque information avant sa diffusion, dans le respect de la déontologie du métier.
            </p>
            <Link to="/redaction/journalistes" className="text-itr-blue text-sm font-semibold hover:text-itr-blue-dark">
              En savoir plus →
            </Link>
          </div>
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
