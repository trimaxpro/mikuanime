import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimeHero } from '@/components/anime/AnimeHero';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { CharacterList } from '@/components/anime/CharacterList';
import { RelatedAnime } from '@/components/anime/RelatedAnime';
import { EmptyState } from '@/components/ui/EmptyState';
import { SEO, buildDescription } from '@/components/common/SEO';
import { useAnimeDetail, useAnimeEpisodes } from '@/hooks/useAnime';
import { apiClient } from '@/api/client';
import { AlertCircle, List, Users, ListVideo, ExternalLink } from 'lucide-react';
import type { Anime } from '@/types/anime';

const ANIME_URL = (id: number) => `https://www.mikuanime.site/anime/${id}`;

function buildAnimeFaq(anime: Anime) {
  const name = anime.title_english || anime.title;
  const genreText = anime.genres.map((g) => g.name).join(', ') || 'a range of genres';
  const questions: { q: string; a: string }[] = [];

  if (anime.synopsis) {
    const firstSentence = buildDescription(anime.synopsis, 240);
    questions.push({
      q: `What is ${name} about?`,
      a: firstSentence,
    });
  }

  questions.push({
    q: `Where can I watch ${name} online?`,
    a: `You can watch ${name} online free in HD on MikuAnime, with subbed and dubbed audio plus a full episode list and weekly airing updates.`,
  });

  if (anime.episodes) {
    questions.push({
      q: `How many episodes does ${name} have?`,
      a: `${name} has ${anime.episodes} ${anime.episodes === 1 ? 'episode' : 'episodes'}${anime.duration ? ` with a runtime of about ${anime.duration} each` : ''}.`,
    });
  } else if (anime.status && /Airing/i.test(anime.status)) {
    questions.push({
      q: `How many episodes does ${name} have?`,
      a: `${name} is currently airing, so new episodes are added to the schedule on MikuAnime as they release.`,
    });
  }

  if (anime.genres.length > 0) {
    questions.push({
      q: `What genre is ${name}?`,
      a: `${name} is an anime series that mixes ${genreText}.`,
    });
  }

  if (anime.status) {
    const isAiring = /Airing/i.test(anime.status);
    questions.push({
      q: `Is ${name} still airing?`,
      a: isAiring
        ? `Yes, ${name} is currently airing — follow the MikuAnime schedule to catch new episodes the day they drop.`
        : `No, ${name} has finished airing${anime.aired?.to ? ` (${anime.aired.to})` : ''}. All released episodes are available to watch on MikuAnime.`,
    });
  }

  return questions.map((item) => ({
    '@type': 'Question',
    'name': item.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
  }));
}

function buildAnimeSchema(anime: Anime): Record<string, unknown>[] {
  const name = anime.title_english || anime.title;
  const url = ANIME_URL(anime.mal_id);
  const image = anime.images.jpg?.large_image_url || anime.images.jpg?.image_url;
  const schemaType = anime.type === 'Movie' ? 'Movie' : anime.type === 'TV' ? 'TVSeries' : 'CreativeWorkSeason';

  const series: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    'name': name,
    'alternateName': [anime.title, anime.title_japanese].filter(Boolean),
    'url': url,
    'image': image,
    'description': anime.synopsis ? buildDescription(anime.synopsis, 280) : `Watch ${name} online free in HD on MikuAnime.`,
    'genre': anime.genres.map((g) => g.name),
    'inLanguage': 'ja',
    'numberOfEpisodes': anime.episodes ?? undefined,
    'datePublished': anime.aired?.from ?? undefined,
    'dateModified': anime.aired?.to ?? undefined,
    'productionCompany': anime.studios?.length
      ? anime.studios.map((s) => ({ '@type': 'Organization', 'name': s.name }))
      : undefined,
    'aggregateRating': anime.score
      ? { '@type': 'AggregateRating', 'ratingValue': anime.score, 'bestRating': 10, 'worstRating': 0, 'ratingCount': anime.scored_by ?? 1 }
      : undefined,
  };
  Object.keys(series).forEach((k) => series[k] === undefined && delete series[k]);

  const breadcrumb: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.mikuanime.site/' },
      { '@type': 'ListItem', 'position': 2, 'name': name, 'item': url },
    ],
  };

  const faq: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': buildAnimeFaq(anime),
  };

  return [series, breadcrumb, faq];
}

