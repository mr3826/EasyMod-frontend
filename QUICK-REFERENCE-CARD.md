# 🎬 EasyMod Animation Patterns - Quick Reference Card

**Print this card or keep it handy while coding!**

---

## 30-Second Refresher

**Motion library**: `motion 12.23.24` ✅ already installed

**Import pattern**:
```typescript
import { motion } from 'motion/react';
import { useStaggerAnimation } from '@/lib/useMotion';
import { presets } from '@/lib/animation-presets';
```

**Use patterns**:
```typescript
// Hook way (usually best)
const { containerVariants, itemVariants } = useStaggerAnimation();

// Preset way
<motion.div {...presets.cardEnter}>

// Custom way (rare)
<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />
```

---

## 8 Copy-Paste Patterns

### 1️⃣ LOADING SPINNER
```typescript
import { useLoadingAnimation } from '@/lib/useMotion';
const { spinner } = useLoadingAnimation();
<motion.div animate={spinner}><Loader /></motion.div>
```
**Use for**: Any async operation  
**Duration**: 2s infinite  
**A11y**: ✅ Respects prefers-reduced-motion

---

### 2️⃣ MODAL DIALOG
```typescript
import { useModalAnimation } from '@/lib/useMotion';
const modal = useModalAnimation();
<motion.div {...modal.backdrop} onClick={close} />
<motion.div {...modal.content}>{content}</motion.div>
```
**Use for**: Dialogs, confirmations  
**Duration**: 300ms entrance, 100ms exit  
**A11y**: ✅ Full keyboard support

---

### 3️⃣ TABLE ROWS
```typescript
import { tableRowEnter } from '@/lib/animation-presets';
{products.map((p, i) => (
  <motion.tr key={p.id} {...tableRowEnter(i, 0.05)}>
    {/* row content */}
  </motion.tr>
))}
```
**Use for**: All data tables  
**Duration**: 200ms per row, 50ms stagger  
**A11y**: ✅ Keyboard navigable

---

### 4️⃣ BUTTON PRESS
```typescript
import { useTapAnimation } from '@/lib/useMotion';
const tap = useTapAnimation();
<motion.button whileTap={tap.press} onClick={handleClick}>
  Click me
</motion.button>
```
**Use for**: All interactive buttons  
**Duration**: 100ms scale-down  
**A11y**: ✅ Works with keyboard

---

### 5️⃣ STATUS BADGE CHANGE
```typescript
import { presets } from '@/lib/animation-presets';
<motion.span key={status} {...presets.badgeStateChange}>
  {status}
</motion.span>
```
**Use for**: Status updates, badges  
**Duration**: 200ms spring bounce  
**A11y**: ✅ Animated with spring

---

### 6️⃣ FORM VALIDATION ✓/✗
```typescript
import { checkmarkSuccess } from '@/lib/animation-presets';
import { motion } from 'motion/react';

{isValid && <motion.div {...checkmarkSuccess}><Check /></motion.div>}
{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  {error}
</motion.div>}
```
**Use for**: Form feedback  
**Duration**: 150ms entrance  
**A11y**: ✅ Error announced

---

### 7️⃣ STAGGERED LIST
```typescript
import { useStaggerAnimation } from '@/lib/useMotion';
const { containerVariants, itemVariants } = useStaggerAnimation(0.05, 0.3);

<motion.ul variants={containerVariants} initial="hidden" animate="show">
  {items.map((item, i) => (
    <motion.li key={i} variants={itemVariants}>{item}</motion.li>
  ))}
</motion.ul>
```
**Use for**: Lists, cards, search results  
**Duration**: 300ms per item, 50ms stagger  
**A11y**: ✅ All keyboard accessible

---

### 8️⃣ SIDEBAR SLIDE
```typescript
import { useDrawerAnimation } from '@/lib/useMotion';
const drawer = useDrawerAnimation('left');

<motion.div {...drawer.overlay} onClick={close} />
<motion.aside {...drawer.panel}>{sidebar}</motion.aside>
```
**Use for**: Mobile nav, filters, detail panels  
**Duration**: 300ms with spring physics  
**A11y**: ✅ Escape closes

---

## Common Mistakes

| ❌ DON'T | ✅ DO | Why |
|---------|-------|-----|
| Animate `width` | Use `scaleX` | GPU acceleration |
| Custom timing | Use preset duration | Consistency |
| Forget `AnimatePresence` | Wrap exit animations | Exit plays smoothly |
| Ignore `prefers-reduced-motion` | Use hooks (automatic) | Accessibility |
| Make it too long | Keep < 300ms | Feels responsive |
| Animate everything | Be intentional | Less is more |

---

## Performance Rules

✅ **GPU-Safe Properties**:
- `transform` (translate, rotate, scale)
- `opacity`
- `filter`

❌ **Avoid**:
- `width`, `height` → use `scaleX/Y`
- `top`, `left`, `bottom`, `right` → use `translate`
- `padding`, `margin` → use `transform`

**Golden Rule**: If it would cause layout reflow → don't animate it

---

## Design Tokens (Copy Values)

### Durations
```typescript
'100ms'  // Micro interactions (button press)
'200ms'  // Standard transitions (default)
'300ms'  // Slow transitions (entrance)
'400ms'  // Very slow (choreographed)
```

