/**
 * Undo Plugin - Undo the last action
 * Keyboard shortcut: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class UndoPlugin extends BasePlugin {
  static pluginName = 'undo';
  static dependencies = [];

  /**
   * Initialize the Undo plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'undo',
      icon: '<i class="ri-arrow-go-back-line"></i>',
      tooltip: 'Undo (Ctrl+Z)',
      callback: () => this.undo(),
      className: 'asteronote-btn-undo'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+Z', () => this.undo());

    // Listen to input changes to update button state
    this.on('asteronote.change', () => this.updateButtonState());
    this.on('asteronote.keyup', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Perform undo action
   */
  undo() {
    if (!this.editor.history) {
      console.warn('History manager not initialized');
      return;
    }

    const success = this.editor.history.undo();
    
    if (success) {
      this.updateButtonState();
      this.emitEvent('executed');
      
      // Emit change event to update other plugins
      this.editor.emit('asteronote.change');
    }
  }

  /**
   * Update button state (disabled if nothing to undo)
   */
  updateButtonState() {
    const button = this.buttons.get('undo');
    if (!button || !button.element) return;

    // Check if undo is available
    const canUndo = this.editor.history && this.editor.history.canUndo();

    if (canUndo) {
      button.element.removeAttribute('disabled');
      button.element.classList.remove('disabled');
    } else {
      button.element.setAttribute('disabled', 'true');
      button.element.classList.add('disabled');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    console.log('Undo plugin destroyed');
    super.destroy();
  }
}
