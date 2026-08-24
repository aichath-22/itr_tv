import { useEffect, useState } from "react";
import { Radio, PlayCircle } from "lucide-react";
import * as api from "../api/endpoints";

export default function WebTV() {
  const [live, setLive] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getLiveStreams(), api.getVideos()]).then(([liveRes, videosRes]) => {
      if (liveRes.status === "fulfilled") setLive(liveRes.value.data.results || liveRes.value.data);
      if (videosRes.status === "fulfilled") setVideos(videosRes.value.data.results || videosRes.value.data);
      setLoading(false);
    });
  }, []);

  const currentLive = live.find((s) => s.status === "live");
  const upcoming = live.filter((s) => s.status === "scheduled");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl text-itr-ink mb-6">Web TV</h1>

      <section className="bg-itr-blue-deep rounded-xl overflow-hidden mb-10 border-t-4 border-itr-red">
        <div className="aspect-video bg-itr-blue-deep flex items-center justify-center relative overflow-hidden">
          {currentLive ? (
            <>
              {currentLive.stream_url ? (
                <iframe
                  src={currentLive.stream_url}
                  title={currentLive.title}
                  className="w-full h-full relative z-10"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  {currentLive.thumbnail && (
                    <img src={currentLive.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                  )}
                  <PlayCircle size={56} className="relative text-white/90 drop-shadow" />
                </>
              )}
              <span className="absolute top-4 left-4 bg-itr-red text-white text-xs font-condensed font-bold uppercase px-3 py-1 rounded flex items-center gap-1.5 z-20">
                <Radio size={12} className="animate-pulse" /> En direct
              </span>
            </>
          ) : (
            <div className="text-white/40 font-display text-xl text-center px-4">
              Aucun direct en cours actuellement
            </div>
          )}
        </div>
        {currentLive && (
          <div className="p-5 text-white">
            <h2 className="font-display text-xl">{currentLive.title}</h2>
            {currentLive.description && <p className="text-white/60 text-sm mt-2">{currentLive.description}</p>}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="mb-10 pt-8 border-t border-gray-200">
          <h2 className="font-display text-xl text-itr-ink mb-4">Directs à venir</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((s) => (
              <div key={s.id} className="bg-white rounded-xl p-4 flex flex-col">
                <span className="text-itr-blue font-condensed text-xs font-bold uppercase mb-2">Programmé</span>
                <p className="font-display text-base text-itr-ink leading-snug">{s.title}</p>
                <p className="text-sm text-gray-400 mt-2 font-condensed">
                  {new Date(s.scheduled_at).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pt-8 border-t border-gray-200">
        <h2 className="font-display text-xl text-itr-ink mb-4">Bibliothèque vidéo</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-gray-400 font-display text-lg py-10 text-center">Aucune vidéo publiée pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((v) => (
              <a
                key={v.id}
                href={v.video_url}
                target="_blank"
                rel="noreferrer"
                className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-itr-blue-deep relative overflow-hidden">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/30 font-display text-xl">ITR</div>
                  )}
                  <PlayCircle className="absolute inset-0 m-auto text-white drop-shadow" size={36} />
                </div>
                <div className="p-3">
                  <p className="font-condensed font-semibold text-sm text-itr-ink leading-snug line-clamp-2">{v.title}</p>
                  {v.program && <p className="text-xs text-itr-red font-condensed font-bold uppercase tracking-wide mt-1">{v.program.name}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
