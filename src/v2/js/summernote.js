/**
 * Summernote v2.0 - Standard Bundle
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
import ListPlugin from './plugins/List.js';
import LinkPlugin from './plugins/Link.js';

// Export core components
export {
  Editor,
  EventEmitter,
  PluginRegistry,
  BasePlugin
};

// Export plugins
export {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  ListPlugin,
  LinkPlugin
};

// Create pre-configured editor with essential plugins
export function createEditor(target, options = {}) {
  const plugins = options.plugins || [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    ListPlugin,
    LinkPlugin
  ];

  return new Editor(target, { ...options, plugins });
}

// Default export
export default Editor;

// For UMD builds, expose on window
if (typeof window !== 'undefined') {
  // Make Editor the default global
  window.Summernote = Editor;
  window.Editor = Editor;

  // Also expose other exports for advanced usage
  window.SummernoteExports = {
    Editor,
    EventEmitter,
    PluginRegistry,
    BasePlugin,
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    ListPlugin,
    LinkPlugin,
    createEditor
  };
}
