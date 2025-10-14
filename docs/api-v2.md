# Summernote v2.0 API Documentation

Complete API reference for Summernote v2.0 WYSIWYG editor.

## Installation

### NPM
```bash
npm install summernote@2.0.0
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/summernote@2.0.0/dist/v2/summernote.js"></script>
```

## Quick Start

```javascript
import Editor from 'summernote';

const editor = new Editor('#editor', {
  height: 300,
  placeholder: 'Start typing...'
});
editor.init();
```

## Editor API

### Constructor
```javascript
new Editor(target, options)
```
- `target`: CSS selector (string) or DOM element
- `options`: Configuration object (see below)

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| height | number | 300 | Editor height in pixels |
| minHeight | number | null | Minimum height |
| maxHeight | number | null | Maximum height |
| focus | boolean | false | Auto-focus on init |
| placeholder | string | '' | Placeholder text |
| plugins | Array | [] | Plugin classes to load |
| shortcuts | boolean | true | Enable keyboard shortcuts |
| callbacks | Object | {} | Event callbacks |

### Methods

#### init()
Initialize the editor.
```javascript
editor.init(); // Returns: Editor (chainable)
```

#### destroy()
Destroy editor and cleanup.
```javascript
editor.destroy();
```

#### getContent()
Get current HTML content.
```javascript
const html = editor.getContent(); // Returns: string
```

#### setContent(content)
Set editor content.
```javascript
editor.setContent('<p>Hello</p>');
```

#### focus() / blur()
Focus or blur the editor.
```javascript
editor.focus();
editor.blur();
```

#### hasFocus()
Check focus state.
```javascript
const focused = editor.hasFocus(); // Returns: boolean
```

#### registerPlugin(PluginClass)
Register plugin after initialization.
```javascript
editor.registerPlugin(MyPlugin); // Returns: Editor (chainable)
```

#### getPlugin(name)
Get plugin instance.
```javascript
const bold = editor.getPlugin('bold'); // Returns: Plugin | null
```

#### hasPlugin(name)
Check if plugin exists.
```javascript
if (editor.hasPlugin('bold')) { /* ... */ }
```

### Events

Subscribe to events using EventEmitter methods:

```javascript
editor.on('summernote.change', (content) => {
  console.log('Content:', content);
});

editor.once('summernote.init', () => {
  console.log('Initialized once');
});

editor.off('summernote.change', handler);
```

#### Core Events

| Event | Data | Description |
|-------|------|-------------|
| summernote.init | none | Editor initialized |
| summernote.change | content | Content changed |
| summernote.focus | none | Editor focused |
| summernote.blur | none | Editor blurred |
| summernote.keydown | event | Key pressed |
| summernote.paste | event | Content pasted |
| summernote.destroy | none | Editor destroyed |

### Callbacks

```javascript
new Editor('#editor', {
  callbacks: {
    onInit: () => console.log('init'),
    onChange: (content) => console.log(content),
    onFocus: () => console.log('focused'),
    onBlur: () => console.log('blurred'),
    onKeydown: (e) => console.log(e.key),
    onPaste: (e) => console.log('pasted'),
    onDestroy: () => console.log('destroyed')
  }
});
```

## Plugins

### Built-in Plugins

#### Bold
```javascript
import { BoldPlugin } from 'summernote';
```
- Shortcut: Ctrl+B (Cmd+B on Mac)
- Event: `plugin.bold.toggled`

#### Italic
```javascript
import { ItalicPlugin } from 'summernote';
```
- Shortcut: Ctrl+I
- Event: `plugin.italic.toggled`

#### Underline
```javascript
import { UnderlinePlugin } from 'summernote';
```
- Shortcut: Ctrl+U
- Event: `plugin.underline.toggled`

#### List
```javascript
import { ListPlugin } from 'summernote';
```
- Events: `plugin.list.ordered-list-toggled`, `plugin.list.unordered-list-toggled`

#### Link
```javascript
import { LinkPlugin } from 'summernote';
```
- Shortcut: Ctrl+K
- Events: `plugin.link.inserted`, `plugin.link.removed`

## Usage Examples

### CDN Usage
```html
<!DOCTYPE html>
<html>
<body>
  <div id="editor"></div>
  <script src="https://cdn.jsdelivr.net/npm/summernote@2.0.0/dist/v2/summernote.js"></script>
  <script>
    const editor = new Summernote('#editor');
    editor.init();
  </script>
</body>
</html>
```

### NPM/ESM Usage
```javascript
import Editor, { BoldPlugin, ItalicPlugin } from 'summernote';

const editor = new Editor('#editor', {
  plugins: [BoldPlugin, ItalicPlugin],
  height: 400,
  callbacks: {
    onChange: (content) => {
      saveToServer(content);
    }
  }
});

editor.init();
```

### Selective Imports (Tree-shaking)
```javascript
import Editor from 'summernote/core';
import { BoldPlugin } from 'summernote';

const editor = new Editor('#editor', {
  plugins: [BoldPlugin]
});
```

### Multiple Editors
```javascript
const editors = Editor.init('.editor-class', {
  height: 300
});
```

### Event Handling
```javascript
editor.on('summernote.change', (content) => {
  document.getElementById('preview').innerHTML = content;
});

editor.on('plugin.bold.toggled', () => {
  console.log('Bold toggled');
});
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

Requires modern JavaScript features: ES6+, Fetch API, CustomEvent, classList, Promises.

## Migration from v1.x

### Breaking Changes
- No jQuery required
- All API methods use vanilla JS
- Event API changed from jQuery events to EventEmitter
- No `we` parameter in events

### Before (v1.x)
```javascript
$('#editor').summernote({ height: 300 });
$('#editor').on('summernote.change', function(we, contents) {
  console.log(contents);
});
```

### After (v2.0)
```javascript
const editor = new Editor('#editor', { height: 300 });
editor.init();
editor.on('summernote.change', (contents) => {
  console.log(contents);
});
```

## See Also

- [Plugin Development Guide](./plugin-development.md)
- [Event System](./events.md)
- [Migration Guide](../migration.md)
