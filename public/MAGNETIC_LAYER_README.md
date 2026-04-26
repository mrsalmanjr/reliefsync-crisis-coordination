# Magnetic Layer - Premium Animation System

A pure vanilla JavaScript animation library that adds premium magnetic cursor, antigravity transitions, and signature animations to ANY website without modifying existing HTML, CSS, or JavaScript.

## Quick Start

### 1. Add the Script

Add this single line to your HTML `<head>` or before closing `</body>`:

```html
<script src="/magnetic-layer.js"></script>
```

That's it! The script automatically initializes on `DOMContentLoaded`.

## Features

### 1. Magnetic Cursor (Desktop Only)

- **Dual-ring cursor** replaces the default pointer
- **Outer ring** (40px): Smooth lag with spring physics (lerp 0.08)
- **Inner dot** (8px): Tight snap with sharp lerp (0.22)
- **Interactive hover**: Expands to 60px, changes to accent color, adds difference blend mode
- **Click ripple**: Implodes then explodes with ripple ring
- **Mobile**: Automatically disabled on touch devices

**Auto-detects interactive elements:**
- All `<a>`, `<button>`, `<input>`, `<textarea>`, `<select>`
- Any element with `[data-magnetic]` or `.magnetic` class

### 2. Magnetic Hover Fields

Elements with `[data-magnetic]` or `.magnetic` class get:
- **Gravitational pull**: Element drifts toward cursor within 80px radius
- **Full lock on hover**: Tracks cursor offset (capped at ±18px)
- **Text parallax**: Inner text shifts at 0.4x element movement for depth
- **Elastic snap-back**: Spring overshoot on mouseout
- **Liquid ripple**: Subtle expansion effect on button hover

### 3. Antigravity Page Transitions

Smooth internal link navigation with:
- **Exit animation**: Staggered elements float upward with blur and opacity fade
- **Wipe panel**: Thin accent bar sweeps down during transition
- **Entrance animation**: Elements stagger in from below with blur and ease-out
- **Respects standard links**: Doesn't break external URLs, target="_blank", or hash navigation

### 4. Scroll Signature Animations

Elements animate in as they enter the viewport:
- **IntersectionObserver-based**: Efficient, no jank
- **Float entrance**: Elements slide up from 40px below with blur
- **Stagger support**: Children inside `[data-stagger]` parents animate 80ms apart
- **Parallax layers**: Elements with `[data-parallax="fast|slow"]` scroll at different speeds

### 5. Ambient Field Effect (Optional)

Subtle background canvas with drifting gradient orbs:
- **6-10 soft orbs**: Slowly drift with Perlin-like motion
- **Cursor attraction**: Closest orbs subtly drift toward cursor
- **Auto-colors**: Uses CSS `--primary` and `--accent` variables
- **Ultra-subtle**: 30% opacity, never distracting

To enable: Add `data-ambient="true"` to `<body>`:

```html
<body data-ambient="true">
```

## HTML Attributes

### Data Attributes

```html
<!-- Enable ambient canvas effect -->
<body data-ambient="true">

<!-- Make element magnetic -->
<div data-magnetic>Content</div>

<!-- Or use class -->
<button class="magnetic">Hover me</button>

<!-- Animate on scroll -->
<div data-scroll-animate>Content</div>

<!-- Stagger children on scroll -->
<div data-scroll-animate data-stagger>
  <p data-stagger>Line 1</p>
  <p data-stagger>Line 2</p>
  <p data-stagger>Line 3</p>
</div>

<!-- Parallax scrolling -->
<div data-parallax="fast">Scroll fast</div>
<div data-parallax="slow">Scroll slow</div>
```

## CSS Variables

The script respects your color scheme:

```css
:root {
  --accent: #4F9DFF; /* Cursor accent color */
  --primary: #0B0F14; /* Background reference */
}
```

## Configuration

Access and customize the CONFIG object:

```javascript
// After the script loads
console.log(window.MagneticLayer.config)

// Example output:
{
  cursor: { outerSize: 40, innerSize: 8, outerLerp: 0.08, innerLerp: 0.22 },
  magnetic: { fieldRadius: 80, maxPull: 18, snapStiffness: 0.15 },
  transitions: { exitDuration: 600, entryStaggeer: 60, wipeDuration: 200 },
  parallax: { fast: 0.3, slow: 0.7 },
  ambient: { enabled: false, orbCount: 8 },
  mobile: false,
  reducedMotion: false
}
```

## API Methods

