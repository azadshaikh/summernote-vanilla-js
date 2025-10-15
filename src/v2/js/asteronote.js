/**
 * AsteroNote v2.0 - Standard Bundle
 * Entry point for standard bundle (core + essential plugins)
 */

import Editor from './core/Editor.js';
import EventEmitter from './core/EventEmitter.js';
import PluginRegistry from './core/PluginRegistry.js';
import BasePlugin from './core/BasePlugin.js';

// Import essential plugins (Phase 1)
import BoldPlugin from './plugins/Bold.js';
import ItalicPlugin from './plugins/Italic.js';
import UnderlinePlugin from './plugins/Underline.js';
import StrikethroughPlugin from './plugins/Strikethrough.js';
import RemoveFormatPlugin from './plugins/RemoveFormat.js';
import OrderedListPlugin from './plugins/OrderedList.js';
import UnorderedListPlugin from './plugins/UnorderedList.js';
import LinkPlugin from './plugins/Link.js';

// Export core components
export {
  Editor as PureEditor,
  EventEmitter,
  PluginRegistry,
  BasePlugin
};

// Export plugins
export {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  RemoveFormatPlugin,
  OrderedListPlugin,
  UnorderedListPlugin,
  LinkPlugin
};

// Create pre-configured editor with essential plugins
export function createEditor(target, options = {}) {
  const plugins = options.plugins || [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    RemoveFormatPlugin,
    ListPlugin,
    LinkPlugin
  ];

  return new Editor(target, { ...options, plugins });
}

// Default class that auto-loads plugins based on toolbar configuration
class AsteroNoteEditor extends Editor {
  constructor(target, options = {}) {
    // Map of plugin names to plugin classes
    const pluginMap = {
      'bold': BoldPlugin,
      'italic': ItalicPlugin,
      'underline': UnderlinePlugin,
      'strikethrough': StrikethroughPlugin,
      'removeFormat': RemoveFormatPlugin,
      'ul': UnorderedListPlugin,
      'ol': OrderedListPlugin,
      'link': LinkPlugin
    };

    // If plugins are explicitly provided, use them
    if (Array.isArray(options.plugins)) {
      super(target, options);
      return;
    }

    // Otherwise, derive plugins from toolbar configuration
    const toolbar = options.toolbar || [
      'bold', 'italic', 'underline', 'strikethrough',
      'removeFormat',
      'ul', 'ol',
      'link'
    ];

    // Extract plugin names from toolbar configuration
    const toolbarActions = new Set();

    // Flatten toolbar configuration
    for (const item of toolbar) {
      if (Array.isArray(item)) {
        // Legacy format: [groupName, [action1, action2]]
        if (item.length >= 2 && Array.isArray(item[1])) {
          item[1].forEach(action => toolbarActions.add(action));
        } else {
          // Flat nested array
          item.forEach(action => toolbarActions.add(action));
        }
      } else if (typeof item === 'string') {
        // Direct string action
        toolbarActions.add(item);
      }
    }

    // Map toolbar actions to unique plugin classes
    const pluginClasses = new Set();
    for (const action of toolbarActions) {
      const PluginClass = pluginMap[action];
      if (PluginClass) {
        pluginClasses.add(PluginClass);
      }
    }

    // Convert Set to Array
    const plugins = Array.from(pluginClasses);

    super(target, { ...options, plugins });
  }
}

// Default export
export default AsteroNoteEditor;

// For UMD builds, expose on window
if (typeof window !== 'undefined') {
  // Make AsteroNote the primary global
  window.AsteroNote = AsteroNoteEditor;
  window.AsteroNoteEditor = AsteroNoteEditor;

  // Backward compatibility aliases (deprecated, will be removed in v3)
  window.Asteronote = AsteroNoteEditor; // lowercase 'n' for compat
  window.Summernote = AsteroNoteEditor; // v1 compat
  window.Editor = AsteroNoteEditor;

  // Also expose other exports for advanced usage
  window.AsteroNoteExports = {
    Editor: AsteroNoteEditor,
    PureEditor: Editor,
    EventEmitter,
    PluginRegistry,
    BasePlugin,
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    RemoveFormatPlugin,
    OrderedListPlugin,
    UnorderedListPlugin,
    LinkPlugin,
    createEditor
  };
}

