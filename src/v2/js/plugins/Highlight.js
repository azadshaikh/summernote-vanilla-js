/**
 * Highlight Plugin - Applies highlight formatting (mark tag) to selected text
 * Keyboard shortcut: Ctrl+H (Windows/Linux) or Cmd+H (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class HighlightPlugin extends BasePlugin {
  static pluginName = 'highlight';
  static dependencies = [];

  /**
   * Initialize the Highlight plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'highlight',
      icon: '<i class="ri-mark-pen-line"></i>',
      tooltip: 'Highlight (Ctrl+H)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-highlight'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+H', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle highlight formatting
   */
  toggle() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Check if we're already inside a mark tag
    const markElement = this.findMarkParent(range.commonAncestorContainer);

    if (markElement) {
      // Remove highlight - unwrap the mark tag
      this.removeHighlight(markElement);
    } else {
      // Add highlight - wrap selection in mark tag
      this.addHighlight(range);
    }

    this.updateButtonState();
    this.emitEvent('toggled');

    // Trigger editor change event
    this.editor.emit('asteronote.change');
  }

  /**
   * Add highlight to selection
   */
  addHighlight(range) {
    if (range.collapsed) return;

    const mark = document.createElement('mark');

    try {
      range.surroundContents(mark);
    } catch (e) {
      // If surroundContents fails (e.g., selection spans multiple elements),
      // extract contents and wrap them
      const contents = range.extractContents();
      mark.appendChild(contents);
      range.insertNode(mark);
    }

    // Restore selection
    const newRange = document.createRange();
    newRange.selectNodeContents(mark);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
  }

  /**
   * Remove highlight from mark element
   */
  removeHighlight(markElement) {
    const parent = markElement.parentNode;
    while (markElement.firstChild) {
      parent.insertBefore(markElement.firstChild, markElement);
    }
    parent.removeChild(markElement);
    parent.normalize(); // Merge adjacent text nodes
  }

  /**
   * Find if current selection is inside a mark tag
   */
  findMarkParent(node) {
    let current = node;

    // If node is text node, start from parent
    if (current.nodeType === Node.TEXT_NODE) {
      current = current.parentNode;
    }

    // Traverse up until we find a mark tag or reach the editor
    while (current && current !== this.editor.editableElement) {
      if (current.tagName === 'MARK') {
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
    const button = this.buttons.get('highlight');
    if (!button || !button.element) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) {
      button.element.classList.remove('active');
      return;
    }

    const range = selection.getRangeAt(0);
    const isHighlighted = this.findMarkParent(range.commonAncestorContainer) !== null;

    if (isHighlighted) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Highlight plugin destroyed');
    super.destroy();
  }
}
