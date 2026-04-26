# Magnetic Layer - Complete Feature Specification

## 1. MAGNETIC POINTER (Signature Anti-Gravity Cursor)

### Visual Design
- **Outer Ring**: 40px diameter, white border (2px), border-radius 50%
- **Inner Dot**: 8px diameter, white solid fill, centered in ring
- **Active State**: Outer ring expands to 60px, border changes to accent color
- **Blend Mode**: Switches to `mix-blend-mode: difference` on hover
- **Mobile**: Completely hidden on touch devices (< 768px)

### Physics Engine
```
Outer Ring Lerp: 0.08 (smooth, laggy follow)
Inner Dot Lerp: 0.22 (snappy, sharp tracking)
Spring tension: Applied on snap-back
Overshoot: ~1.2x on elastic release
```

### Interaction States

#### Idle
- Follows cursor with smooth lag
- Outer ring: 40px, white border
- Inner dot: visible, 8px white fill
- Z-index: 10000

#### Hover (Over Interactive Element)
- Outer ring expands: 40px → 60px (smooth animation)
- Border color: white → accent color
- Inner dot: 8px → 0px scale (disappears)
- Mix-blend-mode: adds `difference`
- Snap to cursor position

#### Click
1. **Implode Phase** (50ms):
   - Both rings scale from 1 to 0.3
   - Opacity fades to 0
2. **Ripple Explosion** (starts at 50ms, lasts 600ms):
   - Circular ripple border (2px stroke)
   - Expands from 30px to 100px diameter
   - Opacity: 0.6 → 0
   - Easing: `ease-out`

#### Exit (Leave Interactive Element)
- Outer ring contracts: 60px → 40px
- Border color: accent → white
- Inner dot scales back: 0 → 8px
- Spring overshoot: ~1.2x on scale
- Duration: 300ms

### Interactive Element Detection
**Auto-detected:**
- `<a>` tags
- `<button>` elements
- `<input>` fields
- `<textarea>` fields
- `<select>` dropdowns
- Any element with `[data-magnetic]` attribute
- Any element with `.magnetic` class

**Excluded:**
- Text inside inputs (no pull applied to field)
- Elements inside iframes
- Disabled buttons/inputs

---

## 2. ANTIGRAVITY PAGE TRANSITIONS

### Exit Animation (Current Page)
**Duration**: 600ms
**Easing**: ease-out
**Stagger**: 20ms per element (max 600ms total)

**Animation per element:**
```javascript
From:
  opacity: 1
  transform: translateY(0) blur(0) scale(1)

To:
  opacity: 0
  transform: translateY(var(--exit-y, -40px)) blur(4px) scale(0.96)
  where --exit-y is random(-20px, -60px) per element
```

### Wipe Panel
**Style**: Thin horizontal bar (100% width × 3px height)
**Color**: Accent color (linear gradient optional)
**Duration**: 200ms
**Animation**: translateY(-100% → +100vh)
**Easing**: ease-out
**Z-index**: 9999 (above content)

### Entrance Animation (New Page)
**Duration**: 800ms per element
**Easing**: cubic-bezier(0.16, 1, 0.3, 1) - "expo out"
**Delay**: Staggered 60ms per element
**Target Elements**: h1, h2, h3, h4, h5, h6, p, .card, nav, section, article, .hero

**Animation per element:**
```javascript
From:
  opacity: 0
  transform: translateY(30px) blur(6px)

To:
  opacity: 1
  transform: translateY(0) blur(0)
```

