# Magnetic Layer - Quick Start Guide

## Installation (30 seconds)

### Option 1: Next.js / React Project
Add this to your `app/layout.tsx` or root layout:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/magnetic-layer.js"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### Option 2: Any HTML Project
Just add one line to your `<head>`:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="/magnetic-layer.js"></script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### Option 3: Standalone Website
Copy `/public/magnetic-layer.js` to your public folder and reference it.

## Basic Usage (2 minutes)

### 1. Magnetic Elements
Make any element respond to the cursor:

```html
<!-- Using data attribute -->
<div data-magnetic>I move toward your cursor</div>

<!-- Using class -->
<button class="magnetic">Click me</button>

<!-- Works with any element -->
<div class="card" data-magnetic>
  <h2>Interactive Card</h2>
  <p>Hover to see the magnetic effect</p>
</div>
```

### 2. Scroll Animations
Animate elements as they enter the viewport:

```html
<section data-scroll-animate>
  <h1>This fades in</h1>
  <p>When you scroll here</p>
</section>
```

### 3. Staggered List
Animate multiple items sequentially:

```html
<div data-scroll-animate>
  <p data-stagger>First item</p>
  <p data-stagger>Second item (80ms later)</p>
  <p data-stagger>Third item (160ms later)</p>
</div>
```

### 4. Parallax Scrolling
Create depth with scrolling layers:

```html
<!-- Scrolls faster (30% of scroll speed) -->
<div data-parallax="fast">
  Foreground image
</div>

<!-- Scrolls slower (70% of scroll speed) -->
<div data-parallax="slow">
  Background image
</div>
```

### 5. Ambient Canvas (Optional)
Add subtle drifting background orbs:

```html
<body data-ambient="true">
  <!-- Content -->
</body>
```

## Customization (5 minutes)

### Custom Cursor Colors
Define CSS variables in your stylesheet:

```css
:root {
  --accent: #4F9DFF;      /* Cursor and ripple color */
  --primary: #0B0F14;     /* Ambient orb color */
}
```

### Disable Ambient Canvas
Remove from body tag or set to false:

```html
<!-- Disable -->
<body data-ambient="false">

<!-- Or just remove the attribute -->
<body>
```

### Control Animations Programmatically
```javascript
// Pause all animations
window.MagneticLayer.pause()

// Resume animations
window.MagneticLayer.resume()

// Destroy and clean up
window.MagneticLayer.destroy()

// Check configuration
console.log(window.MagneticLayer.config)
```

## Examples

### Example 1: Interactive Button
```html
<button class="magnetic" onclick="alert('Clicked!')">
  Hover me!
</button>
```

### Example 2: Product Card
```html
<div class="card" data-magnetic>
  <img src="product.jpg" alt="Product" />
  <h3>Premium Product</h3>
  <p>$99.99</p>
  <button class="magnetic">Buy Now</button>
</div>
```

### Example 3: Hero Section
```html
<section data-scroll-animate class="hero">
  <h1>Welcome to Our Site</h1>
  <p data-stagger>This paragraph fades in</p>
  <p data-stagger>Then this one</p>
  <button class="magnetic">Get Started</button>
</section>
```

### Example 4: Features Grid
```html
<section data-scroll-animate>
  <h2>Our Features</h2>
  <div class="grid">
    <div class="feature-card" data-magnetic>
      <h3>Feature 1</h3>
      <p>Description here</p>
    </div>
    <div class="feature-card" data-magnetic>
      <h3>Feature 2</h3>
      <p>Description here</p>
    </div>
    <div class="feature-card" data-magnetic>
      <h3>Feature 3</h3>
      <p>Description here</p>
    </div>
  </div>
</section>
```

### Example 5: Full Page Setup
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --accent: #4F9DFF;
      --primary: #0B0F14;
    }
  </style>
  <script src="/magnetic-layer.js"></script>
</head>
<body data-ambient="true">
  <nav>
    <a href="/">Home</a>
    <button class="magnetic">Menu</button>
  </nav>

  <section class="hero" data-scroll-animate>
    <h1>Welcome</h1>
    <button class="magnetic">Get Started</button>
  </section>

  <section data-scroll-animate>
    <h2>Features</h2>
    <div data-magnetic class="feature">Feature 1</div>
    <div data-magnetic class="feature">Feature 2</div>
  </section>
</body>
</html>
```

## Testing

### Desktop
1. Open site in Chrome/Firefox
2. Move cursor around - notice the dual-ring cursor
3. Hover over buttons/links - cursor expands
4. Click - see ripple effect
5. Scroll - elements fade in
6. Try clicking links - see smooth transition

### Mobile
1. Open site on phone/tablet
2. Cursor effects are hidden (expected)
3. Scroll animations still work
4. Parallax still works
5. Full functionality preserved

### Accessibility
1. Open DevTools → Rendering → Emulate CSS media feature
2. Enable `prefers-reduced-motion: reduce`
3. Reload - all animations should be disabled
4. Functionality remains normal

## Common Issues & Solutions

### Issue: Cursor not showing
**Solution:**
```javascript
// Check if loaded
console.log(window.MagneticLayer)

// Check if on desktop (not mobile)
console.log(window.innerWidth > 768)

// Check console for initialization message
// You should see: "[MagneticLayer] Initialized"
```

### Issue: Page transitions not working
**Solution:** Ensure internal links use relative URLs:
```html
<!-- Good -->
<a href="/about">About</a>
<a href="page.html">Page</a>

<!-- Won't trigger transition -->
<a href="https://external.com">External</a>
<a href="#section">Hash link</a>
<a target="_blank">New window</a>
```

### Issue: Elements not animating on scroll
**Solution:** Add `data-scroll-animate` to parent:
```html
<!-- Before -->
<section>
  <p>Not animated</p>
</section>

<!-- After -->
<section data-scroll-animate>
  <p>Now animated!</p>
</section>
```

### Issue: Performance problems
**Solution:** Disable ambient canvas:
```html
<body>  <!-- Remove data-ambient="true" -->
```

## Browser Support

✅ Chrome 60+
✅ Firefox 55+
✅ Safari 12+
✅ Edge 79+
✅ Mobile Safari 12+
✅ Mobile Chrome 60+

## File Size

- **magnetic-layer.js**: ~8KB gzipped
- **No dependencies**: Pure vanilla JavaScript
- **Load time**: < 100ms on 4G

## Next Steps

1. ✅ Add script to your site
2. ✅ Add `data-magnetic` to interactive elements
3. ✅ Add `data-scroll-animate` to sections
4. ✅ Customize colors with CSS variables
5. ✅ Test on different devices

## Documentation

For more detailed information:
- **Full Features**: See `MAGNETIC_LAYER_FEATURES.md`
- **Complete README**: See `MAGNETIC_LAYER_README.md`
- **Implementation Details**: See `MAGNETIC_LAYER_IMPLEMENTATION.md`
- **Live Example**: See `magnetic-example.html`

## Support

Having issues? Try:
1. Check console: `[MagneticLayer] ...` messages
2. Verify script loaded: `window.MagneticLayer` exists
3. Test with Chrome DevTools (baseline browser)
4. Check browser compatibility above

## That's It!

You now have a premium animation system running on your site. Enjoy the magic! ✨
