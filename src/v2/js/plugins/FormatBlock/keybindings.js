/**
 * Keybindings for FormatBlock Plugin
 */

import { applyHeading } from './heading.js';
import { applyParagraph } from './paragraph.js';
import { toggleSubscript, toggleSuperscript } from './subsup.js';
import { toggleHighlight } from './highlight.js';

/**
 * Register keyboard shortcuts for format block actions
 * @param {Object} plugin - Plugin instance with addShortcut method
 */
export function registerKeybindings(plugin) {
  // Heading shortcuts: Ctrl+Alt+1 through Ctrl+Alt+6
  for (let i = 1; i <= 6; i++) {
    plugin.addShortcut(`Ctrl+Alt+${i}`, () => {
      applyHeading(i);
      plugin.updateButtonState();
      plugin.emitEvent('heading-changed', { level: i });
    });
  }

  // Paragraph: Ctrl+Alt+0
  plugin.addShortcut('Ctrl+Alt+0', () => {
    applyParagraph();
    plugin.updateButtonState();
    plugin.emitEvent('heading-changed', { level: 0 });
  });

  // Subscript: Ctrl+=
  plugin.addShortcut('Ctrl+=', () => {
    toggleSubscript();
    plugin.updateButtonState();
    plugin.emitEvent('subscript-toggled');
  });

  // Superscript: Ctrl+Shift+=
  plugin.addShortcut('Ctrl+Shift+=', () => {
    toggleSuperscript();
    plugin.updateButtonState();
    plugin.emitEvent('superscript-toggled');
  });

  // Highlight: Ctrl+H
  plugin.addShortcut('Ctrl+H', () => {
    toggleHighlight();
    plugin.updateButtonState();
    plugin.emitEvent('highlight-toggled');
  });
}