### Smart Link Handling
**Intercepts:** Click on same-origin `<a>` tags (internal links)
**Respects:** 
- External URLs (http://, https://)
- `target="_blank"` attributes
- Hash navigation (#anchor)
- Disabled links
- Form submissions
- Non-link clicks

**Prevention:**
- No hijacking of form submits
- No breaking of dropdown menus
- No interfering with modal dialogs
- No affecting JavaScript click handlers

---

## 3. MAGNETIC HOVER FIELDS ON ELEMENTS

### Activation
**Trigger**: Mouse proximity within 80px radius of element
**Attribute**: `[data-magnetic]` or `.magnetic` class

### Magnetic Pull Simulation
```javascript
Distance Calculation: Euclidean distance from cursor to element center
Field Radius: 80px
Max Pull Strength: 18px X/Y displacement
Pull Scaling: Inverse square law feel
  strength = (1 - distance/fieldRadius)^2
```

### Element Movement
```javascript
pullX = (distX / distance) * maxPull * strength
pullY = (distY / distance) * maxPull * strength
transform: translate(pullX, pullY)
```

### Text Parallax (Depth Effect)
- Elements inside magnetic element get 0.4x movement
- Creates 3D depth illusion
- Only applies to text elements: span, p, h1-h6
- Smooth linear interpolation

### Hover Lock
- On full hover: Element fully tracks cursor offset
- Capped at ±18px displacement
- Smooth spring animation (0.3s duration)

### Snap-Back Animation
- Triggered on mouseout
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1) - spring overshoot
- Duration: 300ms
- Overshoot factor: ~1.2x scale
- Back to: transform(0, 0) scale(1)

### Button-Specific: Liquid Ripple
**Trigger**: Mouse enter on button element
**Animation**: Expanding circle from cursor entry point
**Visuals**:
- Pseudo-element (::before) or injected div
- 2px border stroke, accent color
- Initial size: 30px diameter
- Final size: 100px diameter
- Opacity: 0.6 → 0
- Duration: 400ms

### Card-Specific: 3D Tilt + Specular Highlight
**3D Rotation:**
```javascript
rotateX: cursor position relative to card Y axis
rotateY: cursor position relative to card X axis
Max rotation: ±8 degrees
Duration: 100ms (reactive, not smooth)
```

**Specular Highlight:**
- Radial gradient overlay (pseudo-element)
- Size: 150px diameter
- Color: white with 0.3 opacity
- Follows cursor position
- Creates "glossy surface" illusion

---

## 4. SCROLL SIGNATURE ANIMATIONS

### Intersection Observer Setup
```javascript
Threshold: 0.15 (15% of element must be visible)
Root Margin: "0px 0px -50px 0px" (trigger before fully visible)
Behavior: One-time animation (unobserve after trigger)
```

### Float-In Animation
**Trigger**: Element enters viewport (>15% visible)
**Duration**: 600ms
**Easing**: cubic-bezier(0.34, 1.56, 0.64, 1) - spring ease

**Animation:**
```javascript
From:
  opacity: 0
  transform: translateY(40px) blur(6px)

To:
  opacity: 1
  transform: translateY(0) blur(0)
```

### Gravity Well Effect
- Elements slightly accelerate as they enter (ease-in first 30%)
- Then ease-out for last 70%
- Creates "falling into view" physics feel

### Staggered Children
**Selector**: Elements inside `[data-scroll-animate]` with `[data-stagger]`
**Stagger Delay**: 80ms between each child
**Cascade Effect**: Sequential animation down the list

### Parallax Scrolling

#### Activation
```html
<!-- Fast parallax (scroll at 30% speed) -->
<div data-parallax="fast">Content</div>

<!-- Slow parallax (scroll at 70% speed) -->
<div data-parallax="slow">Content</div>
```

#### Physics
```javascript
Fast: scrollY * 0.3
Slow: scrollY * 0.7
Updated: Every frame via requestAnimationFrame
```

#### Use Cases
- Background layers that move slower (depth)
- Hero images that parallax on scroll
- Text that slides differently than images

---

## 5. AMBIENT FIELD EFFECT (Optional)

### Activation
```html
<body data-ambient="true">
  <!-- Content -->
</body>
```

### Canvas Setup
- **Element**: `<canvas id="ambient-canvas">`
- **Position**: fixed, full viewport (100vw × 100vh)
- **Z-index**: -1 (behind all content)
- **Opacity**: 0.3 (very subtle)
- **Pointer-events**: none

### Orb Properties
**Count**: 6-10 orbs (configurable)
**Each orb:**
- Position: Random x, y
- Size: 40-120px radius
- Velocity: Random (-0.5, 0.5) px/frame
- Color: Accent color with 0.05-0.2 opacity
- Fill: Radial gradient (solid center → transparent edge)

### Orb Movement
**Base Motion**: Slow drift with Perlin-like smoothness
**Velocity**: v *= 0.98 per frame (friction)
**Boundary Wrap**: Seamless wrapping at viewport edges

### Cursor Attraction
**Detection Range**: 300px from orb center
**Attraction Force**: (1 - distance/300) * 0.03
**Direction**: Toward cursor position
**Effect**: Closest orbs subtly drift toward cursor

### Visual Rendering
```javascript
gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
gradient.addColorStop(0, color)      // Center: full opacity
gradient.addColorStop(1, transparent) // Edge: transparent
ctx.fillRect(x - r, y - r, r*2, r*2)
```

### Performance
- **30fps target** (not critical for visual quality)
- Disabled on mobile
- Canvas resizes with window
- Auto-cancel frame loop on tab hide (Visibility API)

---

## Performance & Constraints

### Animation Performance Targets
- Cursor tracking: 60fps sustained
- Magnetic fields: 60fps when hovering
- Scroll animations: 60fps (IntersectionObserver handles efficiency)
- Page transitions: Smooth 60fps (staggered over 600ms)
- Ambient canvas: 30fps acceptable

### Layout Optimization
- **Transform-only**: No width/height/top/left animations
- **Opacity-only**: No color animations
- **will-change: transform**: Applied to all animated elements
- **No reflow**: GPU acceleration ensures smooth rendering

### Mobile Considerations
```javascript
Mobile (< 768px):
  ✅ Scroll animations enabled
  ✅ Parallax enabled
  ❌ Magnetic cursor disabled
  ❌ Magnetic fields disabled
  ❌ Ambient canvas disabled
```

### Accessibility
```javascript
prefers-reduced-motion:
  ✅ All animations disabled
  ✅ Script still loads (no JS errors)
  ✅ Graceful degradation
  ✅ Full functionality preserved
```

### Event Handling
- **Passive listeners**: Scroll uses `{ passive: true }`
- **No preventDefault**: Except for internal link clicks
- **Visibility API**: Pauses when tab is hidden
- **No memory leaks**: Proper cleanup in destroy()

---

## Configuration Reference

### CONFIG Object Structure
```javascript
{
  cursor: {
    outerSize: 40,      // px
    innerSize: 8,       // px
    outerLerp: 0.08,    // smoothness (0-1)
    innerLerp: 0.22     // snappiness (0-1)
  },
  magnetic: {
    fieldRadius: 80,    // px attraction range
    maxPull: 18,        // px max displacement
    snapStiffness: 0.15 // spring stiffness
  },
  transitions: {
    exitDuration: 600,      // ms total exit time
    entryStaggeer: 60,      // ms per element
    wipeDuration: 200       // ms wipe panel
  },
  parallax: {
    fast: 0.3,              // scroll multiplier
    slow: 0.7               // scroll multiplier
  },
  ambient: {
    enabled: false,         // boolean (or data-ambient="true")
    orbCount: 8             // number of orbs
  },
  mobile: boolean,          // auto-detected
  reducedMotion: boolean    // auto-detected
}
```

### CSS Variables
```css
:root {
  --accent: #4F9DFF;        /* Cursor color, ripple, orb color */
  --primary: #0B0F14;       /* Ambient background reference */
}
```

---

## Technical Implementation Notes

### Zero Dependencies Achieved ✅
- No GSAP, Anime.js, or tweening libraries
- No Three.js or WebGL libraries
- No jQuery or DOM libraries
- Pure vanilla ES6+ JavaScript

### Zero DOM Changes ✅
- Only injects: `<style>`, cursor div, canvas, wipe panel
- No modification of existing elements
- No reordering of content
- All injected elements have `pointer-events: none`

### Zero Event Interference ✅
- Passive scroll listeners
- Selective click interception (internal links only)
- No form hijacking
- No modal breaking

### Browser Compatibility ✅
- Chrome/Edge: 60+
- Firefox: 55+
- Safari: 12+
- Mobile Safari/Chrome: 12+/60+

---

## Summary

This Magnetic Layer system provides a premium, futuristic visual upgrade that:
- ✨ Enhances user experience with responsive animations
- 🎯 Maintains full accessibility and performance
- 🔌 Drops into any project with zero setup
- 📱 Respects mobile and accessibility preferences
- 🚀 Delivers 60fps performance on modern hardware
