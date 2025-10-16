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
      icon: '<i class="ri-bold"></i>',
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

    const isBold = this.isFormatActive();

    if (isBold) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Check if bold formatting is active at current selection
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

    // Check if we're inside a bold tag or have bold font-weight
    while (node && node !== this.editor.editableElement) {
      if (node.tagName === 'B' || node.tagName === 'STRONG') {
        return true;
      }

      // Check computed style for font-weight
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        const fontWeight = style.fontWeight;
        // Font-weight >= 700 is considered bold (numeric check)
        if (parseInt(fontWeight) >= 700 || fontWeight === 'bold') {
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
    console.log('Bold plugin destroyed');
    super.destroy();
  }
}
