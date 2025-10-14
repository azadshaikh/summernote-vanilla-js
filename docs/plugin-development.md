# Summernote v2.0 - Plugin Development Guide

## Overview

Summernote v2.0 features a completely redesigned plugin architecture that provides:
- **Isolated plugin scope** - No global state pollution
- **Dependency management** - Automatic resolution of plugin dependencies
- **Standardized interface** - All plugins follow the same contract
- **Lifecycle management** - Proper init/destroy patterns
- **Event system** - Plugin-specific events with namespacing

## Plugin Interface Requirements

All plugins MUST:
1. Extend the `BasePlugin` class
2. Define a static `pluginName` property
3. Implement the `init()` method
4. Optionally define `dependencies` array
5. Optionally implement `destroy()` method for cleanup

## Creating a Plugin

### Basic Plugin Structure

```javascript
import BasePlugin from '../core/BasePlugin.js';

class MyPlugin extends BasePlugin {
  // Required: Unique plugin name
  static pluginName = 'myPlugin';

  // Optional: Dependencies (loaded before this plugin)
  static dependencies = ['bold', 'italic'];

  // Required: Initialize plugin
  init() {
    // Add toolbar button
    this.addButton({
      name: 'myAction',
      icon: '<i class="fa fa-star"></i>',
      tooltip: 'My Action',
      callback: () => this.performAction()
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+M', () => this.performAction());

    // Listen to editor events
    this.on('summernote.change', (content) => {
      console.log('Content changed:', content);
    });
  }

  performAction() {
    // Your plugin logic here
    console.log('Action performed!');
    this.emitEvent('action-performed');
  }

  // Optional: Cleanup when plugin is destroyed
  destroy() {
    // Custom cleanup
    console.log('Plugin destroyed');

    // Call parent destroy
    super.destroy();
  }
}

export default MyPlugin;
```

### Plugin Properties

#### Static Properties

```javascript
class MyPlugin extends BasePlugin {
  // Required: Plugin identifier
  static pluginName = 'myPlugin';

  // Optional: Array of plugin names this plugin depends on
  static dependencies = ['bold', 'italic'];
}
```

#### Instance Properties

Available in all plugin methods via `this`:

- `this.editor` - Editor instance
- `this.enabled` - Plugin enabled state
- `this.buttons` - Map of registered buttons
- `this.shortcuts` - Map of registered shortcuts

## Plugin Lifecycle Methods

### `init()`
**Required.** Called when plugin is initialized.

```javascript
init() {
  // Setup plugin
  this.addButton({ /* ... */ });
  this.addShortcut('Ctrl+B', this.toggle);
  this.on('summernote.focus', this.onFocus);
}
```

### `destroy()`
**Optional.** Called when plugin is destroyed.

```javascript
destroy() {
  // Custom cleanup
  this.removeCustomElements();

  // Call parent cleanup (removes buttons, shortcuts, etc.)
  super.destroy();
}
```

### `enable()` / `disable()`
Enable or disable the plugin at runtime.

```javascript
// Disable plugin
myPluginInstance.disable();

// Enable plugin
myPluginInstance.enable();

// Check state
if (myPluginInstance.isEnabled()) {
  // Plugin is active
}
```

## Adding UI Elements

### Toolbar Buttons

```javascript
this.addButton({
  name: 'bold',              // Unique button identifier
  icon: '<b>B</b>',          // Button HTML content
  tooltip: 'Bold (Ctrl+B)',  // Hover tooltip
  callback: () => {          // Click handler
    this.execCommand('bold');
  },
  className: 'custom-class'  // Optional CSS classes
});
```

### Keyboard Shortcuts

```javascript
// Single shortcut
this.addShortcut('Ctrl+B', () => {
  this.execCommand('bold');
});

// With modifiers
this.addShortcut('Ctrl+Shift+B', () => {
  // Custom action
});

// Mac: Use Cmd instead of Ctrl automatically
// The plugin system detects platform and maps appropriately
```

## Working with Editor Content

### Executing Commands

```javascript
// Execute standard contenteditable command
this.execCommand('bold');
this.execCommand('createLink', 'https://example.com');
this.execCommand('insertHTML', '<strong>Text</strong>');
```

### Selection Management

```javascript
// Get current selection
const selection = this.getSelection();

// Get selection range
const range = this.getRange();

// Save and restore selection
const savedRange = this.saveRange();
// ... do something ...
this.restoreRange(savedRange);
```

### Access Editor Content

```javascript
// Get content
const content = this.editor.getContent();

// Set content
this.editor.setContent('<p>New content</p>');

// Focus editor
this.editor.focus();
```

## Event System

### Listening to Events

