import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Send, BarChart3, FileText, Plus, Pencil, Trash2 } from "lucide-react";
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

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.getCategories().then(({ data }) => setCategories(data.results || data));

  useEffect(() => { load(); }, []);

  const slugify = (s) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await api.createCategory({ name: name.trim(), slug: slugify(name) });
      setName("");
      load();
    } catch {
      setError("Impossible de créer cette catégorie (nom déjà utilisé ?).");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    setDeletingSlug(slug);
    try {
      await api.deleteCategory(slug);
      load();
    } catch {
      setError("Impossible de supprimer une catégorie utilisée par des articles.");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="font-display text-lg text-itr-ink mb-4">Catégories</h2>
      <div className="bg-white rounded-xl p-5">
        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nouvelle catégorie..."
            className="flex-1 rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
          />
          <button
            disabled={creating}
            className="flex items-center gap-1 bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            <Plus size={15} /> Ajouter
          </button>
        </form>
        {error && <p className="text-sm text-itr-red mb-3">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="flex items-center gap-2 bg-itr-paper text-sm font-condensed px-3 py-1.5 rounded-full">
              {c.name}
              <button
                disabled={deletingSlug === c.slug}
                onClick={() => handleDelete(c.slug)}
                className="text-gray-400 hover:text-itr-red disabled:opacity-50"
                aria-label={`Supprimer ${c.name}`}
              >
                <Trash2 size={13} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user, hasRoleAtLeast } = useAuth();
  const [myArticles, setMyArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState(null);

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
    setBusySlug(slug);
    try {
      await api.submitArticle(slug);
      loadData();
    } finally {
      setBusySlug(null);
    }
  };

  const handleReview = async (slug, decision) => {
    let comment = "";
    if (decision === "reject") {
      comment = window.prompt("Raison du rejet (optionnel) :") || "";
    }
    setBusySlug(slug);
    try {
      await api.reviewArticle(slug, decision, comment);
      loadData();
    } finally {
      setBusySlug(null);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    setBusySlug(slug);
    try {
      await api.deleteArticle(slug);
      loadData();
    } finally {
      setBusySlug(null);
    }
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

      {hasRoleAtLeast("admin") && <CategoryManager />}

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
                      disabled={busySlug === a.slug}
                      onClick={() => handleReview(a.slug, "approve")}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={15} /> Valider
                    </button>
                    <button
                      disabled={busySlug === a.slug}
                      onClick={() => handleReview(a.slug, "reject")}
                      className="flex items-center gap-1 bg-itr-red hover:bg-itr-red-dark text-white text-sm font-semibold rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-itr-ink">Mes articles</h2>
          <Link
            to="/tableau-de-bord/articles/nouveau"
            className="flex items-center gap-1.5 bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-4 py-2 transition-colors"
          >
            <Plus size={15} /> Nouvel article
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myArticles.length === 0 ? (
          <p className="text-gray-400 text-sm bg-white rounded-xl p-6">
            Tu n'as pas encore rédigé d'article.{" "}
            <Link to="/tableau-de-bord/articles/nouveau" className="text-itr-blue font-semibold">
              Créer mon premier article
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {myArticles.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-condensed font-semibold text-itr-ink">{a.title}</p>
                  <span className="text-xs uppercase font-bold text-itr-blue">{a.status}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/tableau-de-bord/articles/${a.slug}/modifier`}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-itr-blue rounded-full px-2 py-1.5"
                    aria-label={`Modifier ${a.title}`}
                  >
                    <Pencil size={14} />
                  </Link>
                  {a.status === "draft" && (
                    <button
                      disabled={busySlug === a.slug}
                      onClick={() => handleSubmit(a.slug)}
                      className="flex items-center gap-1 bg-itr-blue hover:bg-itr-blue-dark text-white text-sm font-semibold rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send size={14} /> Soumettre
                    </button>
                  )}
                  <button
                    disabled={busySlug === a.slug}
                    onClick={() => handleDelete(a.slug)}
                    className="text-gray-400 hover:text-itr-red p-1.5 disabled:opacity-50"
                    aria-label={`Supprimer ${a.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
