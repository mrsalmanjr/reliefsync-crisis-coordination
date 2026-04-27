'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const count = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    count.set(value)
  }, [value, count])

  useEffect(() => {
    return count.onChange((v) => {
      setDisplayValue(Math.floor(v))
    })
  }, [count])

  return (
    <span className={className}>
      {displayValue}
    </span>
  )
}
