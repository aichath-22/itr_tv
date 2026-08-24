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
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.getCategories().then(({ data }) => setCategories(data.results || data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { status: "published", ordering: "-published_at" };
    if (activeCategory) params.category = activeCategory;
    if (query) params.search = query;
    api
      .getArticles(params)
      .then(({ data }) => setArticles(data.results || data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCategory, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl text-itr-ink">Actualités</h1>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un article..."
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm focus:border-itr-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSearchParams({})}
          className={`px-4 py-1.5 rounded-full text-sm font-condensed font-semibold uppercase transition-colors ${
            !activeCategory ? "bg-itr-blue text-white" : "bg-white text-itr-ink border border-gray-200 hover:border-itr-blue"
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ categorie: cat.id })}
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
