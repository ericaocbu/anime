import { NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  List,
  CalendarDays,
  Search,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Discover",
    path: "/discover",
    icon: Compass,
  },
  {
    label: "My List",
    path: "/my-list",
    icon: List,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Main navigation">
        <div className="navbar__links">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `navbar__link ${isActive ? "navbar__link--active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;