```javascript
// Listen to editor events
this.on('summernote.change', (content) => {
  console.log('Content changed:', content);
});

this.on('summernote.focus', () => {
  console.log('Editor focused');
});

// Listen to other plugin events
this.on('plugin.image.uploaded', (imageData) => {
  console.log('Image uploaded:', imageData);
});
```

### Emitting Events

```javascript
// Emit plugin-specific event
this.emitEvent('custom-action', { data: 'value' });

// This emits: 'plugin.myPlugin.custom-action'
// Other plugins can listen:
// editor.on('plugin.myPlugin.custom-action', handler);
```

## Plugin Dependencies

Declare dependencies to ensure plugins load in correct order:

```javascript
class TablePlugin extends BasePlugin {
  static pluginName = 'table';
  static dependencies = ['bold', 'italic']; // Load after these

  init() {
    // Bold and Italic plugins are guaranteed to be loaded
  }
}
```

## Complete Plugin Example

```javascript
import BasePlugin from '../core/BasePlugin.js';

class HighlightPlugin extends BasePlugin {
  static pluginName = 'highlight';
  static dependencies = [];

  init() {
    // Add toolbar button
    this.addButton({
      name: 'highlight',
      icon: '<i class="fa fa-highlighter"></i>',
      tooltip: 'Highlight Text (Ctrl+H)',
      callback: () => this.toggleHighlight()
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+H', () => this.toggleHighlight());

    // Listen to selection changes
    this.on('summernote.keyup', () => this.updateButtonState());
    this.on('summernote.mouseup', () => this.updateButtonState());
  }

  toggleHighlight() {
    const range = this.getRange();
    if (!range || range.collapsed) return;

    // Check if already highlighted
    const parent = range.commonAncestorContainer.parentElement;
    if (parent && parent.style.backgroundColor) {
      // Remove highlight
      parent.style.backgroundColor = '';
      this.emitEvent('removed');
    } else {
      // Add highlight
      const span = document.createElement('span');
      span.style.backgroundColor = 'yellow';
      range.surroundContents(span);
      this.emitEvent('applied');
    }

    this.editor.emit('summernote.change', this.editor.getContent());
  }

  updateButtonState() {
    const button = this.buttons.get('highlight');
    if (!button || !button.element) return;

    const range = this.getRange();
    if (range) {
      const parent = range.commonAncestorContainer.parentElement;
      if (parent && parent.style.backgroundColor) {
        button.element.classList.add('active');
      } else {
        button.element.classList.remove('active');
      }
    }
  }

  destroy() {
    console.log('Highlight plugin destroyed');
    super.destroy();
  }
}

export default HighlightPlugin;
```

## Registering Plugins

Plugins are registered with the PluginRegistry:

```javascript
import Editor from './core/Editor.js';
import BoldPlugin from './plugins/Bold.js';
import ItalicPlugin from './plugins/Italic.js';
import MyCustomPlugin from './plugins/MyCustomPlugin.js';

// Create editor with plugins
const editor = new Editor('#editor', {
  plugins: [BoldPlugin, ItalicPlugin, MyCustomPlugin]
});

editor.init();
```

## Best Practices

1. **Always extend BasePlugin** - Don't create plugins from scratch
2. **Use static pluginName** - Required for registration
3. **Clean up in destroy()** - Remove event listeners, DOM elements, etc.
4. **Call super.destroy()** - Let BasePlugin clean up common resources
5. **Use this.emitEvent()** - For plugin-specific events
6. **Check this.enabled** - Respect disabled state
7. **Document dependencies** - Make plugin requirements clear
8. **Handle errors gracefully** - Don't crash the editor
9. **Test in isolation** - Ensure plugin works independently
10. **Follow naming conventions** - Use clear, descriptive names

## Testing Plugins

```javascript
// Manual testing example
const editor = new Editor('#test-editor');
editor.init();

// Access plugin instance
const boldPlugin = editor.getPlugin('bold');

// Test plugin methods
boldPlugin.disable();
console.assert(!boldPlugin.isEnabled());

boldPlugin.enable();
console.assert(boldPlugin.isEnabled());

// Listen to plugin events
editor.on('plugin.bold.toggled', () => {
  console.log('Bold was toggled');
});
```

## Troubleshooting

### Plugin not loading
- Check that `static pluginName` is defined
- Verify plugin is registered before editor.init()
- Check browser console for errors

### Circular dependency error
- Review plugin dependencies
- Remove circular references
- Consider restructuring plugins

### Button not appearing
- Ensure `addButton()` is called in `init()`
- Check that toolbar element exists
- Verify button HTML is valid

### Events not firing
- Confirm event name spelling
- Check that handler is registered before event fires
- Verify plugin is enabled
