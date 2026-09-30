import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  List,
  CalendarDays,
  Search,
  User,
  X,
} from "lucide-react";
import { useSearchAnime } from "../../hooks/useSearch";
import "../../styles/search.css";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Discover", path: "/discover", icon: Compass },
  { label: "My List", path: "/my-list", icon: List },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Profile", path: "/profile", icon: User },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchRef = useRef(null);

  const trimmedQuery = query.trim();

  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchError,
  } = useSearchAnime(trimmedQuery);

  const suggestions = (searchResults?.data || []).slice(0, 5);

  useEffect(() => {
    setIsSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function openSearch() {
    setIsSearchOpen(true);
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setQuery("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!trimmedQuery) return;

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setIsSearchOpen(false);
  }

  function handleSuggestionClick(anime) {
    navigate(`/anime/${anime.id}`);
    setIsSearchOpen(false);
  }

  return (
    <>
      <header className="navbar">
        <nav className="navbar__inner" aria-label="Main navigation">
          <div className="navbar__links">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `navbar__link ${
                    isActive ? "navbar__link--active" : ""
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}

            <button
              type="button"
              className="navbar__link navbar__search-button"
              onClick={openSearch}
              aria-label="Search anime"
              aria-expanded={isSearchOpen}
            >
              <Search size={18} strokeWidth={1.8} />
              <span>Search</span>
            </button>
          </div>
        </nav>
      </header>

      {isSearchOpen && (
        <div className="search-overlay">
          <div
            className="search-panel"
            ref={searchRef}
          >
            <form onSubmit={handleSubmit}>
              <div className="search-panel__input-wrapper">
                <Search
                  size={20}
                  strokeWidth={1.8}
                  className="search-panel__icon"
                />

                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search anime..."
                  aria-label="Search anime"
                />

                <button
                  type="button"
                  className="search-panel__close"
                  onClick={closeSearch}
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
            </form>

            {trimmedQuery && (
              <div className="search-suggestions">
                {searchLoading && (
                  <p className="search-suggestions__message">
                    Searching...
                  </p>
                )}

                {!searchLoading &&
                  !searchError &&
                  suggestions.length > 0 && (
                    <>
                      {suggestions.map((anime) => {
                        return (
                          <button
                            key={anime.id}
                            type="button"
                            className="search-suggestion"
                            onClick={() =>
                              handleSuggestionClick(anime)
                            }
                          >
                            {anime.image ? (
                              <img
                                src={anime.image}
                                alt=""
                                className="search-suggestion__image"
                              />
                            ) : (
                              <div className="search-suggestion__placeholder" />
                            )}
                            <div className="search-suggestion__content">
                              <span className="search-suggestion__title">
                                {anime.title}
                              </span>

                              <span className="search-suggestion__meta">
                                {anime.type || "Anime"}
                                {anime.seasonYear
                                  ? ` • ${anime.seasonYear}`
                                  : ""}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="search-suggestions__all"
                        onClick={handleSubmit}
                      >
                        View all results for "{trimmedQuery}"
                      </button>
                    </>
                  )}

                {!searchLoading &&
                  !searchError &&
                  suggestions.length === 0 && (
                    <p className="search-suggestions__message">
                      No anime found. Press Enter to see results.
                    </p>
                  )}

                {searchError && (
                  <p className="search-suggestions__message">
                    Search is temporarily unavailable.
                    Press Enter to try the results page.
                  </p>
                )}
              </div>
            )}

            {!trimmedQuery && (
              <div className="search-panel__hint">
                Search for an anime by title
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;