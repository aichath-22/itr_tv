import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="h-16 w-16 rounded-full bg-itr-blue/10 flex items-center justify-center mx-auto mb-6 text-itr-blue">
        <Compass size={28} />
      </div>
      <p className="font-condensed font-bold text-itr-blue uppercase tracking-wide text-sm mb-2">Erreur 404</p>
      <h1 className="font-display text-3xl text-itr-ink mb-3">Page introuvable</h1>
      <p className="text-gray-500 leading-relaxed mb-8">
        La page que vous cherchez n'existe pas ou plus. Elle a peut-être été déplacée,
        ou le lien que vous avez suivi est incorrect.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Retour à l'accueil
      </Link>
    </div>
  );
}
