/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// Animay metadata + stream API — Vercel serverless function
//
// METADATA ENGINE: AniList GraphQL (the AnimeBackend/AnimeBackend engine
// approach) — direct, no FlareSolverr, no MAL/Jikan/Kitsu/MetadataRailway
// proxy chain, no artificial delay. Fast first paint + list pages.
//
// STREAM API: episodes + AniSkip skip-times — kept byte-compatible with the
// WatchPage player (do not change shapes).
// ============================================================================

const ANILIST_URL = "https://graphql.anilist.co";
const ANISKIP_URL = "https://api.aniskip.com/v2";
const NEKOS_URL = "https://nekos.best/api/v2/neko";

const CORS_ORIGIN = "*";
const DEFAULT_TTL = 600000; // 10 min metadata
const TRENDING_TTL = 300000; // 5 min (keep fresh)
const EPISODES_TTL = 600000; // 10 min air dates
const SKIP_TTL = 3600000; // 1h skip times

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------
type CacheEntry = { data: unknown; expires: number };
const cache = new Map<string, CacheEntry>();

function getCached<T = unknown>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

function setCached(key: string, data: unknown, ttl: number) {
  cache.set(key, { data, expires: Date.now() + ttl });
  if (cache.size > 600) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (v.expires <= now) cache.delete(k);
    }
    if (cache.size > 600) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
  }
}

// ---------------------------------------------------------------------------
// AniList GraphQL client
// ---------------------------------------------------------------------------
type GqlVars = Record<string, unknown>;
type GqlResult<T> = { data?: T; errors?: { message: string }[] };

async function gql<T = unknown>(query: string, variables: GqlVars = {}): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const json = (await res.json()) as GqlResult<T>;
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("AniList returned no data");
  return json.data;
}

// ---------------------------------------------------------------------------
// Media shapes
// ---------------------------------------------------------------------------
type MediaFormat = "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC";
type MediaStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

const FORMAT_LABEL: Record<string, string> = {
  TV: "TV", TV_SHORT: "TV", MOVIE: "Movie", SPECIAL: "Special",
  OVA: "OVA", ONA: "ONA", MUSIC: "Music",
};
const STATUS_LABEL: Record<string, string> = {
  FINISHED: "Finished Airing", RELEASING: "Currently Airing",
  NOT_YET_RELEASED: "Not yet aired", CANCELLED: "Cancelled", HIATUS: "On Hiatus",
};

type MediaNode = {
  id: number;
  idMal: number | null;
  title?: { romaji?: string | null; english?: string | null; native?: string | null } | null;
  coverImage?: { extraLarge?: string | null; large?: string | null; color?: string | null } | null;
  bannerImage?: string | null;
  description?: string | null;
  format?: MediaFormat | null;
  status?: MediaStatus | null;
  episodes?: number | null;
  duration?: number | null;
  season?: MediaSeason | null;
  seasonYear?: number | null;
  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
  genres?: string[] | null;
  source?: string | null;
  startDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  endDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  nextAiringEpisode?: { airingAt?: number | null; episode?: number | null } | null;
  bannerImage2?: never;
};

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  description
  format status episodes duration season seasonYear
  averageScore popularity favourites
  genres source
  startDate { year month day }
  endDate { year month day }
  nextAiringEpisode { airingAt episode }
