'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface PremiumWrapperProps {
  children: ReactNode
  className?: string
}

export function PremiumWrapper({ children, className = '' }: PremiumWrapperProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Stagger animation for multiple children
export function StaggerContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
        hidden: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Floating animation component
export function FloatingElement({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// Scale hover animation
export function ScaleHover({
  children,
  scale = 1.05,
}: {
  children: ReactNode
  scale?: number
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

// Glow pulse animation
export function GlowPulse({
  children,
  intensity = 1,
}: {
  children: ReactNode
  intensity?: number
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px rgba(79, 157, 255, ${0.3 * intensity})`,
          `0 0 40px rgba(79, 157, 255, ${0.6 * intensity})`,
          `0 0 20px rgba(79, 157, 255, ${0.3 * intensity})`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}
