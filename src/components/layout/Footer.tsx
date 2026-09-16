import { Link } from 'react-router-dom';
import { FileText, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border-subtle/80 bg-surface/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-5 font-body">
        <p className="text-text-secondary md:w-1/3 text-center md:text-left leading-relaxed text-[14.5px] sm:text-[15px]">
          MikuAnime does not store any files on our server. We only link to media hosted on third-party services.
        </p>
        <p className="text-text-secondary md:w-1/3 text-center font-medium text-[15px] sm:text-[15.5px]">
          &copy; MikuAnime. All rights reserved.
        </p>
        <div className="md:w-1/3 flex items-center justify-center md:justify-end gap-3 text-text-secondary text-[15px] sm:text-[15.5px]">
          <Link
            to="/terms"
            className="hover:text-accent-glow transition-colors duration-200 flex items-center gap-2 font-medium hover:bg-white/[0.04] px-3 py-1.5 rounded-full border border-transparent hover:border-border-subtle/60"
          >
            <FileText className="w-[18px] h-[18px] stroke-[1.65]" />
            <span>Terms of Service</span>
          </Link>
          <span className="text-border-subtle/60 select-none">•</span>
          <Link
            to="/privacy"
            className="hover:text-accent-glow transition-colors duration-200 flex items-center gap-2 font-medium hover:bg-white/[0.04] px-3 py-1.5 rounded-full border border-transparent hover:border-border-subtle/60"
          >
            <Shield className="w-[18px] h-[18px] stroke-[1.65]" />
            <span>Privacy Policy</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
