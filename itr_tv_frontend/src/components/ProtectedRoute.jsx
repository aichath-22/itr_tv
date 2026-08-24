import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, minRole = "abonne" }) {
  const { user, loading, hasRoleAtLeast } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-gray-400">Chargement...</div>;
  }

  if (!user) return <Navigate to="/connexion" replace />;
  if (!hasRoleAtLeast(minRole)) return <Navigate to="/" replace />;

  return children;
}
