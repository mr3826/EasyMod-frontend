# Motion Design Implementation Checklist

## Pre-Implementation Validation

Use this checklist **before** implementing any motion/animation in the EasyMod app.

---

## 1. Purpose Assessment

- [ ] **Is this motion necessary?**
  - [ ] Provides visual feedback for action?
  - [ ] Clarifies state change?
  - [ ] Guides user attention?
  - [ ] Reduces cognitive load?
  - ⚠️ If none apply → Do NOT add motion

- [ ] **What problem does it solve?**
  - [ ] Problem: ___________________________
  - [ ] Motion solution: ___________________________
  - [ ] Status quo (without motion): ___________________________
  - [ ] Why motion is better: ___________________________

- [ ] **Is similar motion already in the app?**
  - [ ] If yes → reuse existing pattern
  - [ ] If no → document the new pattern

---

## 2. Pattern Classification

Check the appropriate category (determines implementation approach):

**☐ State Transitions** (Loading → Loaded, Error → Resolved)
- Duration: 100-300ms
- Example: `loading spinner fade-in → content entrance`

**☐ User Feedback** (Button press, Form validation, Copy success)
- Duration: 100-150ms
- Example: `button scale 0.95 on click`

**☐ Content Discovery** (Drawer open, Dropdown expand, Menu slide)
- Duration: 200-300ms
- Example: `sidebar slide-in from left`

**☐ Micro-Interaction** (Hover state, Icon animation, Progress fill)
- Duration: 150-200ms
- Example: `button brightness change on hover`

**☐ Navigation** (Page transition, Route change)
- Duration: 200-300ms
- Example: `page fade-in on route change`

---

## 3. Design Decision Matrix

| Criterion | Assessment | Decision |
|-----------|-----------|----------|
| **Type** | [ ] State [ ] Feedback [ ] Content [ ] Micro [ ] Nav | ⬜ |
| **Duration** | Proposed: ___ms (validate: 100-300ms) | ✅/❌ |
| **Easing** | [ ] ease-out [ ] ease-in-out [ ] spring | ⬜ |
| **Trigger** | Event: _________________ | ⬜ |
| **Reversible** | [ ] Yes [ ] No | ✅/❌ |
| **Interruptible** | [ ] Yes [ ] No [ ] N/A | ⬜ |
| **GPU-Safe** | [ ] Yes [ ] No (specify: _____) | ✅/❌ |

---

## 4. Performance Checklist

### Desktop Testing (Chrome, Firefox, Safari)

- [ ] **Frame Rate**
  - [ ] Runs at 60fps (DevTools Performance panel)
  - [ ] No frame drops during first 1000ms
  - [ ] Max jank threshold: <1 frame drop per 60 frames

- [ ] **Paint & Composite**
  - [ ] Uses `transform` and `opacity` only
  - [ ] Triggered paint count: ___
  - [ ] Composite time: ___ms (target: <16ms)
  - [ ] Layout recalculations: ___ (target: 0)

- [ ] **Memory Impact**
  - [ ] No memory leaks on repeat trigger
  - [ ] Animation cleanup verified
  - [ ] Re-entrance doesn't double memory cost

### Mobile Testing (iOS Safari, Android Chrome)

- [ ] **Performance**
  - [ ] 60fps maintained (or 30fps graceful)
  - [ ] Thermal load acceptable (device not hot)
  - [ ] Battery impact minimized

- [ ] **Network**
  - [ ] Works on slow 3G connection
  - [ ] Doesn't compete with data loading
  - [ ] Bandwidth neutral

- [ ] **Input**
  - [ ] Touch animations feel responsive
  - [ ] Gesture interruption works
  - [ ] No janky response to swipe/tap

---

## 5. Accessibility Validation

### Motion Preferences

- [ ] **`prefers-reduced-motion` Respected**
  - [ ] Animation disabled when preference set
  - [ ] Instant state change (duration: 0ms)
  - [ ] No alternative animation substituted
  - [ ] Tested with: [ ] macOS [ ] Windows [ ] iOS [ ] Android

- [ ] **No Motion Sickness Risk**
  - [ ] No fast scrolling parallax
  - [ ] No rapid direction changes
  - [ ] No multiple background animations
  - [ ] User can pause if > 5s duration

### Semantic & Assistive Tech

- [ ] **Screen Reader**
  - [ ] Animated content readable
  - [ ] State changes announced via aria-live
  - [ ] No duplicate announcements
  - [ ] Tested with: [ ] NVDA [ ] JAWS [ ] VoiceOver

- [ ] **Keyboard Navigation**
  - [ ] Keyboard users can trigger animation
  - [ ] Focus remains visible throughout
  - [ ] Tap/click targets unchanged by animation
  - [ ] Escape cancels motion dialogs/modals

- [ ] **No Seizure Risk**
  - [ ] No flashing > 3Hz over 25% of screen
  - [ ] No rapid color changes
  - [ ] No strobing effects
  - [ ] Compliant with WCAG 2.1 Level A

---

## 6. User Testing (Minimum Required)

