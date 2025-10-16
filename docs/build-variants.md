# AsteroNote v2.0 - Build Variants

AsteroNote v2.0 provides two build variants to suit different use cases:

## 1. Full Version (asteronote.js)

**Best for:** Rich text editors, blog posts, content management systems, documentation

### Included Plugins:
- **History**: Undo, Redo
- **FormatBlock**: Headings (H1-H6), Paragraph, Blockquote, Code, Highlight, Small, Subscript, Superscript
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Lists**: Ordered and unordered lists
- **Alignment**: Left, Center, Right, Justify, Indent, Outdent
- **Media**: Link, Video
- **Layout**: Horizontal Rule, Table
- **Utility**: Remove Format, Code View

### Default Toolbar:
```javascript
[
  'undo', 'redo',
  'separator',
  'formatblock', 'list', 'table',
  'separator',
  'bold', 'italic', 'underline', 'strikethrough', 'align',
  'separator',
  'hr', 'link', 'video',
  'separator',
  'removeFormat',
  'codeview'
]
```

### Usage:
```html
<!-- CDN -->
<script src="path/to/asteronote.js"></script>
<script>
  const editor = new AsteroNote('#editor', {
    height: 600
    // Uses default full toolbar automatically
  });
  editor.init();
</script>
```

```javascript
// ES Module
import AsteroNote from 'asteronote';
// or
import AsteroNote from 'asteronote/dist/v2/asteronote.esm.js';
```

### File Sizes:
- **UMD**: ~214 KB (unminified)
- **ESM**: ~201 KB (unminified)

---

## 2. Lite Version (asteronote-lite.js)

**Best for:** Comment forms, notes, simple text input, minimal formatting needs

### Included Plugins:
- **Heading**: H1-H6, Normal text (Paragraph)
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Lists**: Ordered and unordered lists
- **Media**: Link

**Note**: Undo/Redo available via browser native shortcuts (Ctrl+Z / Ctrl+Y)

### Default Toolbar:
```javascript
[
  'heading', 'list',
  'separator',
  'bold', 'italic', 'underline', 'strikethrough',
  'separator',
  'link'
]
```

### Usage:
```html
<!-- CDN -->
<script src="path/to/asteronote-lite.js"></script>
<script>
  const editor = new AsteroNoteLite('#editor', {
    height: 300,
    toolbarAlign: 'left' // Default for lite version. Options: 'left', 'center', 'right'
  });
  editor.init();
</script>
```

```javascript
// ES Module
import AsteroNoteLite from 'asteronote/lite';
// or
import AsteroNoteLite from 'asteronote/dist/v2/asteronote-lite.esm.js';
```

### File Sizes:
- **UMD**: ~114 KB (unminified) - **~47% smaller than full version**
- **ESM**: ~107 KB (unminified)

---

## Comparison Table

| Feature | Full Version | Lite Version |
|---------|--------------|--------------|
| History (Undo/Redo) | ✅ | ✅ |
| FormatBlock (Headings, etc.) | ✅ | ✅ |
| Text Formatting | ✅ | ✅ |
| Lists | ✅ | ✅ |
| Link | ✅ | ✅ |
| Horizontal Rule | ✅ | ✅ |
| Alignment | ✅ | ❌ |
| Table | ✅ | ❌ |
| Video | ✅ | ❌ |
| Remove Format | ✅ | ❌ |
| Code View | ✅ | ❌ |
| Image Resize Tool | ✅ | ❌ |
| **File Size (UMD)** | ~215 KB | ~147 KB (31% smaller) |

---

## Custom Toolbar

Both versions support custom toolbar configuration:

```javascript
const editor = new AsteroNote('#editor', {
  toolbar: [
    'undo', 'redo',
    'separator',
    'bold', 'italic'
    // Only plugins in toolbar will be loaded
  ]
});
```

**Note:** Only plugins included in the build variant can be used. Lite version cannot use alignment, table, video, removeFormat, or codeview plugins.

---

## NPM Package Exports

```json
{
  "name": "asteronote",
  "exports": {
    ".": {
      "require": "./dist/v2/asteronote.js",
      "import": "./dist/v2/asteronote.esm.js"
    },
    "./lite": {
      "require": "./dist/v2/asteronote-lite.js",
      "import": "./dist/v2/asteronote-lite.esm.js"
    }
  }
}
```

---

## Which Version Should I Use?

### Choose **Full Version** if:
- Building a CMS, blog, or documentation platform
- Need advanced formatting (tables, alignment, video embeds)
- Users need to switch between visual and code view
- File size is not a critical concern

### Choose **Lite Version** if:
- Building comment sections, forum posts, or note-taking apps
- Need minimal formatting with small bundle size
- Users only need basic text formatting and links
- Optimizing for performance and loading speed

---

## Examples

- **Full Version**: See `docs/examples/cdn-with-plugins.html`
- **Lite Version**: See `docs/examples/cdn-basic.html`
