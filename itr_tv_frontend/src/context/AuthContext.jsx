import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("itr_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.getMe();
      setUser(data);
    } catch {
      localStorage.removeItem("itr_access_token");
      localStorage.removeItem("itr_refresh_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (username, password) => {
    const { data } = await api.login(username, password);
    localStorage.setItem("itr_access_token", data.access);
    localStorage.setItem("itr_refresh_token", data.refresh);
    const { data: me } = await api.getMe();
    setUser(me);
    return me;
  };

  const signOut = () => {
    localStorage.removeItem("itr_access_token");
    localStorage.removeItem("itr_refresh_token");
    setUser(null);
  };

  const signUp = async (payload) => {
    await api.register(payload);
    return signIn(payload.username, payload.password);
  };

  const roleRank = {
    abonne: 1,
    journaliste: 2,
    admin: 3,
  };

  const hasRoleAtLeast = (role) =>
    !!user && roleRank[user.role] >= roleRank[role];

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, signUp, hasRoleAtLeast }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
