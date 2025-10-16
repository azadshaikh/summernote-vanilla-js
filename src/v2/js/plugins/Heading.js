/**
 * Heading Plugin - Applies heading styles (H1-H6)
 * Displays dropdown menu with heading options
 * Updates button icon to show current heading level
 */

import BasePlugin from '../core/BasePlugin.js';

export default class HeadingPlugin extends BasePlugin {
  static pluginName = 'heading';
  static dependencies = [];

  /**
   * Initialize the Heading plugin
   */
  init() {
    this.currentHeading = null;

    // Add heading button with dropdown
    this.addButton({
      name: 'heading',
      icon: this.getHeadingIcon('H'),
      tooltip: 'Heading',
      callback: () => {}, // No callback needed, Bootstrap handles it
      className: 'asteronote-btn-heading dropdown-toggle'
    });

    // Add Bootstrap dropdown attributes to button
    const button = this.buttons.get('heading');
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

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Get SVG icon for heading
   */
  getHeadingIcon(level) {
    const ri = {
      'H': 'ri-heading',
      'H1': 'ri-h-1',
      'H2': 'ri-h-2',
      'H3': 'ri-h-3',
      'H4': 'ri-h-4',
      'H5': 'ri-h-5',
      'H6': 'ri-h-6'
    };
    const cls = ri[level] || ri['H'];
    return `<i class="${cls}"></i>`;
  }

  /**
   * Create dropdown menu
   */
  createDropdown() {
    const button = this.buttons.get('heading');
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

    // Heading options
    const headings = [
      { level: 1, label: 'Heading 1', tag: 'H1' },
      { level: 2, label: 'Heading 2', tag: 'H2' },
      { level: 3, label: 'Heading 3', tag: 'H3' },
      { level: 4, label: 'Heading 4', tag: 'H4' },
      { level: 5, label: 'Heading 5', tag: 'H5' },
      { level: 6, label: 'Heading 6', tag: 'H6' },
      { level: 0, label: 'Normal text', tag: 'P' }
    ];

    headings.forEach(({ level, label, tag }) => {
      const li = document.createElement('li');
      const item = document.createElement('button');
      item.className = 'dropdown-item d-flex align-items-center';
      item.type = 'button';
      item.innerHTML = `
        <span class="me-2" style="min-width: 24px; font-weight: bold;">${tag}</span>
        <span>${label}</span>
      `;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyHeading(level);
      });

      li.appendChild(item);
      this.dropdown.appendChild(li);
    });

    // Append dropdown to btn-group
    btnGroup.appendChild(this.dropdown);
  }

  /**
   * Apply heading format
   */
  applyHeading(level) {
    if (level === 0) {
      // Convert to paragraph
      document.execCommand('formatBlock', false, '<p>');
    } else {
      // Apply heading level
      document.execCommand('formatBlock', false, `<h${level}>`);
    }

    this.updateButtonState();
    this.emitEvent('heading-changed', { level });
  }

  /**
   * Get current heading level at cursor
   */
  getCurrentHeadingLevel() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    let node = sel.anchorNode;
    if (!node) return null;

    // Walk up the DOM tree to find heading
    while (node && node !== this.editor.editable) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName;
        if (tagName && tagName.match(/^H[1-6]$/)) {
          return parseInt(tagName.charAt(1));
        }
      }
      node = node.parentNode;
    }

    return null;
  }

  /**
   * Update button icon based on current heading
   */
  updateButtonState() {
    const button = this.buttons.get('heading');
    if (!button || !button.element) return;

    const level = this.getCurrentHeadingLevel();

    if (level !== this.currentHeading) {
      this.currentHeading = level;

      // Update button icon with full structure
      const iconLabel = level ? `H${level}` : 'H';
      button.element.innerHTML = this.getHeadingIcon(iconLabel);

      // Update active state
      if (level) {
        button.element.classList.add('active');
      } else {
        button.element.classList.remove('active');
      }
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }
    document.removeEventListener('click', this.handleOutsideClick);
    console.log('Heading plugin destroyed');
    super.destroy();
  }
}
