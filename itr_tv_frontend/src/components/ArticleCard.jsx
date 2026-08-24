import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

export default function ArticleCard({ article, size = "md" }) {
  const isLarge = size === "lg";

  return (
    <Link
      to={`/actualites/${article.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`relative ${isLarge ? "aspect-16/9" : "aspect-4/3"} bg-gray-200 overflow-hidden`}>
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-itr-blue-deep text-white/40 font-display text-2xl">
            ITR TV
          </div>
        )}
        {article.category && (
          <span className="absolute top-3 left-3 bg-itr-red text-white text-xs font-condensed font-bold uppercase tracking-wide px-2.5 py-1 rounded">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className={`font-display leading-snug text-itr-ink group-hover:text-itr-blue-dark transition-colors ${isLarge ? "text-xl" : "text-base"}`}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400 font-condensed">
          <span>{article.author_name}</span>
          <span className="flex items-center gap-1">
            <Eye size={13} /> {article.views_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
