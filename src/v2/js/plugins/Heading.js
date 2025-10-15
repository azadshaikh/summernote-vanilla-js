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
    const svgMap = {
      'H': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M17 11V4H19V21H17V13H7V21H5V4H7V11H17Z"></path></svg>`,
      'H1': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"></path></svg>`,
      'H2': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"></path></svg>`,
      'H3': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path></svg>`,
      'H4': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM22 8V16H23.5V18H22V20H20V18H14.5V16.66L19.5 8H22ZM20 11.133L17.19 16H20V11.133Z"></path></svg>`,
      'H5': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8V10H17.6769L17.2126 12.6358C17.5435 12.5472 17.8912 12.5 18.25 12.5C20.4591 12.5 22.25 14.2909 22.25 16.5C22.25 18.7091 20.4591 20.5 18.25 20.5C16.4233 20.5 14.8827 19.2756 14.4039 17.6027L16.3271 17.0519C16.5667 17.8881 17.3369 18.5 18.25 18.5C19.3546 18.5 20.25 17.6046 20.25 16.5C20.25 15.3954 19.3546 14.5 18.25 14.5C17.6194 14.5 17.057 14.7918 16.6904 15.2478L14.8803 14.3439L16 8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path></svg>`,
      'H6': `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M21.097 8L18.499 12.5C20.7091 12.5 22.5 14.2909 22.5 16.5C22.5 18.7091 20.7091 20.5 18.5 20.5C16.2909 20.5 14.5 18.7091 14.5 16.5C14.5 15.7636 14.699 15.0737 15.0461 14.4811L18.788 8H21.097ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 14.5C17.3954 14.5 16.5 15.3954 16.5 16.5C16.5 17.6046 17.3954 18.5 18.5 18.5C19.6046 18.5 20.5 17.6046 20.5 16.5C20.5 15.3954 19.6046 14.5 18.5 14.5Z"></path></svg>`
    };

    const svg = svgMap[level] || svgMap['H'];
    return `${svg}<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" class="bi bi-chevron-down ms-1" viewBox="0 0 16 16">
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
