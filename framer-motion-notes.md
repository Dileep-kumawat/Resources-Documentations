# Framer Motion — Quick Recall Notes
> For a MERN Stack Developer | Recall everything in one read

---

## 1. What & Why

- **Framer Motion** = production-ready animation library for React
- Replaces CSS transitions/keyframes with a **declarative, component-based API**
- Works seamlessly with React state, hooks, and conditional rendering
- Install: `npm install framer-motion`

---

## 2. The Core Building Block — `motion.*`

Every HTML/SVG element has a `motion` equivalent:

```jsx
import { motion } from "framer-motion"

<motion.div />    // instead of <div />
<motion.button /> // instead of <button />
<motion.svg />    // instead of <svg />
```

That's it — swap the tag, get animation superpowers.

---

## 3. The Three Key Props (90% of your usage)

| Prop | Purpose | Think of it as… |
|------|---------|-----------------|
| `initial` | Start state | "where it begins" |
| `animate` | End state | "where it goes" |
| `exit` | State on unmount | "how it leaves" |

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
/>
```

**Animatable properties:** opacity, x, y, scale, rotate, skew, width, height, borderRadius, backgroundColor, color, and more.

---

## 4. `transition` — Control Timing & Physics

```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    duration: 0.5,       // seconds
    delay: 0.2,
    ease: "easeInOut",   // "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "backOut"
    type: "spring",      // "tween" (default) | "spring" | "inertia"
    stiffness: 300,      // spring only
    damping: 20,         // spring only — lower = more bounce
    repeat: Infinity,    // loop
    repeatType: "reverse" // "loop" | "reverse" | "mirror"
  }}
/>
```

**Mental model:**
- `tween` = CSS-like, time-based
- `spring` = physics-based, feels natural (use for interactive elements)
- `inertia` = momentum/drag (use for drag-and-drop)

---

## 5. `variants` — Clean, Reusable Animation Sets

Instead of inlining everything, define named states:

```jsx
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover:   { scale: 1.05 },
  tap:     { scale: 0.97 }
}

<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
  whileHover="hover"
  whileTap="tap"
/>
```

**Why variants?** They propagate to children automatically — the parent's state name flows down.

---

## 6. Gesture Animations (Interactive)

```jsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#646cff" }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: "2px solid blue" }}
  whileDrag={{ opacity: 0.8 }}
/>
```

No event handlers needed — Framer handles pointer/touch events internally.

---

## 7. `AnimatePresence` — Animate on Mount/Unmount

React removes elements immediately from the DOM. `AnimatePresence` lets them animate out first.

```jsx
import { AnimatePresence, motion } from "framer-motion"

<AnimatePresence>
  {isVisible && (
    <motion.div
      key="modal"                          // ⚠️ key is REQUIRED
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

**Use cases:** modals, toasts, route transitions, list items, dropdowns.

**`mode` prop:**
- `mode="sync"` (default) — enter and exit happen simultaneously
- `mode="wait"` — exit completes before enter starts (good for page transitions)
- `mode="popLayout"` — exiting element is "popped" out of flow (good for lists)

---

## 8. Staggered Children — `staggerChildren`

Animate a list where each item enters with a delay after the previous:

```jsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,   // 100ms between each child
      delayChildren: 0.2      // wait before starting
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

The children inherit the parent's `initial`/`animate` — no need to repeat them.

---

## 9. Scroll Animations — `whileInView` & `useScroll`

### Simple: `whileInView`
```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}  // trigger when 30% visible; only once
  transition={{ duration: 0.6 }}
/>
```

### Advanced: `useScroll` + `useTransform`
```jsx
import { useScroll, useTransform } from "framer-motion"

const { scrollYProgress } = useScroll()  // 0 to 1 as page scrolls
const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
const y = useTransform(scrollYProgress, [0, 1], [0, -100])

<motion.div style={{ opacity, y }} />
```

`useTransform(motionValue, inputRange, outputRange)` — maps one range to another.

---

## 10. `useMotionValue` & `useSpring` — Fine-Grained Control

```jsx
import { useMotionValue, useSpring, motion } from "framer-motion"

const x = useMotionValue(0)              // like useState but for motion
const smoothX = useSpring(x, { stiffness: 300, damping: 30 })  // adds spring physics

const handleMouseMove = (e) => x.set(e.clientX)

<motion.div onMouseMove={handleMouseMove} style={{ x: smoothX }} />
```

**Key difference from state:** `useMotionValue` updates don't trigger re-renders — more performant for continuous animations.

---

## 11. Layout Animations — `layout` prop

Automatically animates when an element's position/size changes in the DOM:

```jsx
<motion.div layout />              // animates any layout change
<motion.div layout="position" />   // only position changes
<motion.div layout="size" />       // only size changes
```

Use `layoutId` for **shared element transitions** (like a card expanding to a modal):

```jsx
// Card
<motion.div layoutId="card-1" onClick={() => setExpanded(true)} />

// Modal (rendered elsewhere in tree)
{expanded && <motion.div layoutId="card-1" />}
```

Framer Motion automatically morphs between the two elements.

---

## 12. `useAnimate` Hook — Imperative Control

For animations triggered by logic, not just render:

```jsx
import { useAnimate } from "framer-motion"

const [scope, animate] = useAnimate()

const handleClick = async () => {
  await animate(scope.current, { scale: 1.2 }, { duration: 0.2 })
  await animate(scope.current, { scale: 1 }, { duration: 0.2 })
  // sequenced: waits for each to finish
}

<div ref={scope}>
  <button onClick={handleClick}>Click me</button>
</div>
```

Also supports CSS selectors within the scope:
```jsx
animate("li", { opacity: 0 }, { duration: 0.3 })
```

---

## 13. Drag

```jsx
<motion.div
  drag                        // enable drag in both axes
  drag="x"                    // x-axis only
  dragConstraints={{ left: -100, right: 100 }}
  dragElastic={0.2}           // resistance (0 = rigid, 1 = fully elastic)
  dragSnapToOrigin            // snaps back on release
  onDragEnd={(event, info) => console.log(info.offset, info.velocity)}
/>
```

Constrain to another element:
```jsx
const constrainRef = useRef(null)
<div ref={constrainRef}>
  <motion.div drag dragConstraints={constrainRef} />
</div>
```

---

## 14. SVG Animations

Path drawing animation using `pathLength`:

```jsx
<motion.path
  d="M 0 0 L 100 100"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 2, ease: "easeInOut" }}
