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
import UndoPlugin from './plugins/Undo.js';
import RedoPlugin from './plugins/Redo.js';
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
import BlockquotePlugin from './plugins/Blockquote.js';
import HorizontalRulePlugin from './plugins/HorizontalRule.js';
import AlignPlugin from './plugins/Align.js';
import SeparatorPlugin from './plugins/Separator.js';

// Export core components
export {
  Editor,
  EventEmitter,
  PluginRegistry,
  BasePlugin
};

// Export all plugins
export {
  UndoPlugin,
  RedoPlugin,
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
  BlockquotePlugin,
  HorizontalRulePlugin,
  AlignPlugin,
  SeparatorPlugin
};

// Create pre-configured editor with all plugins
export function createEditor(target, options = {}) {
  const plugins = options.plugins || [
    UndoPlugin,
    RedoPlugin,
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    HighlightPlugin,
    CodePlugin,
    RemoveFormatPlugin,
    ListPlugin,
    LinkPlugin
    // Additional plugins will be added in future phases
  ];

  return new Editor(target, { ...options, plugins });
}

// Default export
export default Editor;
