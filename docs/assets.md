# Asset Conventions

## Processed assets

Store portfolio images that should be optimized by Astro under:

`src/assets/`

Examples:

- project screenshots
- profile/portrait images
- case-study diagrams
- decorative scene images

Prefer Astro's `Image` or `Picture` components for these assets.

## Public assets

Store files in `public/` only when they need a stable public URL or should not be transformed.

Examples:

- résumé PDF
- favicon files
- robots-related files
- static downloadable files

## Images

- Always provide meaningful `alt` text for informative images.
- Use `alt=""` for truly decorative images.
- Preserve intrinsic dimensions to reduce layout shift.
- Prefer responsive image generation for large screenshots.
- Lazy-load below-the-fold images.
- Do not lazy-load an image later identified as the page's LCP image.
- Keep application screenshots visually authentic.
- Do not tint screenshots to match the portfolio palette.

## Performance

Target screenshot variants around 100–200 KB where practical.

Do not commit oversized source assets when an optimized working source is sufficient.
