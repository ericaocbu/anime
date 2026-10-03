import { useSearchParams, Link } from "react-router-dom";
import { useSearchAnime } from "../hooks/useSearch";
import AnimeGrid from "../components/anime/AnimeGrid";
import "../styles/search.css";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q")?.trim() || "";
  const page = Number(searchParams.get("page")) || 1;

  const {
    data,
    isLoading,
    isError,
  } = useSearchAnime(query, page);

  const results = data?.data || [];
  const pagination = data?.pagination;

  function goToPage(nextPage) {
    setSearchParams({
      q: query,
      page: nextPage.toString(),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!query) {
    return (
      <section className="search-results-page">
        <div className="search-results-page__empty">
          <SearchIcon />
          <h1>Search anime</h1>
          <p>
            Use the search button above to find an anime.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="search-results-page">
      <div className="search-results-page__header">
        <p className="search-results-page__eyebrow">
          Search results
        </p>

        <h1>
          Results for{" "}
          <span>"{query}"</span>
        </h1>

        {!isLoading && !isError && (
          <p className="search-results-page__count">
            {pagination?.items?.total || results.length} anime
            found
          </p>
        )}
      </div>

      {isLoading && (
        <div className="search-results-page__message">
          Searching for anime...
        </div>
      )}

      {isError && (
        <div className="search-results-page__message">
          <h2>Search is temporarily unavailable.</h2>
          <p>
            Couldn't complete this search right now.
            Please try again in a moment.
          </p>
        </div>
      )}

      {!isLoading && !isError && results.length === 0 && (
        <div className="search-results-page__message">
          <h2>No exact results found.</h2>
          <p>
            Try a shorter title, an alternate spelling, or a
            different part of the anime's name.
          </p>
        </div>
      )}

      {!isLoading && !isError && results.length > 0 && (
        <>
          <AnimeGrid anime={results} />

          {pagination?.has_next_page && (
            <div className="search-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </button>

              <span>
                Page {page}
              </span>

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default Search;