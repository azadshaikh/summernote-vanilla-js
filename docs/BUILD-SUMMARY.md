# AsteroNote v2.0 - Build Summary

## Available Builds

### ✅ Full Version (asteronote.js)
**Default toolbar includes ALL plugins:**
- History (Undo/Redo)
- FormatBlock (H1-H6, Paragraph, Blockquote, Code, Highlight, Small, Sub/Sup)
- Text Formatting (Bold, Italic, Underline, Strikethrough)
- Alignment (Left, Center, Right, Justify, Indent, Outdent)
- Lists (Ordered/Unordered)
- Media (Link, Video)
- Layout (HR, Table)
- Utility (Remove Format, Code View)

**File Size:** ~214 KB (UMD) / ~201 KB (ESM)

**Use for:** CMS, blogs, documentation, rich content editing

---

### ✅ Lite Version (asteronote-lite.js)
**Default toolbar includes ESSENTIAL plugins only:**
- Heading (H1-H6, Normal text)
- Text Formatting (Bold, Italic, Underline, Strikethrough)
- Lists (Ordered/Unordered)
- Media (Link)

**Note**: Undo/Redo via browser shortcuts (Ctrl+Z / Ctrl+Y)

**File Size:** ~147 KB (UMD) / ~138 KB (ESM) - **31% smaller!**

**Use for:** Comments, notes, simple forms, minimal formatting needs

---

## Key Changes

### ✅ No More Manual Toolbar Configuration
Both versions come with sensible defaults - **no toolbar config needed!**

```javascript
// Full version - rich toolbar by default
const editor = new AsteroNote('#editor');
editor.init();

// Lite version - minimal toolbar by default
const editor = new AsteroNoteLite('#editor');
editor.init();
```

### ✅ Auto-Plugin Loading
Plugins are automatically loaded based on toolbar configuration. No need to manually specify plugins array.

### ✅ Updated Examples
- **cdn-basic.html** → Uses **asteronote-lite.js** (perfect for simple use cases)
- **cdn-with-plugins.html** → Uses **asteronote.js** (full featured)

---

## Old vs New

### ❌ Old (v2.0 before this update)
```javascript
// Had to manually configure toolbar every time
const editor = new AsteroNote('#editor', {
  toolbar: [
    'undo', 'redo',
    'separator',
    'formatblock',
    'separator',
    'bold', 'italic', 'underline', 'strikethrough',
    'separator',
    'list',
    'separator',
    'link'
  ]
});
```

### ✅ New (v2.0 now)
```javascript
// Just initialize - default toolbar already configured!
const editor = new AsteroNoteLite('#editor');
editor.init();
```

---

## Custom Toolbar (Optional)

You can still customize the toolbar if needed:

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: ['undo', 'redo', 'bold', 'italic']
  // Only specified plugins will be loaded
});
```

---

## NPM Usage

```bash
npm install asteronote
```

```javascript
// Full version
import AsteroNote from 'asteronote';

// Lite version
import AsteroNoteLite from 'asteronote/lite';
```

---

## CDN Usage

```html
<!-- Full version -->
<script src="https://cdn.example.com/asteronote/v2/asteronote.js"></script>
<script>
  const editor = new AsteroNote('#editor');
  editor.init();
</script>

<!-- Lite version -->
<script src="https://cdn.example.com/asteronote/v2/asteronote-lite.js"></script>
<script>
  const editor = new AsteroNoteLite('#editor');
  editor.init();
</script>
```

---

## Build Files Generated

```
dist/v2/
  ├── asteronote.js           (214 KB - Full UMD)
  ├── asteronote.esm.js       (201 KB - Full ESM)
  ├── asteronote-lite.js      (172 KB - Lite UMD)
  └── asteronote-lite.esm.js  (162 KB - Lite ESM)
```

All files include source maps (.js.map) for debugging.
