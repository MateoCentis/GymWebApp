import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import "../styles/Navbar.css";
import logo from "../assets/logoGarden.svg";

interface NavbarItem {
  label: string;
  route?: string;
  dropdown?: { label: string; route?: string }[];
}

interface NavbarButton {
  label: string;
  route?: string;
  className: string;
}

interface NavbarProps {
  items?: NavbarItem[];
  rightItems?: NavbarButton[];
}

function Nabvar({
  items = [
    { label: "Alumnos", route: "/" },
    { label: "Ejercicios", route: "/ejercicios" },
    { label: "Cuotas", route: "/cuotas" },
    { label: "Datos", route: "/datos" },
  ],
  rightItems = [
    {
      label: "Cerrar sesión",
      route: "/logout",
      className: "is-light is-small",
    },
  ],
}: NavbarProps) {
  const [isActive, setIsActive] = useState(false); // State for burger menu

  const toggleBurger = () => {
    setIsActive(!isActive);
  };
  return (
    <nav
      className="navbar is-transparent"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        {/* Logo */}
        <div className="navbar-item logo-container">
          <img src={logo} alt="Garden" className="logo" />
        </div>
        {/* Burguer */}
        <a
          role="button"
          className={`navbar-burger ${isActive ? "is-active" : ""}`}
          aria-label="menu"
          aria-expanded={isActive}
          data-target="navbarBasicExample"
          onClick={toggleBurger}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      {/* Items al lado del logo */}
      <div
        id="navbarBasicExample"
        className={`navbar-menu ${isActive ? "is-active" : ""}`}
      >
        {/* Active class */}
        <div className="navbar-start">
          {items?.map((item, index) =>
            item.dropdown ? (
              <div
                key={index}
                className="navbar-item has-dropdown is-hoverable"
              >
                <a className="navbar-link">{item.label}</a>
                <div className="navbar-dropdown">
                  {item.dropdown.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      className="navbar-item"
                      to={subItem.route || "#"}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={index}
                to={item.route || "#"}
                className={({ isActive }) =>
                  `navbar-item ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </div>
        {/* La parte derecha (acá poner el cerrar sesión) */}
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {rightItems?.map((btn, index) => (
                <Link
                  key={index}
                  className={`button ${btn.className || ""} navbar-end-button`}
                  to={btn.route || "#"}
                >
                  <strong>{btn.label}</strong>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nabvar;

// Ejemplo de use

// const navItems: NavbarItem[] = [
//     { label: "Datos", route: "/datos" },
//     { label: "Alumnos", route: "/alumnos" },
//     { label: "Cuotas", route: "/cuotas" },
//     {
//       label: "More",
//       dropdown: [
//         { label: "About", route: "/about" },
//         { label: "Jobs", route: "/jobs" },
//         { label: "Contact", route: "/contact" },
//       ],
//     },
//   ];

//   const rightButtons: NavbarButton[] = [
//     { label: "Sign up", className: "is-primary", route: "/signup" },
//     { label: "Log in", className: "is-light", route: "/login" },
//   ];

//   <Navbar items={navItems} rightItems={rightButtons} />;
