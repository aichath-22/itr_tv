import { useEffect, useState } from "react";
import * as api from "../api/endpoints";

export default function Emissions() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPrograms()
      .then(({ data }) => setPrograms(data.results || data))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl text-itr-ink mb-6">Émissions</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-4/3 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <p className="text-gray-400 font-display text-lg py-16 text-center">Aucune émission enregistrée pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-itr-blue-deep">
                {p.thumbnail && <img src={p.thumbnail} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg text-itr-ink">{p.name}</h2>
                {p.presenter && <p className="text-sm text-itr-blue font-condensed mt-1">Présenté par {p.presenter}</p>}
                {p.description && <p className="text-sm text-gray-500 mt-2 line-clamp-3">{p.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
