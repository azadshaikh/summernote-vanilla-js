/**
 * Bold Plugin - Applies bold formatting to selected text
 * Keyboard shortcut: Ctrl+B (Windows/Linux) or Cmd+B (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class BoldPlugin extends BasePlugin {
  static pluginName = 'bold';
  static dependencies = [];

  /**
   * Initialize the Bold plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'bold',
      icon: '<strong>B</strong>',
      tooltip: 'Bold (Ctrl+B)',
      callback: () => this.toggle(),
      className: 'summernote-btn-bold'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+B', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('summernote.keyup', () => this.updateButtonState());
    this.on('summernote.mouseup', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle bold formatting
   */
  toggle() {
    this.execCommand('bold');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('bold');
    if (!button || !button.element) return;

    const isBold = document.queryCommandState('bold');

    if (isBold) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Bold plugin destroyed');
    super.destroy();
  }
}
