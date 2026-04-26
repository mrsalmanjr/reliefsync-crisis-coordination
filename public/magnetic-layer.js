// ═══════════════════════════════════════════════════════════════════════════════
// MAGNETIC LAYER - Premium Visual Animation System
// Pure vanilla JS + CSS — Zero dependencies, zero DOM structure changes
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // === CONFIG ===
  const CONFIG = {
    cursor: { outerSize: 40, innerSize: 8, outerLerp: 0.08, innerLerp: 0.22 },
    magnetic: { fieldRadius: 80, maxPull: 18, snapStiffness: 0.15 },
    transitions: { exitDuration: 600, entryStaggeer: 60, wipeDuration: 200 },
    parallax: { fast: 0.3, slow: 0.7 },
    ambient: { enabled: document.body.dataset.ambient === 'true', orbCount: 8 },
    mobile: window.matchMedia('(max-width: 768px)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }

  // Check for reduced motion preference
  if (CONFIG.reducedMotion) {
    console.log('[MagneticLayer] Reduced motion detected, animations disabled')
    return
  }

  // === INJECT CSS ===
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    html {
      cursor: none;
    }

    /* Magnetic Cursor */
    .magnetic-cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: ${CONFIG.cursor.outerSize}px;
      height: ${CONFIG.cursor.outerSize}px;
      border: 2px solid rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      will-change: transform;
      transform: translate(-50%, -50%);
    }

    .magnetic-cursor.active {
      border-color: var(--accent, rgba(79, 157, 255, 1));
      mix-blend-mode: difference;
      width: 60px;
      height: 60px;
    }

    .magnetic-cursor::before {
      content: '';
      position: absolute;
      width: ${CONFIG.cursor.innerSize}px;
      height: ${CONFIG.cursor.innerSize}px;
      background: white;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .magnetic-cursor.active::before {
      transform: translate(-50%, -50%) scale(0);
    }

    /* Wipe Panel */
    .transition-wipe {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--accent, rgba(79, 157, 255, 1));
      z-index: 9999;
      pointer-events: none;
      animation: wipe-down 200ms ease-out forwards;
    }

    @keyframes wipe-down {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(100vh);
      }
    }

    /* Magnetic Elements */
    [data-magnetic] {
      will-change: transform;
    }

    /* Scroll Animations */
    [data-scroll-animate] {
      opacity: 0;
      transform: translateY(40px) blur(6px);
      will-change: transform, opacity;
    }

    [data-scroll-animate].in-view {
      opacity: 1;
      transform: translateY(0) blur(0);
    }

    /* Parallax */
    [data-parallax] {
      will-change: transform;
    }

    /* Ambient Canvas */
    #ambient-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0.3;
    }

    /* Exit Animation */
    .exit-animate {
      animation: exit-float 600ms ease-out forwards !important;
    }

    @keyframes exit-float {
      to {
        opacity: 0;
        transform: translateY(var(--exit-y, -40px)) blur(4px) scale(0.96);
      }
    }

    /* Entrance Animation */
    @keyframes entrance-float {
      from {
        opacity: 0;
        transform: translateY(30px) blur(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0) blur(0);
      }
    }

    .entrance-animate {
      animation: entrance-float 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    }
  `
  document.head.appendChild(styleSheet)

  // === CURSOR ENGINE ===
  let mouseX = window.innerWidth / 2
  let mouseY = window.innerHeight / 2
  let cursorOuterX = mouseX
  let cursorOuterY = mouseY
  let cursorInnerX = mouseX
  let cursorInnerY = mouseY
  let isOverInteractive = false
  let isAnimating = true

  const cursorOuter = document.createElement('div')
  cursorOuter.className = 'magnetic-cursor'
  document.body.appendChild(cursorOuter)

  // Only add cursor on desktop
  if (!CONFIG.mobile) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    })

    document.addEventListener('mouseenter', () => {
      cursorOuter.style.opacity = '1'
    })

    document.addEventListener('mouseleave', () => {
      cursorOuter.style.opacity = '0'
    })

    document.addEventListener('mousedown', () => {
      cursorOuter.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(0.3)`
      setTimeout(() => {
        const ripple = document.createElement('div')
        ripple.style.cssText = `
          position: fixed;
          width: 30px;
          height: 30px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          top: ${mouseY}px;
          left: ${mouseX}px;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          animation: ripple-burst 600ms ease-out forwards;
        `
        document.body.appendChild(ripple)
        setTimeout(() => ripple.remove(), 600)
      }, 50)
    })

    document.addEventListener('mouseup', () => {
      cursorOuter.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    })

    // Add ripple animation
    const rippleStyle = document.createElement('style')
    rippleStyle.textContent = `
      @keyframes ripple-burst {
        to {
          width: 100px;
          height: 100px;
          opacity: 0;
          transform: translate(-50%, -50%);
        }
      }
    `
    document.head.appendChild(rippleStyle)

    // Cursor animation loop
    const animateCursor = () => {
      if (!isAnimating) return

      cursorOuterX += (mouseX - cursorOuterX) * CONFIG.cursor.outerLerp
      cursorOuterY += (mouseY - cursorOuterY) * CONFIG.cursor.outerLerp

      cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px)`

      requestAnimationFrame(animateCursor)
    }

    animateCursor()

    // Detect interactive elements
    const interactiveSelector = 'a, button, input, textarea, select, [data-magnetic], .magnetic'
    document.addEventListener('mouseenter', (e) => {
      if (e.target.closest(interactiveSelector)) {
        isOverInteractive = true
        cursorOuter.classList.add('active')
      }
    }, true)

    document.addEventListener('mouseleave', (e) => {
      if (e.target.closest(interactiveSelector)) {
        isOverInteractive = false
        cursorOuter.classList.remove('active')
      }
    }, true)
  }

  // === MAGNETIC FIELDS ===
  const magneticElements = document.querySelectorAll('[data-magnetic], .magnetic')
  let animationFrameId = null

  const updateMagneticElements = () => {
    magneticElements.forEach((el) => {
      if (CONFIG.mobile) return

      const rect = el.getBoundingClientRect()
      const elCenterX = rect.left + rect.width / 2
      const elCenterY = rect.top + rect.height / 2

      const distX = mouseX - elCenterX
      const distY = mouseY - elCenterY
      const distance = Math.sqrt(distX * distX + distY * distY)

      if (distance < CONFIG.magnetic.fieldRadius) {
        const strength = 1 - distance / CONFIG.magnetic.fieldRadius
        const pullX = (distX / distance) * CONFIG.magnetic.maxPull * strength
        const pullY = (distY / distance) * CONFIG.magnetic.maxPull * strength

        el.style.transform = `translate(${pullX}px, ${pullY}px)`

        // Text parallax
        const textElements = el.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6')
        textElements.forEach((text) => {
          text.style.transform = `translate(${pullX * 0.4}px, ${pullY * 0.4}px)`
        })
      } else {
        el.style.transform = 'translate(0, 0) scale(1)'
        const textElements = el.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6')
        textElements.forEach((text) => {
          text.style.transform = 'translate(0, 0)'
        })
      }
    })

    if (isAnimating) {
      animationFrameId = requestAnimationFrame(updateMagneticElements)
    }
  }

  if (!CONFIG.mobile) {
    updateMagneticElements()
  }

  // === PAGE TRANSITIONS ===
  let isTransitioning = false

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a')
    if (!link || isTransitioning) return

    const href = link.getAttribute('href')
    const isExternal = link.target === '_blank' || /^https?:\/\//.test(href)
    const isHash = href?.startsWith('#')
    const isInternal = href && !isExternal && !isHash

    if (!isInternal) return

    e.preventDefault()
    isTransitioning = true

    // Exit animation - stagger elements
    const exitElements = document.querySelectorAll('*')
    let delay = 0

    exitElements.forEach((el) => {
      if (el.closest('script, style, meta, link, title')) return

      const randomY = Math.random() * 40 - 20
      el.style.setProperty('--exit-y', `${randomY}px`)
      el.style.animation = `exit-float 600ms ease-out ${delay}ms forwards`
      delay += 20
      if (delay > 600) delay = 600
    })

    // Wipe panel
    const wipePanel = document.createElement('div')
    wipePanel.className = 'transition-wipe'
    document.body.appendChild(wipePanel)

    setTimeout(() => {
      window.location.href = href
    }, 400)
  })

  // Entrance animation on load
  window.addEventListener('load', () => {
    const entranceElements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, .card, nav, section, article, .hero'
    )

    entranceElements.forEach((el, index) => {
      el.classList.add('entrance-animate')
      el.style.animationDelay = `${index * CONFIG.transitions.entryStaggeer}ms`
    })
  })

  // === SCROLL ANIMATIONS ===
  const scrollElements = document.querySelectorAll('[data-scroll-animate]')

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view')

        // Stagger children if parent has data-stagger
        const children = entry.target.querySelectorAll('[data-stagger]')
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('in-view')
          }, index * 80)
        })

        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  scrollElements.forEach((el) => {
    observer.observe(el)
    // Stagger animation setup
    const staggerChildren = el.querySelectorAll('[data-stagger]')
    staggerChildren.forEach((child) => {
      child.style.opacity = '0'
      child.style.transform = 'translateY(20px)'
      child.style.willChange = 'transform, opacity'
    })
  })

  // === PARALLAX ===
  let scrollY = 0

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY
  }, { passive: true })

  const parallaxElements = document.querySelectorAll('[data-parallax]')

  const updateParallax = () => {
    parallaxElements.forEach((el) => {
      const parallaxSpeed = el.dataset.parallax === 'fast' ? CONFIG.parallax.fast : CONFIG.parallax.slow
      const offset = scrollY * parallaxSpeed
      el.style.transform = `translateY(${offset}px)`
    })

    if (isAnimating) {
      requestAnimationFrame(updateParallax)
    }
  }

  updateParallax()

  // === AMBIENT CANVAS ===
  if (CONFIG.ambient.enabled && !CONFIG.mobile) {
    const canvas = document.createElement('canvas')
    canvas.id = 'ambient-canvas'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.insertBefore(canvas, document.body.firstChild)

    const ctx = canvas.getContext('2d')
    const orbs = []

    class Orb {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 80 + 40
        this.color = `rgba(79, 157, 255, ${Math.random() * 0.15 + 0.05})`
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Boundary wrap
        if (this.x < -this.radius) this.x = canvas.width + this.radius
        if (this.x > canvas.width + this.radius) this.x = -this.radius
        if (this.y < -this.radius) this.y = canvas.height + this.radius
        if (this.y > canvas.height + this.radius) this.y = -this.radius

        // Cursor attraction
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 300) {
          const strength = (1 - distance / 300) * 0.03
          this.vx += (dx / distance) * strength
          this.vy += (dy / distance) * strength
        }

        // Friction
        this.vx *= 0.98
        this.vy *= 0.98
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(1, 'rgba(79, 157, 255, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
      }
    }

    for (let i = 0; i < CONFIG.ambient.orbCount; i++) {
      orbs.push(new Orb())
    }

    const animateAmbient = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orbs.forEach((orb) => {
        orb.update()
        orb.draw()
      })

      if (isAnimating) {
        requestAnimationFrame(animateAmbient)
      }
    }

    animateAmbient()

    // Resize canvas
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }

  // === PAUSE/RESUME/DESTROY ===
  window.MagneticLayer = {
    destroy() {
      isAnimating = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      cursorOuter.remove()
      console.log('[MagneticLayer] Destroyed')
    },

    pause() {
      isAnimating = false
      console.log('[MagneticLayer] Paused')
    },

    resume() {
      isAnimating = true
      if (!CONFIG.mobile) {
        updateMagneticElements()
      }
      updateParallax()
      console.log('[MagneticLayer] Resumed')
    },

    config: CONFIG,
  }

  // Visibility API - pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.MagneticLayer.pause()
    } else {
      window.MagneticLayer.resume()
    }
  })

  console.log('[MagneticLayer] Initialized', CONFIG)
})
