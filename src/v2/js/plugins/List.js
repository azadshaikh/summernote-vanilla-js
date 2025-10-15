/**
 * List Plugin - Creates ordered and unordered lists
 * Displays dropdown menu with list options (UL/OL)
 * Updates button icon to show current list type
 */

import BasePlugin from '../core/BasePlugin.js';

export default class ListPlugin extends BasePlugin {
  static pluginName = 'list';
  static dependencies = [];

  /**
   * Initialize the List plugin
   */
  init() {
    this.currentListType = null;
    this.dropdownVisible = false;

    // Add list button with dropdown (default UL icon)
    this.addButton({
      name: 'list',
      icon: this.getListIcon('ul'),
      tooltip: 'List',
      callback: () => this.toggleDropdown(),
      className: 'asteronote-btn-list'
    });

    // Create dropdown menu
    this.createDropdown();

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    // Keyboard: Tab = indent/outdent, Backspace = outdent/exit on empty item or at start
    this.on('asteronote.keydown', (e) => this.handleKeydown(e));

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Get icon for list type
   */
  getListIcon(type) {
    if (type === 'ol') {
      return `<i class="ri-list-ordered"></i><i class=\"ri-arrow-down-s-line\"></i>`;
    }
    // Default: UL
    return `<i class="ri-list-unordered"></i><i class=\"ri-arrow-down-s-line\"></i>`;
  }

  /**
   * Create dropdown menu
   */
  createDropdown() {
    const button = this.buttons.get('list');
    if (!button || !button.element) return;

    // Wrap button in a container for positioning
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    // Replace button with wrapper
    button.element.parentNode.insertBefore(wrapper, button.element);
    wrapper.appendChild(button.element);

    // Create dropdown container
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'dropdown-menu';
    this.dropdown.style.position = 'absolute';
    this.dropdown.style.top = '100%';
    this.dropdown.style.left = '0';
    this.dropdown.style.marginTop = '0.125rem';
    this.dropdown.style.zIndex = '1000';
    this.dropdown.style.minWidth = '200px';

    // List options
    const listTypes = [
      { type: 'ul', label: 'Bullet List', icon: '<i class="ri-list-unordered"></i>' },
      { type: 'ol', label: 'Numbered List', icon: '<i class="ri-list-ordered"></i>' }
    ];

    listTypes.forEach(({ type, label, icon }) => {
      const item = document.createElement('button');
      item.className = 'dropdown-item d-flex align-items-center';
      item.type = 'button';
      item.innerHTML = `
        <span class="me-2" style="min-width: 24px;">${icon}</span>
        <span>${label}</span>
      `;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyList(type);
        this.hideDropdown();
      });

      this.dropdown.appendChild(item);
    });

    // Append dropdown to wrapper
    wrapper.appendChild(this.dropdown);
    this.dropdownWrapper = wrapper;
  }

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown() {
    if (this.dropdownVisible) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  /**
   * Show dropdown
   */
  showDropdown() {
    if (!this.dropdown) return;

    const button = this.buttons.get('list');
    if (!button || !button.element) return;

    // Show dropdown with Bootstrap's show class
    this.dropdown.classList.add('show');
    this.dropdown.style.display = 'block';

    this.dropdownVisible = true;
    button.element.classList.add('active');
  }

  /**
   * Hide dropdown
   */
  hideDropdown() {
    if (!this.dropdown) return;

    const button = this.buttons.get('list');
    if (button && button.element) {
      button.element.classList.remove('active');
    }

    this.dropdown.classList.remove('show');
    this.dropdown.style.display = 'none';
    this.dropdownVisible = false;
  }

  /**
   * Handle clicks outside dropdown
   */
  handleOutsideClick(event) {
    const button = this.buttons.get('list');
    if (!button || !button.element) return;

    if (this.dropdownVisible &&
        !button.element.contains(event.target) &&
        !this.dropdown.contains(event.target)) {
      this.hideDropdown();
    }
  }

  /**
   * Apply list format
   */
  applyList(type) {
    if (type === 'ul') {
      this.execCommand('insertUnorderedList');
      this.emitEvent('unordered-list-toggled');
    } else if (type === 'ol') {
      this.execCommand('insertOrderedList');
      this.emitEvent('ordered-list-toggled');
    }

    this.updateButtonState();
  }

  /**
   * Get current list type at cursor
   */
  getCurrentListType() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    let node = sel.anchorNode;
    if (!node) return null;

    // Walk up the DOM tree to find UL or OL
    while (node && node !== this.editor.editable) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName;
        if (tagName === 'UL') return 'ul';
        if (tagName === 'OL') return 'ol';
      }
      node = node.parentNode;
    }

    return null;
  }

  /**
   * Update button icon based on current list type
   */
  updateButtonState() {
    const button = this.buttons.get('list');
    if (!button || !button.element) return;

    const listType = this.getCurrentListType();

    // Always update if list type changed or if we need to update active state
    if (listType !== this.currentListType) {
      this.currentListType = listType;

      // Update button icon with full structure
      const iconType = listType || 'ul'; // Default to UL icon
      button.element.innerHTML = this.getListIcon(iconType);
    }

    // Always update active state regardless of icon change
    if (listType) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
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
      setTimeout(() => this.updateButtonState(), 0);
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

        setTimeout(() => this.updateButtonState(), 0);
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
   * Cleanup
   */
  destroy() {
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }
    document.removeEventListener('click', this.handleOutsideClick);
    console.log('List plugin destroyed');
    super.destroy();
  }
}
