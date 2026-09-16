import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimeHero } from '@/components/anime/AnimeHero';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { CharacterList } from '@/components/anime/CharacterList';
import { RelatedAnime } from '@/components/anime/RelatedAnime';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAnimeDetail, useAnimeEpisodes } from '@/hooks/useAnime';
import { apiClient } from '@/api/client';
import { AlertCircle, List, Users, ListVideo } from 'lucide-react';
import type { Anime } from '@/types/anime';

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

  return (
    <PageWrapper>
      <AnimeHero anime={anime} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {visibleEpisodes && visibleEpisodes.length > 0 && (
          <section className="scroll-mt-20">
            <h2 className="font-display font-semibold text-xl text-text-primary mb-5 flex items-center gap-2">
              <List className="w-5 h-5 stroke-[1.5]" />
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
              <Users className="w-5 h-5 stroke-[1.5]" />
              Characters & Voice Actors
              <span className="text-sm font-mono font-medium text-text-muted ml-1">({anime.characters.length})</span>
            </h2>
            <CharacterList characters={anime.characters} />
          </section>
        )}

        {similar.data && similar.data.length > 0 && (
          <section className="scroll-mt-20">
            <div className="flex items-center gap-2 mb-5">
              <ListVideo className="w-5 h-5 stroke-[1.5] text-text-primary" />
              <h2 className="font-display font-semibold text-xl text-text-primary">More Like This</h2>
            </div>
            <div className="pl-7">
              <RelatedAnime anime={similar.data} />
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
