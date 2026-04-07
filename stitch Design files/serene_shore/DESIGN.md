# Design System Strategy: The Supportive Partner

## 1. Overview & Creative North Star
**Creative North Star: "The Serene Navigator"**

This design system is built to transform the often-overwhelming experience of labor planning into a shared journey of calm and confidence. We are moving away from the "medical utility" or "infantile" aesthetics common in the industry. Instead, we are adopting a high-end editorial approach that feels like a premium wellness publication—sophisticated yet deeply nurturing.

The "Serene Navigator" uses intentional asymmetry, generous negative space, and tonal layering to guide the eye. We break the rigid, boxed-in nature of standard mobile apps by allowing elements to breathe and overlap, creating a sense of organic flow rather than a clinical checklist.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in the earth and the sea, designed to lower the heart rate.

### The "No-Line" Rule
**Borders are forbidden for sectioning.** To create a high-end feel, structure must be defined by shifts in color, not lines. 
- Use `surface_container_low` for large background sections.
- Place `surface` or `surface_container_lowest` elements on top to create a "lifted" feel.
- Visual boundaries are achieved through the contrast between `#fdf9f1` (Low) and `#ffffff` (Lowest).

### Surface Hierarchy & Nesting
Think of the UI as layers of fine, heavy-weight paper. 
- **Base Level:** `background` (#fffbff)
- **Content Sections:** `surface_container` (#f7f3eb)
- **Interactive Cards:** `surface_container_lowest` (#ffffff)
This nesting creates a soft, tactile depth that feels premium and intentional.

### The Glass & Gradient Rule
To add "soul" to the digital interface:
- **CTAs & Heroes:** Use a subtle linear gradient from `primary` (#2d6e6e) to `primary_dim` (#1d6262) at a 135-degree angle. This adds a gemstone-like depth.
- **Floating Navigation:** Use Glassmorphism. Apply `surface_bright` at 80% opacity with a `20px` backdrop blur. This ensures the app feels light and airy, never heavy.

---

## 3. Typography: Editorial Authority
We use a dual-sans-serif pairing to balance modern reliability with approachable warmth.

*   **Display & Headlines (Manrope):** This font provides a structural, confident foundation. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for milestone moments to create an editorial "hero" feel.
*   **Body & Titles (Work Sans):** Chosen for its exceptional legibility and friendly apertures. It keeps the "partnership" aspect feeling conversational and clear.

**The Hierarchy of Calm:**
- Use `headline-sm` for section headers to provide clear signposting without shouting.
- Use `body-lg` for primary instructions to ensure accessibility during high-stress moments.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "digital." We use environmental light.

*   **The Layering Principle:** Instead of a shadow, place a `surface_container_highest` element behind a `primary_container` element to create a natural "step" in depth.
*   **Ambient Shadows:** For floating action buttons or critical modals, use a shadow with a 32px blur, 8px Y-offset, and 6% opacity of the `on_surface` color (#393831). It should look like a soft glow, not a dark edge.
*   **The Ghost Border Fallback:** If a divider is essential for accessibility in a list, use `outline_variant` (#bcb9b0) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Primitive Styling

### Buttons (The "Soft-Touch" CTA)
- **Primary:** Gradient fill (`primary` to `primary_dim`), `xl` (1.5rem) corner radius. No border. Text is `on_primary`.
- **Secondary:** `surface_container_high` fill with `primary` text. This feels more "nurturing" than a harsh outlined button.
- **Tertiary:** Text-only using `primary` with `label-md` styling, reserved for low-emphasis actions.

### Cards & Lists (Asymmetric Containers)
- **The Rule:** Cards must never have a border. Use `surface_container_low` for the card body.
- **Spacing over Dividers:** Separate list items with `1.5rem` of vertical whitespace. If the content is dense, use a subtle background shift (alternating `surface` and `surface_container_low`).

### Input Fields
- Use `surface_container_highest` for the input track. 
- Use `xl` rounded corners to maintain the "approachable" feel.
- The label should use `label-md` and sit 8px above the field, never inside it, to reduce visual clutter.

### Signature Component: The Partnership Progress Ring
- A dual-layered circular progress indicator using `primary` and `secondary`. One ring represents the birthing parent, the other the partner, visually reinforcing the "labor planning partner" concept.

---

## 6. Do’s and Don’ts

### Do
- **Do** use `xl` (1.5rem) and `full` (9999px) corner radii for almost everything. Roundness equates to safety.
- **Do** lean heavily on `surface_container` tiers to create hierarchy.
- **Do** use `tertiary` (#3f6982) for "Educational" or "Insight" components to distinguish them from "Action" items.
- **Do** ensure `on_background` text has at least a 4.5:1 contrast ratio against all surface levels.

### Don’t
- **Don’t** use a 1px solid border. Ever.
- **Don’t** use "Baby Blue" or "Soft Pink." Stick to the sophisticated Teals (`primary`) and Creams (`surface_container`) to honor the adult partnership.
- **Don’t** crowd the screen. If a screen feels busy, increase the whitespace by 20%.
- **Don’t** use pure black (#000000) for text. Always use `on_surface` (#393831) for a softer, more natural reading experience.