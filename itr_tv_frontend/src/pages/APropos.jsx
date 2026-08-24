export default function APropos() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <span className="font-condensed text-xs font-bold uppercase tracking-[0.15em] text-itr-red">Qui sommes-nous</span>
      <h1 className="font-display text-3xl text-itr-ink mt-2 mb-6 text-balance">À propos d'ITR TV</h1>
      <div className="prose prose-lg max-w-none text-itr-ink leading-relaxed space-y-4">
        <p>
          InfosEnTempsRéel (ITR TV) est un média numérique béninois dédié à l'information en continu.
          Notre plateforme diffuse l'actualité sous plusieurs formats — articles, vidéos, directs,
          reportages et interviews — pour s'imposer comme un média de référence au Bénin et en Afrique.
        </p>
        <h2 className="font-display text-xl text-itr-ink pt-4 border-l-4 border-itr-red pl-4">Notre mission</h2>
        <p>
          Faire d'ITR TV une référence de l'information numérique au Bénin et en Afrique, à travers une
          plateforme multimédia fiable, rapide et sécurisée, portée par un journalisme de qualité et
          une salle de rédaction structurée.
        </p>
        <h2 className="font-display text-xl text-itr-ink pt-4 border-l-4 border-itr-red pl-4">Ce que nous couvrons</h2>
        <p>
          Politique, Économie, Société, Justice, Éducation, Santé, Culture, Sport, International,
          Technologies — et bien plus, en continu.
        </p>
      </div>
    </div>
  );
}
