# AsteroNote v2.0 - Keyboard Shortcut Fix & List Plugin Refactor

## Summary of Changes

This document describes two important updates to AsteroNote v2.0:
1. **Fixed Ctrl+K keyboard shortcut** - Now properly prevents browser default behavior
2. **Refactored List plugin** - Split into separate OrderedList and UnorderedList plugins

---

## 1. Keyboard Shortcut Fix (Ctrl+K)

### Problem
The Ctrl+K shortcut for inserting links was not working because:
- The browser's default Ctrl+K behavior was interfering (browser's search/address bar)
- The shortcut handler wasn't calling `event.stopPropagation()`
- Key normalization was case-sensitive ('k' vs 'K')

### Solution
Updated `src/v2/js/core/BasePlugin.js` in the `handleShortcut` method:

```javascript
// Before
shortcut += key;  // Case-sensitive, could be 'k' or 'K'
if (handler) {
  event.preventDefault();  // Only preventDefault
  handler.call(this, event);
  return true;
}

// After
shortcut += key.toUpperCase();  // Always uppercase for consistency
if (handler) {
  event.preventDefault();
  event.stopPropagation();  // Also stop propagation to prevent browser handling
  handler.call(this, event);
  return true;
}
```

### What Changed
1. **Key normalization**: Always convert `event.key` to uppercase
2. **Stop propagation**: Added `event.stopPropagation()` to prevent browser from handling the shortcut
3. **Consistency**: All shortcuts now use uppercase keys (Ctrl+K, Ctrl+B, etc.)

### Testing
```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic', 'link']
});

editor.init();

// Press Ctrl+K (or Cmd+K on Mac)
// Result: Link dialog opens, browser search/address bar does NOT open
```

---

## 2. List Plugin Refactoring

### Problem
The single `ListPlugin` handled both ordered (numbered) and unordered (bullet) lists in one plugin. This made it difficult to:
- Load only one type of list
- Customize behavior for each list type independently
- Track which plugin is responsible for which button

### Solution
Split `ListPlugin` into two separate plugins:
- **`OrderedListPlugin`** - Handles numbered lists (`<ol>`)
- **`UnorderedListPlugin`** - Handles bullet lists (`<ul>`)

### File Structure

**New Files Created:**
```
src/v2/js/plugins/
├── OrderedList.js      ✅ NEW - Numbered lists
├── UnorderedList.js    ✅ NEW - Bullet lists
└── List.js             ⚠️  DEPRECATED (will be removed)
```

### Plugin Mapping Updated

**Old Mapping:**
```javascript
const pluginMap = {
  'ul': ListPlugin,           // Both mapped to same plugin
  'ol': ListPlugin,           // Both mapped to same plugin
  'insertUnorderedList': ListPlugin,
  'insertOrderedList': ListPlugin
};
```

**New Mapping:**
```javascript
const pluginMap = {
  'ul': UnorderedListPlugin,           // Separate plugins
  'ol': OrderedListPlugin,             // Separate plugins
  'insertUnorderedList': UnorderedListPlugin,
  'insertOrderedList': OrderedListPlugin
};
```

---

## OrderedListPlugin Features

### Plugin Name
- `pluginName`: `'orderedList'`

### Toolbar Button
- **Action**: `insertOrderedList`
- **Icon**: `<i class="bi bi-list-ol"></i>` (Bootstrap Icons)
- **Tooltip**: "Numbered List"
- **Class**: `asteronote-btn-ol`

### Functionality
- Creates and manages `<ol>` (ordered list) elements
- Automatic numbering (1, 2, 3, etc.)
- Nested list support
- Tab/Shift+Tab for indent/outdent
- Backspace to exit list or outdent

### Events
- `plugin.orderedList.toggled` - When list is toggled on/off
- `plugin.orderedList.indented` - When list item is indented
- `plugin.orderedList.outdented` - When list item is outdented

---

## UnorderedListPlugin Features

### Plugin Name
- `pluginName`: `'unorderedList'`

### Toolbar Button
- **Action**: `insertUnorderedList`
- **Icon**: `<i class="bi bi-list-ul"></i>` (Bootstrap Icons)
- **Tooltip**: "Bullet List"
- **Class**: `asteronote-btn-ul`

### Functionality
- Creates and manages `<ul>` (unordered list) elements
- Bullet points (•)
- Nested list support
- Tab/Shift+Tab for indent/outdent
- Backspace to exit list or outdent

### Events
- `plugin.unorderedList.toggled` - When list is toggled on/off
- `plugin.unorderedList.indented` - When list item is indented
- `plugin.unorderedList.outdented` - When list item is outdented

---

## Usage Examples

### Both List Types (Default)

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['bold', 'italic', 'ul', 'ol', 'link']
});
```

**Loaded Plugins**: `bold`, `italic`, `unorderedList`, `orderedList`, `link`

### Bullet Lists Only

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['ul']
});
```

**Loaded Plugins**: `unorderedList` only

### Numbered Lists Only

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['ol']
});
```

**Loaded Plugins**: `orderedList` only

### Manual Plugin Loading

```javascript
import { OrderedListPlugin, UnorderedListPlugin } from 'asteronote';

