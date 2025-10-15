/**
 * Code Plugin - Applies inline code formatting (code tag) to selected text
 */

import BasePlugin from '../core/BasePlugin.js';

export default class CodePlugin extends BasePlugin {
  static pluginName = 'code';
  static dependencies = [];

  /**
   * Initialize the Code plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'code',
      icon: '<i class="ri-code-line"></i>',
      tooltip: 'Inline Code',
      callback: () => this.toggle(),
      className: 'asteronote-btn-code'
    });

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle code formatting
   */
  toggle() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Check if we're already inside a code tag
    const codeElement = this.findCodeParent(range.commonAncestorContainer);

    if (codeElement) {
      // Remove code - unwrap the code tag
      this.removeCode(codeElement);
    } else {
      // Add code - wrap selection in code tag
      this.addCode(range);
    }

    this.updateButtonState();
    this.emitEvent('toggled');

    // Trigger editor change event
    this.editor.emit('asteronote.change');
  }

  /**
   * Add code to selection
   */
  addCode(range) {
    if (range.collapsed) return;

    const code = document.createElement('code');

    try {
      range.surroundContents(code);
    } catch (e) {
      // If surroundContents fails (e.g., selection spans multiple elements),
      // extract contents and wrap them
      const contents = range.extractContents();
      code.appendChild(contents);
      range.insertNode(code);
    }

    // Restore selection
    const newRange = document.createRange();
    newRange.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
  }

  /**
   * Remove code from code element
   */
  removeCode(codeElement) {
    const parent = codeElement.parentNode;
    while (codeElement.firstChild) {
      parent.insertBefore(codeElement.firstChild, codeElement);
    }
    parent.removeChild(codeElement);
    parent.normalize(); // Merge adjacent text nodes
  }

  /**
   * Find if current selection is inside a code tag
   */
  findCodeParent(node) {
    let current = node;

    // If node is text node, start from parent
    if (current.nodeType === Node.TEXT_NODE) {
      current = current.parentNode;
    }

    // Traverse up until we find a code tag or reach the editor
    while (current && current !== this.editor.editableElement) {
      if (current.tagName === 'CODE') {
        return current;
      }
      current = current.parentNode;
    }

    return null;
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('code');
    if (!button || !button.element) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) {
      button.element.classList.remove('active');
      return;
    }

    const range = selection.getRangeAt(0);
    const isCode = this.findCodeParent(range.commonAncestorContainer) !== null;

    if (isCode) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Code plugin destroyed');
    super.destroy();
  }
}