```javascript
// Pause all animations
window.MagneticLayer.pause()

// Resume animations
window.MagneticLayer.resume()

// Clean up and remove all effects
window.MagneticLayer.destroy()
```

## Accessibility

- **Respects `prefers-reduced-motion`**: All animations are disabled if user has reduced motion enabled
- **Mobile-friendly**: Magnetic cursor is disabled on touch devices (< 768px width)
- **Keyboard support**: Standard link/button navigation works unchanged
- **Screen readers**: No DOM structure changes, all interactive elements remain accessible

## Performance

- **GPU-accelerated**: Only uses `transform` and `opacity` (no reflow)
- **RequestAnimationFrame**: 60fps cursor and parallax loops
- **Passive listeners**: Scroll events use `passive: true` for better performance
- **Visibility API**: Pauses animations when tab is hidden
- **No dependencies**: Pure vanilla JavaScript (~8KB gzipped)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile Safari 12+
- Mobile Chrome 60+

## Limitations

- **No iframes**: Content inside iframes won't be animated
- **Text fields excluded**: `<input>`, `<textarea>`, `<select>` don't get magnetic pull (only surroundings)
- **Reduced Motion**: All animations disabled if user has system preference enabled
- **Mobile**: Magnetic cursor and field effects disabled, scroll animations only
- **Performance**: Ambient canvas disabled on mobile to save resources

## Troubleshooting

### Cursor not showing
- Check that `cursor: none` is applied to `html` in browser DevTools
- Ensure you're not on a mobile device (< 768px width)
- Verify script loaded: `console.log(window.MagneticLayer)`

### Animations not working
- Check console for errors: `[MagneticLayer] Initialized`
- Verify `prefers-reduced-motion` is not enabled in system settings
- Check that CSS variables `--accent` and `--primary` are defined

### Performance issues
- Disable ambient canvas: Remove `data-ambient="true"`
- Reduce number of magnetic elements
- Check browser DevTools Performance tab for jank

### Scroll animations not triggering
- Ensure elements have `[data-scroll-animate]` attribute
- Check IntersectionObserver threshold (15% of element must be visible)
- Verify CSS `will-change` property isn't causing issues

## Examples

### Full setup

```html
<!DOCTYPE html>
<html>
<head>
  <script src="/magnetic-layer.js"></script>
  <style>
    :root {
      --accent: #4F9DFF;
      --primary: #0B0F14;
    }
  </style>
</head>
<body data-ambient="true">
  <nav>
    <a href="/">Home</a>
    <button class="magnetic">Menu</button>
  </nav>

  <section data-scroll-animate>
    <h1>Welcome</h1>
    <p data-stagger>Paragraph 1</p>
    <p data-stagger>Paragraph 2</p>
  </section>

  <div class="card" data-magnetic>
    <h2>Interactive Card</h2>
    <p>Hover me to see magnetic effect</p>
  </div>

  <div data-parallax="slow">Background layer</div>
</body>
</html>
```

### Programmatic control

```javascript
// Start
// Script auto-initializes, nothing needed

// Pause during heavy operation
window.MagneticLayer.pause()

// Resume when done
window.MagneticLayer.resume()

// Check config
console.log(window.MagneticLayer.config.cursor)

// Clean up
window.MagneticLayer.destroy()
```

## Technical Details

### Animation Timings

- **Cursor outer ring**: Lerp 0.08 (smooth lag)
- **Cursor inner dot**: Lerp 0.22 (snappy)
- **Exit animation**: 600ms (staggered 20ms per element, max 600ms)
- **Entrance animation**: 800ms with cubic-bezier(0.16, 1, 0.3, 1) (expo out)
- **Wipe panel**: 200ms ease-out
- **Scroll stagger**: 80ms between children

### CSS Injection

The script injects a `<style>` tag with:
- Cursor styling
- Animation keyframes
- Transition wipe panel
- Scroll animation states
- Will-change optimizations

**No existing CSS is overridden** - only new rules are added.

### DOM Injection

Only these elements are injected:
1. `<div class="magnetic-cursor">` - Custom cursor (desktop only)
2. `<div class="transition-wipe">` - Page transition panel
3. `<canvas id="ambient-canvas">` - Background orbs (optional)
4. `<style>` - Animation CSS

All elements have `pointer-events: none` except the canvas.

## License

Free to use and modify. No attribution required.

## Support

For issues or questions:
1. Check the console: `[MagneticLayer] ...` messages
2. Verify script is loaded: `window.MagneticLayer` exists
3. Test with reduced config: Temporarily disable features
4. Check browser compatibility: Use Chrome/Firefox as baseline
