/**
 * Redo Plugin - Redo the last undone action
 * Keyboard shortcut: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class RedoPlugin extends BasePlugin {
  static pluginName = 'redo';
  static dependencies = [];

  /**
   * Initialize the Redo plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'redo',
      icon: '<i class="ri-arrow-go-forward-line"></i>',
      tooltip: 'Redo (Ctrl+Y)',
      callback: () => this.redo(),
      className: 'asteronote-btn-redo'
    });

    // Add keyboard shortcuts
    this.addShortcut('Ctrl+Y', () => this.redo());
    this.addShortcut('Ctrl+Shift+Z', () => this.redo()); // Alternative shortcut

    // Listen to input changes to update button state
    this.on('asteronote.change', () => this.updateButtonState());
    this.on('asteronote.keyup', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Perform redo action
   */
  redo() {
    if (!this.editor.history) {
      console.warn('History manager not initialized');
      return;
    }

    const success = this.editor.history.redo();
    
    if (success) {
      this.updateButtonState();
      this.emitEvent('executed');
      
      // Emit change event to update other plugins
      this.editor.emit('asteronote.change');
    }
  }

  /**
   * Update button state (disabled if nothing to redo)
   */
  updateButtonState() {
    const button = this.buttons.get('redo');
    if (!button || !button.element) return;

    // Check if redo is available
    const canRedo = this.editor.history && this.editor.history.canRedo();

    if (canRedo) {
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
    console.log('Redo plugin destroyed');
    super.destroy();
  }
}