- [ ] **5 users tested** (diverse abilities, devices)
  
  | User | Age | Device | Opinion | Notes |
  |------|-----|--------|---------|-------|
  | 1 | ___ | ___ | ⭐⭐⭐⭐⭐ | _________ |
  | 2 | ___ | ___ | ⭐⭐⭐⭐⭐ | _________ |
  | 3 | ___ | ___ | ⭐⭐⭐⭐⭐ | _________ |
  | 4 | ___ | ___ | ⭐⭐⭐⭐⭐ | _________ |
  | 5 | ___ | ___ | ⭐⭐⭐⭐⭐ | _________ |

- [ ] **Feedback Analysis**
  - Positive: ___________________________
  - Negative: ___________________________
  - Timing feedback: ___________________________
  - Any "jank" reported? [ ] Yes [ ] No

- [ ] **Iteration Results** (if any feedback addressed)
  - Change made: ___________________________
  - User re-test result: ___________________________

---

## 7. Code Quality

- [ ] **Implementation Pattern**
  - [ ] Uses `motion` library (consistent)
  - [ ] Uses animation preset from library
  - [ ] Has TypeScript types defined
  - [ ] Well-commented (why, not how)

- [ ] **Code Review**
  ```
  Reviewer: _________________ Date: _______
  Comments:
  _______________________________________________
  _______________________________________________
  ```

- [ ] **Test Coverage**
  - [ ] Unit test for animation trigger
  - [ ] E2E test for motion behavior
  - [ ] Accessibility test included
  - [ ] Mobile regression test

---

## 8. Design System Consistency

- [ ] **Timing**
  - [ ] Duration matches preset: [ ] 100ms [ ] 200ms [ ] 300ms [ ] 400ms
  - [ ] Easing matches preset: [ ] ease-out [ ] ease-in-out [ ] spring
  - [ ] Not one-off custom timing

- [ ] **Pattern Reuse**
  - [ ] Same animation as similar feature? [ ] Yes [ ] No
  - [ ] If no → why create new pattern?
  - [ ] Could be generalized? [ ] Yes [ ] No

- [ ] **Component Library**
  - [ ] Exported as reusable component?
  - [ ] Documented in Storybook/component library?
  - [ ] Other modules notified for reuse?

---

## 9. Documentation

- [ ] **Code Comments**
  ```typescript
  // Why: User needs visual feedback on state change
  // What: Bounce animation on successful upload
  // Duration: 300ms (spring with bounce=0.4)
  // Accessibility: Respects prefers-reduced-motion
  ```

- [ ] **Design Doc Linked**
  - [ ] Figma design attached to PR?
  - [ ] Motion principles documented?
  - [ ] Before/after comparison shown?

- [ ] **Changelog Entry**
  ```
  - ✨ Add button click feedback animation (affects: all buttons)
  - 🎬 Implement table row stagger entrance (affects: Products, Orders)
  - ♿ Add prefers-reduced-motion support (affects: all animations)
  ```

---

## 10. Browser & Device Coverage

**Desktop:**
- [ ] Chrome (latest) - Desktop ← PRIMARY TEST
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- Older version support needed? [ ] Yes [ ] No → If yes, test IE11 support

**Mobile:**
- [ ] iOS Safari (Latest 2 versions)
- [ ] Android Chrome (Latest 2 versions)
- [ ] iOS motion disabled mode
- [ ] Android battery saver mode

**Test Results:**

| Browser | Version | Status | Issues | Notes |
|---------|---------|--------|--------|-------|
| Chrome | ____ | ✅/❌ | _____ | _____ |
| Firefox | ____ | ✅/❌ | _____ | _____ |
| Safari | ____ | ✅/❌ | _____ | _____ |
| Edge | ____ | ✅/❌ | _____ | _____ |
| iOS Safari | ____ | ✅/❌ | _____ | _____ |
| Android Chrome | ____ | ✅/❌ | _____ | _____ |

---

## 11. Final Sign-Off

**Implementation Date**: ________________  
**Developer**: ________________  
**Reviewer**: ________________  
**Design Lead**: ________________  

**Sign-off Criteria** (All must be ✅):
- [ ] All applicable sections completed
- [ ] Performance validated (60fps)
- [ ] Accessibility tested (prefers-reduced-motion + WCAG)
- [ ] User tested (5+ users, positive feedback)
- [ ] Code reviewed and approved
- [ ] Tests passing (unit + e2e + accessibility)
- [ ] Browser coverage verified
- [ ] Design system consistency maintained

**Status**:
- [ ] ✅ APPROVED - Ready for production
- [ ] ⚠️ CONDITIONAL - Requires changes: ___________
- [ ] ❌ REJECTED - Reason: ___________

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________

---

## Usage Instructions

1. **Print this document** or save as PDF for each animation
2. **Complete during development** - don't defer to QA
3. **Keep with PR/merge request** for code review
4. **Archive completed checklists** for reference library
5. **Review quarterly** to identify common issues

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Maintenance**: Review every quarter during retrospectives
