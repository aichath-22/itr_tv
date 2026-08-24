import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-full.jpeg";

const NAV_LINKS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/actualites", label: "Actualités" },
  { to: "/webtv", label: "Web TV" },
  { to: "/emissions", label: "Émissions" },
  { to: "/redaction", label: "Rédaction" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut, hasRoleAtLeast } = useAuth();

  const linkClass = ({ isActive }) =>
    `relative font-condensed font-semibold uppercase text-sm tracking-wide px-3 py-2 transition-colors after:absolute after:left-3 after:right-3 after:-bottom-px after:h-[3px] after:rounded-full after:transition-opacity ${
      isActive
        ? "text-itr-red after:bg-itr-red after:opacity-100"
        : "text-itr-ink hover:text-itr-blue after:bg-itr-blue after:opacity-0 hover:after:opacity-60"
    }`;

  const todayLabel = (() => {
    const s = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm">
      <div className="hidden sm:block border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 h-8 flex items-center justify-between">
          <span className="font-condensed text-[11px] uppercase tracking-[0.15em] text-gray-400">{todayLabel}</span>
          <span className="font-condensed text-[11px] uppercase tracking-[0.15em] text-gray-400">itrtv.bj · L'information en continu</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-16 gap-4">
        <Link to="/" className="shrink-0 flex items-center h-full py-2">
          <img src={logo} alt="ITR TV — L'Information en Temps Réel" className="h-12 w-auto object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button
            aria-label="Rechercher"
            className="p-2 rounded-lg hover:bg-itr-paper text-itr-ink transition-colors"
          >
            <Search size={20} />
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              {hasRoleAtLeast("journaliste") && (
                <Link
                  to="/tableau-de-bord"
                  className="font-condensed font-semibold text-sm uppercase text-itr-blue-dark hover:text-itr-blue px-3 py-2"
                >
                  Tableau de bord
                </Link>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-2 bg-itr-ink text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-black transition-colors"
              >
                <User size={16} /> {user.username}
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="bg-itr-blue text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-itr-blue-dark transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-itr-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 font-condensed font-semibold uppercase text-sm ${
                    isActive ? "text-itr-red" : "text-itr-ink"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                {hasRoleAtLeast("journaliste") && (
                  <Link
                    to="/tableau-de-bord"
                    onClick={() => setOpen(false)}
                    className="py-3 font-condensed font-semibold uppercase text-sm text-itr-blue-dark"
                  >
                    Tableau de bord
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="py-3 text-left font-condensed font-semibold uppercase text-sm text-itr-ink"
                >
                  Déconnexion ({user.username})
                </button>
              </>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setOpen(false)}
                className="py-3 font-condensed font-semibold uppercase text-sm text-itr-blue"
              >
                Connexion / Inscription
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
