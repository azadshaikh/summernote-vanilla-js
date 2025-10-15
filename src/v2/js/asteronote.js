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
import HighlightPlugin from './plugins/Highlight.js';
import CodePlugin from './plugins/Code.js';
import RemoveFormatPlugin from './plugins/RemoveFormat.js';
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

// Export plugins
export {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  HighlightPlugin,
  CodePlugin,
  RemoveFormatPlugin,
  ListPlugin,
  LinkPlugin,
  HeadingPlugin,
  SeparatorPlugin
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
      'highlight': HighlightPlugin,
      'code': CodePlugin,
      'removeFormat': RemoveFormatPlugin,
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
    const toolbar = options.toolbar || [
      'heading',
      'separator',
      'bold', 'italic', 'underline', 'strikethrough', 'highlight', 'code',
      'separator',
      'removeFormat',
      'separator',
      'list',
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
    ListPlugin,
    LinkPlugin,
    HeadingPlugin,
    SeparatorPlugin,
    createEditor
  };
}

