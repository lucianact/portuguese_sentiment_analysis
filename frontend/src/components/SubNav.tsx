import { Link } from "react-router-dom";

export default function SubNav({ current }: { current: "about-project" | "about-me" }) {
  return (
    <nav className="subnav" aria-label="Secondary">
      <Link to="/">Home</Link>
      <span className="divider" aria-hidden="true">|</span>
      {current === "about-project" ? (
        <Link to="/about-me">About me</Link>
      ) : (
        <Link to="/about-project">About this project</Link>
      )}
    </nav>
  );
}
