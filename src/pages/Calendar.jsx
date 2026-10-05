import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSchedule } from "../hooks/useSchedule";
import { useMyList } from "../hooks/useMyList";
import "../styles/calendar.css";

function formatDay(timestamp) {
  const date = new Date(timestamp * 1000);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatShortDay(timestamp) {
  const date = new Date(timestamp * 1000);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getDateKey(timestamp) {
  const date = new Date(timestamp * 1000);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function groupByDay(schedule) {
  const groups = new Map();

  schedule.forEach((item) => {
    if (!item?.nextAiringEpisode?.airingAt) {
      return;
    }

    const airingAt = item.nextAiringEpisode.airingAt;

    const key = getDateKey(airingAt);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        timestamp: airingAt,
        items: [],
      });
    }

    groups.get(key).items.push(item);
  });

  return Array.from(groups.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt,
      ),
    }));
}

function getDayNumber(timestamp) {
  return new Date(timestamp * 1000).getDate();
}

function isToday(timestamp) {
  const date = new Date(timestamp * 1000);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function CalendarItem({ anime }) {
  const episode = anime.nextAiringEpisode;

  if (!episode) {
    return null;
  }

  const airingToday = isToday(episode.airingAt);

  return (
    <Link
      to={`/anime/${anime.id}`}
      className={`calendar-item ${airingToday ? "calendar-item--today" : ""}`}
    >
      <div className="calendar-item__time">{formatTime(episode.airingAt)}</div>

      <div className="calendar-item__poster">
        {anime.image ? (
          <img src={anime.image} alt={anime.title} loading="lazy" />
        ) : (
          <div className="calendar-item__placeholder">No Image</div>
        )}
      </div>

      <div className="calendar-item__content">
        <div className="calendar-item__title-row">
          <h3>{anime.title}</h3>

          {airingToday && <span className="calendar-item__today">Today</span>}
        </div>

        <div className="calendar-item__meta">
          <span className="calendar-item__episode">
            Episode {episode.episode}
          </span>

          {anime.format && <span>{anime.format}</span>}

          {anime.score != null && <span>★ {anime.score.toFixed(1)}</span>}
        </div>
      </div>

      <div className="calendar-item__arrow">→</div>
    </Link>
  );
}

function Calendar() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: schedule = [], isLoading, isError, error } = useSchedule();

  const { myList } = useMyList();

  const myShowIds = useMemo(
    () => new Set(myList.map((item) => item.id)),
    [myList],
  );

  const filteredSchedule = useMemo(() => {
    if (activeTab === "my") {
      return schedule.filter((anime) => myShowIds.has(anime.id));
    }

    return schedule;
  }, [activeTab, schedule, myShowIds]);

  const groupedSchedule = useMemo(
    () => groupByDay(filteredSchedule),
    [filteredSchedule],
  );

  if (isLoading) {
    return (
      <div className="calendar">
        <header className="calendar__header">
          <div>
            <p className="calendar__eyebrow">Schedule</p>

            <h1>Calendar</h1>

            <p>Keep up with what’s airing.</p>
          </div>
        </header>

        <div className="calendar__tabs">
          <div className="calendar__tab-skeleton" />
          <div className="calendar__tab-skeleton" />
        </div>

        <div className="calendar-loading">
          <div className="calendar-loading__day" />

          <div className="calendar-loading__items">
            <div />
            <div />
            <div />
          </div>

          <div className="calendar-loading__day" />

          <div className="calendar-loading__items">
            <div />
            <div />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="calendar">
        <header className="calendar__header">
          <div>
            <p className="calendar__eyebrow">Schedule</p>

            <h1>Calendar</h1>

            <p>Keep up with what’s airing.</p>
          </div>
        </header>

        <div className="calendar-error">
          <h2>We couldn't load the calendar.</h2>

          <p>
            {error?.message ||
              "Something went wrong while loading the airing schedule."}
          </p>

          <button type="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar">
      <header className="calendar__header">
        <div>
          <p className="calendar__eyebrow">Schedule</p>

          <h1>Calendar</h1>

          <p>Keep up with what’s airing.</p>
        </div>

        <div className="calendar__week-summary">
          <strong>{filteredSchedule.length}</strong>

          <span>
            {filteredSchedule.length === 1
              ? "episode this week"
              : "episodes this week"}
          </span>
        </div>
      </header>

      <div
        className="calendar__tabs"
        role="tablist"
        aria-label="Calendar views"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          className={`calendar__tab ${
            activeTab === "all" ? "calendar__tab--active" : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Airing
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "my"}
          className={`calendar__tab ${
            activeTab === "my" ? "calendar__tab--active" : ""
          }`}
          onClick={() => setActiveTab("my")}
        >
          My Shows
        </button>
      </div>

      {groupedSchedule.length === 0 ? (
        <div className="calendar-empty">
          <div className="calendar-empty__icon">○</div>

          <h2>
            {activeTab === "my"
              ? "None of your shows are airing this week."
              : "No upcoming episodes found."}
          </h2>

          <p>
            {activeTab === "my"
              ? "Shows from your list will appear here when they have an upcoming episode."
              : "AniList doesn't currently have upcoming airing information for this period."}
          </p>

          {activeTab === "my" && (
            <Link to="/discover" className="calendar-empty__link">
              Find something to watch
            </Link>
          )}
        </div>
      ) : (
        <div className="calendar__schedule">
          {groupedSchedule.map((day) => {
            const dayIsToday = isToday(day.timestamp);

            return (
              <section
                key={day.key}
                className={`calendar-day ${
                  dayIsToday ? "calendar-day--today" : ""
                }`}
              >
                <div className="calendar-day__header">
                  <div className="calendar-day__date">
                    <span className="calendar-day__weekday">
                      {formatShortDay(day.timestamp)}
                    </span>

                    <span className="calendar-day__number">
                      {getDayNumber(day.timestamp)}
                    </span>
                  </div>

                  <div className="calendar-day__heading">
                    <div className="calendar-day__title-row">
                      <h2>{formatDay(day.timestamp)}</h2>

                      {dayIsToday && (
                        <span className="calendar-day__today">Today</span>
                      )}
                    </div>

                    <span>
                      {day.items.length}{" "}
                      {day.items.length === 1 ? "episode" : "episodes"}
                    </span>
                  </div>
                </div>

                <div className="calendar-day__items">
                  {day.items.map((anime) => (
                    <CalendarItem
                      key={`${anime.id}-${anime.nextAiringEpisode?.episode}`}
                      anime={anime}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Calendar;