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
    this.dropdownVisible = false;

    // Add heading button with dropdown
    this.addButton({
      name: 'heading',
      icon: this.getHeadingIcon('H'),
      tooltip: 'Heading',
      callback: () => this.toggleDropdown(),
      className: 'asteronote-btn-heading'
    });

    // Create dropdown menu
    this.createDropdown();

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Get SVG icon for heading
   */
  getHeadingIcon(level) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" class="pt-1">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="15" font-weight="700" font-family="system-ui, -apple-system, sans-serif">${level}</text>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" class="bi bi-chevron-down ms-1" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
</svg>`;
  }

  /**
   * Create dropdown menu
   */
  createDropdown() {
    const button = this.buttons.get('heading');
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
      const item = document.createElement('button');
      item.className = 'dropdown-item d-flex align-items-center';
      item.type = 'button';
      item.innerHTML = `
        <span class="me-2" style="min-width: 24px; font-weight: bold;">${tag}</span>
        <span>${label}</span>
      `;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyHeading(level);
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

    const button = this.buttons.get('heading');
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

    const button = this.buttons.get('heading');
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
    const button = this.buttons.get('heading');
    if (!button || !button.element) return;

    if (this.dropdownVisible &&
        !button.element.contains(event.target) &&
        !this.dropdown.contains(event.target)) {
      this.hideDropdown();
    }
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
