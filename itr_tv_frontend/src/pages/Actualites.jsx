import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import * as api from "../api/endpoints";
import ArticleCard from "../components/ArticleCard";

export default function Actualites() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categorie") || "";
  const [queryInput, setQueryInput] = useState(searchParams.get("recherche") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(queryInput);

  useEffect(() => {
    api.getCategories().then(({ data }) => setCategories(data.results || data)).catch(() => {});
  }, []);

  // Débounce : une recherche par API après une pause de frappe, pas à chaque caractère.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(queryInput), 300);
    return () => clearTimeout(timeout);
  }, [queryInput]);

  useEffect(() => {
    setLoading(true);
    const params = { status: "published", ordering: "-published_at" };
    if (activeCategory) params.category = activeCategory;
    if (debouncedQuery) params.search = debouncedQuery;
    api
      .getArticles(params)
      .then(({ data }) => setArticles(data.results || data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedQuery]);

  const setCategory = (categoryId) => {
    const next = new URLSearchParams(searchParams);
    if (categoryId) next.set("categorie", categoryId);
    else next.delete("categorie");
    setSearchParams(next);
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQueryInput(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("recherche", value);
    else next.delete("recherche");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl text-itr-ink">Actualités</h1>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un article..."
            value={queryInput}
            onChange={handleQueryChange}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm focus:border-itr-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-condensed font-semibold uppercase transition-colors ${
            !activeCategory ? "bg-itr-blue text-white" : "bg-white text-itr-ink border border-gray-200 hover:border-itr-blue"
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-condensed font-semibold uppercase transition-colors ${
              activeCategory === String(cat.id)
                ? "bg-itr-blue text-white"
                : "bg-white text-itr-ink border border-gray-200 hover:border-itr-blue"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-4/3 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-400 py-16 font-display text-xl">Aucun article trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
