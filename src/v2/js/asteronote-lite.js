/**
 * AsteroNote v2.0 - Lite Bundle
 * Minimal editor for simple use cases (comments, notes, etc.)
 * Includes: Heading, List, Bold, Italic, Underline, Strikethrough, Link
 * Note: Undo/Redo available via browser native Ctrl+Z/Ctrl+Y
 * ImageTool excluded for smaller bundle size
 */

import Editor from './core/EditorLite.js';
import EventEmitter from './core/EventEmitter.js';
import PluginRegistry from './core/PluginRegistry.js';
import BasePlugin from './core/BasePlugin.js';

// Using EditorLite which doesn't import ImageTool at all

// Import lite plugins only
import BoldPlugin from './plugins/Bold.js';
import ItalicPlugin from './plugins/Italic.js';
import UnderlinePlugin from './plugins/Underline.js';
import StrikethroughPlugin from './plugins/Strikethrough.js';
import ListPlugin from './plugins/List.js';
import LinkPlugin from './plugins/Link.js';
import HeadingPlugin from './plugins/Heading.js';
import SeparatorPlugin from './plugins/Separator.js';

// Export core components
export {
  Editor as PureEditor,
  EventEmitter,
  PluginRegistry,
  BasePlugin
};

// Export lite plugins
export {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  ListPlugin,
  LinkPlugin,
  HeadingPlugin,
  SeparatorPlugin
};

// Create pre-configured editor with lite plugins
export function createEditor(target, options = {}) {
  const plugins = options.plugins || [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    ListPlugin,
    LinkPlugin
  ];

  return new Editor(target, { ...options, plugins });
}

// Lite class that auto-loads plugins based on toolbar configuration
class AsteroNoteLite extends Editor {
  constructor(target, options = {}) {
    // Map of plugin names to plugin classes (lite version)
    const pluginMap = {
      'bold': BoldPlugin,
      'italic': ItalicPlugin,
      'underline': UnderlinePlugin,
      'strikethrough': StrikethroughPlugin,
      'list': ListPlugin,
      'link': LinkPlugin,
      'heading': HeadingPlugin,
      'separator': SeparatorPlugin
    };

    // If plugins are explicitly provided, use them
    if (Array.isArray(options.plugins)) {
      super(target, options);
      return;
    }

    // Otherwise, derive plugins from toolbar configuration
    // Default: Lite toolbar for simple use cases (no undo/redo buttons - use Ctrl+Z/Y)
    const toolbar = options.toolbar || [
      'heading', 'list',
      'separator',
      'bold', 'italic', 'underline', 'strikethrough',
      'separator',
      'link'
    ];

    // Extract plugin names from toolbar configuration
    const toolbarActions = [];

    // Flatten toolbar configuration (keep duplicates for separator)
    for (const item of toolbar) {
      if (Array.isArray(item)) {
        // Legacy format: [groupName, [action1, action2]]
        if (item.length >= 2 && Array.isArray(item[1])) {
          item[1].forEach(action => toolbarActions.push(action));
        } else {
          // Flat nested array
          item.forEach(action => toolbarActions.push(action));
        }
      } else if (typeof item === 'string') {
        // Direct string action
        toolbarActions.push(item);
      }
    }

    // Map toolbar actions to plugin classes
    // Keep duplicates (e.g., multiple separators)
    const pluginClasses = [];

    for (const action of toolbarActions) {
      const PluginClass = pluginMap[action];
      if (PluginClass) {
        // Always add to array, even if duplicate (for separator)
        pluginClasses.push(PluginClass);
      }
    }

    const plugins = pluginClasses;

    super(target, { ...options, plugins });
  }
}

// Default export
export default AsteroNoteLite;

// For UMD builds, expose on window
if (typeof window !== 'undefined') {
  // Make AsteroNoteLite the primary global
  window.AsteroNoteLite = AsteroNoteLite;

  // Also expose on main namespace for convenience
  window.AsteroNote = window.AsteroNote || {};
  window.AsteroNote.Lite = AsteroNoteLite;

  // Also expose other exports for advanced usage
  window.AsteroNoteLiteExports = {
    Editor: AsteroNoteLite,
    PureEditor: Editor,
    EventEmitter,
    PluginRegistry,
    BasePlugin,
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    ListPlugin,
    LinkPlugin,
    HeadingPlugin,
    SeparatorPlugin,
    createEditor
  };
}
