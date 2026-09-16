import { PageWrapper } from '@/components/layout/PageWrapper';
import { Shield, Lock, Eye, Cookie, Server, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';

const sections = [
  {
    icon: Lock,
    title: 'Data Collection & Privacy by Design',
    content:
      'MikuAnime is built with a privacy-first mindset. We collect the bare minimum information required to deliver our service. Your watch history, watchlist, audio preferences, and playback positions are saved directly on your local device rather than being tracked on remote profiling databases.',
  },
  {
    icon: Eye,
    title: 'How Your Information Is Used',
    content:
      'Your preferences are used exclusively to power your personal user experience — allowing you to resume episodes where you left off, organize your bookmarks, and remember your preferred viewing options. We never sell, rent, monetize, or disclose your personal data to marketing brokers or third-party advertisers.',
  },
  {
    icon: Cookie,
    title: 'Local Device Storage Policy',
    content:
      'MikuAnime does not deploy persistent third-party advertising or cross-site tracking cookies. We utilize standard local device storage to remember your chosen theme, viewing progress, and audio settings across browsing sessions. If you create an account, secure authentication tokens are maintained strictly for your active session.',
  },
  {
    icon: Server,
    title: 'Third-Party Content Providers',
    content:
      'MikuAnime organizes links to third-party streaming providers. When accessing third-party media, your connection interacts directly with external provider networks. These independent platforms maintain their own respective privacy policies and data collection standards independent of MikuAnime.',
  },
  {
    icon: UserCheck,
    title: 'User Rights & Complete Data Control',
    content:
      'You maintain total control and ownership of your viewing data at all times. You can easily reset or clear your watch history and saved list at any moment with a single click. Registered users may also request complete account deletion and credential erasure at any time.',
  },
  {
    icon: Shield,
    title: 'Security & Encryption',
    content:
      'All traffic to MikuAnime is transmitted over secure, encrypted HTTPS/TLS connections. User accounts and authentication credentials are encrypted and managed with industry-standard cryptographic protocols to safeguard account integrity.',
  },
];

export default function PrivacyPage() {
  return (
    <PageWrapper className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface/90 via-surface/60 to-surface/30 border border-border-subtle/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-glow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-glow text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Privacy &amp; Security
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
              Privacy <span className="text-accent-glow">Policy</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary mt-3 leading-relaxed">
              Your privacy is paramount. Discover how MikuAnime handles your preferences, local data, and account information with transparency.
            </p>
          </div>
        </div>

        {/* Privacy Pledge Banner */}
        <div className="glass-card rounded-2xl p-5 border border-accent-primary/30 bg-accent-primary/5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-accent-glow" />
          </div>
          <div className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-0.5">Zero Tracking Advertising Pledge</p>
            We do not monetize your browsing habits or sell your viewing telemetry to data brokers. Your watchlist and episode progress are stored locally on your device unless you choose to sync via an authenticated account.
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="group glass-card rounded-2xl p-5 sm:p-6 border border-border-subtle/80 hover:border-accent-primary/40 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:border-accent-primary/40 transition-all duration-300">
                    <Icon className="w-5 h-5 text-accent-glow stroke-[1.6]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-bold text-base sm:text-lg text-text-primary mb-1.5">
                      {section.title}
                    </h2>
                    <p className="text-sm text-text-secondary font-body leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
