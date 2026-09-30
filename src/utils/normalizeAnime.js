export function normalizeAnime(anime) {
  if (!anime) {
    return null;
  }

  return {
    id: anime.id,

    title:
      anime.title?.english ||
      anime.title?.romaji ||
      anime.title?.native ||
      "Unknown Title",

    englishTitle:
      anime.title?.english || null,

    romajiTitle:
      anime.title?.romaji || null,

    nativeTitle:
      anime.title?.native || null,

    image:
      anime.coverImage?.extraLarge ||
      anime.coverImage?.large ||
      anime.coverImage?.medium ||
      null,

    bannerImage:
      anime.bannerImage || null,

    type:
      anime.type || null,

    format:
      anime.format || null,

    status:
      anime.status || null,

    description:
      anime.description || "",

    episodes:
      anime.episodes || null,

    duration:
      anime.duration || null,

    score:
      anime.averageScore != null
        ? anime.averageScore / 10
        : null,

    averageScore:
      anime.averageScore || null,

    meanScore:
      anime.meanScore || null,

    popularity:
      anime.popularity || 0,

    trending:
      anime.trending || 0,

    favourites:
      anime.favourites || 0,

    genres:
      anime.genres || [],

    synonyms:
      anime.synonyms || [],

    tags:
      anime.tags || [],

    season:
      anime.season || null,

    seasonYear:
      anime.seasonYear || null,

    startDate:
      anime.startDate || null,

    endDate:
      anime.endDate || null,

    nextAiringEpisode:
      anime.nextAiringEpisode || null,

    isAdult:
      anime.isAdult || false,

    isLicensed:
      anime.isLicensed || false,

    source:
      anime.source || null,

    countryOfOrigin:
      anime.countryOfOrigin || null,

    hashtag:
      anime.hashtag || null,

    trailer:
      anime.trailer || null,

    relations:
      anime.relations?.edges || [],

    characters:
      anime.characters?.edges || [],

    staff:
      anime.staff?.edges || [],

    studios:
      anime.studios?.edges || [],

    externalLinks:
      anime.externalLinks || [],

    streamingEpisodes:
      anime.streamingEpisodes || [],

    rankings:
      anime.rankings || [],

    siteUrl:
      anime.siteUrl || null,
  };
}