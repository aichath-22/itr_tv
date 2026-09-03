import { useEffect, useState } from "react";
import * as api from "../api/endpoints";

export default function AdBanner({ placement, className = "" }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getBanners(placement)
      .then(({ data }) => {
        if (cancelled) return;
        const banners = data.results || data;
        const picked = banners[0] || null;
        setBanner(picked);
        if (picked) api.trackBannerImpression(picked.id).catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!banner) return null;

  return (
    <a
      href={banner.target_url}
      target="_blank"
      rel="noreferrer sponsored"
      onClick={() => api.trackBannerClick(banner.id).catch(() => {})}
      className={`block group ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-condensed font-bold uppercase tracking-wide text-gray-400">
          Publicité · {banner.sponsor.name}
        </span>
      </div>
      <img
        src={banner.image}
        alt={banner.sponsor.name}
        className="w-full rounded-lg object-cover group-hover:opacity-90 transition-opacity"
      />
    </a>
  );
}
