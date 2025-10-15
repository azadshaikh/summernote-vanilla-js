/**
 * Strikethrough Plugin - Applies strikethrough formatting to selected text
 * Keyboard shortcut: Ctrl+Shift+S (Windows/Linux) or Cmd+Shift+S (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class StrikethroughPlugin extends BasePlugin {
  static pluginName = 'strikethrough';
  static dependencies = [];

  /**
   * Initialize the Strikethrough plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'strikethrough',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-type-strikethrough" viewBox="0 0 16 16">
  <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.8 2.8 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967"/>
</svg>`,
      tooltip: 'Strikethrough (Ctrl+Shift+S)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-strikethrough'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+Shift+S', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle strikethrough formatting
   */
  toggle() {
    this.execCommand('strikeThrough');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('strikethrough');
    if (!button || !button.element) return;

    const isActive = document.queryCommandState('strikeThrough');

    if (isActive) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Clean up when plugin is destroyed
   */
  destroy() {
    // Base class handles button removal and event cleanup
    super.destroy();
  }
}
