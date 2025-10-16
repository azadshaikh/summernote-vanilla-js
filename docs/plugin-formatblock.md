# FormatBlock Plugin

The **FormatBlock** plugin is a comprehensive text formatting plugin that combines multiple formatting actions into a single dropdown interface.

## Overview

FormatBlock provides a unified interface for changing content types and applying various text formats:

- **Headings**: H1 through H6
- **Paragraph**: Normal text
- **Blockquote**: Quote formatting
- **Code**: Inline code formatting
- **Highlight**: Highlight text with mark tag
- **Small**: Smaller text size
- **Subscript**: Subscript text (X₂)
- **Superscript**: Superscript text (X²)

## Usage

### Basic Usage (CDN)

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://asteroui-temp.pages.dev/styles/asteroui.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />
  <link href="path/to/asteronote.css" rel="stylesheet" />
</head>
<body>
  <div id="editor"></div>

  <script src="path/to/asteronote.js"></script>
  <script>
    const editor = new AsteroNote('#editor', {
      toolbar: [
        'formatblock', // Adds the FormatBlock dropdown
        'separator',
        'bold', 'italic', 'underline'
      ]
    });
    editor.init();
  </script>
</body>
</html>
```

### NPM Usage

```javascript
import AsteroNote from 'asteronote';
import FormatBlockPlugin from 'asteronote/plugins/FormatBlock';

const editor = new AsteroNote('#editor', {
  plugins: [FormatBlockPlugin]
});

editor.init();
```

## Keyboard Shortcuts

The FormatBlock plugin provides the following keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+1` through `Ctrl+Alt+6` | Apply heading level 1-6 |
| `Ctrl+Alt+0` | Convert to paragraph |
| `Ctrl+H` | Toggle highlight |
| `Ctrl+=` | Toggle subscript |
| `Ctrl+Shift+=` | Toggle superscript |

## Toolbar Icon

The FormatBlock dropdown button displays different icons based on the current format:

- Default: `ri-text` (T icon)
- H1-H6: `ri-h-1` through `ri-h-6`
- Blockquote: `ri-double-quotes-l`
- Code: `ri-code-line`
- Highlight: `ri-mark-pen-line`
- Small: `ri-font-size-2`
- Subscript: `ri-subscript-2`
- Superscript: `ri-superscript-2`

## Events

The plugin emits the following events:

- `heading-changed` - When heading level changes
  ```javascript
  editor.on('plugin.formatblock.heading-changed', (data) => {
    console.log('Heading level:', data.level); // 0 for paragraph, 1-6 for headings
  });
  ```

- `paragraph-changed` - When converted to paragraph
- `blockquote-toggled` - When blockquote is toggled
- `code-toggled` - When inline code is toggled
- `highlight-toggled` - When highlight is toggled
- `small-toggled` - When small text is toggled
- `subscript-toggled` - When subscript is toggled
- `superscript-toggled` - When superscript is toggled

## Architecture

The FormatBlock plugin is organized into separate modules:

```
FormatBlock/
├── index.js          # Main plugin entry
├── toolbar.js        # Toolbar UI rendering
├── keybindings.js    # Keyboard shortcuts
├── heading.js        # Heading actions (H1-H6)
├── paragraph.js      # Paragraph action
├── blockquote.js     # Blockquote action
├── code.js           # Inline code action
├── highlight.js      # Highlight (mark) action
├── small.js          # Small text action
└── subsup.js         # Subscript/superscript actions
```

Each action module is independent and can be used separately if needed.

## Browser Support

The FormatBlock plugin uses standard `document.execCommand` for most operations and falls back to manual DOM manipulation when necessary. It supports all modern browsers:

- Chrome/Edge 60+
- Firefox 60+
- Safari 12+

## Notes

- **Replaces**: This plugin replaces the previous separate `HeadingPlugin`, `BlockquotePlugin`, `CodePlugin`, and `HighlightPlugin` with a unified interface
- **Icon Library**: Uses Remix Icons (<https://remixicon.com/>)
- **Bootstrap**: Requires Bootstrap 5.3+ for dropdown functionality