/>
```

Also supports `pathOffset` and `pathSpacing` for dashed path animations.

---

## 15. `MotionConfig` — Global Defaults

Wrap your app (or section) to set global animation defaults:

```jsx
import { MotionConfig } from "framer-motion"

<MotionConfig
  transition={{ duration: 0.4, ease: "easeOut" }}
  reducedMotion="user"   // respects OS-level "reduce motion" preference
>
  <App />
</MotionConfig>
```

---

## 16. Performance Tips

| Tip | Why |
|-----|-----|
| Animate `transform` and `opacity` only | GPU-accelerated, no layout recalculation |
| Avoid animating `width`/`height` directly | Use `scaleX`/`scaleY` instead |
| Use `useMotionValue` for cursor-tracked animations | No re-renders |
| `will-change: transform` via CSS for heavy animations | Hints browser to optimize |
| Set `viewport={{ once: true }}` on scroll animations | Avoid re-triggering |

---

## 17. MERN-Specific Patterns

### React Router Page Transitions
```jsx
import { AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"

const location = useLocation()

<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
  </Routes>
</AnimatePresence>

// PageWrapper.jsx
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)
```

### Loading States (API fetching)
```jsx
{isLoading ? (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
  />
) : (
  <AnimatePresence>
    {data.map(item => (
      <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    ))}
  </AnimatePresence>
)}
```

### Toast/Notification System
```jsx
<AnimatePresence>
  {toasts.map(toast => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      layout
    >
      {toast.message}
    </motion.div>
  ))}
</AnimatePresence>
```

### Animated List (CRUD)
```jsx
// When adding/removing items from MongoDB response
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.li
      key={item._id}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
    >
      {item.name}
    </motion.li>
  ))}
</AnimatePresence>
```

---

## 18. Quick Mental Map

```
motion.*           →  animatable element
initial/animate    →  from → to
exit               →  unmount animation (needs AnimatePresence)
transition         →  timing, physics
variants           →  named states + stagger
whileHover/Tap     →  gesture shortcuts
layout/layoutId    →  auto-animate position/size changes
useScroll          →  scroll-driven animations
useMotionValue     →  imperative, no re-render
useAnimate         →  sequential, programmatic
```

---

## 19. Common Gotchas

- `exit` animations **require** `<AnimatePresence>` as an ancestor
- `key` prop is **required** on the animated child inside `AnimatePresence`
- `layout` on a child requires the parent not to clip/overflow-hide during animation
- Don't animate `width: "auto"` — use `layout` prop instead
- `useSpring` returns a motion value, not a state value — use with `style`, not `animate`
- `useScroll` needs the scrollable container referenced if it's not the window

---

*One-page reference — covers ~95% of real-world Framer Motion usage.*
