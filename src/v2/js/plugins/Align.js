/**
 * Align Plugin - Provides text alignment and indentation controls
 * Keyboard shortcuts (same as v1):
 *  - Ctrl+Shift+L: Align Left
 *  - Ctrl+Shift+E: Align Center
 *  - Ctrl+Shift+R: Align Right
 *  - Ctrl+Shift+J: Justify
 *  - Ctrl+[: Outdent
 *  - Ctrl+]: Indent
 */

import BasePlugin from '../core/BasePlugin.js';

export default class AlignPlugin extends BasePlugin {
  static pluginName = 'align';
  static dependencies = [];

  init() {
    this.currentAlign = null;

    // Add align button with dropdown
    this.addButton({
      name: 'align',
      icon: this.getAlignIcon('left'),
      tooltip: 'Alignment',
      callback: () => {}, // Bootstrap handles dropdown
      className: 'asteronote-btn-align dropdown-toggle'
    });

    // Add Bootstrap dropdown attributes to button
    const button = this.buttons.get('align');
    if (button && button.element) {
      button.element.setAttribute('data-bs-toggle', 'dropdown');
      button.element.setAttribute('aria-expanded', 'false');
    }

    // Create dropdown menu
    this.createDropdown();

    // Keyboard shortcuts (match v1)
    this.addShortcut('Ctrl+Shift+L', () => this.applyAlign('left'));
    this.addShortcut('Ctrl+Shift+E', () => this.applyAlign('center'));
    this.addShortcut('Ctrl+Shift+R', () => this.applyAlign('right'));
    this.addShortcut('Ctrl+Shift+J', () => this.applyAlign('justify'));
    this.addShortcut('Ctrl+[', () => this.outdent());
    this.addShortcut('Ctrl+]', () => this.indent());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Build dropdown for alignment + indentation
   */
  createDropdown() {
    const button = this.buttons.get('align');
    if (!button || !button.element) return;

    // Wrap button in btn-group
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    button.element.parentNode.insertBefore(btnGroup, button.element);
    btnGroup.appendChild(button.element);

    // Menu container
    this.dropdown = document.createElement('ul');
    this.dropdown.className = 'dropdown-menu';

    // Alignment options
    const items = [
      { key: 'left', label: 'Align Left', icon: '<i class="ri-align-left"></i>' },
      { key: 'center', label: 'Align Center', icon: '<i class="ri-align-center"></i>' },
      { key: 'right', label: 'Align Right', icon: '<i class="ri-align-right"></i>' },
      { key: 'justify', label: 'Justify', icon: '<i class="ri-align-justify"></i>' },
      { key: 'divider' },
      { key: 'outdent', label: 'Outdent', icon: '<i class="ri-indent-decrease"></i>' },
      { key: 'indent', label: 'Indent', icon: '<i class="ri-indent-increase"></i>' }
    ];

    items.forEach(({ key, label, icon }) => {
      const li = document.createElement('li');
      if (key === 'divider') {
        const hr = document.createElement('hr');
        hr.className = 'dropdown-divider';
        li.appendChild(hr);
        this.dropdown.appendChild(li);
        return;
      }

      const item = document.createElement('button');
      item.className = 'dropdown-item d-flex align-items-center';
      item.type = 'button';
      item.innerHTML = `
        <span class="me-2" style="min-width: 24px;">${icon}</span>
        <span>${label}</span>
      `;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        if (key === 'indent') return this.indent();
        if (key === 'outdent') return this.outdent();
        this.applyAlign(key);
      });

      li.appendChild(item);
      this.dropdown.appendChild(li);
    });

    btnGroup.appendChild(this.dropdown);
  }

  /**
   * Apply alignment via execCommand
   */
  applyAlign(type) {
    const cmdMap = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    const cmd = cmdMap[type];
    if (!cmd) return;
    this.execCommand(cmd);
    this.emitEvent('align', { value: type });
    this.updateButtonState();
  }

  indent() {
    this.execCommand('indent');
    this.emitEvent('indented');
  }

  outdent() {
    this.execCommand('outdent');
    this.emitEvent('outdented');
  }

  /**
   * Determine current alignment from selection
   */
  getCurrentAlignment() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    while (node && node !== this.editor.editable) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        let ta = (style.textAlign || '').toLowerCase();
        if (ta === 'start') ta = 'left';
        if (ta === 'end') ta = 'right';
        if (ta === 'left' || ta === 'center' || ta === 'right' || ta === 'justify') {
          return ta;
        }
      }
      node = node.parentElement;
    }
    return 'left';
  }

  /**
   * Update toolbar button icon and state
   */
  updateButtonState() {
    const button = this.buttons.get('align');
    if (!button || !button.element) return;
    const align = this.getCurrentAlignment();
    if (align !== this.currentAlign) {
      this.currentAlign = align;
      button.element.innerHTML = this.getAlignIcon(align || 'left');
    }
    // Active if not left (i.e., center/right/justify)
    if (align && align !== 'left') button.element.classList.add('active');
    else button.element.classList.remove('active');
  }

  getAlignIcon(type) {
    const map = {
      left: 'ri-align-left',
      center: 'ri-align-center',
      right: 'ri-align-right',
      justify: 'ri-align-justify'
    };
    const cls = map[type] || map.left;
    return `<i class="${cls}"></i>`;
  }

  destroy() {
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }
    super.destroy();
  }
}

