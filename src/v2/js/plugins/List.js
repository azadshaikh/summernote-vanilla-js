/**
 * List Plugin - Creates ordered and unordered lists
 * Handles both bullet lists (UL) and numbered lists (OL)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class ListPlugin extends BasePlugin {
  static pluginName = 'list';
  static dependencies = [];

  /**
   * Initialize the List plugin
   */
  init() {
    // Add unordered list button
    this.addButton({
      name: 'insertUnorderedList',
      icon: '• List',
      tooltip: 'Unordered List',
      callback: () => this.toggleUnorderedList(),
      className: 'summernote-btn-ul'
    });

    // Add ordered list button
    this.addButton({
      name: 'insertOrderedList',
      icon: '1. List',
      tooltip: 'Ordered List',
      callback: () => this.toggleOrderedList(),
      className: 'summernote-btn-ol'
    });

    // Listen to selection changes to update button states
    this.on('summernote.keyup', () => this.updateButtonStates());
    this.on('summernote.mouseup', () => this.updateButtonStates());

    // Initial button states
    setTimeout(() => this.updateButtonStates(), 0);
  }

  /**
   * Toggle unordered list
   */
  toggleUnorderedList() {
    this.execCommand('insertUnorderedList');
    this.updateButtonStates();
    this.emitEvent('unordered-list-toggled');
  }

  /**
   * Toggle ordered list
   */
  toggleOrderedList() {
    this.execCommand('insertOrderedList');
    this.updateButtonStates();
    this.emitEvent('ordered-list-toggled');
  }

  /**
   * Update button active states based on current selection
   */
  updateButtonStates() {
    const ulButton = this.buttons.get('insertUnorderedList');
    const olButton = this.buttons.get('insertOrderedList');

    if (ulButton && ulButton.element) {
      const isUL = document.queryCommandState('insertUnorderedList');
      if (isUL) {
        ulButton.element.classList.add('active');
      } else {
        ulButton.element.classList.remove('active');
      }
    }

    if (olButton && olButton.element) {
      const isOL = document.queryCommandState('insertOrderedList');
      if (isOL) {
        olButton.element.classList.add('active');
      } else {
        olButton.element.classList.remove('active');
      }
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('List plugin destroyed');
    super.destroy();
  }
}
