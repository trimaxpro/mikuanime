import { PageWrapper } from '@/components/layout/PageWrapper';
import { SEO } from '@/components/common/SEO';
import { HelpCircle, Sparkles } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'What is MikuAnime?',
    a: 'MikuAnime is a free anime streaming and discovery platform where you can watch subbed and dubbed anime online in HD, follow weekly airing schedules, and track whatever you have watched.',
  },
  {
    q: 'Is MikuAnime free to use?',
    a: 'Yes. Every series, schedule, and tracking feature on MikuAnime is free with no hidden paywall, so you can watch anime online without paying for a premium subscription.',
  },
  {
    q: 'Do I need an account to watch anime?',
    a: 'No. You can stream anime instantly without signing up. A free account only adds cloud sync for your watchlist and watch history across devices.',
  },
  {
    q: 'Can I watch both subbed and dubbed anime?',
    a: 'Yes. Most titles on MikuAnime offer subbed and dubbed streams, and you can switch audio tracks directly on the player.',
  },
  {
    q: 'Where can I find what is airing this season?',
    a: 'The Schedule page lists daily anime broadcast timetables with next-episode release countdowns, so you can follow simulcasts as they air.',
  },
  {
    q: 'How can I explore anime by genre?',
    a: 'Open the Browse page to filter the full catalog by format, status, season, year, score, and genre tags, or jump straight into curated collections from the homepage.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': FAQ_ITEMS.map((f) => ({
    '@type': 'Question',
    'name': f.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
  })),
};

export default function FaqPage() {
  return (
    <PageWrapper className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <SEO
        title="FAQ — Frequently Asked Questions"
        description="Answers to common questions about MikuAnime — is it free, do you need an account, sub vs dub, and how the airing schedule and catalog work."
        canonical="/faq"
        keywords={['MikuAnime FAQ', 'is MikuAnime free', 'anime streaming help']}
        schema={FAQ_SCHEMA}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface/90 via-surface/60 to-surface/30 border border-border-subtle/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-glow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-glow text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> FAQ
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
              Frequently Asked <span className="text-accent-glow">Questions</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary mt-3 leading-relaxed">
              MikuAnime is a free anime streaming platform built for people who want to watch anime online
              without hunting through scattered sites. You get a curated home page of trending shows, a live
              anime airing schedule, a searchable catalog, and genre collections — all in one place. Every
              title supports subbed and dubbed audio, streams in HD, and updates as new episodes air.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="glass-card rounded-2xl p-5 sm:p-6 border border-border-subtle/80">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-accent-glow stroke-[1.6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-bold text-base sm:text-lg text-text-primary mb-1.5">
                    {item.q}
                  </h2>
                  <p className="text-sm text-text-secondary font-body leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}