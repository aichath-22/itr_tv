import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as api from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

const ROLE_OPTIONS = [
  { value: "abonne", label: "Abonné" },
  { value: "journaliste", label: "Journaliste" },
  { value: "redacteur_chef", label: "Rédacteur en chef" },
  { value: "admin", label: "Administrateur" },
  { value: "super_admin", label: "Super administrateur" },
];

const SENSITIVE_ROLES = ["admin", "super_admin"];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  const load = () => {
    setLoading(true);
    api.getUsers(search).then(({ data }) => setUsers(data.results || data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (target, role) => {
    setBusyId(target.id);
    setRowErrors((e) => ({ ...e, [target.id]: null }));
    try {
      const { data } = await api.updateUser(target.id, { role });
      setUsers((list) => list.map((u) => (u.id === target.id ? data : u)));
    } catch (err) {
      setRowErrors((e) => ({ ...e, [target.id]: err.response?.data?.role?.[0] || "Modification refusée." }));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (target) => {
    setBusyId(target.id);
    try {
      const { data } = await api.updateUser(target.id, { is_active: !target.is_active });
      setUsers((list) => list.map((u) => (u.id === target.id ? data : u)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/tableau-de-bord" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-itr-blue mb-6">
        <ArrowLeft size={15} /> Retour au tableau de bord
      </Link>

      <h1 className="font-display text-2xl text-itr-ink mb-1">Utilisateurs</h1>
      <p className="text-gray-500 mb-6">
        {isSuperAdmin
          ? "En tant que super administrateur, vous pouvez attribuer n'importe quel rôle."
          : "Les rôles Administrateur et Super administrateur sont réservés au super administrateur."}
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom d'utilisateur ou email..."
        className="w-full rounded-lg px-3 py-2 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none mb-5"
      />

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-condensed font-bold uppercase text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-6 text-gray-400">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-gray-400">Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-itr-ink">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={busyId === u.id || isSelf}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="rounded-lg px-2 py-1.5 border border-gray-200 text-sm focus:border-itr-blue focus:outline-none disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option
                              key={r.value}
                              value={r.value}
                              disabled={!isSuperAdmin && SENSITIVE_ROLES.includes(r.value)}
                            >
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {isSelf && <p className="text-xs text-gray-400 mt-1">Vous ne pouvez pas modifier votre propre rôle.</p>}
                        {rowErrors[u.id] && <p className="text-xs text-itr-red mt-1">{rowErrors[u.id]}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={busyId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs font-condensed font-bold uppercase px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                            u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {u.is_active ? "Actif" : "Désactivé"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