const editor = new AsteroNote('#editor', {
  plugins: [OrderedListPlugin, UnorderedListPlugin],
  toolbar: ['ol', 'ul']
});
```

---

## Keyboard Shortcuts

### Both Plugins Support

| Key | Action |
|-----|--------|
| **Tab** | Indent list item (increase nesting) |
| **Shift+Tab** | Outdent list item (decrease nesting) |
| **Backspace** | Exit list (when item is empty) or outdent |
| **Enter** | Create new list item (browser default) |

### Indentation Example

```
1. First item
   1. Nested item (after Tab)
      1. Double nested (after Tab)
   2. Back to single nested (after Shift+Tab)
2. Second item
```

---

## Migration from Old ListPlugin

### If You Were Using Default Toolbar
**No changes needed!** The refactoring is backward compatible.

```javascript
// This still works
const editor = new AsteroNote('#editor');
```

### If You Were Importing ListPlugin Directly

**Before:**
```javascript
import { ListPlugin } from 'asteronote';

const editor = new AsteroNote('#editor', {
  plugins: [ListPlugin]
});
```

**After:**
```javascript
import { OrderedListPlugin, UnorderedListPlugin } from 'asteronote';

const editor = new AsteroNote('#editor', {
  plugins: [OrderedListPlugin, UnorderedListPlugin]
});
```

---

## Benefits of Refactoring

### 1. **Smaller Bundle Size**
Load only what you need:
```javascript
// Before: ListPlugin always loaded both OL and UL support (~8KB)
toolbar: ['ol']  // Still loads UL code

// After: Only load what you use
toolbar: ['ol']  // Only OrderedListPlugin (~4KB)
```

### 2. **Better Plugin Tracking**
```javascript
editor.init();
console.log(Array.from(editor.plugins.keys()));

// Before: ['bold', 'list']
// After:  ['bold', 'orderedList', 'unorderedList']
```

### 3. **Independent Customization**
You can now extend or override behavior for each list type separately:

```javascript
class MyOrderedListPlugin extends OrderedListPlugin {
  toggle() {
    // Custom behavior for numbered lists only
    super.toggle();
    console.log('Ordered list toggled');
  }
}
```

### 4. **Clearer Event Handling**
```javascript
// Before: Generic events
editor.on('plugin.list.ordered-list-toggled', handler);
editor.on('plugin.list.unordered-list-toggled', handler);

// After: Specific plugin events
editor.on('plugin.orderedList.toggled', handler);
editor.on('plugin.unorderedList.toggled', handler);
```

---

## Implementation Details

### Common Code Between Plugins

Both plugins share similar logic for:
- Finding current list item
- Checking if list item is empty
- Checking caret position
- Indent/outdent operations
- Tab/Backspace key handling

**Difference**: They only operate on their respective list types (OL vs UL).

### List Type Detection

**OrderedListPlugin:**
```javascript
getCurrentListItem() {
  // ... walks up DOM tree
  if (node.tagName === 'LI' &&
      node.parentElement &&
      node.parentElement.tagName === 'OL') {  // Only OL
    return node;
  }
}
```

**UnorderedListPlugin:**
```javascript
getCurrentListItem() {
  // ... walks up DOM tree
  if (node.tagName === 'LI' &&
      node.parentElement &&
      node.parentElement.tagName === 'UL') {  // Only UL
    return node;
  }
}
```

---

## Files Updated

### Source Files
1. ✅ `src/v2/js/core/BasePlugin.js` - Fixed keyboard shortcut handling
2. ✅ `src/v2/js/plugins/OrderedList.js` - NEW plugin
3. ✅ `src/v2/js/plugins/UnorderedList.js` - NEW plugin
4. ✅ `src/v2/js/asteronote.js` - Updated imports and plugin map
5. ✅ `src/v2/js/asteronote-full.js` - Updated imports and exports

### Build Outputs
All bundles rebuilt successfully:
- ✅ `dist/v2/asteronote-core.js` (UMD)
- ✅ `dist/v2/asteronote-core.esm.js` (ESM)
- ✅ `dist/v2/asteronote.js` (UMD)
- ✅ `dist/v2/asteronote.esm.js` (ESM)
- ✅ `dist/v2/asteronote-full.js` (UMD)
- ✅ `dist/v2/asteronote-full.esm.js` (ESM)

---

## Testing Checklist

### Keyboard Shortcut Testing
- [x] Ctrl+K opens link dialog (doesn't trigger browser search)
- [x] Ctrl+B applies bold formatting
- [x] Ctrl+I applies italic formatting
- [x] Ctrl+U applies underline formatting
- [x] Cmd+K works on Mac (instead of Ctrl+K)

### List Plugin Testing
- [x] `ul` in toolbar loads UnorderedListPlugin only
- [x] `ol` in toolbar loads OrderedListPlugin only
- [x] Both `ul` and `ol` load both plugins
- [x] Tab/Shift+Tab work for indenting/outdenting
- [x] Backspace exits list when item is empty
- [x] Plugin names show correctly in debug info

---

## Future Enhancements

### Planned Features
1. **Custom list styles** - Different bullet types, numbering formats
2. **List conversion** - Convert between OL and UL
3. **Multi-level list shortcuts** - Quick keyboard shortcuts for nested lists
4. **List formatting** - Start number, list style type
5. **Task lists** - Checkbox lists (separate plugin)

---

**Last Updated:** January 2025
**Version:** AsteroNote v2.0
**Status:** ✅ Implemented & Tested
