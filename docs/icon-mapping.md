# Icon Mapping (v1 → v2 Bootstrap Icons)

This document lists the mappings from legacy icons (e.g., Font Awesome) to Bootstrap Icons used in Summernote v2.

- Bold: `fa-bold` → `<i class="bi bi-type-bold"></i>`
- Italic: `fa-italic` → `<i class="bi bi-type-italic"></i>`
- Underline: `fa-underline` → `<i class="bi bi-type-underline"></i>`
- Unordered List: `fa-list-ul` → `<i class="bi bi-list-ul"></i>`
- Ordered List: `fa-list-ol` → `<i class="bi bi-list-ol"></i>`
- Link: `fa-link` → `<i class="bi bi-link-45deg"></i>`

Notes:
- All icons in v2 use Bootstrap Icons. Include via CDN:
  `<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">`
- Button rendering expects raw `<i class="bi ..."></i>` HTML passed to plugin button configs.

