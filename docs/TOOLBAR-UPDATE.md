# AsteroNote v2.0 - Toolbar & API Updates

## Overview
This document describes the recent updates to the AsteroNote v2.0 toolbar system and API naming.

---

## API Changes

### Primary API Name: `AsteroNote`

**Old (deprecated):**
```javascript
const editor = new Editor('#editor', options);
```

**New (recommended):**
```javascript
const editor = new AsteroNote('#editor', options);
```

### Backward Compatibility
For UMD builds (CDN usage), the following aliases are still available on `window`:
- `window.AsteroNote` ✅ **Primary global**
- `window.AsteroNoteEditor` ✅ **Alternative**
- `window.Asteronote` ⚠️ **Deprecated** (lowercase 'n')
- `window.Editor` ⚠️ **Deprecated**
- `window.Summernote` ⚠️ **Deprecated** (v1 compatibility)

**Note:** Deprecated aliases will be removed in v3.0.

---

## Toolbar Architecture Changes

### Individual Buttons (No Button Groups)

**What Changed:**
- ❌ **Removed:** Bootstrap `.btn-group` containers for toolbar grouping
- ✅ **Added:** Individual buttons rendered directly on toolbar
- ✅ **Added:** Individual button spacing (`me-1 mb-1` classes)
- ✅ **Added:** Flexbox layout for toolbar (`d-flex flex-wrap`)

**Why:**
- Cleaner, more flexible toolbar layout
- Easier to customize individual button positions
- Better responsive behavior on small screens
- Simplified toolbar configuration

---

## Toolbar Configuration

### New Flat Array Format

**Old Format (still supported for backward compatibility):**
```javascript
toolbar: [
  ['style', ['bold', 'italic', 'underline']],
  ['para', ['ul', 'ol']],
  ['insert', ['link']]
]
```

**New Format (recommended):**
```javascript
toolbar: [
  'bold', 'italic', 'underline', 'strikethrough',
  'removeformat',
  'ul', 'ol',
  'link'
]
```

### Default Toolbar

The new default toolbar configuration includes all Phase 1 plugins:
```javascript
toolbar: [
  'bold',           // Bold formatting
  'italic',         // Italic formatting
  'underline',      // Underline formatting
  'strikethrough',  // Strikethrough formatting
  'removeformat',   // Remove all formatting
  'ul',             // Unordered list
  'ol',             // Ordered list
  'link'            // Insert/edit link
]
```

### Custom Toolbar Examples

**Minimal toolbar (text formatting only):**
```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic', 'underline']
});
```

**Lists and links only:**
```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['ul', 'ol', 'link']
});
```

**Full toolbar (all plugins):**
```javascript
const editor = new AsteroNote('#editor', {
  toolbar: [
    'bold', 'italic', 'underline', 'strikethrough',
    'removeFormat',
    'ul', 'ol',
    'link'
  ]
});
```

---

## Technical Implementation

### CSS Classes

**Toolbar container:**
```html
<div class="asteronote-toolbar d-flex flex-wrap" role="toolbar">
  <!-- Individual buttons -->
</div>
```

**Individual buttons:**
```html
<button class="btn btn-outline-secondary me-1 mb-1 asteronote-btn asteronote-btn-bold">
  <i class="bi bi-type-bold"></i>
</button>
```

### Button Spacing
- `me-1` - Right margin (0.25rem / 4px)
- `mb-1` - Bottom margin (0.25rem / 4px)
- Provides consistent spacing between all toolbar buttons
- Works well with flexbox wrapping on small screens

---

## Code Changes Summary

### Modified Files

1. **`src/v2/js/core/Editor.js`**
   - Updated default toolbar configuration to flat array format
   - Changed `buildToolbarGroups()` to support flat array format
   - Removed `.btn-group` containers
   - Changed toolbar container class from `btn-toolbar` to `d-flex flex-wrap`
   - Updated comments and documentation

2. **`src/v2/js/core/BasePlugin.js`**
   - Updated `createButtonElement()` to add spacing classes
   - Changed button classes from `btn btn-outline-secondary` to `btn btn-outline-secondary me-1 mb-1`

3. **`docs/examples/cdn-basic.html`**
   - Changed `new Editor()` to `new AsteroNote()`

4. **`docs/examples/cdn-events.html`**
   - Changed `new Editor()` to `new AsteroNote()`
   - Fixed event names to use lowercase `asteronote.*` prefix

5. **`docs/examples/cdn-with-plugins.html`**
   - Changed `new Editor()` to `new AsteroNote()`
   - Updated to demonstrate flat toolbar configuration
   - Updated example content to explain new layout

---

## Migration Guide

### For Existing Code

**Minimal changes required:**

1. Update initialization:
   ```javascript
   // Old
   const editor = new Editor('#editor', options);

   // New
   const editor = new AsteroNote('#editor', options);
   ```

2. (Optional) Update toolbar configuration:
   ```javascript
   // Old format still works
   toolbar: [
     ['style', ['bold', 'italic']],
     ['para', ['ul', 'ol']]
   ]

   // New format (recommended)
   toolbar: ['bold', 'italic', 'ul', 'ol']
   ```

### For New Projects

Use the new `AsteroNote` class name and flat toolbar configuration:

```javascript
const editor = new AsteroNote('#editor', {
  height: 400,
  placeholder: 'Start typing...',
  toolbar: [
    'bold', 'italic', 'underline', 'strikethrough',
    'removeformat',
    'ul', 'ol',
    'link'
  ],
  callbacks: {
    onInit: () => console.log('Editor ready!'),
    onChange: (content) => console.log('Content changed')
  }
});

editor.init();
```

---

## Visual Differences

### Before (Button Groups)
```
[Bold Italic Underline]  [UL OL]  [Link]
```
- Buttons visually grouped with borders
- Groups separated by larger margins

### After (Individual Buttons)
```
[Bold] [Italic] [Underline] [Strikethrough] [Remove] [UL] [OL] [Link]
```
- All buttons have equal spacing
- Cleaner, more uniform appearance
- Better wrapping behavior on small screens

---

## Browser Compatibility

No changes to browser compatibility. The updates use standard:
- Flexbox (`d-flex`, `flex-wrap`)
- Bootstrap 5.3 utility classes
- Standard JavaScript

---

## Next Steps

### Future Enhancements (Planned)
- Toolbar sections/dividers (visual separators without button groups)
- Configurable button size variants (small, medium, large)
- Toolbar position options (top, bottom, floating)
- Custom button icons and tooltips
- Toolbar visibility toggle

---

## Questions & Support

For questions or issues related to these changes:
1. Check the updated examples in `docs/examples/`
2. Review the API documentation in `docs/api-v2.md`
3. Open an issue on GitHub

---

**Last Updated:** January 2025
**Version:** AsteroNote v2.0
**Status:** ✅ Implemented & Tested
