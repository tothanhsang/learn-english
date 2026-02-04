import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        secondary: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
        destructive: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        outline: 'border border-gray-200 text-gray-700 dark:border-white/20 dark:text-gray-300',
        new: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
        learning: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
        reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        mastered: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
