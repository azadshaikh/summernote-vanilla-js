/**
 * FormatBlock Plugin - Comprehensive text formatting plugin
 * Combines heading, paragraph, blockquote, code, small, subscript, and superscript formatting
 */

import BasePlugin from '../../core/BasePlugin.js';
import { createToolbarButtons } from './toolbar.js';
import { registerKeybindings } from './keybindings.js';
import { getCurrentHeadingLevel, getHeadingIcon } from './heading.js';
import { isInsideParagraph } from './paragraph.js';
import { isSmallActive } from './small.js';
import { isSubscriptActive, isSuperscriptActive } from './subsup.js';
import { isBlockquoteActive } from './blockquote.js';
import { isCodeActive } from './code.js';
import { isHighlightActive, getHighlightIcon } from './highlight.js';

export default class FormatBlockPlugin extends BasePlugin {
  static pluginName = 'formatblock';
  static dependencies = [];

  /**
   * Initialize the FormatBlock plugin
   */
  init() {
    this.currentHeading = null;

    // Create toolbar UI
    createToolbarButtons(this);

    // Register keyboard shortcuts
    registerKeybindings(this);

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Update button state based on current selection
   * Keep toolbar icon static, but update active state on dropdown items
   */
  updateButtonState() {
    if (!this.dropdown) return;

    // Get all current active states
    const headingLevel = getCurrentHeadingLevel(this.editor.editable);
    const isBlockquote = isBlockquoteActive();
    const isCode = isCodeActive();
    const isHighlight = isHighlightActive();
    const isSmall = isSmallActive();
    const isSubscript = isSubscriptActive();
    const isSuperscript = isSuperscriptActive();

    // Remove all active classes and styles from dropdown items
    const allItems = this.dropdown.querySelectorAll('.dropdown-item');
    allItems.forEach(item => {
      item.classList.remove('active');
      item.style.fontWeight = '';
      // Remove underline from text spans
      const textSpans = item.querySelectorAll('span');
      textSpans.forEach(span => {
        span.style.textDecoration = '';
      });
    });

    // Helper function to apply active styling
    const applyActiveStyle = (item) => {
      if (!item) return;
      item.classList.add('active');
      item.style.fontWeight = '600';
      // Apply underline only to text spans, not icons
      const textSpans = item.querySelectorAll('span');
      textSpans.forEach(span => {
        span.style.textDecoration = 'underline';
      });
    };

    // Add active class and underline to currently active formats
    if (headingLevel) {
      const headingItem = this.dropdown.querySelector(`[data-format="h${headingLevel}"]`);
      applyActiveStyle(headingItem);
    }

    if (isBlockquote) {
      const blockquoteItem = this.dropdown.querySelector('[data-format="blockquote"]');
      applyActiveStyle(blockquoteItem);
    }

    if (isCode) {
      const codeItem = this.dropdown.querySelector('[data-format="code"]');
      applyActiveStyle(codeItem);
    }

    if (isHighlight) {
      const highlightItem = this.dropdown.querySelector('[data-format="highlight"]');
      applyActiveStyle(highlightItem);
    }

    if (isSmall) {
      const smallItem = this.dropdown.querySelector('[data-format="small"]');
      applyActiveStyle(smallItem);
    }

    if (isSubscript) {
      const subscriptItem = this.dropdown.querySelector('[data-format="subscript"]');
      applyActiveStyle(subscriptItem);
    }

    if (isSuperscript) {
      const superscriptItem = this.dropdown.querySelector('[data-format="superscript"]');
      applyActiveStyle(superscriptItem);
    }

    // If nothing is active, mark paragraph as active
    if (!headingLevel && !isBlockquote && !isCode && !isHighlight && !isSmall && !isSubscript && !isSuperscript) {
      const paragraphItem = this.dropdown.querySelector('[data-format="paragraph"]');
      applyActiveStyle(paragraphItem);
    }
  }

  /**
   * Destroy plugin and clean up
   */
  destroy() {
    // Remove dropdown if exists
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }

    super.destroy();
  }
}
