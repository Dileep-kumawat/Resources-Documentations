# Lenis — Quick Recall Notes
> Smooth scroll library · MERN Stack Developer Reference

---

## What is Lenis?

A lightweight (~5KB gzipped) smooth-scroll library by [darkroom.engineering](https://lenis.darkroom.engineering/).  
It intercepts native scroll, applies lerp (linear interpolation) easing, and re-emits the scroll position — giving buttery, controllable scrolling without killing native APIs.

**Why not just `scroll-behavior: smooth`?**  
CSS smooth scroll has no control over speed, easing curve, or programmatic access to scroll progress. Lenis gives you all three.

---

## Installation

```bash
# npm
npm install lenis

# yarn
yarn add lenis
```

CDN (quick prototype):
```html
<script src="https://unpkg.com/lenis@latest/dist/lenis.min.js"></script>
```

---

## Core Concept — How It Works

```
User scrolls (wheel/touch)
        ↓
Lenis captures delta
        ↓
Applies lerp easing  →  lerp(current, target, damping)
        ↓
Updates scroll position smoothly on each RAF tick
        ↓
Fires scroll event with enriched data
```

**Key terms:**
| Term | Meaning |
|------|---------|
| `lerp` | Linear interpolation — moves value towards target by a factor each frame |
| `damping` | How quickly scroll "catches up" (lower = slower/smoother) |
| `RAF` | requestAnimationFrame — Lenis runs inside it |
| `raf` | Lenis's own update method you call inside RAF |

---

## Basic Setup (Vanilla JS)

```js
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,          // scroll animation duration (seconds)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease
  orientation: 'vertical', // 'vertical' | 'horizontal'
  smoothWheel: true,       // smooth mouse wheel
  wheelMultiplier: 1,      // scroll speed multiplier
  touchMultiplier: 2,      // touch scroll multiplier
})

// RAF loop — REQUIRED
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

> ⚠️ **Must call `lenis.raf(time)` inside RAF** — Lenis does nothing without it.

---

## Options Cheatsheet

| Option | Default | Notes |
|--------|---------|-------|
| `duration` | `1.2` | Seconds for scroll animation |
| `easing` | expo | Any `(t) => number` function |
| `damping` | `100` | Used if lerp mode (replaces duration) |
| `lerp` | `0.1` | Direct lerp factor (0–1); skip duration |
| `orientation` | `'vertical'` | `'horizontal'` for horizontal scroll |
| `smoothWheel` | `true` | Apply smooth to mouse wheel |
| `smoothTouch` | `false` | Smooth on touch (mobile, use carefully) |
| `infinite` | `false` | Infinite scroll loop |
| `wrapper` | `window` | Scroll container element |
| `content` | `document.body` | Scrollable content element |
| `wheelMultiplier` | `1` | Scale wheel delta |
| `touchMultiplier` | `2` | Scale touch delta |

---

## Instance Methods

```js
// Scroll to a target
lenis.scrollTo(target, options)
// target: number (px) | CSS selector | DOM element | 'top' | 'bottom' | 'left' | 'right'

lenis.scrollTo('#section2', {
  offset: -80,        // offset in px
  duration: 1.5,      // override duration
  easing: (t) => t,  // override easing
  immediate: false,   // jump instantly if true
  lock: false,        // lock scroll during animation
  onComplete: () => console.log('done'),
})

lenis.stop()    // pause smooth scroll
lenis.start()   // resume
lenis.destroy() // remove all listeners, cleanup

lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
  // scroll    → current px position
  // limit     → max scrollable px
  // velocity  → scroll speed
  // direction → 1 (down) | -1 (up)
  // progress  → 0 to 1 (scroll percentage)
})
```

---

## React Integration

### Vanilla approach (useEffect)

```jsx
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function App() {
  useEffect(() => {
    const lenis = new Lenis()

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy() // cleanup on unmount
  }, [])

  return <div>...</div>
}
```

### With `@studio-freight/react-lenis` (official wrapper)

```bash
npm install @studio-freight/react-lenis
```

```jsx
import { ReactLenis, useLenis } from '@studio-freight/react-lenis'

