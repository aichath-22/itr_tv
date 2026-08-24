import { Link } from "react-router-dom";
import { Radio, Camera, PlaySquare, MessageCircle, Users, Music2 } from "lucide-react";
import { useState } from "react";
import * as api from "../api/endpoints";
import logo from "../assets/logo-compact.jpeg";

const SOCIALS = [
  { icon: Radio, href: "#", label: "Facebook" },
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: PlaySquare, href: "#", label: "YouTube" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
  { icon: Users, href: "#", label: "LinkedIn" },
  { icon: Music2, href: "#", label: "TikTok" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-itr-blue-deep text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <img src={logo} alt="ITR TV" className="h-14 w-auto object-contain bg-white rounded-lg p-1 mb-4" />
          <p className="text-sm text-white/70 leading-relaxed">
            Média numérique béninois dédié à l'information en continu — articles, direct, reportages et interviews.
          </p>
        </div>

        <div>
          <h3 className="font-condensed uppercase text-sm tracking-wider text-white/60 mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/actualites" className="hover:text-itr-red">Actualités</Link></li>
            <li><Link to="/webtv" className="hover:text-itr-red">Web TV</Link></li>
            <li><Link to="/emissions" className="hover:text-itr-red">Émissions</Link></li>
            <li><Link to="/redaction" className="hover:text-itr-red">Rédaction</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-condensed uppercase text-sm tracking-wider text-white/60 mb-3">À propos</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/a-propos" className="hover:text-itr-red">Qui sommes-nous</Link></li>
            <li><Link to="/contact" className="hover:text-itr-red">Contact</Link></li>
            <li><Link to="/connexion" className="hover:text-itr-red">Connexion</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-condensed uppercase text-sm tracking-wider text-white/60 mb-3">Newsletter</h3>
          <p className="text-sm text-white/70 mb-3">Recevez l'essentiel de l'actualité béninoise chaque jour.</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="flex-1 min-w-0 rounded-full px-4 py-2 text-sm text-itr-ink placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-itr-red hover:bg-itr-red-dark rounded-full px-4 py-2 text-sm font-semibold shrink-0 transition-colors"
            >
              OK
            </button>
          </form>
          {status === "success" && <p className="text-xs text-green-300 mt-2">Inscription confirmée, merci !</p>}
          {status === "error" && <p className="text-xs text-red-300 mt-2">Une erreur est survenue, réessayez.</p>}

          <div className="flex gap-3 mt-5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-itr-red transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} ITR TV — InfosEnTempsRéel. Tous droits réservés. — itrtv.bj
      </div>
    </footer>
  );
}
