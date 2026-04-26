'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export function PremiumFooter() {
  const [hovering, setHovering] = useState(false)

  return (
    <footer className="mt-12 py-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          ReliefSync AI • Real-time Crisis Coordination
        </div>

        {/* Easter Egg - Developer Credit */}
        <motion.div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          animate={{ opacity: hovering ? 0.4 : 0.1 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-muted-foreground cursor-pointer select-none"
        >
          developed by mrsalmanjr
        </motion.div>
      </div>
    </footer>
  )
}
