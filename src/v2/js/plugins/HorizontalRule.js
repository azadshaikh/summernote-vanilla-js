/**
 * Horizontal Rule Plugin - Inserts a horizontal line (<hr>) at the caret
 * Keyboard shortcut: Ctrl+Enter (Cmd+Enter on macOS)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class HorizontalRulePlugin extends BasePlugin {
  static pluginName = 'hr';
  static dependencies = [];

  init() {
    // Add toolbar button
    this.addButton({
      name: 'hr',
      icon: '<i class="ri-separator"></i>',
      tooltip: 'Horizontal Line (Ctrl+Enter)',
      callback: () => this.insert(),
      className: 'asteronote-btn-hr'
    });

    // Add keyboard shortcut: Ctrl+Enter (or Cmd+Enter on macOS)
    this.addShortcut('Ctrl+ENTER', () => this.insert());
  }

  /**
   * Insert a horizontal rule at the caret position
   */
  insert() {
    this.execCommand('insertHorizontalRule');
    this.emitEvent('inserted');
  }

  destroy() {
    super.destroy();
  }
}

