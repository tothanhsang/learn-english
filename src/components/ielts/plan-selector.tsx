'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updatePlan } from '@/lib/actions/ielts'
import type { IELTSPlan } from '@/types/database'

interface PlanSelectorProps {
  plans: IELTSPlan[]
  activePlanId: string
}

export function PlanSelector({ plans, activePlanId }: PlanSelectorProps) {
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  const handleSelect = async (planId: string) => {
    if (planId === activePlanId) {
      setOpen(false)
      return
    }

    setSwitching(true)

    // Deactivate current plan
    await updatePlan(activePlanId, { is_active: false })
    // Activate selected plan
    await updatePlan(planId, { is_active: true })

    setSwitching(false)
    setOpen(false)
  }

  const activePlan = plans.find((p) => p.id === activePlanId)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="min-w-[150px] justify-between"
      >
        <span className="truncate">{activePlan?.name || 'Chọn kế hoạch'}</span>
        <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:glass-card dark:bg-white/10 dark:border dark:border-white/15 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="py-1">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelect(plan.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{plan.name}</p>
                    {plan.exam_date && (
                      <p className="text-xs text-gray-500 dark:text-white/50">
                        Thi: {new Date(plan.exam_date).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  {plan.id === activePlanId && <Check className="w-4 h-4 text-accent-pink" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
