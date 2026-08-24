import { Link } from "react-router-dom";

export default function ArticleListRow({ article }) {
  return (
    <Link
      to={`/actualites/${article.slug}`}
      className="group flex gap-3 py-3 border-b border-gray-100"
    >
      <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-itr-blue-deep text-white/40 font-display text-xs">
            ITR
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {article.category && (
          <span className="text-itr-red font-condensed font-bold text-[11px] uppercase tracking-wide">
            {article.category.name}
          </span>
        )}
        <h3 className="font-display text-sm leading-snug text-itr-ink group-hover:text-itr-blue-dark transition-colors line-clamp-2 mt-0.5">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 font-condensed mt-1">
          {article.author_name} · {article.views_count ?? 0} vues
        </p>
      </div>
    </Link>
  );
}
