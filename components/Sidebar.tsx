'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Users, label: 'Volunteers', href: '/volunteers' },
  { icon: Map, label: 'Map', href: '/map' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 md:hidden z-50 hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="md:animate-none fixed left-0 top-0 h-screen w-64 glass border-r md:translate-x-0 z-40 md:z-10 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
            ReliefSync
          </h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    active
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-blue-500 rounded-r"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="glass rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">System Active</p>
            <p>Ready to assist</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-red-500/10 text-red-400"
            onClick={() => {
              // Handle logout
              console.log('Logout')
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
