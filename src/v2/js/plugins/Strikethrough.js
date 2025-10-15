/**
 * Strikethrough Plugin - Applies strikethrough formatting to selected text
 * Keyboard shortcut: Ctrl+Shift+S (Windows/Linux) or Cmd+Shift+S (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class StrikethroughPlugin extends BasePlugin {
  static pluginName = 'strikethrough';
  static dependencies = [];

  /**
   * Initialize the Strikethrough plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'strikethrough',
      icon: '<i class="ri-strikethrough"></i>',
      tooltip: 'Strikethrough (Ctrl+Shift+S)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-strikethrough'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+Shift+S', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle strikethrough formatting
   */
  toggle() {
    this.execCommand('strikeThrough');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('strikethrough');
    if (!button || !button.element) return;

    const isActive = document.queryCommandState('strikeThrough');

    if (isActive) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Clean up when plugin is destroyed
   */
  destroy() {
    // Base class handles button removal and event cleanup
    super.destroy();
  }
}

