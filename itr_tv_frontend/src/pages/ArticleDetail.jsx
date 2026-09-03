import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, Calendar, Send, Heart, Share2 } from "lucide-react";
import * as api from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import AdBanner from "../components/AdBanner";

const SHARE_LINKS = (url, title) => [
  { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  { label: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
];

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [comment, setComment] = useState("");
  const [liking, setLiking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .getArticle(slug)
      .then(({ data }) => setArticle(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.postComment(article.id, comment);
      setComment("");
      const { data } = await api.getArticle(slug);
      setArticle(data);
    } catch {
      // silencieux : à améliorer avec un toast si besoin
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/connexion");
      return;
    }
    setLiking(true);
    try {
      const { data } = await api.toggleLike(slug);
      setArticle((a) => ({ ...a, is_liked: data.liked, likes_count: data.likes_count }));
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 animate-pulse text-gray-400">Chargement de l'article...</div>;
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-2xl text-itr-ink mb-2">Article introuvable</p>
        <Link to="/actualites" className="text-itr-blue font-semibold">Retour aux actualités</Link>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {article.category && (
        <span className="bg-itr-red text-white text-xs font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded">
          {article.category.name}
        </span>
      )}
      <h1 className="font-display text-3xl md:text-4xl text-itr-ink mt-4 leading-tight">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 font-condensed">
        <span>Par {article.author_name}</span>
        {article.published_at && (
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(article.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Eye size={14} /> {article.views_count} vues
        </span>
        <button
          onClick={handleLike}
          disabled={liking}
          aria-pressed={article.is_liked}
          className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
            article.is_liked ? "text-itr-red" : "text-gray-500 hover:text-itr-red"
          }`}
        >
          <Heart size={14} fill={article.is_liked ? "currentColor" : "none"} /> {article.likes_count ?? 0}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs font-condensed font-bold uppercase text-gray-400 flex items-center gap-1">
          <Share2 size={13} /> Partager :
        </span>
        {SHARE_LINKS(shareUrl, article.title).map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-condensed font-semibold text-itr-blue hover:text-itr-blue-dark px-2 py-1 rounded-full border border-gray-200 hover:border-itr-blue transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>

      {article.cover_image && (
        <img src={article.cover_image} alt="" className="w-full aspect-16/9 object-cover rounded-xl mt-6" />
      )}

      <div className="prose prose-lg max-w-none mt-8 whitespace-pre-line text-itr-ink leading-relaxed">
        {article.content}
      </div>

      <div className="mt-8">
        <AdBanner placement="article_inline" />
      </div>

      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {article.tags.map((tag) => (
            <span key={tag.id} className="bg-gray-100 text-gray-500 text-xs font-condensed px-3 py-1 rounded-full">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <hr className="my-10 border-gray-200" />

      <h2 className="font-display text-xl text-itr-ink mb-4">Commentaires ({article.comments?.length || 0})</h2>

      {user ? (
        <form onSubmit={handleComment} className="flex gap-2 mb-8">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre commentaire..."
            className="flex-1 rounded-full px-4 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
          />
          <button className="bg-itr-blue text-white rounded-full px-4 py-2 hover:bg-itr-blue-dark transition-colors">
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-8">
          <Link to="/connexion" className="text-itr-blue font-semibold">Connecte-toi</Link> pour commenter cet article.
        </p>
      )}

      <div className="space-y-4">
        {(article.comments || []).map((c) => (
          <div key={c.id} className="bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-itr-ink">{c.author_name}</p>
            <p className="text-sm text-gray-600 mt-1">{c.content}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
