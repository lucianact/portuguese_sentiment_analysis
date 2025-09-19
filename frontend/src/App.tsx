import "./index.css";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AboutMe from "./pages/AboutMe";
import AboutProject from "./pages/AboutProject";

function App() {
  const location = useLocation(); // NEW

  // Decide what to show in the footer based on current path
  const pathname = location.pathname;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-me" element={<AboutMe />} />
        <Route path="/about-project" element={<AboutProject />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Footer should appear ONLY on the Home page */}
      {pathname === "/" && (
        <footer className="footer-links" aria-label="About links">
          <Link to="/about-me">About me</Link>
          <span aria-hidden="true">|</span>
          <Link to="/about-project">About this project</Link>
        </footer>
      )}
    </>
  );
}

export default App;
