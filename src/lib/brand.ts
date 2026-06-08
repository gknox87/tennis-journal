/**
 * Sports Journal — Brand Design Tokens
 *
 * Source of truth for all brand colours, typography, spacing and
 * component conventions. Use these instead of hard‑coding values.
 *
 * Colour reference (HSL → Hex):
 *   Primary   hsl(220, 70%, 50%)  #2563eb  — main actions, links
 *   Secondary hsl(285, 85%, 65%)  #a855f7  — accents, highlights
 *   Accent    hsl(142, 76%, 36%)  #16a34a  — success, wins, CTAs
 *   Brand     #6366F1              — app icon, splash, theme
 *   Destructive hsl(0, 84%, 60%)  #ef4444  — errors, loss
 *
 * Usage in components:
 *   import { brand } from '@/lib/brand'
 *   <div className={brand.colors.primary}>…</div>
 *
 * Usage in CSS:
 *   color: hsl(var(--primary))  ← picks up index.css variables
 */

export const brand = {
  // ── Colours ────────────────────────────────────────────
  colors: {
    primary:   '#2563eb',  // blue — actions, links
    secondary: '#a855f7',  // purple — highlights, badges
    accent:    '#16a34a',  // green — wins, success CTAs
    brand:     '#6366F1',  // indigo — app icon, splash, theme
    destructive:'#ef4444',  // red — errors, losses
    warning:   '#f59e0b',  // amber — warnings
    muted:     '#64748b',  // slate — secondary text

    // Sport badge colours
    sports: {
      tennis:    '#16a34a',
      padel:     '#f59e0b',
      tabletennis:'#3b82f6',
      badminton: '#8b5cf6',
      squash:    '#ec4899',
      boxing:    '#ef4444',
      swimming:  '#06b6d4',
      cycling:   '#f97316',
      athletics: '#eab308',
      weightlifting: '#dc2626',
      football:  '#22c55e',
      hockey:    '#6366F1',
      custom:    '#64748b',
    } as Record<string, string>,
  },

  // ── Typography ────────────────────────────────────────
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono:   "'JetBrains Mono', 'Fira Code', monospace",
  },

  // ── Spacing / radius ──────────────────────────────────
  radius: {
    sm:  'calc(var(--radius) - 4px)',
    md:  'calc(var(--radius) - 2px)',
    lg:  'var(--radius)',
    xl:  'calc(var(--radius) + 4px)',
  },

  // ── Shadows ───────────────────────────────────────────
  shadow: {
    card:  '0 4px 24px rgba(0,0,0,0.08)',
    cardHover: '0 8px 32px rgba(0,0,0,0.12)',
    button: '0 2px 8px rgba(37,99,235,0.25)',
  },

  // ── Animation ─────────────────────────────────────────
  transition: {
    fast:  '150ms ease',
    base:  '200ms ease',
    slow:  '300ms ease',
  },
} as const;

// Convenience: flat colour map for Tailwind arbitrary values
export const sportColors = brand.colors.sports;
