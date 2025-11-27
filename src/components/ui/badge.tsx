import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        new: 'bg-purple-100 text-purple-700',
        learning: 'bg-orange-100 text-orange-700',
        reviewing: 'bg-blue-100 text-blue-700',
        mastered: 'bg-green-100 text-green-700',
      },
    },
    defaultVariants: {
      variant: 'new',
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
