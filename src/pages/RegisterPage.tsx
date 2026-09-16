import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Check, AlertCircle } from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';
import { GoogleIcon } from '@/components/ui/GoogleIcon';

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
      {checks.map(({ label, met }) => (
        <div key={label} className="flex items-center gap-1">
          <Check className={`w-3 h-3 ${met ? 'text-green-400' : 'text-text-muted'}`} />
          <span className={`text-xs font-body ${met ? 'text-green-400' : 'text-text-muted'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RegisterPage() {
  const { register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, displayName);
      navigate('/verify-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-void">
      <DotPattern opacity={0.25} />

      {/* Atmospheric theme ambient glow */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-violet/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[380px] relative z-10 animate-fade-in">
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-center gap-3.5 mb-6">
          <Link to="/" className="group flex-shrink-0" aria-label="Home">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-accent-primary/40 shadow-glow-sm bg-void group-hover:ring-accent-primary transition-all duration-300">
              <img src="/logo.gif" alt="MikuAnime" className="w-full h-full object-cover scale-105" />
            </div>
          </Link>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight">
            Register
          </h1>
        </div>

        {/* Main Card */}
        <div className="relative glass-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.7)] bg-surface/75 backdrop-blur-xl overflow-hidden">
          {/* Subtle top glowing line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-body font-medium text-text-secondary">
                Display Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted stroke-[1.5] transition-colors group-focus-within:text-accent-primary" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your username"
                  className="w-full bg-void/70 border border-white/[0.08] rounded-xl pl-11 pr-3.5 py-3 text-base text-text-primary placeholder:text-text-muted/60 font-body transition-all duration-200 hover:border-white/[0.16] focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:bg-void/90 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-body font-medium text-text-secondary">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted stroke-[1.5] transition-colors group-focus-within:text-accent-primary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-void/70 border border-white/[0.08] rounded-xl pl-11 pr-3.5 py-3 text-base text-text-primary placeholder:text-text-muted/60 font-body transition-all duration-200 hover:border-white/[0.16] focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:bg-void/90 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-body font-medium text-text-secondary">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted stroke-[1.5] transition-colors group-focus-within:text-accent-primary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-void/70 border border-white/[0.08] rounded-xl pl-11 pr-11 py-3 text-base text-text-primary placeholder:text-text-muted/60 font-body transition-all duration-200 hover:border-white/[0.16] focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:bg-void/90 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-xs text-accent-rose bg-accent-rose/10 border border-accent-rose/25 rounded-xl px-3.5 py-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-accent-rose" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-accent-primary via-[#26f7dd] to-[#00e5c5] hover:opacity-95 text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4.5 h-4.5 stroke-[2.2]" />
              )}
              <span>{isLoading ? 'Creating account...' : 'Register'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-text-muted font-label uppercase tracking-wider text-[11px]">
                or
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div>
            <button
              onClick={handleGoogle}
              type="button"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 rounded-xl bg-elevated/70 hover:bg-elevated text-text-primary border border-white/[0.08] hover:border-white/[0.18] font-body font-medium text-sm sm:text-base flex items-center justify-center gap-3 transition-all hover:shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-5">
          <p className="text-sm sm:text-base text-text-secondary font-body">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="text-accent-glow hover:text-accent-primary transition-colors font-semibold ml-1 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
