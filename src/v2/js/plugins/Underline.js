/**
 * Underline Plugin - Applies underline formatting to selected text
 * Keyboard shortcut: Ctrl+U (Windows/Linux) or Cmd+U (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class UnderlinePlugin extends BasePlugin {
  static pluginName = 'underline';
  static dependencies = [];

  /**
   * Initialize the Underline plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'underline',
      icon: '<i class="ri-underline"></i>',
      tooltip: 'Underline (Ctrl+U)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-underline'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+U', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle underline formatting
   */
  toggle() {
    this.execCommand('underline');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('underline');
    if (!button || !button.element) return;

    const isUnderline = document.queryCommandState('underline');

    if (isUnderline) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Underline plugin destroyed');
    super.destroy();
  }
}

