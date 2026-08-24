import { Link } from "react-router-dom";
import { PenLine, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Redaction() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl text-itr-ink mb-4">Salle de rédaction</h1>
      <p className="text-gray-500 leading-relaxed mb-10">
        ITR TV s'appuie sur une équipe de journalistes et de rédacteurs pour produire une information
        fiable et vérifiée, avec un circuit de validation avant chaque publication.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-white rounded-xl p-5">
          <PenLine className="text-itr-blue mb-3" size={22} />
          <h2 className="font-display text-base text-itr-ink mb-1">Journalistes</h2>
          <p className="text-sm text-gray-500">Rédigent, mettent en brouillon et soumettent leurs articles à validation.</p>
        </div>
        <div className="bg-white rounded-xl p-5">
          <ShieldCheck className="text-itr-blue mb-3" size={22} />
          <h2 className="font-display text-base text-itr-ink mb-1">Rédacteur en chef</h2>
          <p className="text-sm text-gray-500">Valide, modifie ou rejette les publications avant mise en ligne.</p>
        </div>
        <div className="bg-white rounded-xl p-5">
          <Users className="text-itr-blue mb-3" size={22} />
          <h2 className="font-display text-base text-itr-ink mb-1">Équipe éditoriale</h2>
          <p className="text-sm text-gray-500">Statistiques par journaliste et par contenu, pilotées depuis le tableau de bord.</p>
        </div>
      </div>

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
