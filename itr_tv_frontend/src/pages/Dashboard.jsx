import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Send, BarChart3, FileText } from "lucide-react";
import * as api from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-full bg-itr-blue/10 flex items-center justify-center text-itr-blue-dark shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display text-itr-ink">{value}</p>
        <p className="text-xs text-gray-400 font-condensed uppercase">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, hasRoleAtLeast } = useAuth();
  const [myArticles, setMyArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const calls = [api.getArticles({ author: user.id })];
    if (hasRoleAtLeast("redacteur_chef")) calls.push(api.getArticles({ status: "pending" }));
    if (hasRoleAtLeast("admin")) calls.push(api.getDashboard());

    Promise.allSettled(calls).then((results) => {
      if (results[0]?.status === "fulfilled") {
        setMyArticles(results[0].value.data.results || results[0].value.data);
      }
      if (hasRoleAtLeast("redacteur_chef") && results[1]?.status === "fulfilled") {
        setPendingArticles(results[1].value.data.results || results[1].value.data);
      }
      if (hasRoleAtLeast("admin")) {
        const statsRes = results[results.length - 1];
        if (statsRes?.status === "fulfilled") setDashboardStats(statsRes.value.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (slug) => {
    await api.submitArticle(slug);
    loadData();
  };

  const handleReview = async (slug, decision) => {
    await api.reviewArticle(slug, decision);
    loadData();
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl text-itr-ink mb-1">Tableau de bord</h1>
      <p className="text-gray-500 mb-8">
        Connecté en tant que <strong>{user.username}</strong> — {user.role.replace("_", " ")}
      </p>

      {hasRoleAtLeast("admin") && dashboardStats && (
        <section className="mb-10">
          <h2 className="font-display text-lg text-itr-ink mb-4">Statistiques globales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Articles publiés" value={dashboardStats.total_published_articles} icon={FileText} />
            <StatCard label="Vues articles" value={dashboardStats.total_article_views} icon={BarChart3} />
            <StatCard label="Vues vidéos" value={dashboardStats.total_video_views} icon={BarChart3} />
            <StatCard label="Directs réalisés" value={dashboardStats.total_live_streams} icon={BarChart3} />
          </div>
        </section>
      )}

      {hasRoleAtLeast("redacteur_chef") && (
        <section className="mb-10">
          <h2 className="font-display text-lg text-itr-ink mb-4">
            Articles en attente de validation ({pendingArticles.length})
          </h2>
          {pendingArticles.length === 0 ? (
            <p className="text-gray-400 text-sm bg-white rounded-xl p-6">Rien à valider pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {pendingArticles.map((a) => (
                <div key={a.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-condensed font-semibold text-itr-ink">{a.title}</p>
                    <p className="text-xs text-gray-400">Par {a.author_name}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(a.slug, "approve")}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full px-3 py-1.5 transition-colors"
                    >
                      <CheckCircle size={15} /> Valider
                    </button>
                    <button
                      onClick={() => handleReview(a.slug, "reject")}
                      className="flex items-center gap-1 bg-itr-red hover:bg-itr-red-dark text-white text-sm font-semibold rounded-full px-3 py-1.5 transition-colors"
                    >
                      <XCircle size={15} /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="font-display text-lg text-itr-ink mb-4">Mes articles</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myArticles.length === 0 ? (
          <p className="text-gray-400 text-sm bg-white rounded-xl p-6">
            Tu n'as pas encore rédigé d'article. La création d'article depuis l'interface arrive dans une prochaine itération —
            en attendant, utilise l'admin Django (<code>/admin/</code>) pour en créer un.
          </p>
        ) : (
          <div className="space-y-3">
            {myArticles.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-condensed font-semibold text-itr-ink">{a.title}</p>
                  <span className="text-xs uppercase font-bold text-itr-blue">{a.status}</span>
                </div>
                {a.status === "draft" && (
                  <button
                    onClick={() => handleSubmit(a.slug)}
                    className="flex items-center gap-1 bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-3 py-1.5 transition-colors shrink-0"
                  >
                    <Send size={14} /> Soumettre
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
