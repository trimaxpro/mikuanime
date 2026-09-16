import { PageWrapper } from '@/components/layout/PageWrapper';
import { FileText, Scale, Shield, AlertCircle, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

const sections = [
  {
    icon: Scale,
    title: 'Acceptance of Terms',
    content:
      'By accessing or using MikuAnime, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our service. We reserve the right to revise or update these terms at any time; your continued use of the platform constitutes full acceptance of any modifications.',
  },
  {
    icon: AlertCircle,
    title: 'Service Description & Third-Party Content',
    content:
      'MikuAnime functions exclusively as an index and streaming directory providing links to anime media hosted on independent third-party networks. We do not upload, store, host, manage, or distribute any copyrighted media or video files on our infrastructure. All content is embedded directly from external third-party video providers over which MikuAnime exercises no control or ownership.',
  },
  {
    icon: Shield,
    title: 'User Responsibilities & Acceptable Use',
    content:
      'You agree to utilize MikuAnime solely for personal, non-commercial entertainment purposes. You agree not to bypass security controls, reverse engineer, scrape, flood, or use automated bots or scripts to access our services. You remain individually responsible for ensuring your use complies with local laws in your jurisdiction.',
  },
  {
    icon: FileText,
    title: 'Intellectual Property Rights',
    content:
      'All anime titles, cover artwork, trademarks, logos, character designs, and promotional images displayed on MikuAnime belong to their respective copyright holders and licensors. MikuAnime does not claim ownership of any third-party intellectual property. Media assets are referenced strictly for descriptive and identification purposes under fair use principles.',
  },
  {
    icon: Scale,
    title: 'Limitation of Liability & As-Is Warranty',
    content:
      'MikuAnime is provided strictly on an "as is" and "as available" basis without express or implied warranties of any kind. We make no guarantee regarding unbroken uptime, stream latency, or content continuity. Under no circumstance shall MikuAnime or its contributors be held liable for damages resulting from platform use or third-party links.',
  },
  {
    icon: HelpCircle,
    title: 'DMCA & Copyright Inquiries',
    content:
      'Because MikuAnime does not host, store, or transmit any media on its servers, copyright notices regarding specific media files must be directed to the third-party platforms hosting the content. We respect intellectual property rights and promptly review any verifiable reports regarding invalid or infringing index references.',
  },
];

export default function TermsPage() {
  return (
    <PageWrapper className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface/90 via-surface/60 to-surface/30 border border-border-subtle/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-glow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-glow text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Legal Documentation
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
              Terms of <span className="text-accent-glow">Service</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary mt-3 leading-relaxed">
              Please review these terms governing your access to and use of MikuAnime. By continuing to use the site, you agree to these conditions.
            </p>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="glass-card rounded-2xl p-5 border border-accent-primary/30 bg-accent-primary/5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-accent-glow" />
          </div>
          <div className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-0.5">Non-Hosting Aggregator Notice</p>
            MikuAnime is a media index and user-interface layer. No video files, torrents, or streams are stored on or transmitted from our servers. All video streams are embedded from third-party hosting networks.
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
