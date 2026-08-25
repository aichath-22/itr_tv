import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user, signOut, hasRoleAtLeast } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchValue.trim();
    navigate(term ? `/actualites?recherche=${encodeURIComponent(term)}` : "/actualites");
    setSearchOpen(false);
    setSearchValue("");
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `font-condensed font-semibold uppercase text-sm tracking-wide px-3 py-2 transition-colors ${
      isActive ? "text-itr-red" : "text-itr-ink hover:text-itr-blue"
    }`;

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm">
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
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                autoFocus
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => !searchValue && setSearchOpen(false)}
                placeholder="Rechercher un article..."
                aria-label="Rechercher un article"
                className="w-56 rounded-full px-4 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
              />
            </form>
          ) : (
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-itr-paper text-itr-ink"
            >
              <Search size={20} />
            </button>
          )}
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
                className="flex items-center gap-2 bg-itr-ink text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-black transition-colors"
              >
                <User size={16} /> {user.username}
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="bg-itr-blue text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-itr-blue-dark transition-colors"
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
          <form onSubmit={handleSearchSubmit} className="px-4 pt-3">
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher un article..."
              aria-label="Rechercher un article"
              className="w-full rounded-full px-4 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none"
            />
          </form>
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
