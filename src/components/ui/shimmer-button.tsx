import React from 'react'
import { cn } from '@/lib/utils'

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  children?: React.ReactNode
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.1em',
      shimmerDuration = '2s',
      borderRadius = '100px',
      background = 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--shimmer-color': shimmerColor,
            '--shimmer-size': shimmerSize,
            '--shimmer-duration': shimmerDuration,
            '--border-radius': borderRadius,
            '--background': background,
          } as React.CSSProperties
        }
        className={cn(
          'group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-[var(--border-radius)] bg-[image:var(--background)] px-6 font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95',
          'before:absolute before:inset-0 before:rounded-[var(--border-radius)] before:bg-[image:linear-gradient(90deg,transparent,var(--shimmer-color),transparent)] before:translate-x-[-100%] before:animate-[shimmer_var(--shimmer-duration)_infinite]',
          className
        )}
        ref={ref}
        {...props}
      >
        <span className='relative z-10 flex items-center gap-2'>{children}</span>
        <style jsx>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'

export default ShimmerButton