export default function AnimePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const animeId = Number(id);

  const detail = useAnimeDetail(animeId);
  const episodes = useAnimeEpisodes(animeId, 120000);
  const genreIds = detail.data?.genres?.map((g) => g.name).join(',') || '';
  const similar = useQuery({
    queryKey: ['similar', animeId, genreIds],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Anime[] }>(`/browse?genres=${genreIds}&sort=score&perPage=15`);
      return (data.data || []).filter((a) => a.mal_id !== animeId).slice(0, 12);
    },
    enabled: !!genreIds,
    staleTime: 10 * 60 * 1000,
  });

  if (detail.isError) {
    return (
      <PageWrapper className="pt-24 pb-12 px-4">
        <SEO title="Anime Not Found or Unavailable" description="This anime page could not be loaded. Explore the full MikuAnime catalog instead." noindex />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load anime"
          message="Something went wrong loading this content."
          actionLabel="Try Again"
          onAction={() => detail.refetch()}
        />
      </PageWrapper>
    );
  }

  if (detail.isLoading) {
    return (
      <PageWrapper>
        <SEO title="Loading Anime" description="Almost there — loading this title." noindex />
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <img src="/loader.gif" alt="Loading..." className="w-24 h-24 object-contain" />
          <p className="font-display text-base text-text-muted animate-pulse">Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  const anime = detail.data;
  if (!anime) {
    return (
      <PageWrapper className="pt-24 pb-12 px-4">
        <SEO title="Anime Not Found" description="This anime could not be found. It may have been removed or the link is incorrect." noindex />
        <EmptyState
          icon={AlertCircle}
          title="Anime not found"
          message="This anime could not be found. It may have been removed or the link is incorrect."
          actionLabel="Browse Anime"
          onAction={() => navigate('/browse')}
        />
      </PageWrapper>
    );
  }

  const isAiring = anime.status === 'Currently Airing' || anime.status === 'Airing';
  const visibleEpisodes = isAiring
    ? episodes.data?.filter((ep) => ep.aired !== null && ep.aired !== '')
    : episodes.data;

  const title = anime.title_english || anime.title;
  const description = anime.synopsis
    ? buildDescription(`${anime.synopsis.trim()} Watch ${title} free in HD, subbed and dubbed, on MikuAnime with a full episode list and airing schedule.`)
    : `Watch ${title} online free in HD on MikuAnime — stream subbed and dubbed episodes, browse the episode list and follow its airing schedule.`;

  return (
    <PageWrapper>
      <SEO
        title={title}
        description={description}
        canonical={`/anime/${anime.mal_id}`}
        ogImage={anime.images.jpg?.large_image_url || anime.images.jpg?.image_url}
        ogType={anime.type === 'Movie' ? 'video.movie' : 'video.tv_show'}
        keywords={[title, ...anime.genres.map((g) => g.name)]}
        schema={buildAnimeSchema(anime)}
      />

      <AnimeHero anime={anime} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {visibleEpisodes && visibleEpisodes.length > 0 && (
          <section className="scroll-mt-20">
            <h2 className="font-display font-semibold text-xl text-text-primary mb-5 flex items-center gap-2">
              <List className="w-5 h-5 text-accent-glow stroke-[1.5]" />
              Episodes
              <span className="text-sm font-mono font-medium text-text-muted ml-1">
                {isAiring ? `${visibleEpisodes.length}/${episodes.data?.length}` : visibleEpisodes.length}
              </span>
            </h2>
            <EpisodeGrid animeId={animeId} episodes={visibleEpisodes} isLoading={episodes.isLoading} posterImage={anime.images.jpg?.image_url} isAiring={isAiring} />
          </section>
        )}

        {anime.characters && anime.characters.length > 0 && (
          <section className="scroll-mt-20">
            <h2 className="font-display font-semibold text-xl text-text-primary mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-glow stroke-[1.5]" />
              Characters & Voice Actors
              <span className="text-sm font-mono font-medium text-text-muted ml-1">({anime.characters.length})</span>
            </h2>
            <CharacterList characters={anime.characters} />
          </section>
        )}

        {similar.data && similar.data.length > 0 && (
          <section className="scroll-mt-20">
            <div className="flex items-center gap-2 mb-5">
              <ListVideo className="w-5 h-5 text-accent-glow stroke-[1.5]" />
              <h2 className="font-display font-semibold text-xl text-text-primary">More Like This</h2>
            </div>
            <div className="pl-7">
              <RelatedAnime anime={similar.data} />
            </div>
          </section>
        )}

        <section className="scroll-mt-20">
          <h2 className="font-display font-semibold text-xl text-text-primary mb-5">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-border-subtle/70 max-w-3xl">
            {buildAnimeFaq(anime).map((item) => (
              <div key={item.q} className="py-4">
                <h3 className="font-body font-semibold text-text-primary text-base mb-1.5">{item.q}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle/70">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-3">Info & Sources</p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={`https://myanimelist.net/anime/${anime.mal_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-glow border border-border-subtle hover:border-accent-primary/40 px-3.5 py-2 rounded-card bg-elevated/50 transition-colors"
              >
                MyAnimeList <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
              </a>
              {anime.anilist_id && (
                <a
                  href={`https://anilist.co/anime/${anime.anilist_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-glow border border-border-subtle hover:border-accent-primary/40 px-3.5 py-2 rounded-card bg-elevated/50 transition-colors"
                >
                  AniList <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                </a>
              )}
              {anime.trailer?.url && (
                <a
                  href={anime.trailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-glow border border-border-subtle hover:border-accent-primary/40 px-3.5 py-2 rounded-card bg-elevated/50 transition-colors"
                >
                  Official Trailer <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}