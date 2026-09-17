import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { VideoPlayer } from '@/components/watch/VideoPlayer';
import { EpisodeList } from '@/components/watch/EpisodeList';
import { WatchInfo } from '@/components/watch/WatchInfo';
import { MiniAnimeCard } from '@/components/ui/MiniAnimeCard';
import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { EpisodeSkeleton } from '@/components/ui/Skeleton';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { useAnimeDetail, useAnimeEpisodes, useSkipTimes } from '@/hooks/useAnime';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { apiClient } from '@/api/client';
import { SEO } from '@/components/common/SEO';
import { AlertCircle, Server, Monitor, Globe, Sparkles, Play, ListVideo, ChevronDown, Radio } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Anime } from '@/types/anime';

const SERVERS = [
  { id: 'anixo', label: 'Anixo', icon: Sparkles },
  { id: 'mal', label: 'MegaPlay', icon: Monitor },
  { id: 'animeplay', label: 'AnimePlay', icon: Globe },
  { id: 'videasy', label: 'Videasy', icon: Play },
  { id: 'filmu', label: 'FilmU', icon: Server },
  { id: 'embed', label: 'TryEmbed', icon: Globe },
  { id: 'anikoto', label: 'Anikoto', icon: Server },
] as const;

export default function WatchPage() {
  const { id, episode: episodeParam } = useParams<{ id: string; episode: string }>();
  const animeId = Number(id);
  const episodeNum = Number(episodeParam) || 1;
  const [server, setServer] = useState<string>('anixo');
  const [serverOpen, setServerOpen] = useState(false);
  const [track, setTrack] = useState<'sub' | 'dub'>('sub');

  const detail = useAnimeDetail(animeId);
  const episodes = useAnimeEpisodes(animeId);
  const skipTimes = useSkipTimes(animeId, episodeNum);
  const { addToHistory } = useWatchHistory();
  const navigate = useNavigate();

  const anime = detail.data;
  const genreNames = anime?.genres?.map((g) => g.name).join(',') || '';
  const similar = useQuery({
    queryKey: ['similar', animeId, genreNames],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Anime[] }>(`/browse?genres=${genreNames}&sort=score&perPage=15`);
      return (data.data || []).filter((a) => a.mal_id !== animeId).slice(0, 12);
    },
    enabled: !!genreNames,
    staleTime: 10 * 60 * 1000,
  });
  const currentEpisode = episodes.data?.find((ep) => ep.episode === episodeNum);

  const targetAniId = anime?.anilist_id;
  const targetMalId = anime?.mal_id || animeId;
  const anilistId = targetAniId || animeId;
  const trackParam = track === 'dub' ? '&track=dub' : '';

  // Anixo server=3 sets Zexy directly as the active server route
  const embedUrl = server === 'anixo'
    ? (targetAniId
      ? `https://anixo.buzz/embed/ani/${targetAniId}/${episodeNum}?player=custom&server=3${trackParam}`
      : `https://anixo.buzz/embed/mal/${targetMalId}/${episodeNum}?player=custom&server=3${trackParam}`)
    : server === 'mal'
    ? `https://megaplay.buzz/stream/mal/${animeId}/${episodeNum}/${track}`
    : server === 'animeplay'
    ? `https://animeplay.cfd/stream/mal/${animeId}/${episodeNum}/${track}`
    : server === 'videasy'
    ? (anime?.type === 'Movie'
      ? `https://player.videasy.net/anime/${anilistId}`
      : `https://player.videasy.net/anime/${anilistId}/${episodeNum}`)
    : server === 'filmu'
    ? `https://embed.filmu.in/embed/anime/${anilistId}/${episodeNum}/${track}`
    : server === 'anikoto'
    ? `https://megaplay.buzz/stream/ani/${anilistId}/${episodeNum}/${track}`
    : `https://tryembed.us.cc/embed/anime/${anilistId}/${episodeNum}/${track}`;

  const animeMalId = anime?.mal_id;
  const animeTitle = anime?.title_english || anime?.title || '';
  const animeImage = anime?.images.jpg?.image_url || '';

  useEffect(() => {
    if (animeMalId) {
      addToHistory({
        malId: animeMalId,
        title: animeTitle,
        image: animeImage,
        episode: episodeNum,
        progress: 0.01,
      });
    }
  }, [animeMalId, animeTitle, animeImage, episodeNum, addToHistory]);

  const isAiring = anime?.status === 'Currently Airing' || anime?.status === 'Airing';
  const visibleEpisodes = useMemo(() => {
    if (!episodes.data) return [];
    if (!isAiring) return episodes.data;
    return episodes.data.filter((ep) => ep.aired !== null && ep.aired !== '');
  }, [episodes.data, isAiring]);
  const maxAvailableEpisode = visibleEpisodes.reduce((max, ep) => Math.max(max, ep.episode), 0);

  const refetchEpisodes = episodes.refetch;
  useEffect(() => {
    if (!isAiring) return;
    const interval = setInterval(() => { refetchEpisodes(); }, 120000);
    return () => clearInterval(interval);
  }, [isAiring, refetchEpisodes]);

  if (detail.isError) {
    return (
      <PageWrapper className="pt-20 pb-12 px-4">
        <SEO title="Failed to Load Episode" description="Something went wrong loading this anime episode player." noindex />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load"
          message="Something went wrong loading this content."
          actionLabel="Try Again"
          onAction={() => detail.refetch()}
        />
      </PageWrapper>
    );
  }

  if (detail.isLoading) {
    return (
      <PageWrapper className="pt-20 pb-12 px-4">
        <SEO title="Loading Episode" description="Loading the anime episode player." noindex />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <img src="/loader.gif" alt="Loading..." className="w-24 h-24 object-contain" />
          <p className="text-text-muted text-sm mt-4">Loading anime...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-20 pb-12">
      <SEO
        noindex
        title={animeTitle ? `Watch ${animeTitle} Episode ${episodeNum}` : 'Watch Anime Online'}
        description={
          anime?.synopsis
            ? `Watch ${animeTitle} Episode ${episodeNum} free in HD on MikuAnime — subbed and dubbed. ${anime.synopsis.slice(0, 120)}`
            : `Stream ${animeTitle} Episode ${episodeNum} free in HD on MikuAnime, subbed and dubbed.`
        }
      />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content: player + info + description + recommendations */}
          <div className="flex-1 min-w-0">
            {/* Player with floating server dropdown */}
            <div className="relative">
              <VideoPlayer
                src=""
                embedUrl={embedUrl}
                skipTimes={skipTimes.data}
                onEnded={() => {
                  const nextEp = episodeNum + 1;
                  if (nextEp <= maxAvailableEpisode) {
                    navigate(`/watch/${animeId}/${nextEp}`);
                  }
                }}
              />

              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                {/* Audio track toggle (SUB / DUB) */}
                <div className="flex items-center bg-void/80 backdrop-blur-sm border border-border-subtle rounded-card p-0.5 text-[11px] font-medium shadow-sm">
                  <button
                    onClick={() => setTrack('sub')}
                    className={cn(
                      'px-2 py-1 rounded-[6px] transition-all',
                      track === 'sub'
                        ? 'bg-accent-primary text-white shadow-sm font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    SUB
                  </button>
                  <button
                    onClick={() => setTrack('dub')}
                    className={cn(
                      'px-2 py-1 rounded-[6px] transition-all',
                      track === 'dub'
                        ? 'bg-accent-primary text-white shadow-sm font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    DUB
                  </button>
                </div>

                {/* Server selection */}
                <div className="relative">
                  <button
                    onClick={() => setServerOpen(!serverOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-void/80 backdrop-blur-sm border border-border-subtle text-xs text-text-secondary hover:text-text-primary hover:border-border-glow transition-all shadow-sm"
                  >
                    {(() => {
                      const active = SERVERS.find((s) => s.id === server);
                      if (!active) return null;
                      const Icon = active.icon;
                      return <Icon className="w-3.5 h-3.5 stroke-[1.5]" />;
                    })()}
                    {SERVERS.find((s) => s.id === server)?.label || 'Server'}
                    <ChevronDown className="w-3 h-3 stroke-[1.5] ml-1 transition-transform" style={{ transform: serverOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {serverOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setServerOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-44 rounded-card bg-elevated border border-border-subtle shadow-xl z-20 overflow-hidden">
                        <div className="px-3 py-1.5 border-b border-border-subtle/50 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                          Select Server
                        </div>
                        {SERVERS.filter((s) => s.id !== 'videasy' || anime?.anilist_id).map((s) => {
                          const Icon = s.icon;
                          return (
                            <button
                              key={s.id}
                              onClick={() => { setServer(s.id); setServerOpen(false); }}
                              className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors',
                                server === s.id
                                  ? 'bg-accent-primary/15 text-accent-glow font-medium'
                                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
                              )}
                            >
                              <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                              <span>{s.label}</span>
                              {s.id === 'anixo' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-glow border border-accent-primary/30">
                                  Default
                                </span>
                              )}
                              {server === s.id && <span className="ml-auto text-[10px] text-accent-glow">Active</span>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Episode title, metadata, Add to List, Description */}
            {currentEpisode && anime && (
              <WatchInfo
                animeId={anime.mal_id}
                animeTitle={anime.title_english || anime.title}
                animeImage={anime.images.jpg?.image_url || ''}
                episode={currentEpisode}
                totalEpisodes={episodes.data?.length || anime.episodes || 0}
                currentEpisode={episodeNum}
                maxEpisode={isAiring ? maxAvailableEpisode : undefined}
                description={anime.synopsis}
              />
            )}

          </div>

          {/* Sidebar: episodes */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="space-y-6">
              {/* Anime Quick Info Panel */}
              {anime && (
                <div className="flex items-center gap-3 p-3 glass-card rounded-card border border-border-subtle bg-elevated/20">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border-glow shadow-glow-sm flex-shrink-0 bg-void">
                    <img 
                      src={anime.images.webp?.image_url || anime.images.jpg?.image_url} 
                      alt={anime.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/anime/${anime.mal_id}`} className="font-display font-semibold text-text-primary text-sm hover:text-accent-glow transition-colors line-clamp-1">
                      {anime.title_english || anime.title}
                    </Link>
                    <p className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1">
                      <span>Studio:</span>
                      <span className="text-text-secondary font-medium">
                        {anime.studios?.[0]?.name || 'Unknown Studio'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Episodes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-semibold text-sm text-text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-glow stroke-[1.5]" />
                    Episodes
                  </h2>
                  {episodes.data && (
                    <span className="text-xs text-text-muted font-mono">
                      {isAiring
                        ? `${episodes.data.filter((e) => e.aired !== null && e.aired !== '').length}/${episodes.data.length}`
                        : episodes.data.length}
                    </span>
                  )}
                </div>
                <div className="glass-card rounded-card p-2">
                  {episodes.isLoading ? (
                    <div className="space-y-1">
                      {Array.from({ length: 6 }).map((_, i) => <EpisodeSkeleton key={i} />)}
                    </div>
                  ) : episodes.data ? (
                    <EpisodeList animeId={animeId} episodes={episodes.data} currentEpisode={episodeNum} isAiring={isAiring} />
                  ) : null}
                </div>
              </div>

              {/* Next episode countdown for airing anime */}
              {isAiring && episodes.data && (() => {
                const nextEp = episodes.data.find((ep) => ep.aired === null && ep.airing_at);
                if (!nextEp || !nextEp.airing_at) return null;
                const airDate = new Date(nextEp.airing_at * 1000).toISOString();
                return (
                  <div className="glass-card rounded-card p-3 flex items-center gap-3 border border-border-subtle">
                    <div className="w-8 h-8 rounded-full bg-accent-primary/15 flex items-center justify-center flex-shrink-0">
                      <Radio className="w-4 h-4 text-accent-glow stroke-[1.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary">Next: Ep {nextEp.episode} airs in</p>
                      <CountdownTimer targetDate={airDate} className="text-sm" />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Similar Anime - genre-based suggestions */}
        {similar.data && similar.data.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border-subtle">
            <h2 className="font-display font-semibold text-lg text-text-primary mb-4 flex items-center gap-1.5">
              <ListVideo className="w-4 h-4 text-accent-glow stroke-[1.5]" />
              More Like This
            </h2>
            <ScrollableRow>
              {similar.data.map((item) => (
                <MiniAnimeCard key={item.mal_id} anime={item} />
              ))}
            </ScrollableRow>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
