/**
 * Italic Plugin - Applies italic formatting to selected text
 * Keyboard shortcut: Ctrl+I (Windows/Linux) or Cmd+I (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class ItalicPlugin extends BasePlugin {
  static pluginName = 'italic';
  static dependencies = [];

  /**
   * Initialize the Italic plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'italic',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" class="bi bi-type-italic" viewBox="0 0 16 16">
  <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
</svg>`,
      tooltip: 'Italic (Ctrl+I)',
      callback: () => this.toggle(),
      className: 'asteronote-btn-italic'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+I', () => this.toggle());

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle italic formatting
   */
  toggle() {
    this.execCommand('italic');
    this.updateButtonState();
    this.emitEvent('toggled');
  }

  /**
   * Update button active state based on current selection
   */
  updateButtonState() {
    const button = this.buttons.get('italic');
    if (!button || !button.element) return;

    const isItalic = document.queryCommandState('italic');

    if (isItalic) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Italic plugin destroyed');
    super.destroy();
  }
}
