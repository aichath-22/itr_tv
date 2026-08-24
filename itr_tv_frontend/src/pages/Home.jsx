import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, PlayCircle, ArrowRight } from "lucide-react";
import * as api from "../api/endpoints";
import ArticleCard from "../components/ArticleCard";
import ArticleListRow from "../components/ArticleListRow";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [live, setLive] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getArticles({ status: "published", ordering: "-published_at" }),
      api.getLiveStreams(),
      api.getVideos(),
    ]).then(([articlesRes, liveRes, videosRes]) => {
      if (articlesRes.status === "fulfilled") {
        setArticles(articlesRes.value.data.results || articlesRes.value.data);
      }
      if (liveRes.status === "fulfilled") {
        const streams = liveRes.value.data.results || liveRes.value.data;
        setLive(streams.find((s) => s.status === "live") || streams[0] || null);
      }
      if (videosRes.status === "fulfilled") {
        setVideos((videosRes.value.data.results || videosRes.value.data).slice(0, 4));
      }
      setLoading(false);
    });
  }, []);

  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1, 5);
  const latestArticles = articles.slice(5, 11);

  return (
    <div>
      {/* HERO */}
      <section className="bg-itr-blue-deep text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="lg:col-span-2 aspect-16/9 bg-white/10 rounded-xl animate-pulse" />
          ) : heroArticle ? (
            <Link
              to={`/actualites/${heroArticle.slug}`}
              className="lg:col-span-2 group relative rounded-xl overflow-hidden block"
            >
              <div className="aspect-16/9 bg-gray-800">
                {heroArticle.cover_image && (
                  <img
                    src={heroArticle.cover_image}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-condensed text-[11px] font-bold uppercase tracking-[0.15em] text-itr-red">À la une</span>
                  {heroArticle.category && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="bg-itr-red text-xs font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded">
                        {heroArticle.category.name}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-4xl leading-tight max-w-2xl text-balance">
                  {heroArticle.title}
                </h1>
              </div>
            </Link>
          ) : (
            <div className="lg:col-span-2 aspect-16/9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-display text-3xl">
              ITR TV
            </div>
          )}

          {/* Live block */}
          <div className="bg-black/30 rounded-xl p-5 flex flex-col border border-white/10">
            <div className="flex items-center gap-2 text-itr-red font-condensed font-bold uppercase text-sm mb-3">
              <Radio size={16} className={live?.status === "live" ? "animate-pulse" : ""} />
              {live?.status === "live" ? "En direct maintenant" : "Prochain direct"}
            </div>
            <div className="aspect-video bg-itr-blue-deep rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
              {live?.thumbnail && (
                <img src={live.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
              )}
              <PlayCircle size={40} className="relative text-white/90 drop-shadow" />
            </div>
            <p className="font-display text-lg leading-snug mb-1">
              {live ? live.title : "Aucun direct programmé"}
            </p>
            {live && (
              <p className="text-white/60 text-sm font-condensed">
                {new Date(live.scheduled_at).toLocaleString("fr-FR", {
                  weekday: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            <Link
              to="/webtv"
              className="mt-auto pt-4 text-itr-blue font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              Voir la Web TV <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECONDARY ARTICLES */}
      {secondaryArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-itr-ink">À la une</h2>
            <Link to="/actualites" className="text-itr-blue text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Toute l'actualité <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
            <div className="lg:col-span-2">
              <ArticleCard article={secondaryArticles[0]} size="lg" />
            </div>
            {secondaryArticles.length > 1 && (
              <div className="bg-white rounded-xl p-4">
                {secondaryArticles.slice(1, 4).map((a) => (
                  <ArticleListRow key={a.id} article={a} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* WEB TV STRIP */}
      <section className="bg-itr-blue-deep text-white py-10 border-t-4 border-itr-red">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">Web TV — Rediffusions</h2>
            <Link to="/webtv" className="text-white/70 hover:text-white text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Bibliothèque vidéo <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.length === 0 && !loading && (
              <p className="text-white/40 col-span-full">Aucune vidéo publiée pour le moment.</p>
            )}
            {videos.map((v) => (
              <div key={v.id} className="group cursor-pointer">
                <div className="aspect-video bg-white/10 rounded-lg overflow-hidden relative">
                  {v.thumbnail && (
                    <img src={v.thumbnail} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <PlayCircle className="absolute inset-0 m-auto text-white/80" size={36} />
                </div>
                <p className="font-condensed font-semibold mt-2 text-sm leading-snug">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST NEWS LIST */}
      {latestArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="font-display text-xl text-itr-ink mb-5">Dernières informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 bg-white rounded-xl p-4">
            {latestArticles.map((a) => (
              <ArticleListRow key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {!loading && articles.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-400">
          <p className="font-display text-2xl mb-2">Aucun article publié pour le moment</p>
          <p className="text-sm">Connecte le backend Django et publie ton premier article pour le voir apparaître ici.</p>
        </section>
      )}
    </div>
  );
}
