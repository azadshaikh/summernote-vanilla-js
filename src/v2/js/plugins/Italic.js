/**
 * Italic Plugin - Applies italic formatting to selected text
 * Keyboard shortcut: Ctrl+I (Windows/Linux) or Cmd+I (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class ItalicPlugin extends BasePlugin {
  static pluginName = 'italic';
  static dependencies = [];

  /**
   * Initialize the Italic plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'italic',
      icon: '<i class="bi bi-type-italic"></i>',
      tooltip: 'Italic (Ctrl+I)',
      callback: () => this.toggle(),
      className: 'summernote-btn-italic'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+I', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('summernote.keyup', () => this.updateButtonState());
    this.on('summernote.mouseup', () => this.updateButtonState());
    this.on('summernote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle italic formatting
   */
  toggle() {
    this.execCommand('italic');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('italic');
    if (!button || !button.element) return;

    const isItalic = document.queryCommandState('italic');

    if (isItalic) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Italic plugin destroyed');
    super.destroy();
  }
}
