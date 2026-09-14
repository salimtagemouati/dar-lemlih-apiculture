import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-tight ring-offset-sand-25 transition-all duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-charcoal-950 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-card hover:shadow-card-hover hover:from-amber-500 hover:to-amber-600 active:from-amber-600 active:to-amber-700 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500',
        subtle:
          'bg-amber-50 text-amber-700 shadow-inner hover:bg-amber-100 hover:shadow-sm dark:bg-charcoal-800 dark:text-amber-200 dark:hover:bg-charcoal-700',
        outline:
          'border-2 border-amber-200 bg-transparent text-amber-700 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:border-amber-600 dark:hover:bg-charcoal-900',
        ghost:
          'text-charcoal-700 hover:bg-sand-100 hover:text-charcoal-900 dark:text-charcoal-200 dark:hover:bg-charcoal-800 dark:hover:text-amber-100',
        link: 'text-amber-600 underline-offset-4 hover:underline dark:text-amber-300',
        premium:
          'bg-gradient-to-r from-amber-500 via-honey-glow to-amber-500 bg-[length:200%_100%] text-white shadow-glow hover:bg-[position:100%_0] hover:shadow-glow-lg transition-[background-position,box-shadow] duration-700',
        // Hero — flat honey on dark imagery, no gradient, low rounded corners.
        hero:
          'bg-amber-400 text-stone-900 shadow-md hover:bg-amber-500 hover:shadow-lg active:bg-amber-600',
        // Ghost-on-hero — white outline on imagery.
        ghostHero:
          'border border-white/80 bg-transparent text-white hover:border-white hover:bg-white/10'
      },
      size: {
        sm: 'h-9 px-4 py-2 text-xs',
        md: 'h-11 px-5 py-2.5 text-sm',
        lg: 'h-12 px-7 py-3 text-base',
        xl: 'h-14 px-8 py-3.5 text-base',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
