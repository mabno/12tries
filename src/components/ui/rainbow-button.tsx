import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const rainbowButtonVariants = cva(
  cn(
    'relative cursor-pointer group transition-all animate-rainbow',
    'inline-flex items-center justify-center gap-2 shrink-0',
    'rounded-sm outline-none focus-visible:ring-[3px] aria-invalid:border-destructive',
    'text-sm font-medium whitespace-nowrap',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default:
          'border-0 bg-[linear-gradient(#1a1a2e,#1a1a2e),linear-gradient(#1a1a2e_50%,rgba(26,26,46,0.8)_80%,rgba(26,26,46,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] text-white font-bold [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.25rem)_solid_transparent] shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] before:absolute before:bottom-[-30%] before:left-1/2 before:z-0 before:h-2/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(1.2rem)] transition-all duration-300',
        outline:
          'border border-input border-b-transparent bg-[linear-gradient(#1a1a2e,#1a1a2e),linear-gradient(#1a1a2e_50%,rgba(26,26,46,0.8)_80%,rgba(26,26,46,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] text-white font-bold [background-clip:padding-box,border-box,border-box] [background-origin:border-box] before:absolute before:bottom-[-30%] before:left-1/2 before:z-0 before:h-2/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(1.2rem)]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof rainbowButtonVariants> {
  asChild?: boolean
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp data-slot='button' className={cn(rainbowButtonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)

RainbowButton.displayName = 'RainbowButton'

export { RainbowButton, rainbowButtonVariants, type RainbowButtonProps }
