/**
 * Separator Plugin - Displays a vertical divider line in the toolbar
 * Used to visually organize toolbar buttons into groups
 * Can be used multiple times in toolbar configuration
 */

import BasePlugin from '../core/BasePlugin.js';

export default class SeparatorPlugin extends BasePlugin {
  static pluginName = 'separator';
  static dependencies = [];

  /**
   * Initialize the Separator plugin
   */
  init() {
    // Add separator element (not a button)
    this.addSeparator();
  }

  /**
   * Add a vertical separator to the toolbar
   */
  addSeparator() {
    if (!this.editor.toolbar) return;

    // Create separator element using AsteroUI divider-vertical class
    const separator = document.createElement('span');
    separator.className = 'divider-vertical my-1';
    separator.setAttribute('role', 'separator');
    separator.setAttribute('aria-orientation', 'vertical');

    // Append to toolbar
    this.editor.toolbar.appendChild(separator);

    // Store reference for cleanup
    this.separatorElement = separator;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.separatorElement && this.separatorElement.parentNode) {
      this.separatorElement.parentNode.removeChild(this.separatorElement);
    }
    super.destroy();
  }
}
