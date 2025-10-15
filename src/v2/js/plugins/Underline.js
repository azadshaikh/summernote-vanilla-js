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
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-type-underline" viewBox="0 0 16 16">
  <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57s-2.687-1.08-2.687-2.57zM12.5 15h-9v-1h9z"/>
</svg>`,
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