// Wrap your app
export default function App() {
  return (
    <ReactLenis root options={{ duration: 1.2 }}>
      <YourContent />
    </ReactLenis>
  )
}

// Access lenis anywhere in tree
function SomeChild() {
  const lenis = useLenis(({ scroll }) => {
    // runs on every scroll tick
  })

  return <button onClick={() => lenis.scrollTo('#target')}>Go</button>
}
```

---

## GSAP + ScrollTrigger Integration

> Critical: tell ScrollTrigger to use Lenis scroll position, not native.

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis()

// Sync Lenis → ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

// Put Lenis inside GSAP's ticker (replaces manual RAF)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000) // gsap time is in seconds, lenis needs ms
})

gsap.ticker.lagSmoothing(0) // prevent gsap from skipping frames
```

---

## Common Patterns

### Navbar hide/show on scroll direction

```js
lenis.on('scroll', ({ direction, velocity }) => {
  if (Math.abs(velocity) > 0.1) {
    navbar.classList.toggle('hidden', direction === 1)
  }
})
```

### Scroll progress bar

```js
lenis.on('scroll', ({ progress }) => {
  progressBar.style.width = `${progress * 100}%`
})
```

### Disable scroll temporarily (e.g., modal open)

```js
lenis.stop()   // open modal
lenis.start()  // close modal
```

### Horizontal scroll section

```js
const lenis = new Lenis({
  orientation: 'horizontal',
  wrapper: document.querySelector('.h-scroll-wrapper'),
  content: document.querySelector('.h-scroll-content'),
})
```

---

## CSS Required for Smooth Scroll to Work

```css
/* Prevent native browser smooth scroll conflicting */
html {
  scroll-behavior: auto; /* NOT smooth */
}

/* If using a wrapper (not window) */
.scroll-wrapper {
  overflow: hidden;  /* Lenis manages overflow */
  height: 100vh;
}
```

---

## Next.js Integration

```jsx
// app/providers.jsx (App Router)
'use client'
import { ReactLenis } from '@studio-freight/react-lenis'

export function Providers({ children }) {
  return <ReactLenis root>{children}</ReactLenis>
}

// app/layout.jsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

> In Next.js App Router, Lenis must be inside a `'use client'` component.

---

## Performance Tips

| Tip | Why |
|-----|-----|
| Use `will-change: transform` on animated elements | Promotes to GPU layer |
| Avoid `scroll` listener on every component — use `lenis.on` once | Single source |
| `gsap.ticker.lagSmoothing(0)` when using with GSAP | Prevents frame skip |
| Don't enable `smoothTouch` by default | Feels unnatural on mobile |
| Destroy on component unmount | Prevent memory leaks |

---

## Debugging

```js
// Check if lenis is running
console.log(lenis.isRunning)   // true/false
console.log(lenis.scroll)      // current scroll px
console.log(lenis.limit)       // max scrollable px
console.log(lenis.progress)    // 0–1

// If scroll feels janky: check RAF is wired up, and no overflow:hidden on body
```

---

## Lenis vs Alternatives

| Library | Weight | Easing Control | GSAP Sync | Maintenance |
|---------|--------|---------------|-----------|-------------|
| **Lenis** | ~5KB | ✅ Full | ✅ Native | ✅ Active |
| Locomotive Scroll | ~30KB | ✅ | ⚠️ Manual | ⚠️ Slow |
| Smooth Scrollbar | ~15KB | ✅ | ⚠️ Manual | ⚠️ Slow |
| `scroll-behavior: smooth` | 0 | ❌ | ❌ | — |

---

## Mental Model Summary

```
Lenis = native scroll position hijacked + lerp easing + RAF loop
      = smooth feel + full JS control + tiny footprint

You must:  wire RAF  →  lenis.raf(time)
           cleanup   →  lenis.destroy()
           CSS       →  html { scroll-behavior: auto }

GSAP users: replace RAF with gsap.ticker, sync via lenis.on('scroll', ScrollTrigger.update)
React users: use ReactLenis wrapper or manual useEffect with destroy cleanup
```

---

*Notes cover Lenis v1.x · Last updated June 2026*
