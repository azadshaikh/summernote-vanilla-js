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
import ListPlugin from './plugins/List.js';
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
  ListPlugin,
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

// Default class that auto-loads essential plugins when none provided
class AsteroNoteEditor extends Editor {
  constructor(target, options = {}) {
    const defaultPlugins = [BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, RemoveFormatPlugin, ListPlugin, LinkPlugin];
    const plugins = Array.isArray(options.plugins) ? options.plugins : defaultPlugins;
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
    createEditor
  };
}

