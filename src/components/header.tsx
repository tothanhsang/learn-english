'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { LogOut, BookOpen, BarChart3, GraduationCap } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Học Tập', icon: BookOpen },
  { href: '/practice', label: 'Tập Luyện', icon: GraduationCap },
  { href: '/stats', label: 'Thống Kê', icon: BarChart3 },
]

export function Header({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <header className="gradient-header text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg hidden sm:block">Learn English</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80 hidden md:block">
              {user.email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
