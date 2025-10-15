/**
 * Bold Plugin - Applies bold formatting to selected text
 * Keyboard shortcut: Ctrl+B (Windows/Linux) or Cmd+B (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class BoldPlugin extends BasePlugin {
  static pluginName = 'bold';
  static dependencies = [];

  /**
   * Initialize the Bold plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'bold',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-type-bold" viewBox="0 0 16 16">
  <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
</svg>
`,
      tooltip: 'Bold (Ctrl+B)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-bold'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+B', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle bold formatting
   */
  toggle() {
    this.execCommand('bold');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('bold');
    if (!button || !button.element) return;

    const isBold = document.queryCommandState('bold');

    if (isBold) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Bold plugin destroyed');
    super.destroy();
  }
}
