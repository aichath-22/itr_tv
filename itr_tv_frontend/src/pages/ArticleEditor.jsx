import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Send, Trash2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import * as api from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS = {
  draft: "Brouillon",
  pending: "En attente de validation",
  published: "Publié",
  rejected: "Rejeté",
  archived: "Archivé",
};

const REVIEW_ACTION_LABELS = {
  submitted: "Soumis",
  approved: "Approuvé",
  rejected: "Rejeté",
  revision: "Révision demandée",
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-condensed font-bold uppercase text-gray-500 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-itr-red mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none";

export default function ArticleEditor() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();
  const { user, hasRoleAtLeast } = useAuth();

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", cover_image: "", attached_pdf: "",
    category: "", tags: [],
  });
  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    api.getCategories().then(({ data }) => setCategories(data.results || data)).catch(() => {});
    api.getTags().then(({ data }) => setTags(data.results || data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    api
      .getArticle(slug)
      .then(({ data }) => {
        setArticle(data);
        setForm({
          title: data.title,
          excerpt: data.excerpt || "",
          content: data.content,
          cover_image: data.cover_image || "",
          attached_pdf: data.attached_pdf || "",
          category: data.category?.id || "",
          tags: (data.tags || []).map((t) => t.id),
        });
        return api.getArticleReviews(data.id);
      })
      .then(({ data }) => setReviews(data.results || data))
      .catch(() => setFormError("Impossible de charger cet article."))
      .finally(() => setLoading(false));
  }, [slug, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleTag = (tagId) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((id) => id !== tagId) : [...f.tags, tagId],
    }));
  };

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const { data: tag } = await api.createTag(name);
      setTags((t) => [...t, tag]);
      setForm((f) => ({ ...f, tags: [...f.tags, tag.id] }));
      setNewTagName("");
    } catch {
      setFormError("Impossible de créer ce tag.");
    }
  };

  const buildPayload = () => ({
    ...form,
    category: form.category ? Number(form.category) : null,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError("");
    try {
      if (isEditing) {
        const { data } = await api.updateArticle(slug, buildPayload());
        setArticle(data);
      } else {
        const { data } = await api.createArticle(buildPayload());
        navigate(`/tableau-de-bord/articles/${data.slug}/modifier`, { replace: true });
        return;
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setFieldErrors(err.response.data);
      } else if (err.response?.status === 403) {
        setFormError("Vous n'avez pas la permission de modifier cet article.");
      } else {
        setFormError("Une erreur est survenue pendant l'enregistrement.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForValidation = async () => {
    setSubmitting(true);
    try {
      await api.submitArticle(slug);
      navigate("/tableau-de-bord");
    } catch {
      setFormError("Impossible de soumettre cet article à validation.");
      setSubmitting(false);
    }
  };

  const handleReview = async (decision) => {
    let comment = "";
    if (decision === "reject") {
      comment = window.prompt("Raison du rejet (optionnel) :") || "";
    }
    setReviewing(true);
    try {
      await api.reviewArticle(slug, decision, comment);
      navigate("/tableau-de-bord");
    } catch {
      setFormError("Impossible d'enregistrer cette décision.");
      setReviewing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    setDeleting(true);
    try {
      await api.deleteArticle(slug);
      navigate("/tableau-de-bord");
    } catch {
      setFormError("Impossible de supprimer cet article.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 animate-pulse text-gray-400">Chargement...</div>;
  }

  const canEdit = !isEditing || !article || article.author === user?.id || user?.role !== "journaliste";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-itr-ink">
          {isEditing ? "Modifier l'article" : "Nouvel article"}
        </h1>
        {article && (
          <span className="text-xs font-condensed font-bold uppercase text-itr-blue bg-itr-blue/10 px-3 py-1 rounded-full">
            {STATUS_LABELS[article.status] || article.status}
          </span>
        )}
      </div>

      {!canEdit && (
        <p className="text-sm text-itr-red bg-itr-red/10 rounded-lg p-3 mb-6">
          Cet article appartient à un autre journaliste. Vous pouvez le consulter mais pas l'enregistrer.
        </p>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <Field label="Titre" error={fieldErrors.title?.[0]}>
          <input name="title" required value={form.title} onChange={handleChange} className={inputClass} disabled={!canEdit} />
        </Field>

        <Field label="Chapô (résumé court)" error={fieldErrors.excerpt?.[0]}>
          <textarea name="excerpt" rows={2} value={form.excerpt} onChange={handleChange} className={inputClass} disabled={!canEdit} />
        </Field>

        <Field label="Contenu" error={fieldErrors.content?.[0]}>
          <textarea name="content" rows={12} required value={form.content} onChange={handleChange} className={inputClass} disabled={!canEdit} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Image de couverture (URL)" error={fieldErrors.cover_image?.[0]}>
            <input name="cover_image" type="url" value={form.cover_image} onChange={handleChange} className={inputClass} disabled={!canEdit} />
          </Field>
          <Field label="PDF joint (URL)" error={fieldErrors.attached_pdf?.[0]}>
            <input name="attached_pdf" type="url" value={form.attached_pdf} onChange={handleChange} className={inputClass} disabled={!canEdit} />
          </Field>
        </div>

        <Field label="Catégorie" error={fieldErrors.category?.[0]}>
          <select name="category" required value={form.category} onChange={handleChange} className={inputClass} disabled={!canEdit}>
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Tags" error={fieldErrors.tags?.[0]}>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <button
                type="button"
                key={t.id}
                disabled={!canEdit}
                onClick={() => toggleTag(t.id)}
                className={`text-xs font-condensed px-3 py-1 rounded-full border transition-colors ${
                  form.tags.includes(t.id)
                    ? "bg-itr-blue text-white border-itr-blue"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nouveau tag..."
                className="flex-1 rounded-lg px-3 py-1.5 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
              />
              <button type="button" onClick={handleAddTag} className="text-sm font-semibold text-itr-blue px-3">
                Ajouter
              </button>
            </div>
          )}
        </Field>

        {formError && <p className="text-sm text-itr-red">{formError}</p>}

        {canEdit && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              disabled={saving}
              className="bg-itr-blue hover:bg-itr-blue-dark text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Créer l'article"}
            </button>

            {isEditing && article?.status === "draft" && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitForValidation}
                className="flex items-center gap-1.5 bg-itr-red hover:bg-itr-red-dark text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors disabled:opacity-50"
              >
                <Send size={14} /> {submitting ? "Envoi..." : "Soumettre à validation"}
              </button>
            )}

            {isEditing && article?.status === "pending" && hasRoleAtLeast("admin") && (
              <>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReview("approve")}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={14} /> {reviewing ? "..." : "Valider"}
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReview("reject")}
                  className="flex items-center gap-1.5 bg-itr-red hover:bg-itr-red-dark text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors disabled:opacity-50"
                >
                  <XCircle size={14} /> {reviewing ? "..." : "Rejeter"}
                </button>
              </>
            )}

            {isEditing && (
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-itr-red ml-auto disabled:opacity-50"
              >
                <Trash2 size={14} /> {deleting ? "Suppression..." : "Supprimer"}
              </button>
            )}
          </div>
        )}
      </form>

      {isEditing && reviews.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-display text-base text-itr-ink mb-4">Historique de validation</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="text-sm border-l-2 border-itr-blue/30 pl-3">
                <p>
                  <strong>{REVIEW_ACTION_LABELS[r.action] || r.action_display}</strong> par {r.actor_name}{" "}
                  <span className="text-gray-400">
                    · {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </p>
                {r.comment && <p className="text-gray-500 mt-0.5">« {r.comment} »</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
