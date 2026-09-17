import { cn } from '@/utils/cn';

export interface KeyFact {
  label: string;
  value: string;
}

interface KeyFactsProps {
  title?: string;
  facts: KeyFact[];
  className?: string;
}

export function KeyFacts({ title, facts, className }: KeyFactsProps) {
  const visible = facts.filter((f) => f.value && f.value.trim() !== '' && f.value !== '—' && f.value !== 'N/A');

  if (visible.length === 0) return null;

  return (
    <section className={cn('glass-card rounded-card border border-border-subtle bg-elevated/20 p-5', className)}>
      {title && <h2 className="font-display font-semibold text-base text-text-primary mb-3 flex items-center gap-1.5">{title}</h2>}
      <dl className="divide-y divide-border-subtle/70">
        {visible.map((fact, i) => (
          <div key={`${fact.label}-${i}`} className="py-2 grid grid-cols-[110px_1fr] gap-3 sm:grid-cols-[150px_1fr]">
            <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted pt-0.5">{fact.label}</dt>
            <dd className="text-sm text-text-secondary leading-relaxed">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}