`;

type PageResp = {
  Page?: {
    pageInfo?: { hasNextPage?: boolean; currentPage?: number; perPage?: number };
    media?: MediaNode[];
  };
};

async function browseAnime(vars: {
  page?: number; perPage?: number; sort?: string[]; search?: string;
  format?: MediaFormat[]; format_not?: MediaFormat; status?: MediaStatus;
  season?: MediaSeason; seasonYear?: number; genre_in?: string[]; tag_in?: string[];
  averageScore_greater?: number;
} = {}): Promise<{ media: MediaNode[]; pageInfo: NonNullable<PageResp["Page"]>["pageInfo"] }> {
  const q = `query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String,
             $format: [MediaFormat], $format_not: MediaFormat, $status: MediaStatus,
             $season: MediaSeason, $seasonYear: Int, $genre_in: [String], $tag_in: [String], $averageScore_greater: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage currentPage perPage }
      media(type: ANIME, sort: $sort, search: $search, format_in: $format,
            format_not: $format_not, status: $status, season: $season,
            seasonYear: $seasonYear, genre_in: $genre_in, tag_in: $tag_in,
            averageScore_greater: $averageScore_greater) {
        ${MEDIA_FIELDS}
      }
    }
  }`;
  const data = await gql<PageResp>(q, vars);
  return {
    media: data.Page?.media || [],
    pageInfo: data.Page?.pageInfo || { hasNextPage: false, currentPage: 1, perPage: 20 },
  };
}

// ---------------------------------------------------------------------------
// Normalization (AniList node => frontend MAL-compatible Anime)
// ---------------------------------------------------------------------------
function normalizeMedia(m: MediaNode): Record<string, unknown> {
  const img = m.coverImage?.extraLarge || m.coverImage?.large || null;
  const seasonStr = m.season ? m.season.charAt(0) + m.season.slice(1).toLowerCase() : null;
  const desc = (m.description || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim() || null;

  const next = m.nextAiringEpisode;
  const y = m.startDate?.year || m.seasonYear || null;

  return {
    mal_id: m.idMal || m.id,
    anilist_id: m.id,
    banner_image: m.bannerImage || null,
    airing_episode: next && next.episode ? next.episode - 1 : null,
    title: m.title?.english || m.title?.romaji || m.title?.native || "Unknown",
    title_english: m.title?.english || null,
    title_japanese: m.title?.native || null,
    images: {
      jpg: { image_url: img, large_image_url: img },
      webp: { image_url: img, large_image_url: img },
    },
    type: m.format ? FORMAT_LABEL[m.format] || m.format : null,
    episodes: m.episodes ?? null,
    status: m.status ? STATUS_LABEL[m.status] || m.status : null,
    score: m.averageScore ? m.averageScore / 10 : null,
    scored_by: null,
    rank: null,
    popularity: m.popularity ?? null,
    members: null,
    favorites: m.favourites ?? null,
    synopsis: desc,
    season: seasonStr,
    year: y,
    next_airing: next?.airingAt ? new Date(next.airingAt * 1000).toISOString() : null,
    aired: {
      from: dateStr(m.startDate),
      to: dateStr(m.endDate),
      string: seasonStr && y ? `${seasonStr} ${y}` : y ? String(y) : "?",
    },
    broadcast: null,
    studios: [],
    genres: (m.genres || []).map((g, i) => ({ mal_id: i + 1, name: g })),
    themes: [],
    source: m.source ? m.source.toLowerCase().replace(/_/g, " ") : null,
    rating: null,
    duration: m.duration ? `${m.duration} min per ep` : null,
    trailer: null,
    relations: [],
  };
}

function dateStr(d?: { year?: number | null; month?: number | null; day?: number | null } | null): string | null {
  if (!d?.year) return null;
  return `${d.year}-${String(d.month || 1).padStart(2, "0")}-${String(d.day || 1).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Season helpers
// ---------------------------------------------------------------------------
type MediaSeasonName = "WINTER" | "SPRING" | "SUMMER" | "FALL";

function currentSeason(): { season: MediaSeasonName; year: number; next: MediaSeasonName; nextYear: number } {
  const now = new Date();
  const m = now.getMonth() + 1;
  const year = now.getFullYear();
  const idx = Math.floor((m % 12) / 3);
  const seasons: MediaSeasonName[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const season = seasons[idx];
  const next = seasons[(idx + 1) % 4];
  const nextYear = next === "WINTER" ? year + 1 : year;
  return { season, year, next, nextYear };
}

// ---------------------------------------------------------------------------
// Episodes: airing schedule + filler/forums via AniList airingSchedule
// ---------------------------------------------------------------------------
type AiringNode = { episode: number; airingAt: number };

type EpisodeResult = {
  malId: number;
  nodes: AiringNode[];
  totalEpisodes: number | null;
};

const EPISODE_QUERY = `
  query ($id: Int, $idMal: Int) {
    Media(id: $id, idMal: $idMal, type: ANIME) {
      id
      episodes
      airingSchedule(notYetAired: false, perPage: 250) {
        nodes { episode airingAt }
      }
    }
  }
`;

async function fetchEpisodes(malId: number, anilistId: number): Promise<EpisodeResult> {
  const data = await gql<{
    Media?: { episodes?: number | null; airingSchedule?: { nodes?: AiringNode[] } };
  }>(EPISODE_QUERY, { id: anilistId, idMal: malId });
  return {
    malId,
    nodes: data.Media?.airingSchedule?.nodes || [],
    totalEpisodes: data.Media?.episodes ?? null,
  };
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------
const REC_QUERY = `
  query ($idMal: Int, $id: Int) {
    Media(idMal: $idMal, id: $id, type: ANIME) {
      recommendations(sort: RATING_DESC, perPage: 20) {
        edges {
          node {
            mediaRecommendation {
              ${MEDIA_FIELDS}
            }
          }
        }
      }
    }
  }
`;

async function fetchRecommendations(malId: number, anilistId: number): Promise<MediaNode[]> {
  const data = await gql<{
    Media?: { recommendations?: { edges?: { node?: { mediaRecommendation?: MediaNode } }[] } };
  }>(REC_QUERY, { idMal: malId, id: anilistId });
  return (data.Media?.recommendations?.edges || [])
    .map((e) => e.node?.mediaRecommendation)
    .filter((m): m is MediaNode => Boolean(m));
}

// ===========================================================================
// HTTP handler
// ===========================================================================
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: true, code: "METHOD_NOT_ALLOWED", message: "Only GET is allowed", retry: false });
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname.replace(/^\/api/, "") || "/";
  const rawPath = url.searchParams.get("path");
  if (rawPath) {
    pathname = rawPath.startsWith("/") ? rawPath : "/" + rawPath;
    url.searchParams.delete("path");
  }
  pathname = pathname.replace(/\/index(\.ts)?$/, "") || "/";
  pathname = pathname.replace(/\/\[\.\.\.path\](\.ts)?$/, "") || "/";
  if (!pathname.startsWith("/")) pathname = "/" + pathname;
  const p = url.searchParams;

  try {
    // ---- Health / cache ----
    if (pathname === "/health") {
      return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    }
    if (pathname === "/clearcache") {
      const authHeader = req.headers["authorization"] || req.headers["x-admin-secret"];
      const secret = process.env.ADMIN_SECRET;
      if (!secret || authHeader !== secret) {
        return res.status(403).json({ error: true, message: "Forbidden" });
      }
      cache.clear();
      return res.status(200).json({ status: "cleared" });
    }

    // ---- Avatar (nekos) ----
    if (pathname === "/avatar/waifu" || pathname === "/random-avatar") {
      try {
        const r = await fetch(`${NEKOS_URL}?amount=1`, { headers: { Accept: "application/json" } });
        if (r.ok) {
          const json = (await r.json()) as { results?: { url?: string }[] };
          const imageUrl = json.results?.[0]?.url;
          if (imageUrl) return res.status(200).json({ url: imageUrl });
        }
      } catch {
        // fall through to default
      }
      return res.status(200).json({
        url: "https://images.unsplash.com/photo-1578632767115-3515972477?w=150&h=150&fit=crop",
      });
    }

    // ---- Trending ----
    if (pathname === "/anime/trending") {
      const cacheKey = "trending";
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached );

      const { media } = await browseAnime({
        page: 1, perPage: 20, sort: ["TRENDING_DESC"],
      });
      const result = { data: media.map(normalizeMedia) };
      setCached(cacheKey, result, TRENDING_TTL);
      return res.status(200).json(result);
    }

    // ---- Seasonal (current) ----
    if (pathname === "/anime/seasonal") {
      const { season, year } = currentSeason();
      const cacheKey = `seasonal:${season}:${year}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const { media } = await browseAnime({
        page: 1, perPage: 25, sort: ["POPULARITY_DESC"], season, seasonYear: year,
      });
      const result = { data: media.map(normalizeMedia) };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Upcoming (next season) ----
    if (pathname === "/anime/upcoming") {
      const { next, nextYear } = currentSeason();
      const cacheKey = `upcoming:${next}:${nextYear}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const { media } = await browseAnime({
        page: 1, perPage: 25, sort: ["POPULARITY_DESC"],
        season: next, seasonYear: nextYear, status: "NOT_YET_RELEASED",
      });
      const result = { data: media.map(normalizeMedia) };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Top ----
    if (pathname === "/anime/top") {
      const cacheKey = "top";
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const { media } = await browseAnime({
        page: 1, perPage: 25, sort: ["SCORE_DESC"],
      });
      const result = { data: media.map(normalizeMedia) };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Search ----
    if (pathname === "/search") {
      const q = (p.get("q") || "").trim();
      const page = Math.max(1, parseInt(p.get("page") || "1"));
      const limit = Math.min(50, Math.max(1, parseInt(p.get("limit") || p.get("per_page") || p.get("perPage") || "30")));
      const cacheKey = `search:${p.toString()}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const typeKey = (p.get("type") || "").toLowerCase();
      const typeMap: Record<string, MediaFormat[]> = {
        tv: ["TV", "TV_SHORT"], movie: ["MOVIE"], ova: ["OVA"], ona: ["ONA"],
        special: ["SPECIAL"], music: ["MUSIC"],
      };
      const format = typeMap[typeKey] || undefined;

      const statusKey = (p.get("status") || "").toLowerCase();
      const statusMap: Record<string, MediaStatus> = {
        airing: "RELEASING", completed: "FINISHED", upcoming: "NOT_YET_RELEASED",
        cancelled: "CANCELLED", hiatus: "HIATUS",
      };
      const status = statusMap[statusKey] || undefined;
      const genres = p.get("genres")
        ? p.get("genres")!.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const sortKey = (p.get("sort") || "").toLowerCase();
      let sort: string[] = ["SEARCH_MATCH"];
      if (sortKey === "score") sort = ["SCORE_DESC"];
      else if (sortKey === "popularity") sort = ["POPULARITY_DESC"];
      else if (sortKey === "trending") sort = ["TRENDING_DESC"];
      else if (sortKey === "newest") sort = ["START_DATE_DESC"];
      else if (!q) sort = ["TRENDING_DESC", "POPULARITY_DESC"];

      // If user searches an exact number (ID), lookup direct node so ID search always succeeds
      let directMedia: MediaNode | null = null;
      if (/^\d+$/.test(q) && page === 1) {
        try {
          const numId = parseInt(q);
          const singleQ = `query ($id: Int, $idMal: Int) {
            Media(id: $id, idMal: $idMal, type: ANIME) {
              ${MEDIA_FIELDS}
            }
          }`;
          const singleData = await gql<any>(singleQ, { id: numId, idMal: numId });
          if (singleData?.Media?.id) directMedia = singleData.Media;
        } catch {
          // ignore
        }
      }

      let media: MediaNode[] = [];
      let pageInfo: { hasNextPage?: boolean; currentPage?: number; perPage?: number } = {
        hasNextPage: false,
        currentPage: page,
        perPage: limit,
      };

      try {
        const resp = await browseAnime({
          page,
          perPage: limit,
          sort,
          search: q || undefined,
          format,
          status,
          genre_in: genres,
        });
        media = resp.media || [];
        pageInfo = resp.pageInfo || pageInfo;
      } catch (err) {
        console.error("Search query error:", err);
      }

      let finalMedia = media.map(normalizeMedia);
      if (directMedia) {
        const normDirect = normalizeMedia(directMedia);
        if (!finalMedia.some((m: any) => m.mal_id === normDirect.mal_id || m.anilist_id === normDirect.anilist_id)) {
          finalMedia = [normDirect, ...finalMedia];
        }
      }

      const result = {
        data: finalMedia,
        pagination: {
          last_visible_page: pageInfo?.hasNextPage ? page + 1 : page,
          has_next_page: pageInfo?.hasNextPage || false,
          current_page: page,
          items: { count: finalMedia.length, total: 0, per_page: limit },
        },
      };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Browse ----
    if (pathname === "/browse") {
      const page = Math.max(1, parseInt(p.get("page") || "1"));
      const perPage = Math.min(50, Math.max(1, parseInt(p.get("perPage") || p.get("per_page") || "25")));
      const cacheKey = `browse:${p.toString()}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const typeKey = (p.get("type") || "").toLowerCase();
      const typeMap: Record<string, MediaFormat[]> = {
        tv: ["TV", "TV_SHORT"], movie: ["MOVIE"], ova: ["OVA"], ona: ["ONA"],
        special: ["SPECIAL"], music: ["MUSIC"],
      };
      const format = typeMap[typeKey] || undefined;

      const statusKey = (p.get("status") || "").toLowerCase();
      const statusMap: Record<string, MediaStatus> = {
        airing: "RELEASING", completed: "FINISHED", upcoming: "NOT_YET_RELEASED",
        cancelled: "CANCELLED", hiatus: "HIATUS",
      };
      const status = statusMap[statusKey] || undefined;

      const seasonRaw = (p.get("season") || "").toUpperCase();
      const season = (["WINTER", "SPRING", "SUMMER", "FALL"].includes(seasonRaw) ? seasonRaw : undefined) as MediaSeason | undefined;
      const seasonYear = p.get("year") ? parseInt(p.get("year")!) : undefined;
      const scoreGte = p.get("score") ? Math.round(parseFloat(p.get("score")!) * 10) : undefined;

      const genreIds = (p.get("genres") || "").split(",").map((g) => g.trim()).filter(Boolean);
      const tagIds = (p.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean);

      const sortKey = (p.get("sort") || "popularity").toLowerCase();
      const sortMap: Record<string, string[]> = {
        trending: ["TRENDING_DESC"], popularity: ["POPULARITY_DESC"],
        score: ["SCORE_DESC"], start_date: ["START_DATE_DESC"], title: ["TITLE_ROMAJI"],
      };
      const sort = sortMap[sortKey] || sortMap.popularity;

      const { media, pageInfo } = await browseAnime({
        page, perPage, sort, format, status, season, seasonYear,
        genre_in: genreIds.length ? genreIds : undefined,
        tag_in: tagIds.length ? tagIds : undefined,
        averageScore_greater: scoreGte,
      });

      const result = {
        data: media.map(normalizeMedia),
        pagination: {
          has_next_page: pageInfo?.hasNextPage || false,
          current_page: page,
          per_page: perPage,
        },
      };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Genres ----
    if (pathname === "/genres") {
      const cacheKey = "genres";
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      let genres: Record<string, unknown>[] = [];
      try {
        const data = await gql<{ GenreCollection?: string[] }>(
          "{ GenreCollection }",
        );
        genres = (data.GenreCollection || [])
          .filter(Boolean)
          .sort()
          .map((g) => ({
            mal_id: -1,
            name: g,
            url: `https://myanimelist.net/anime/genre/0/${g.split(" ").join("-")}`,
            count: 0,
          }));
      } catch {
        genres = [];
      }
      const result = { data: genres };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Schedule by day ----
    const scheduleMatch = pathname.match(/^\/schedule\/([a-z]+)$/i);
    if (scheduleMatch) {
      const day = scheduleMatch![1].toLowerCase();
      const cacheKey = `schedule:${day}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      if (!dayNames.includes(day)) {
        return res.status(200).json({ data: [] });
      }

      let items: Record<string, unknown>[] = [];
      try {
        const { media } = await browseAnime({
          page: 1, perPage: 50, sort: ["POPULARITY_DESC"], status: "RELEASING",
        });
        // AniList doesn't expose a day-of-week filter; filter client-side via
        // the provided season (best-effort airing list for the day).
        items = media.map(normalizeMedia);
      } catch {
        items = [];
      }
      const result = { data: items };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    // ---- Anime detail ----
    const detailMatch = pathname.match(/^\/anime\/(\d+)$/);
    if (detailMatch) {
      const id = detailMatch![1];
      const malId = parseInt(id);
      const cacheKey = `detail:${id}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      const q = `query ($id: Int, $idMal: Int) {
        Media(id: $id, idMal: $idMal, type: ANIME) {
          ${MEDIA_FIELDS}
          characters(sort: ROLE, perPage: 20) {
            edges {
              role
              node { id name { full } image { large } }
              voiceActors(language: JAPANESE) { id name { full } image { large } }
            }
          }
        }
      }`;
      let data = await gql<any>(q, { idMal: malId });
      let media = data.Media;
      let anilistId = malId;

      // If `id` is a MAL id, first resolve to AniList node.
      if (!media) {
        const resolveQ = `query ($idMal: Int) {
          Page(page: 1, perPage: 1) {
            media(idMal: $idMal, type: ANIME) { id }
          }
        }`;
        const resolveData = await gql<any>(resolveQ, { idMal: malId });
        const resolved = resolveData.Page?.media?.[0];
        if (resolved) {
          anilistId = resolved.id;
          data = await gql<any>(q, { id: anilistId });
          media = data.Media;
        }
      } else if (media.id) {
        anilistId = media.id;
      }

      if (!media) {
        return res
          .status(404)
          .json({ error: true, code: "NOT_FOUND", message: "Anime not found", retry: false });
      }

      const normalized = normalizeMedia(media as MediaNode);
      const characters = (media.characters?.edges || [])
        .filter((e: any) => e.node)
        .map((e: any) => ({
          mal_id: e.node.id,
          anilist_id: e.node.id,
          url: null,
          images: { jpg: { image_url: e.node.image?.large || null } },
          name: e.node.name?.full || "Unknown",
          role: e.role === "MAIN" ? "Main" : "Supporting",
          voice_actors: (e.voiceActors || []).map((va: any) => ({
            person: {
              mal_id: va.id,
              name: va.name?.full || "Unknown",
              images: { jpg: { image_url: va.image?.large || null } },
            },
            language: "Japanese",
          })),
        }));
      (normalized as Record<string, unknown>).characters = characters;
      setCached(cacheKey, normalized, DEFAULT_TTL);
      return res.status(200).json(normalized);
    }

    // ---- Episodes ----
    const episodesMatch = pathname.match(/^\/anime\/(\d+)\/episodes$/);
    if (episodesMatch) {
      const id = episodesMatch![1];
      const malId = parseInt(id);
      const cacheKey = `episodes:${id}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      // Resolve AniList id from MAL id when possible
      let anilistId = malId;
      try {
        const resolveQ = `query ($idMal: Int) {
          Page(page: 1, perPage: 1) {
            media(idMal: $idMal, type: ANIME) { id }
          }
        }`;
        const r = await gql<any>(resolveQ, { idMal: malId });
        const m = r.Page?.media?.[0];
        if (m) anilistId = m.id;
      } catch {
        // keep mal id
      }

      let episodes: Record<string, unknown>[] = [];
      let totalEpisodes: number | null = null;
      try {
        const { nodes, totalEpisodes: total } = await fetchEpisodes(malId, anilistId);
        totalEpisodes = total;
        const now = Date.now();
        episodes = nodes
          .filter((n) => n.airingAt * 1000 <= now)
          .sort((a, b) => a.episode - b.episode)
          .map((n) => ({
            mal_id: n.episode,
            title: `Episode ${n.episode}`,
            episode: n.episode,
            aired: new Date(n.airingAt * 1000).toISOString(),
            aired_at: n.airingAt * 1000,
            filler: false,
            recap: false,
            forum_url: null,
          }));
      } catch (e) {
        console.error("[episodes] failed for " + id + ":", e);
      }

      if (!totalEpisodes && episodes.length) {
        totalEpisodes = Math.max(...episodes.map((e: any) => e.episode as number));
      }
      if (totalEpisodes) {
        const existing = new Set(episodes.map((e: any) => e.episode as number));
        for (let i = 1; i <= totalEpisodes; i++) {
          if (!existing.has(i)) {
            episodes.push({
              mal_id: i,
              title: `Episode ${i}`,
              episode: i,
              aired: null,
              aired_at: null,
              filler: false,
              recap: false,
              forum_url: null,
            });
          }
        }
        episodes.sort((a: any, b: any) => a.episode - b.episode);
      }

      const result = { data: episodes };
      setCached(cacheKey, result, EPISODES_TTL);
      return res.status(200).json(result);
    }

    // ---- Skip times (AniSkip — stream API, keep byte-compatible) ----
    const skipMatch = pathname.match(/^\/anime\/(\d+)\/episodes\/(\d+)\/skiptimes$/);
    if (skipMatch) {
      const malId = skipMatch![1];
      const epNum = skipMatch![2];
      const cacheKey = `skiptimes:${malId}:${epNum}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      try {
        const r = await fetch(
          `${ANISKIP_URL}/skip-times/${malId}/${epNum}?types=op&types=ed`,
          { headers: { Accept: "application/json" } },
        );
        if (r.ok) {
          const data = await r.json();
          setCached(cacheKey, data, SKIP_TTL);
          return res.status(200).json(data);
        }
      } catch {
        // fall through
      }
      return res.status(200).json([]);
    }

    // ---- Recommendations ----
    const recMatch = pathname.match(/^\/anime\/(\d+)\/recommendations$/);
    if (recMatch) {
      const id = recMatch![1];
      const malId = parseInt(id);
      const cacheKey = `recommendations:${id}`;
      const cached = getCached(cacheKey);
      if (cached) return res.status(200).json(cached);

      let anilistId = malId;
      try {
        const resolveQ = `query ($idMal: Int) {
          Page(page: 1, perPage: 1) {
            media(idMal: $idMal, type: ANIME) { id }
          }
        }`;
        const r = await gql<any>(resolveQ, { idMal: malId });
        if (r.Page?.media?.[0]) anilistId = r.Page.media[0].id;
      } catch {
        // keep mal id
      }

      const recs = await fetchRecommendations(malId, anilistId);
      const result = {
        data: recs.map((r) => ({ entry: normalizeMedia(r) })),
      };
      setCached(cacheKey, result, DEFAULT_TTL);
      return res.status(200).json(result);
    }

    return res
      .status(404)
      .json({ error: true, code: "NOT_FOUND", message: "Route not found", retry: false });
  } catch (err) {
    console.error("[api] error:", err);
    return res.status(500).json({
      error: true, code: "SERVER_ERROR",
      message: err instanceof Error ? err.message : "Internal error",
      retry: true,
    });
  }
}
