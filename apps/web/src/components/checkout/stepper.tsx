import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'cart', label: 'Panier' },
  { key: 'shipping', label: 'Livraison' },
  { key: 'payment', label: 'Paiement' },
  { key: 'confirmation', label: 'Confirmation' }
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export function CheckoutStepper({ active }: { active: StepKey }) {
  const activeIndex = STEPS.findIndex(s => s.key === active);

  return (
    <ol className="mx-auto flex max-w-3xl items-center justify-between gap-2 sm:gap-4" aria-label="Progress">
      {STEPS.map((step, index) => {
        const status: 'done' | 'active' | 'todo' =
          index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'todo';
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.key} className="flex flex-1 items-center gap-2 sm:gap-4" aria-current={status === 'active' ? 'step' : undefined}>
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                status === 'done' && 'bg-honey-500 text-white',
                status === 'active' && 'bg-honey-50 text-honey-700 ring-2 ring-honey-400 dark:bg-honey-900/30 dark:text-honey-200',
                status === 'todo' && 'bg-stone-100 text-stone-400 dark:bg-charcoal-800 dark:text-stone-500'
              )}
            >
              {status === 'done' ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-[11px] font-semibold uppercase tracking-[0.2em] sm:inline',
                status === 'todo'
                  ? 'text-stone-400 dark:text-stone-500'
                  : 'text-stone-700 dark:text-stone-200'
              )}
            >
              {step.label}
            </span>
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-px flex-1',
                  index < activeIndex ? 'bg-honey-400' : 'bg-stone-200 dark:bg-charcoal-700'
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export type CheckoutStep = StepKey;
