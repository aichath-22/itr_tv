import { useEffect, useState } from "react";
import * as api from "../api/endpoints";

export default function BreakingBar() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .getBreakingNews()
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  const loopItems = [...items, ...items];

  return (
    <div className="bg-itr-red text-white overflow-hidden">
      <div className="mx-auto max-w-7xl flex items-stretch">
        <div className="shrink-0 bg-itr-red-dark px-4 py-2 font-condensed font-bold tracking-wide uppercase text-sm flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          En direct
        </div>
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {loopItems.map((item, i) => (
              <a
                key={i}
                href={item.link || "#"}
                className="mx-6 font-condensed text-sm hover:underline"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
