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

    const isUnderline = this.isFormatActive();

    if (isUnderline) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Check if underline formatting is active at current selection
   * @returns {boolean}
   */
  isFormatActive() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    let node = selection.anchorNode;

    // If text node, start from parent
    if (node && node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    // Check if we're inside an underline tag or have underline text-decoration
    while (node && node !== this.editor.editableElement) {
      if (node.tagName === 'U') {
        return true;
      }

      // Check computed style for text-decoration
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        const textDecoration = style.textDecoration || style.textDecorationLine;
        if (textDecoration && textDecoration.includes('underline')) {
          return true;
        }
      }

      node = node.parentNode;
    }

    return false;
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Underline plugin destroyed');
    super.destroy();
  }
}

