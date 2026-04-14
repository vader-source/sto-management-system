import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">
        STO<span>.</span>SYSTEM
      </NavLink>
      <ul className="navbar__links">
        <li><NavLink to="/"        className={({isActive}) => isActive ? "active" : ""}>Дашборд</NavLink></li>
        <li><NavLink to="/remont"  className={({isActive}) => isActive ? "active" : ""}>Ремонти</NavLink></li>
        <li><NavLink to="/auto"    className={({isActive}) => isActive ? "active" : ""}>Автомобілі</NavLink></li>
        <li><NavLink to="/zap"     className={({isActive}) => isActive ? "active" : ""}>Запчастини</NavLink></li>
      </ul>
    </nav>
  );
}
