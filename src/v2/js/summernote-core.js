/**
 * Summernote Core v2.0
 * Entry point for core-only bundle (no plugins)
 */

import Editor from './core/Editor.js';
import EventEmitter from './core/EventEmitter.js';
import PluginRegistry from './core/PluginRegistry.js';
import BasePlugin from './core/BasePlugin.js';

// Export core components
export {
  Editor,
  EventEmitter,
  PluginRegistry,
  BasePlugin
};

// Default export
export default Editor;