### Easing Curves
```typescript
'cubic-bezier(0, 0, 0.2, 1)'           // easeOut (default)
'cubic-bezier(0.4, 0, 0.2, 1)'         // easeInOut
'cubic-bezier(0.34, 1.56, 0.64, 1)'    // spring (bouncy)
'cubic-bezier(0.4, 0, 1, 1)'           // easeIn
```

### Component Spacing
```typescript
compactPitch: { px: '12px', py: '8px' }
normalPitch: { px: '16px', py: '12px' }
spacious: { px: '24px', py: '16px' }
```

---

## Quick Validation (Before You Commit)

```
Performance
□ 60fps on desktop (Chrome DevTools)
□ 60fps on mobile (real device)
□ No red frames in graph
□ No jank/stuttering

Accessibility
□ Works with prefers-reduced-motion enabled
□ Keyboard navigation unaffected
□ Focus ring visible
□ Works on mobile

Code Quality
□ Uses preset tokens (not custom)
□ Uses animation presets (not one-off)
□ Well-commented (why, not how)
□ No console errors
```

---

## Common Questions

**Q: How do I make it faster?**  
A: `duration: 100` instead of `200`

**Q: How do I make it bouncier?**  
A: Use `spring` easing instead of `easeOut`

**Q: It doesn't animate at all**  
A: Wrap in `<AnimatePresence>` for exits

**Q: It works on desktop but not mobile**  
A: Test on real device; may need GPU fix

**Q: How do I disable it for testing?**  
A: Set `duration: 0` or use `prefers-reduced-motion`

---

## File Quick Reference

| Need | File | Export |
|------|------|--------|
| Button scaledown | `useMotion` | `useTapAnimation()` |
| Load spinner | `useMotion` | `useLoadingAnimation()` |
| Stagger list | `useMotion` | `useStaggerAnimation()` |
| Modal slide | `presets` | `modalEnter` |
| Table rows | `presets` | `tableRowEnter(i)` |
| Status badge | `presets` | `badgeStateChange` |
| Custom stagger | `presets` | `createStaggerVariants()` |

---

## Workflow

```
1. Identify animation need
   ↓
2. Check "8 Copy-Paste Patterns" above
   ↓
3. Copy pattern to your component
   ↓
4. Test on real device (not just browser)
   ↓
5. Run through "Quick Validation" checklist
   ↓
6. Commit & celebrate! 🎉
```

---

## Import Cheat Sheet

```typescript
// Motion library
import { motion, AnimatePresence } from 'motion/react';

// Your hooks
import { 
  useMotionPreferences,
  useStaggerAnimation,
  useLoadingAnimation,
  useModalAnimation,
  useDrawerAnimation,
  useTapAnimation,
  useHoverAnimation,
} from '@/lib/useMotion';

// Your presets
import { presets } from '@/lib/animation-presets';
// or specific ones:
import { 
  cardEnter, 
  tableRowEnter, 
  badgeStateChange,
  // ... 30+ more available
} from '@/lib/animation-presets';

// Design tokens
import { designTokens } from '@/lib/design-tokens';
```

---

## The Accessibility Rule

Always ask: **"Does this work with `prefers-reduced-motion` enabled?"**

**If using hooks** → Automatically ✅ (hooks handle it)  
**If using presets** → Test it manually  
**If custom** → You must handle it

```typescript
// ❌ BAD - Ignore preference
<motion.div animate={{ rotate: 360 }} repeat={Infinity} />

// ✅ GOOD - Check preference
const { shouldReduceMotion } = useMotionPreferences();
<motion.div 
  animate={shouldReduceMotion ? {} : { rotate: 360 }}
  transition={{ repeat: Infinity }}
/>
```

---

## Module Implementation Order

### 🔴 Priority 1 (Do First - High Impact)
1. Dashboard (cards, metrics)
2. Products (table, filters)
3. Orders (status, timeline)
4. Customers (list, detail)

### 🟡 Priority 2 (Then - Medium Impact)
5. Forms (validation, inputs)
6. Modals (dialogs, confirmations)
7. Buttons (all interactions)
8. Loaders (async states)

### 🟢 Priority 3 (Last - Polish)
9. Inbox (messages)
10. Reports (charts)
11. Settings (forms)
12. Categories (trees)

---

## Debug Mode

**Enable motion debug**:
```typescript
// Add to component for timing info
console.log('Animation start:', Date.now());
// Check browser DevTools → Performance tab during animation
// Look for FPS graph (should be 60 mostly)
```

**Is it 60fps?**
- Chrome DevTools → Performance tab
- Hit record, do animation, stop
- Look at FPS graph
- If green (60fps) → good ✅
- If red (30fps) → needs optimization ❌

---

## Final Reminder

```
✨ Motion is not decoration
✨ Motion is communication
✨ Motion guides attention
✨ Motion reduces cognitive load

Use intentionally. Use sparingly. Use respectfully.
```

---

## Need Help?

- 📖 See [README-MODERNIZATION.md](./README-MODERNIZATION.md) for full docs
- 🚀 See [QUICK-START-IMPLEMENTATION.md](./QUICK-START-IMPLEMENTATION.md) for examples
- ✅ See [MOTION-DESIGN-CHECKLIST.md](./MOTION-DESIGN-CHECKLIST.md) for validation
- 📋 See [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) for schedule

---

**Keep. This. Handy. 📌**

*Last updated: March 2026*
