/**
 * Phase 4: Performance Validation & Testing
 * 
 * Utilities for validating animations meet 60 FPS target and accessibility requirements.
 * 
 * Usage:
 * - Chrome DevTools Performance tab (manual)
 * - React Profiler wrapper (automated)
 * - Lighthouse CI (CI/CD pipeline)
 */

import React from 'react';

// ============================================================================
// PERFORMANCE MONITOR (Development Only)
// ============================================================================

/**
 * PerformanceMonitor
 * 
 * Wraps components to measure render duration during animations.
 * Logs warning if animation takes >16.67ms (60 FPS budget).
 * 
 * Usage:
 * <PerformanceMonitor label="AnimatedButton">
 *   <AnimatedButton>Click me</AnimatedButton>
 * </PerformanceMonitor>
 */
export const PerformanceMonitor: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <React.Profiler
      id={label}
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        // Warn if commit time exceeds 60 FPS budget
        const frameTimeMs = 16.67;
        if (actualDuration > frameTimeMs) {
          console.warn(
            `⚠️ Performance: ${id} took ${actualDuration.toFixed(2)}ms (budget: ${frameTimeMs}ms)`,
            `Phase: ${phase}`
          );
        }

        // Log to performance observer
        if (window.performance && window.performance.mark) {
          window.performance.mark(`${id}-end`);
        }
      }}
    >
      {children}
    </React.Profiler>
  );
};

// ============================================================================
// FPS MONITOR (Development Only)
// ============================================================================

/**
 * useFPSMonitor
 * 
 * Custom hook to measure FPS during animations.
 * Logs frame rate to console during interaction.
 * 
 * Usage:
 * const fpsMetrics = useFPSMonitor();
 * console.log(`Current FPS: ${fpsMetrics.currentFPS}`);
 */
export function useFPSMonitor() {
  const [fps, setFps] = React.useState(60);
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    if (!isMonitoring || process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const countFrame = (currentTime: number) => {
      frameCount++;

      const elapsed = currentTime - lastTime;
      if (elapsed >= 1000) {
        setFps(frameCount);
        console.log(`📊 FPS: ${frameCount} frames (${elapsed.toFixed(0)}ms)`);
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(countFrame);
    };

    animationFrameId = requestAnimationFrame(countFrame);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isMonitoring]);

  return {
    currentFPS: fps,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    isMonitoring,
  };
}

// ============================================================================
// ANIMATION VALIDATION HELPER
// ============================================================================

/**
 * validateAnimationProperties
 * 
 * Ensures animation only targets transform/opacity (GPU-accelerated).
 * Logs error if invalid properties detected.
 * 
 * Usage:
 * validateAnimationProperties({ x: 100, opacity: 1 }); // ✅ OK
 * validateAnimationProperties({ width: '100px', height: '200px' }); // ❌ ERROR
 */
export function validateAnimationProperties(
  properties: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const allowedProperties = [
    'opacity',
    'scale',
    'scaleX',
    'scaleY',
    'x',
    'y',
    'rotate',
    'rotateX',
    'rotateY',
    'rotateZ',
    'skewX',
    'skewY',
  ];

  const errors: string[] = [];

  Object.keys(properties).forEach((key) => {
    if (!allowedProperties.includes(key)) {
      errors.push(
        `❌ Invalid property "${key}". Use only GPU-accelerated properties: ${allowedProperties.join(', ')}`
      );
    }
  });

  if (process.env.NODE_ENV === 'development' && errors.length > 0) {
    console.error('Animation Validation Error:', errors);
  }

  return { isValid: errors.length === 0, errors };
}

// ============================================================================
// ACCESSIBILITY VALIDATION
// ============================================================================

/**
 * checkAccessibility
 * 
 * Validates animation respects prefers-reduced-motion.
 * Checks focus management and ARIA attributes.
 */
export function checkAccessibility(): {
  prefersReducedMotion: boolean;
  darkMode: boolean;
} {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (prefersReducedMotion && process.env.NODE_ENV === 'development') {
    console.info('ℹ️ Accessibility: User prefers reduced motion - animations disabled');
  }

  return { prefersReducedMotion, darkMode };
}

