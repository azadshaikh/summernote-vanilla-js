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

    const isActive = this.isFormatActive();

    if (isActive) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Check if strikethrough formatting is active at current selection
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

    // Check if we're inside a strikethrough tag or have line-through text-decoration
    while (node && node !== this.editor.editableElement) {
      if (node.tagName === 'S' || node.tagName === 'STRIKE' || node.tagName === 'DEL') {
        return true;
      }

      // Check computed style for text-decoration
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        const textDecoration = style.textDecoration || style.textDecorationLine;
        if (textDecoration && textDecoration.includes('line-through')) {
          return true;
        }
      }

      node = node.parentNode;
    }

    return false;
  }

  /**
   * Clean up when plugin is destroyed
   */
  destroy() {
    // Base class handles button removal and event cleanup
    super.destroy();
  }
}

