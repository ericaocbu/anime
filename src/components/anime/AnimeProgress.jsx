function AnimeProgress({
  currentEpisode,
  totalEpisodes,
}) {
  if (!currentEpisode) {
    return null;
  }

  const hasTotalEpisodes =
    typeof totalEpisodes === "number" &&
    totalEpisodes > 0;

  const progress = hasTotalEpisodes
    ? Math.min((currentEpisode / totalEpisodes) * 100, 100)
    : 0;

  return (
    <div className="anime-progress">
      <div className="anime-progress__header">
        <span>Episode {currentEpisode}</span>

        {hasTotalEpisodes && (
          <span>/ {totalEpisodes}</span>
        )}
      </div>

      {hasTotalEpisodes && (
        <div
          className="anime-progress__track"
          aria-label={`Episode ${currentEpisode} of ${totalEpisodes}`}
        >
          <div
            className="anime-progress__bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default AnimeProgress;