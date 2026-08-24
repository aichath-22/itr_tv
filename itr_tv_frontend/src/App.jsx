import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Actualites from "./pages/Actualites";
import ArticleDetail from "./pages/ArticleDetail";
import WebTV from "./pages/WebTV";
import Emissions from "./pages/Emissions";
import Redaction from "./pages/Redaction";
import APropos from "./pages/APropos";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ArticleEditor from "./pages/ArticleEditor";
import AdminUsers from "./pages/admin/Users";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/actualites/:slug" element={<ArticleDetail />} />
            <Route path="/webtv" element={<WebTV />} />
            <Route path="/emissions" element={<Emissions />} />
            <Route path="/redaction" element={<Redaction />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/connexion" element={<Auth />} />
            <Route
              path="/tableau-de-bord"
              element={
                <ProtectedRoute minRole="journaliste">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tableau-de-bord/articles/nouveau"
              element={
                <ProtectedRoute minRole="journaliste">
                  <ArticleEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tableau-de-bord/articles/:slug/modifier"
              element={
                <ProtectedRoute minRole="journaliste">
                  <ArticleEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tableau-de-bord/utilisateurs"
              element={
                <ProtectedRoute minRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
