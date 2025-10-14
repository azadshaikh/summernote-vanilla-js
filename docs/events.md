# Summernote v2.0 - Event System Guide

## Overview

Summernote v2.0 uses a custom EventEmitter system for managing events throughout the editor. This allows both internal components and external code to subscribe to and react to editor events.

## Event Naming Convention

All events follow a namespaced pattern to prevent conflicts and provide clear context:

### Core Events
Format: `summernote.[event-name]`

Examples:
- `summernote.init`
- `summernote.change`
- `summernote.focus`
- `summernote.blur`

### Plugin Events
Format: `plugin.[plugin-name].[event-name]`

Examples:
- `plugin.bold.toggled`
- `plugin.image.uploaded`
- `plugin.table.created`

### Custom Events
Format: `custom.[your-namespace].[event-name]`

Examples:
- `custom.myapp.validation`
- `custom.analytics.track`

## Core Editor Events

### `summernote.init`
Fired when the editor is fully initialized.

**Data:** None

**Example:**
```javascript
editor.on('summernote.init', () => {
  console.log('Editor is ready!');
});
```

### `summernote.change`
Fired when the editor content changes.

**Data:** `content` (string) - Current HTML content

**Example:**
```javascript
editor.on('summernote.change', (content) => {
  console.log('Content:', content);
  // Auto-save content
  saveToServer(content);
});
```

### `summernote.focus`
Fired when the editor receives focus.

**Data:** None

**Example:**
```javascript
editor.on('summernote.focus', () => {
  console.log('Editor focused');
});
```

### `summernote.blur`
Fired when the editor loses focus.

**Data:** None

**Example:**
```javascript
editor.on('summernote.blur', () => {
  console.log('Editor blurred');
  // Validate content on blur
  validateContent();
});
```

### `summernote.keydown`
Fired on keydown events in the editor.

**Data:** `event` (KeyboardEvent) - Original keyboard event

**Example:**
```javascript
editor.on('summernote.keydown', (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    console.log('Ctrl+Enter pressed');
    submitForm();
  }
});
```

### `summernote.paste`
Fired when content is pasted into the editor.

**Data:** `event` (ClipboardEvent) - Original paste event

**Example:**
```javascript
editor.on('summernote.paste', (event) => {
  console.log('Content pasted');
  // Clean pasted content
  cleanPastedContent(event);
});
```

### `summernote.destroy`
Fired when the editor is destroyed.

**Data:** None

**Example:**
```javascript
editor.on('summernote.destroy', () => {
  console.log('Editor destroyed');
  // Cleanup external references
});
```

## Using the Event System

### Subscribe to Events

```javascript
// Basic subscription
editor.on('summernote.change', (content) => {
  console.log('Changed:', content);
});

// One-time subscription
editor.once('summernote.init', () => {
  console.log('Initialized once');
});

// Multiple events
editor.on('summernote.focus', onFocus);
editor.on('summernote.blur', onBlur);
```

### Unsubscribe from Events

```javascript
// Unsubscribe specific handler
const handler = (content) => console.log(content);
editor.on('summernote.change', handler);
editor.off('summernote.change', handler);

// Unsubscribe all handlers for an event
editor.off('summernote.change');

// Unsubscribe all events
editor.removeAllListeners();
```

### Emit Custom Events

Plugins and external code can emit custom events:

```javascript
// In a plugin
class MyPlugin {
  doSomething() {
    // Perform action
    this.editor.emit('plugin.myplugin.action', { data: 'value' });
  }
}

// External code listening
editor.on('plugin.myplugin.action', (data) => {
  console.log('Plugin action:', data);
});
```

### Wildcard Listeners

Listen to all events:

```javascript
editor.onAny((eventName, ...args) => {
  console.log(`Event: ${eventName}`, args);
});
```

## Best Practices

1. **Use Namespaced Events**: Always prefix events with appropriate namespace
2. **Clean Up Listeners**: Remove event listeners when components are destroyed
3. **Avoid Memory Leaks**: Use `once()` for one-time operations
4. **Document Plugin Events**: Document custom events in plugin code
5. **Error Handling**: Event handlers automatically catch errors to prevent cascade failures

## Event Order

Typical event sequence during editor lifecycle:

1. `summernote.init` - Editor initialized
2. `summernote.focus` - User clicks editor (optional)
3. `summernote.keydown` - User types (repeated)
4. `summernote.change` - Content changes (repeated)
5. `summernote.blur` - User clicks outside (optional)
6. `summernote.destroy` - Editor destroyed

## Migration from v1.x

v1.x used jQuery custom events. v2.0 uses a custom EventEmitter:

```javascript
// v1.x (jQuery)
$('#editor').on('summernote.change', function(we, contents) {
  console.log(contents);
});

// v2.0 (EventEmitter)
editor.on('summernote.change', (contents) => {
  console.log(contents);
});
```

Key differences:
- No `we` (window event) parameter in v2.0
- Direct function syntax (no jQuery wrapper)
- Proper `this` context binding
