import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AutoPage from "./pages/AutoPage";
import RemontPage from "./pages/RemontPage";
import "./main.scss";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"       element={<Dashboard />} />
            <Route path="/auto"   element={<AutoPage />} />
            <Route path="/remont" element={<RemontPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
