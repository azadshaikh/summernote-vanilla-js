/**
 * UnorderedListPlugin - Creates and manages bullet (unordered) lists
 * Handles <ul> elements with bullet points
 */

import BasePlugin from '../core/BasePlugin.js';

export default class UnorderedListPlugin extends BasePlugin {
  static pluginName = 'unorderedList';
  static dependencies = [];

  /**
   * Initialize the UnorderedList plugin
   */
  init() {
    // Add unordered list button
    this.addButton({
      name: 'insertUnorderedList',
      icon: '<i class="bi bi-list-ul"></i>',
      tooltip: 'Bullet List',
      callback: () => this.toggle(),
      className: 'asteronote-btn-ul'
    });

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Keyboard: Tab = indent/outdent, Backspace = outdent/exit on empty item
    this.on('asteronote.keydown', (e) => this.handleKeydown(e));

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle unordered list
   */
  toggle() {
    this.execCommand('insertUnorderedList');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Handle keydown for indent/outdent behavior with Tab keys inside lists
   */
  handleKeydown(event) {
    const li = this.getCurrentListItem();
    if (!li) return; // only handle when caret is in an unordered list item

    // Only handle if we're inside a UL
    const list = li.parentElement;
    if (!list || list.tagName !== 'UL') return;

    // Handle Tab / Shift+Tab for indent/outdent
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        this.outdentListItem(li);
        this.emitEvent('outdented');
      } else {
        this.indentListItem(li);
        this.emitEvent('indented');
      }
      setTimeout(() => this.updateButtonState(), 0);
      return;
    }

    // Handle Backspace when at beginning of item or item is empty
    if (event.key === 'Backspace') {
      if (this.isListItemEmpty(li) || this.isCaretAtStartOfItem(li)) {
        event.preventDefault();

        const parentList = li.parentElement; // UL
        const parentLI = parentList ? parentList.parentElement : null;

        if (parentLI && parentLI.tagName === 'LI') {
          // Nested list item: outdent
          this.outdentListItem(li);
        } else {
          // Top-level list item: convert to paragraph and exit list
          const p = document.createElement('p');
          p.innerHTML = li.innerHTML || '';
          const list = li.parentElement;
          list.insertBefore(p, li);
          list.removeChild(li);
          // If list becomes empty, remove it
          if (list.children.length === 0) {
            list.parentElement.removeChild(list);
          }
          this.placeCaretAtEnd(p);
        }

        setTimeout(() => this.updateButtonState(), 0);
        this.editor.emit('asteronote.change', this.editor.getContent());
      }
    }
  }

  /**
   * Find the current LI element inside a UL containing the caret/selection
   */
  getCurrentListItem() {
    const sel = this.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    // Walk up to find LI inside UL
    while (node && node !== this.editor.editable) {
      if (node.tagName === 'LI' && node.parentElement && node.parentElement.tagName === 'UL') {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  /**
   * Check if list item is empty or only contains <br>
   */
  isListItemEmpty(li) {
    if (!li) return false;
    const text = li.textContent.trim();
    return text === '' || li.innerHTML === '<br>';
  }

  /**
   * Check if caret is at start of list item
   */
  isCaretAtStartOfItem(li) {
    const sel = this.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return false;

    // Check if caret offset is 0 in first text node
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
      // Check if this is the first text node in the LI
      let parent = node.parentElement;
      while (parent && parent !== li) {
        if (parent.previousSibling) return false;
        parent = parent.parentElement;
      }
      return true;
    }
    return false;
  }

  /**
   * Indent a list item (increase nesting level)
   */
  indentListItem(li) {
    const prev = li.previousElementSibling;
    if (!prev) return; // can't indent first item

    // Find or create nested list in previous sibling
    let nestedList = Array.from(prev.children).find(el => el.tagName === 'UL');
    if (!nestedList) {
      nestedList = document.createElement('ul');
      prev.appendChild(nestedList);
    }

    // Move this item into nested list
    nestedList.appendChild(li);
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  /**
   * Outdent a list item (decrease nesting level)
   */
  outdentListItem(li) {
    const parentList = li.parentElement; // UL
    if (!parentList || parentList.tagName !== 'UL') return;

    const grandParent = parentList.parentElement;
    if (!grandParent) return;

    if (grandParent.tagName === 'LI') {
      // Nested list: move item after parent LI
      const parentLI = grandParent;
      const outerList = parentLI.parentElement;
      if (!outerList) return;

      // Insert after parent LI
      outerList.insertBefore(li, parentLI.nextSibling);

      // Clean up if nested list is now empty
      if (parentList.children.length === 0) {
        parentLI.removeChild(parentList);
      }
    } else {
      // Top-level list: convert to paragraph
      const p = document.createElement('p');
      p.innerHTML = li.innerHTML;
      parentList.insertBefore(p, li);
      parentList.removeChild(li);
      this.placeCaretAtEnd(p);

      // Clean up if list is now empty
      if (parentList.children.length === 0) {
        parentList.parentElement.removeChild(parentList);
      }
    }

    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  /**
   * Place caret at end of element
   */
  placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    const sel = this.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Get current selection
   */
  getSelection() {
    return window.getSelection();
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('insertUnorderedList');
    if (!button || !button.element) return;

    const isInUnorderedList = document.queryCommandState('insertUnorderedList');

    if (isInUnorderedList) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('UnorderedList plugin destroyed');
    super.destroy();
  }
}
