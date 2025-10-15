/**
 * AsteroNote v2.0 - Full Bundle
 * Entry point for full bundle (core + all plugins)
 * Currently same as standard bundle (Phase 1 only)
 * Will include additional plugins in future phases
 */

import Editor from './core/Editor.js';
import EventEmitter from './core/EventEmitter.js';
import PluginRegistry from './core/PluginRegistry.js';
import BasePlugin from './core/BasePlugin.js';

// Import all available plugins
import BoldPlugin from './plugins/Bold.js';
import ItalicPlugin from './plugins/Italic.js';
import UnderlinePlugin from './plugins/Underline.js';
import StrikethroughPlugin from './plugins/Strikethrough.js';
import RemoveFormatPlugin from './plugins/RemoveFormat.js';
import ListPlugin from './plugins/List.js';
import LinkPlugin from './plugins/Link.js';

// Export core components
export {
  Editor,
  EventEmitter,
  PluginRegistry,
  BasePlugin
};

// Export all plugins
export {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  RemoveFormatPlugin,
  ListPlugin,
  LinkPlugin
};

// Create pre-configured editor with all plugins
export function createEditor(target, options = {}) {
  const plugins = options.plugins || [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    RemoveFormatPlugin,
    ListPlugin,
    LinkPlugin
    // Additional plugins will be added in future phases
  ];

  return new Editor(target, { ...options, plugins });
}

// Default export
export default Editor;

