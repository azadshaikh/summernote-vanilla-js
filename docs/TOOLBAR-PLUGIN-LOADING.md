# Toolbar-Based Plugin Loading

## Overview

AsteroNote v2.0 now automatically loads plugins based on the toolbar configuration. Only plugins that have buttons in the toolbar will be loaded and initialized.

---

## How It Works

### Automatic Plugin Loading

When you create an `AsteroNote` instance, plugins are automatically loaded based on your `toolbar` configuration:

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic', 'link']  // Only these 3 plugins will load
});
```

**Result:** Only `BoldPlugin`, `ItalicPlugin`, and `LinkPlugin` will be loaded and initialized.

---

## Toolbar Actions to Plugin Mapping

| Toolbar Action | Plugin Loaded |
|----------------|---------------|
| `bold`, `italic`, `underline`, `strikethrough` | Text formatting plugins |
| `removeFormat` | Clear formatting plugin |
| `ul`, `ol` | List plugins (UnorderedList, OrderedList) |
| `link` | `LinkPlugin` |
| `createLink` | `LinkPlugin` |
| `insertUnorderedList` | `ListPlugin` |
| `insertOrderedList` | `ListPlugin` |

**Note:** Some actions share the same plugin. For example, `ul` and `ol` both load `ListPlugin` (but only once).

---

## Examples

### Minimal Editor (Text Formatting Only)

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic', 'underline']
});
```

**Loaded Plugins:** `bold`, `italic`, `underline`

### Lists Only Editor

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['ul', 'ol']
});
```

**Loaded Plugins:** `list` (loads once for both ul and ol)

### Custom Order

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: [
    'link',           // Link first
    'bold',           // Then bold
    'ul', 'ol',       // Then lists
    'removeformat'    // Remove format last
  ]
});
```

**Button Order:** Matches toolbar array order exactly
**Loaded Plugins:** `link`, `bold`, `unorderedList`, `orderedList`, `removeformat`

---

## Explicit Plugin Control

### Override with Manual Plugin Array

If you want full control, you can still explicitly provide a `plugins` array:

```javascript
import { BoldPlugin, ItalicPlugin } from 'asteronote';

const editor = new AsteroNote('#editor', {
  plugins: [BoldPlugin, ItalicPlugin],  // Explicit control
  toolbar: ['bold', 'italic', 'underline']  // Toolbar config ignored for plugin loading
});
```

**When `plugins` array is provided:** Toolbar config is only used for button placement, not plugin loading.

---

## Debug Info

To see which plugins are loaded, check the editor instance:

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic', 'link']
});

editor.init();

// Check loaded plugins
console.log('Loaded plugins:', Array.from(editor.plugins.keys()));
// Output: ['bold', 'italic', 'link']
```

---

## Benefits

### 1. **Smaller Bundle Size**
Only load the plugins you actually use:

```javascript
// Before (all plugins loaded)
const editor = new AsteroNote('#editor');  // ~50KB of plugins

// After (selective loading)
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic']  // ~10KB of plugins
});
```

### 2. **Better Performance**
- Fewer plugins = faster initialization
- Fewer event listeners
- Less memory usage

### 3. **Cleaner Configuration**
- Define toolbar order and loaded plugins in one place
- No need to manage plugin imports separately

### 4. **Automatic Dependencies**
- Plugins are deduplicated automatically
- `ul` and `ol` both map to `ListPlugin` but it's only loaded once

---

## Migration from Fixed Plugin Loading

### Old Behavior (Pre-Fix)

```javascript
// All plugins always loaded regardless of toolbar
const editor = new AsteroNote('#editor', {
  toolbar: ['bold']  // But italic, underline, etc. still loaded!
});
```

**Problem:** All 7 default plugins loaded even if not in toolbar.

### New Behavior (Current)

```javascript
// Only plugins in toolbar are loaded
const editor = new AsteroNote('#editor', {
  toolbar: ['bold']  // Only BoldPlugin loads
});
```

**Fixed:** Only the plugins you specify in toolbar are loaded.

---

## Default Toolbar

If no toolbar is specified, all Phase 1 plugins are loaded:

```javascript
const editor = new AsteroNote('#editor');

// Equivalent to:
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

## Backward Compatibility

### Legacy Toolbar Format Still Supported

```javascript
// Old grouped format (still works)
toolbar: [
  ['style', ['bold', 'italic', 'underline']],
  ['para', ['ul', 'ol']],
  ['insert', ['link']]
]

// Flattens to: ['bold', 'italic', 'underline', 'ul', 'ol', 'link']
```

The system automatically flattens nested arrays to extract plugin names.

---

## Browser Native Shortcuts

**Important Note:** Even if a plugin is not loaded, browser native shortcuts may still work on contenteditable elements:

- `Ctrl+B` → Browser's native bold (via `execCommand`)
- `Ctrl+I` → Browser's native italic
- `Ctrl+U` → Browser's native underline

This is expected behavior. If you want to completely disable these:

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: [],  // No plugins loaded
  shortcuts: false  // Disable shortcut handling
});

// Prevent all contenteditable shortcuts
editor.editable.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
```

---

## Implementation Details

### Plugin Registry

Internally, the `AsteroNoteEditor` class:

1. Reads the `toolbar` configuration
2. Flattens nested arrays
3. Maps toolbar actions to plugin classes
4. Deduplicates plugin classes (Set)
5. Passes unique plugins to Editor constructor

```javascript
// Simplified implementation
class AsteroNoteEditor extends Editor {
  constructor(target, options = {}) {
    const pluginMap = {
      'bold': BoldPlugin,
      'italic': ItalicPlugin,
      // ... etc
    };

    const toolbar = options.toolbar || defaultToolbar;
    const actions = flattenToolbar(toolbar);
    const pluginClasses = actions.map(action => pluginMap[action]).filter(Boolean);
    const uniquePlugins = [...new Set(pluginClasses)];

    super(target, { ...options, plugins: uniquePlugins });
  }
}
```

---

## Testing

To verify which plugins are loaded, use the debug example:

```html
<!-- See docs/examples/cdn-with-plugins.html -->
<div id="plugin-info"></div>

<script>
  const editor = new AsteroNote('#editor', {
    toolbar: ['bold', 'italic']
  });

  editor.init();

  const loadedPlugins = Array.from(editor.plugins.keys());
  document.getElementById('plugin-info').textContent =
    `Loaded: ${loadedPlugins.join(', ')}`;
</script>
```

---

## Future Enhancements

Planned improvements:

1. **Plugin Lazy Loading** - Load plugins on-demand when first used
2. **Plugin Dependencies** - Auto-load dependent plugins
3. **Plugin Categories** - Group related plugins (e.g., 'formatting', 'insert')
4. **Bundle Optimization** - Tree-shake unused plugins in build
5. **Plugin Marketplace** - Community plugins with automatic loading

---

**Last Updated:** January 2025
**Version:** AsteroNote v2.0
**Status:** ✅ Implemented & Tested
