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
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path></svg>`,
      tooltip: 'Bold (Ctrl+B)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-bold'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+B', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

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
