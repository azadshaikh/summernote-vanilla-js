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
      name: 'ul',
      icon: '<i class="bi bi-list-ul"></i>',
      tooltip: 'Bullet List',
      callback: () => this.toggleUnorderedList(),
      className: 'asteronote-btn-ul'
    });

    // Add ordered list button
    this.addButton({
      name: 'ol',
      icon: '<i class="bi bi-list-ol"></i>',
      tooltip: 'Numbered List',
      callback: () => this.toggleOrderedList(),
      className: 'asteronote-btn-ol'
    });

    // Listen to selection changes to update button states
    this.on('asteronote.keyup', () => this.updateButtonStates());
    this.on('asteronote.mouseup', () => this.updateButtonStates());
    this.on('asteronote.selectionchange', () => this.updateButtonStates());

    // Keyboard: Tab = indent/outdent, Backspace = outdent/exit on empty item or at start
    this.on('asteronote.keydown', (e) => this.handleKeydown(e));

    // Initial button states
    setTimeout(() => this.updateButtonStates(), 0);
  }

  /**
   * Handle keydown for indent/outdent behavior with Tab keys inside lists
   */
  handleKeydown(event) {
    const li = this.getCurrentListItem();
    if (!li) return; // only handle when caret is in a list item

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
      setTimeout(() => this.updateButtonStates(), 0);
      return;
    }

    // Handle Backspace when at beginning of item or item is empty
    if (event.key === 'Backspace') {
      if (this.isListItemEmpty(li) || this.isCaretAtStartOfItem(li)) {
        event.preventDefault();

        const parentList = li.parentElement; // UL/OL
        const parentLI = parentList ? parentList.parentElement : null;

        if (parentLI && parentLI.tagName === 'LI') {
          // Nested list item: outdent
          this.outdentListItem(li);
        } else {
          // Top-level list item: convert to paragraph and exit list
          const p = document.createElement('p');
          p.innerHTML = '';
          const list = li.parentElement;
          list.insertBefore(p, li);
          list.removeChild(li);
          // If list becomes empty, remove it
          if (list.children.length === 0) {
            list.parentElement.removeChild(list);
          }
          this.placeCaretAtEnd(p);
        }

        setTimeout(() => this.updateButtonStates(), 0);
      }
    }
  }

  /**
   * Find the current LI element containing the caret/selection, if any
   */
  getCurrentListItem() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node) return null;
    if (node.tagName === 'LI') return node;
    return node.closest ? node.closest('li') : null;
  }

  /**
   * Determine if the caret is visually at the start of the given list item
   */
  isCaretAtStartOfItem(li) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0).cloneRange();
    // Build a range from start of LI to caret
    const before = document.createRange();
    before.selectNodeContents(li);
    before.setEnd(range.startContainer, range.startOffset);
    const text = before.toString();
    return text.replace(/\s+/g, '') === '';
  }

  /**
   * Check if a list item is effectively empty (ignoring whitespace and <br>)
   */
  isListItemEmpty(li) {
    // Remove zero-width spaces and trim
    const text = (li.textContent || '').replace(/\u200B/g, '').trim();
    if (text.length > 0) return false;
    // Also consider only a single <br> as empty
    const html = (li.innerHTML || '').replace(/\u200B/g, '').trim().toLowerCase();
    if (html === '' || html === '<br>' || html === '<br/>' || html === '<br />') return true;
    return text.length === 0;
  }

  /**
   * Indent the given list item by moving it into a nested list under its previous sibling.
   * Creates the nested list if it does not exist.
   */
  indentListItem(li) {
    const prev = li.previousElementSibling;
    if (!prev) return; // cannot indent the first item
    const parentList = li.parentElement; // UL or OL
    if (!parentList) return;
    const listTag = parentList.tagName; // 'UL' or 'OL'

    // Find or create a sublist in the previous item with the same type
    let sublist = Array.from(prev.children).find((c) => c.tagName === listTag);
    if (!sublist) {
      sublist = document.createElement(listTag.toLowerCase());
      prev.appendChild(sublist);
    }

    sublist.appendChild(li);
    this.placeCaretAtEnd(li);
  }

  /**
   * Outdent the given list item by moving it after the parent LI.
   */
  outdentListItem(li) {
    const parentList = li.parentElement; // UL or OL
    if (!parentList) return;
    const parentLI = parentList.parentElement;

    // If parent list is inside an LI, move li after that LI
    if (parentLI && parentLI.tagName === 'LI') {
      const grandList = parentLI.parentElement; // UL/OL that contains parentLI
      if (!grandList) return;
      grandList.insertBefore(li, parentLI.nextSibling);

      // Remove empty sublist if necessary
      if (parentList.children.length === 0) {
        parentLI.removeChild(parentList);
      }

      this.placeCaretAtEnd(li);
      return;
    }

    // If there is no parent LI (top-level), fallback to native outdent
    document.execCommand('outdent');
    this.placeCaretAtEnd(li);
  }

  /**
   * Place caret at end of a list item
   */
  placeCaretAtEnd(li) {
    const range = document.createRange();
    range.selectNodeContents(li);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
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
    const ulButton = this.buttons.get('ul');
    const olButton = this.buttons.get('ol');

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
