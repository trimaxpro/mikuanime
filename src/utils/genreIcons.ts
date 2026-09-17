import {
  Swords,
  Compass,
  Laugh,
  Theater,
  Flame,
  Wand2,
  Ghost,
  Star,
  Bot,
  Music,
  Search,
  Brain,
  Heart,
  Rocket,
  Coffee,
  Trophy,
  Moon,
  Skull,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export const GENRE_ICON_MAP: Record<string, LucideIcon> = {
  action: Swords,
  adventure: Compass,
  comedy: Laugh,
  drama: Theater,
  ecchi: Flame,
  fantasy: Wand2,
  horror: Ghost,
  'mahou-shoujo': Star,
  mecha: Bot,
  music: Music,
  mystery: Search,
  psychological: Brain,
  romance: Heart,
  'sci-fi': Rocket,
  'slice-of-life': Coffee,
  sports: Trophy,
  supernatural: Moon,
  thriller: Skull,
};

/**
 * Normalizes any genre name or slug (e.g. "Mahou Shoujo" or "mahou-shoujo" or "Sci-Fi")
 * and returns the corresponding LucideIcon component.
 */
export function getGenreIcon(slugOrName?: string | null): LucideIcon {
  if (!slugOrName) return Tag;
  const normalized = slugOrName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  return GENRE_ICON_MAP[normalized] || Tag;
}
