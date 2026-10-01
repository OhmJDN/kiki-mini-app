---
name: Aura & Essence
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#50443f'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#82746e'
  outline-variant: '#d4c3bc'
  surface-tint: '#7a5646'
  primary: '#7a5646'
  on-primary: '#ffffff'
  primary-container: '#b78d7a'
  on-primary-container: '#44281a'
  inverse-primary: '#ebbda8'
  secondary: '#5f5e5c'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfdc'
  on-secondary-container: '#636260'
  tertiary: '#655d57'
  on-tertiary: '#ffffff'
  tertiary-container: '#9e948d'
  on-tertiary-container: '#342d28'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ebbda8'
  on-primary-fixed: '#2e1508'
  on-primary-fixed-variant: '#603f30'
  secondary-fixed: '#e5e2df'
  secondary-fixed-dim: '#c8c6c3'
  on-secondary-fixed: '#1c1c1a'
  on-secondary-fixed-variant: '#474745'
  tertiary-fixed: '#ece0d8'
  tertiary-fixed-dim: '#d0c4bd'
  on-tertiary-fixed: '#201a16'
  on-tertiary-fixed-variant: '#4d4540'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
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
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  stack-gap-sm: 8px
  stack-gap-md: 16px
  stack-gap-lg: 32px
  section-padding: 48px
---

## Brand & Style

The design system is centered on **Modern Elegance**, blending a high-fashion editorial aesthetic with the accessibility required for a mobile-first booking experience. The target audience seeks a premium, self-care sanctuary; thus, the UI must evoke feelings of serenity, luxury, and professional expertise.

The visual style utilizes a **Refined Minimalist** approach with subtle **Glassmorphism** to maintain a sense of airiness. High-quality lifestyle imagery is the primary visual driver, framed by generous whitespace and precise, thin-stroke iconography. The interface avoids heavy shadows or industrial blocks, opting instead for tonal layering and soft transitions to create a "digital spa" environment.

## Colors

The palette is anchored in sophisticated neutrals and metallic warmth:
- **Primary (Rose Gold/Dusty Rose):** Used for primary calls-to-action, active states, and highlighting key services. It should feel warm, not neon.
- **Secondary (Alabaster):** The main background color, providing a softer, more premium feel than pure white.
- **Tertiary (Warm Stone):** Used for secondary containers, dividers, and subtle backgrounds to create depth without harsh lines.
- **Neutral (Charcoal):** Reserved exclusively for typography and iconography to ensure high legibility and a grounded, professional contrast.

## Typography

This design system employs a classic "Serif for Titles, Sans for Utility" pairing. 
- **Playfair Display** provides the editorial authority and luxury feel. It should be used for section headers, service names, and promotional banners.
- **Plus Jakarta Sans** offers a clean, modern, and highly readable counterpoint for service descriptions, pricing, and functional labels. 

Text should maintain generous line heights to prevent the UI from feeling cramped. Label styles utilize slight tracking (letter-spacing) and uppercase treatments to differentiate functional metadata from narrative content.

## Layout & Spacing

Designed for the constraints of a Line mini app, the layout follows a **Fluid Mobile-First** model. 
- **Margins:** A standard 20px horizontal margin ensures content does not crowd the screen edges.
- **Vertical Rhythm:** Sections are separated by large 48px gaps to emphasize the "premium" use of space. 
- **Grid:** Use a simple 2-column flex grid for service cards and a single-column stack for the booking flow. 
- **Safe Areas:** Adhere to Line's header and navigation bar constraints, ensuring the primary booking button is always pinned or easily accessible within the thumb zone.

## Elevation & Depth

To maintain a lightweight feel, the design system avoids heavy drop shadows. Depth is achieved through:
- **Tonal Layering:** Using the Tertiary color (`#E5D9D1`) to lift cards off the Secondary background (`#F9F6F3`).
- **Soft Diffusion:** Where necessary, use extremely subtle, low-opacity (5%) shadows with a large blur radius (20px+) to suggest a gentle lift.
- **Glassmorphism:** Navigation bars and sticky headers should use a background-blur (15px) with a semi-transparent Alabaster fill (80% opacity) to create a sense of continuity as the user scrolls through imagery.

## Shapes

The shape language is "Softly Geometric." Elements use a **Rounded** (0.5rem) base to feel approachable and modern, but never "bubbly." 
- **Buttons:** Use `rounded-lg` (1rem) for a more organic, premium feel. 
- **Images:** All hero and service photos must have a consistent `rounded-lg` corner radius to soften the high-fashion photography. 
- **Input Fields:** Maintain a crisp `rounded-md` (0.5rem) to ensure they feel functional and precise.

## Components

- **Buttons:** Primary buttons use a solid Rose Gold fill with Charcoal or White text. Secondary buttons are outlined in a thin 1px Charcoal stroke.
- **Booking Cards:** Service cards should feature a 1:1 aspect ratio image, followed by a Playfair Display title and a Jakarta Sans price label.
- **Time Slots:** Use chips with a Tertiary background and a 1px Primary border when selected.
- **Inputs:** Floating labels with a thin bottom border only, creating a sleek, minimal form appearance.
- **Progress Stepper:** A very thin, elegant line at the top of the booking flow using Primary color to indicate steps (Select Service > Select Time > Details).
- **Sticky Footer:** A fixed "Book Now" bar at the bottom of service pages using a backdrop-blur and a prominent Primary button.