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

    // Add list button with dropdown (default UL icon)
    this.addButton({
      name: 'list',
      icon: this.getListIcon('ul'),
      tooltip: 'List',
      callback: () => {}, // No callback needed, Bootstrap handles it
      className: 'asteronote-btn-list dropdown-toggle'
    });

    // Add Bootstrap dropdown attributes to button
    const button = this.buttons.get('list');
    if (button && button.element) {
      button.element.setAttribute('data-bs-toggle', 'dropdown');
      button.element.setAttribute('aria-expanded', 'false');
    }

    // Create dropdown menu
    this.createDropdown();

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

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
      return `<i class="ri-list-ordered"></i>`;
    }
    // Default: UL
    return `<i class="ri-list-unordered"></i>`;
  }

  /**
   * Create dropdown menu
   */
  createDropdown() {
    const button = this.buttons.get('list');
    if (!button || !button.element) return;

    // Wrap button in btn-group for Bootstrap dropdown
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    // Replace button with btn-group
    button.element.parentNode.insertBefore(btnGroup, button.element);
    btnGroup.appendChild(button.element);

    // Create dropdown container
    this.dropdown = document.createElement('ul');
    this.dropdown.className = 'dropdown-menu';

    // Bulleted (UL) header
    this.dropdown.appendChild(this.createHeader('Bulleted list'));
    // UL styles
    [
      { style: 'disc', label: 'Bullet (•)', icon: '<i class="ri-list-unordered"></i>' },
      { style: 'circle', label: 'Circle (○)', icon: '<i class="ri-list-unordered"></i>' },
      { style: 'square', label: 'Square (■)', icon: '<i class="ri-list-unordered"></i>' },
    ].forEach(({ style, label, icon }) => {
      const li = document.createElement('li');
      const item = document.createElement('button');
      item.className = 'dropdown-item d-flex align-items-center';
      item.type = 'button';
      item.innerHTML = `
        <span class="me-2" style="min-width: 24px;">${icon}</span>
        <span>${label}</span>
      `;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyList('ul', style);
      });
      li.appendChild(item);
      this.dropdown.appendChild(li);
    });

    // Divider
    this.dropdown.appendChild(this.createDivider());

    // Numbered (OL) header
    this.dropdown.appendChild(this.createHeader('Numbered list'));
    // OL styles
    [
      { style: 'decimal', label: 'Decimal (1, 2, 3)', icon: '<i class="ri-list-ordered"></i>' },
      { style: 'lower-alpha', label: 'Lower alpha (a, b, c)', icon: '<i class="ri-list-ordered"></i>' },
      { style: 'upper-alpha', label: 'Upper alpha (A, B, C)', icon: '<i class="ri-list-ordered"></i>' },
      { style: 'lower-roman', label: 'Lower roman (i, ii, iii)', icon: '<i class="ri-list-ordered"></i>' },
      { style: 'upper-roman', label: 'Upper roman (I, II, III)', icon: '<i class="ri-list-ordered"></i>' },
    ].forEach(({ style, label, icon }) => {
      const li = document.createElement('li');
      const item = document.createElement('button');
      item.className = 'dropdown-item d-flex align-items-center';
      item.type = 'button';
      item.innerHTML = `
        <span class="me-2" style="min-width: 24px;">${icon}</span>
        <span>${label}</span>
      `;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyList('ol', style);
      });
      li.appendChild(item);
      this.dropdown.appendChild(li);
    });

    // Append dropdown to btn-group
    btnGroup.appendChild(this.dropdown);
  }

  /**
   * Apply list format
   */
  applyList(type, style = null) {
    const currentRoot = this.getClosestListRoot();

    if (currentRoot) {
      const currentType = currentRoot.tagName.toLowerCase();
      if (currentType !== type) {
        // Convert UL <-> OL without removing the list first
        const converted = this.convertListRoot(currentRoot, type);
        if (converted) {
          // Apply style after conversion
          this.applyListStyle(converted, type, style);
          // Emit events (keep backward compatible toggled event)
          if (type === 'ul') this.emitEvent('unordered-list-toggled');
          if (type === 'ol') this.emitEvent('ordered-list-toggled');
          this.emitEvent('type-changed', { type, style: style || null });
          this.updateButtonState();
          return;
        }
      } else {
        // Same list type: just apply style
        this.applyListStyle(currentRoot, type, style);
        this.updateButtonState();
        return;
      }
    }

    // Not currently in a list: toggle creation via execCommand
    if (type === 'ul') {
      this.execCommand('insertUnorderedList');
      this.emitEvent('unordered-list-toggled');
    } else if (type === 'ol') {
      this.execCommand('insertOrderedList');
      this.emitEvent('ordered-list-toggled');
    }

    // Apply style to the newly created list
    const list = this.getClosestListRoot();
    if (list) this.applyListStyle(list, type, style);

    this.updateButtonState();
  }

  /** Convert the current list root to a different type (ul <-> ol) */
  convertListRoot(listEl, toType) {
    if (!listEl || (toType !== 'ul' && toType !== 'ol')) return null;
    const newList = document.createElement(toType);
    // Copy class and inline styles
    if (listEl.getAttribute('class')) newList.setAttribute('class', listEl.getAttribute('class'));
    if (listEl.getAttribute('style')) newList.setAttribute('style', listEl.getAttribute('style'));
    // Move children
    while (listEl.firstChild) newList.appendChild(listEl.firstChild);
    // Replace in DOM
    listEl.parentNode.insertBefore(newList, listEl);
    listEl.parentNode.removeChild(listEl);
    // Place caret in last item for stability
    const li = newList.lastElementChild || newList;
    this.placeCaretAtEnd(li);
    return newList;
  }

  /** Apply list styling for UL/OL */
  applyListStyle(list, type, style) {
    if (!list) return;
    // Clear previous specifics
    list.removeAttribute('type');
    if (style) {
      if (type === 'ul') {
        list.style.listStyleType = style; // disc, circle, square
      } else if (type === 'ol') {
        const typeAttr = this.mapOrderedType(style);
        if (typeAttr) list.setAttribute('type', typeAttr); // 1,a,A,i,I
        list.style.listStyleType = style; // decimal, lower-alpha, upper-alpha, lower-roman, upper-roman
      }
    }
  }

  /** Create a dropdown header element */
  createHeader(text) {
    const li = document.createElement('li');
    const header = document.createElement('h6');
    header.className = 'dropdown-header';
    header.textContent = text;
    li.appendChild(header);
    return li;
  }

  /** Create a dropdown divider element */
  createDivider() {
    const li = document.createElement('li');
    const hr = document.createElement('hr');
    hr.className = 'dropdown-divider';
    li.appendChild(hr);
    return li;
  }

  /** Map CSS ordered list style to HTML type attribute when possible */
  mapOrderedType(style) {
    const map = {
      'decimal': '1',
      'lower-alpha': 'a',
      'upper-alpha': 'A',
      'lower-roman': 'i',
      'upper-roman': 'I'
    };
    return map[style] || null;
  }

  /** Return the closest UL/OL element for current selection */
  getClosestListRoot() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    while (node && node !== this.editor.editable) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName;
        if (tag === 'UL' || tag === 'OL') return node;
      }
      node = node.parentElement;
    }
    return null;
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
