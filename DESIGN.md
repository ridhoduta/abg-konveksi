---
name: Garment Operations System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#006056'
  on-tertiary: '#ffffff'
  tertiary-container: '#007b6e'
  on-tertiary-container: '#b1fff1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for a modern garment and convection enterprise, balancing industrial precision with digital vibrancy. The brand personality is efficient, energetic, and highly professional, reflecting the fast-paced nature of textile production and retail.

The visual style follows a **Corporate Modern** aesthetic with high-density layouts optimized for operational speed. It prioritizes solid surfaces and clear boundaries over decorative effects like glassmorphism. The interface evokes a sense of reliability through structured grids and "High-Precision" UI—where every pixel serves a functional purpose in the manufacturing and sales workflow.

## Colors
The palette is built on a foundation of "Electric Industrial" tones. 
- **Primary (Vibrant Blue):** Represents the core technology and reliability of the convection process. Used for primary actions and brand presence.
- **Secondary (Energetic Orange):** Used sparingly for high-attention calls to action, notifications, or "Rush Order" statuses.
- **Tertiary (Fresh Teal):** Dedicated to success states, inventory health, and financial growth indicators.
- **Neutral (Deep Navy/Slate):** Provides the professional grounding needed for data-heavy environments.

Gradients should be used only as subtle 10% linear overlays on primary buttons to provide a slight "pressed" depth, rather than as background elements.

## Typography
Plus Jakarta Sans is selected for its modern, geometric clarity and high legibility in data-dense environments like Point of Sale (POS) and inventory tables. 

The type hierarchy emphasizes weight over size to distinguish between different information categories. Labels use a slightly tighter tracking and semi-bold weight to remain legible at small sizes, crucial for garment tags and SKU labels. Headlines use a slight negative letter-spacing to feel more compact and "engineered."

## Layout & Spacing
The design system utilizes an 8px rhythmic grid. Layouts are strictly structured to handle the complexity of convection management.

- **Desktop (POS/Admin):** A 12-column fluid grid with 16px gutters. For cashier screens, a split-pane layout is preferred: a 3-column fixed sidebar for the receipt/cart and a 9-column fluid area for the product grid.
- **Tablet:** An 8-column grid focused on touch targets for warehouse staff.
- **Mobile:** A 4-column grid with 16px side margins.

Content reflow follows a "Dense-to-Stacked" rule: data tables on desktop convert to expandable cards on mobile to maintain readability of garment specifications and pricing.

## Elevation & Depth
This design system uses **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy. 

Depth is achieved by shifting background colors (e.g., a Slate-50 background with White cards) rather than using heavy shadows. When shadows are necessary for floating elements (like modals or dropdowns), use a "Soft Industrial" shadow: a very low-opacity (8-10%) navy tint with a large blur and zero spread, ensuring it looks like an ambient light source rather than a floating object. 

Avoid all glassmorphism. Surfaces must be 100% opaque to ensure maximum contrast for production data.

## Shapes
The shape language is "Soft-Technical." Elements use a consistent 4px (0.25rem) corner radius for standard components like input fields and buttons. This provides a professional, "machined" look that feels more modern than sharp 90-degree corners but more serious than highly rounded "pill" shapes. 

Product cards in the POS view may use `rounded-lg` (8px) to subtly differentiate them as selectable objects from the more rigid data entry forms.

## Components
- **Data Tables:** High-density with 1px Slate-200 borders. Row hovering uses a Primary-50 (very light blue) tint. Column headers are `label-sm` with a subtle Slate-100 background.
- **Product Cards (POS):** Features a large image area, followed by a `label-md` for the product name and a bold Primary-600 price. A small vibrant blue "+" button is anchored to the bottom-right.
- **Input Fields:** Use 1px Slate-300 borders. On focus, the border shifts to Primary-500 with a 2px soft outer glow in the primary color.
- **Buttons:** Primary buttons are solid Blue. Action buttons (like "Add Item") use the Secondary Orange. Success actions (like "Complete Order") use the Tertiary Teal.
- **Status Chips:** Use a "Pastel-on-Solid" look—a very light background tint of the status color with high-contrast bold text (e.g., a "Completed" chip has a light teal background with dark teal text).
- **Login Elements:** Center-aligned, utilizing a large brand-mark and clean white cards against a subtle Slate-50 background to minimize distraction.