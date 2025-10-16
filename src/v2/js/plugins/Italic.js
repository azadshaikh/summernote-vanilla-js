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
      icon: '<i class="ri-italic"></i>',
      tooltip: 'Italic (Ctrl+I)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-italic'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+I', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

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

    const isItalic = this.isFormatActive();

    if (isItalic) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Check if italic formatting is active at current selection
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

    // Check if we're inside an italic tag or have italic font-style
    while (node && node !== this.editor.editableElement) {
      if (node.tagName === 'I' || node.tagName === 'EM') {
        return true;
      }

      // Check computed style for font-style
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        if (style.fontStyle === 'italic' || style.fontStyle === 'oblique') {
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
    console.log('Italic plugin destroyed');
    super.destroy();
  }
}