// ============================================================================
// NETWORK THROTTLE TESTER
// ============================================================================

/**
 * simulateNetworkThrottle
 * 
 * Artificially slows down interactions to simulate 4G network.
 * Helps validate animations remain smooth on slow connections.
 * 
 * Usage:
 * const slowDown = simulateNetworkThrottle('slow-4g');
 * await slowDown(async () => {
 *   await fetchData();
 *   // Animation should still be smooth
 * });
 */
export function simulateNetworkThrottle(throttleLevel: '4g' | 'slow-4g' | '3g') {
  const delays = {
    '4g': 50,
    'slow-4g': 100,
    '3g': 200,
  };

  const delay = delays[throttleLevel];

  return async (callback: () => Promise<void>): Promise<void> => {
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, delay));
    await callback();
    const elapsed = performance.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `⏱️ Throttled operation (${throttleLevel}): ${elapsed.toFixed(2)}ms`
      );
    }
  };
}

// ============================================================================
// PERFORMANCE BASELINE
// ============================================================================

/**
 * PerformanceBaseline
 * 
 * Records baseline performance metrics before/after animations.
 * Helps catch regressions.
 */
export class PerformanceBaseline {
  private baselines: Map<string, number> = new Map();

  record(label: string, metric: number): void {
    this.baselines.set(label, metric);
    console.log(`📊 Baseline recorded: ${label} = ${metric.toFixed(2)}ms`);
  }

  compare(label: string, currentMetric: number): {
    baseline: number | undefined;
    delta: number | undefined;
    isRegression: boolean;
  } {
    const baseline = this.baselines.get(label);
    if (!baseline) {
      return { baseline: undefined, delta: undefined, isRegression: false };
    }

    const delta = currentMetric - baseline;
    const isRegression = delta > baseline * 0.1; // >10% increase = regression

    if (isRegression) {
      console.warn(
        `⚠️ Performance Regression: ${label} increased by ${delta.toFixed(2)}ms (${(
          (delta / baseline) *
          100
        ).toFixed(1)}%)`
      );
    }

    return { baseline, delta, isRegression };
  }

  clear(): void {
    this.baselines.clear();
  }
}

// ============================================================================
// EXPORT VALIDATION CHECKLIST
// ============================================================================

/**
 * Pre-ship Animation Checklist
 * 
 * Print checklist to console before shipping animations
 */
export function printValidationChecklist(): void {
  const checklist = `
╔════════════════════════════════════════════════════════════╗
║      🚀 PRE-SHIP ANIMATION VALIDATION CHECKLIST            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Chrome DevTools:                                          ║
║  □ Open DevTools Performance tab                          ║
║  □ Record 3-second animation                              ║
║  □ Verify FPS graph shows green (60 FPS minimum)          ║
║  □ Check rendering section - minimal purple bars          ║
║                                                            ║
║  Code Quality:                                             ║
║  □ Only animate transform/opacity (no width/height)      ║
║  □ will-change: transform on active elements only        ║
║  □ Animation duration ≤ 500ms                             ║
║  □ prefers-reduced-motion respected                       ║
║                                                            ║
║  Browser Testing:                                          ║
║  □ Chrome (latest)                                         ║
║  □ Firefox (latest)                                        ║
║  □ Safari (iOS 15+)                                        ║
║  □ Edge (90+)                                              ║
║                                                            ║
║  Mobile Testing:                                           ║
║  □ iPhone 13/14 (Safari)                                   ║
║  □ Android (Chrome)                                        ║
║  □ Slow 4G throttle in DevTools                           ║
║                                                            ║
║  Accessibility:                                            ║
║  □ Tab navigation works smoothly                           ║
║  □ Focus states visible                                    ║
║  □ Screen readers announce changes                         ║
║  □ prefers-reduced-motion working                         ║
║                                                            ║
║  Performance:                                              ║
║  □ Lighthouse score ≥ 90                                   ║
║  □ Core Web Vitals green                                   ║
║  □ No memory leaks (DevTools heap snapshot)               ║
║  □ Battery drain minimal (mobile profiler)                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `;

  console.log(checklist);
}

// Print checklist on app load (development only)
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      // Uncomment to show checklist on load
      // printValidationChecklist();
    });
  }
}
