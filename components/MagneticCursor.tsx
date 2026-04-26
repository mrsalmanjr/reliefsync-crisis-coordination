'use client'

import { useEffect, useRef, useState } from 'react'

export function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const magneticElementsRef = useRef<HTMLElement[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) return // Disable on mobile

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      // Find all interactive elements
      const interactiveElements = Array.from(
        document.querySelectorAll('button, a, [role="button"], input, textarea')
      ) as HTMLElement[]

      magneticElementsRef.current = interactiveElements

      interactiveElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const elCenterX = rect.left + rect.width / 2
        const elCenterY = rect.top + rect.height / 2

        const distance = Math.hypot(
          e.clientX - elCenterX,
          e.clientY - elCenterY
        )

        const maxDistance = 100 // Attraction range in pixels
        if (distance < maxDistance) {
          const angle = Math.atan2(
            e.clientY - elCenterY,
            e.clientX - elCenterX
          )
          const attractForce = 1 - distance / maxDistance
          const offsetX = Math.cos(angle) * attractForce * 8 // Max 8px attraction
          const offsetY = Math.sin(angle) * attractForce * 8

          // Apply subtle glow effect
          const glowIntensity = Math.round(attractForce * 30)
          el.style.boxShadow = `0 0 ${glowIntensity}px rgba(79, 157, 255, ${attractForce * 0.5})`
          el.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        } else {
          // Reset when cursor leaves
          el.style.boxShadow = ''
          el.style.transform = ''
        }
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  if (isMobile) return null

  return (
    <div
      ref={cursorRef}
      className="fixed w-6 h-6 pointer-events-none z-50"
      style={{
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-full h-full border border-accent/30 rounded-full" />
      <div className="absolute inset-2 border border-accent/20 rounded-full" />
    </div>
  )
}
