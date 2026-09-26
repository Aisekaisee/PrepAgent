# Premium Minimalist UI Refactor

## Intent
Completely refactor the current dark/neon "PrepAgent" dashboard into a high-end, presentation-ready light mode interface with a strict, refined color palette and uniform components.

## Instructions
Act as an elite UI/UX engineer and strictly execute the following visual changes across the codebase without changing the layout structure:

### 1. Canvas & Backgrounds (The Pale-White Shift)
- **Primary Background:** Change the main website canvas to a very soft, pale off-white/grey (`#F8F9FA` or `#F4F5F7`). Completely eliminate the current dark purple/black theme.
- **Card Backgrounds:** Set all dashboard cards, containers, and the left sidebar to solid pure white (`#FFFFFF`).
- **Depth & Separation:** Remove all neon backing glows, gradients, and ambient shadows. Instead, separate containers using a crisp, thin border: `1px solid #E2E8F0` or a very subtle soft shadow: `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05)`.

### 2. Strict 4-Color Palette Engine
Restrict the UI to exactly these colors. Eliminate all random purples, cyans, and neon text gradients:
- **Color 1 (Dominant/Base):** Pure White (`#FFFFFF`) for panels and Pale Grey (`#F8F9FA`) for page backgrounds.
- **Color 2 (Typography/Structure):** Deep Slate Black/Charcoal (`#1E293B`) for high-contrast primary text, headers, and core navigation icons.
- **Color 3 (Accent Option A - Green):** Emerald/Mint Green (`#10B981`) for positive indicators (e.g., "78% Readiness", "Online" badge, checkmarks).
- **Color 4 (Accent Option B - Orange):** Burnt Orange/Amber (`#F59E0B` or `#E28743`) for warning gaps or secondary highlights (e.g., "In Progress" badges, "2 Deficits").

### 3. Uniform Component Standardization
- **Button Rounding:** Enforce a strict global standard for all button corner radiuses. Set every button (e.g., "Resume Roadmap", "Open Roadmap", "Launch Placement Coach") to exactly `border-radius: 8px` (or Tailwind `rounded-lg`). Remove pill shapes or uneven rounding.
- **Button Fills:** Replace the glowing blue/purple gradients on buttons with solid colors. Use a solid slate or primary accent fill with crisp white text.

### 4. High-End Micro-Interactions (Antigravity Polish)
Make the dashboard feel organic and premium to the touch rather than rigid and static:
- **Hover Lift:** When a user hovers over any card or navigation item, it must lift subtly using a clean 3D transform and transition:
  `transition: transform 0.2s ease, box-shadow 0.2s ease;`
  `hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); }`
- **Interactive States:** When buttons are clicked or hovered, slightly deepen their background tint rather than triggering neon light displays.
