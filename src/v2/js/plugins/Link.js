/**
 * Link Plugin - Creates and manages hyperlinks
 * Keyboard shortcut: Ctrl+K (Windows/Linux) or Cmd+K (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';
import { createElement } from '../core/dom.js';

export default class LinkPlugin extends BasePlugin {
  static pluginName = 'link';
  static dependencies = [];

  /**
   * Initialize the Link plugin
   */
  init() {
    this.dialog = null;
    this.savedRange = null;

    // Add toolbar button
    this.addButton({
      name: 'createLink',
      icon: '🔗',
      tooltip: 'Insert Link (Ctrl+K)',
      callback: () => this.showLinkDialog(),
      className: 'summernote-btn-link'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+K', () => this.showLinkDialog());

    // Listen to selection changes to update button state
    this.on('summernote.keyup', () => this.updateButtonState());
    this.on('summernote.mouseup', () => this.updateButtonState());

    // Initial button state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Show link insertion dialog
   */
  showLinkDialog() {
    // Save current selection
    this.savedRange = this.saveRange();

    // Check if we're editing an existing link
    const existingLink = this.getLinkAtCursor();
    const existingUrl = existingLink ? existingLink.href : '';
    const existingText = existingLink ? existingLink.textContent : '';

    // Create dialog if it doesn't exist
    if (!this.dialog) {
      this.createDialog();
    }

    // Populate dialog fields
    const urlInput = this.dialog.querySelector('#link-url');
    const textInput = this.dialog.querySelector('#link-text');

    urlInput.value = existingUrl;
    textInput.value = existingText || this.getSelectedText();

    // Show dialog
    this.dialog.style.display = 'block';
    urlInput.focus();
  }

  /**
   * Create link dialog element
   */
  createDialog() {
    this.dialog = createElement('div', {
      className: 'summernote-dialog summernote-link-dialog',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: '10000',
        display: 'none',
        minWidth: '400px'
      }
    });

    // Dialog content
    this.dialog.innerHTML = `
      <h3 style="margin-top: 0;">Insert Link</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Link URL:</label>
        <input type="url" id="link-url" placeholder="https://example.com"
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Link Text:</label>
        <input type="text" id="link-text" placeholder="Link text"
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button type="button" class="btn-cancel"
                style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 3px; cursor: pointer;">
          Cancel
        </button>
        <button type="button" class="btn-insert"
                style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 3px; cursor: pointer;">
          Insert
        </button>
        <button type="button" class="btn-unlink"
                style="padding: 8px 16px; border: none; background: #dc3545; color: white; border-radius: 3px; cursor: pointer;">
          Remove Link
        </button>
      </div>
    `;

    // Attach event listeners
    const btnInsert = this.dialog.querySelector('.btn-insert');
    const btnCancel = this.dialog.querySelector('.btn-cancel');
    const btnUnlink = this.dialog.querySelector('.btn-unlink');
    const urlInput = this.dialog.querySelector('#link-url');

    btnInsert.addEventListener('click', () => this.insertLink());
    btnCancel.addEventListener('click', () => this.hideDialog());
    btnUnlink.addEventListener('click', () => this.removeLink());

    // Handle Enter key in URL input
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.insertLink();
      }
    });

    // Add to document
    document.body.appendChild(this.dialog);
  }

  /**
   * Insert or update link
   */
  insertLink() {
    const urlInput = this.dialog.querySelector('#link-url');
    const textInput = this.dialog.querySelector('#link-text');

    let url = urlInput.value.trim();
    const text = textInput.value.trim();

    if (!url) {
      alert('Please enter a URL');
      urlInput.focus();
      return;
    }

    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      alert('Please enter a valid URL');
      urlInput.focus();
      return;
    }

    // Restore selection
    this.restoreRange(this.savedRange);

    // Check if editing existing link
    const existingLink = this.getLinkAtCursor();

    if (existingLink) {
      // Update existing link
      existingLink.href = url;
      if (text) {
        existingLink.textContent = text;
      }
    } else {
      // Create new link
      if (text) {
        // Insert text and create link
        this.execCommand('insertHTML', `<a href="${url}">${text}</a>`);
      } else {
        // Create link from selection
        this.execCommand('createLink', url);
      }
    }

    this.hideDialog();
    this.editor.focus();
    this.emitEvent('inserted', { url, text });
  }

  /**
   * Remove link at cursor
   */
  removeLink() {
    this.restoreRange(this.savedRange);
    this.execCommand('unlink');
    this.hideDialog();
    this.editor.focus();
    this.emitEvent('removed');
  }

  /**
   * Hide dialog
   */
  hideDialog() {
    if (this.dialog) {
      this.dialog.style.display = 'none';
    }
  }

  /**
   * Get link element at cursor position
   * @returns {HTMLAnchorElement|null}
   */
  getLinkAtCursor() {
    const range = this.getRange();
    if (!range) return null;

    let node = range.commonAncestorContainer;

    // If text node, get parent
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    // Check if node is a link or find closest link
    if (node.tagName === 'A') {
      return node;
    }

    return node.closest('a');
  }

  /**
   * Get selected text
   * @returns {string}
   */
  getSelectedText() {
    const selection = this.getSelection();
    return selection ? selection.toString().trim() : '';
  }

  /**
   * Update button active state
   */
  updateButtonState() {
    const button = this.buttons.get('createLink');
    if (!button || !button.element) return;

    const link = this.getLinkAtCursor();

    if (link) {
      button.element.classList.add('active');
    } else {
      button.element.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    // Remove dialog from DOM
    if (this.dialog && this.dialog.parentNode) {
      this.dialog.parentNode.removeChild(this.dialog);
    }

    console.log('Link plugin destroyed');
    super.destroy();
  }
}
