import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BreakingBar from "../components/BreakingBar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-itr-paper">
      <Header />
      <BreakingBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
