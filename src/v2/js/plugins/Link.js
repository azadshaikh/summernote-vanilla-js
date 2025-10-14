/**
 * Link Plugin - Creates and manages hyperlinks
 * Keyboard shortcut: Ctrl+K (Windows/Linux) or Cmd+K (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';
import { createElement } from '../core/dom.js';

export default class LinkPlugin extends BasePlugin {
  static pluginName = 'link';
  static dependencies = [];

  init() {
    this.dialog = null;
    this.backdrop = null;
    this.savedRange = null;

    // Toolbar button with Bootstrap Icon
    this.addButton({
      name: 'createLink',
      icon: '<i class="bi bi-link-45deg"></i>',
      tooltip: 'Insert Link (Ctrl+K)',
      callback: () => this.showLinkDialog(),
      className: 'summernote-btn-link'
    });

    this.addShortcut('Ctrl+K', () => this.showLinkDialog());

    // Keep state in sync
    this.on('summernote.keyup', () => this.updateButtonState());
    this.on('summernote.mouseup', () => this.updateButtonState());
    this.on('summernote.selectionchange', () => this.updateButtonState());
    setTimeout(() => this.updateButtonState(), 0);
  }

  showLinkDialog() {
    // Ensure we have a valid caret/range inside editor
    this.ensureFocusAndRange();
    this.savedRange = this.saveRange();
    const existing = this.getLinkAtCursor();
    const existingUrl = existing ? existing.href : '';
    const existingText = existing ? existing.textContent : '';

    if (!this.dialog) this.createDialog();

    const urlInput = this.dialog.querySelector('#sn-link-url');
    const textInput = this.dialog.querySelector('#sn-link-text');
    urlInput.value = existingUrl;
    textInput.value = existingText || this.getSelectedText();

    // Show minimal Bootstrap-like modal
    this.dialog.style.display = 'block';
    this.dialog.classList.add('show');
    this.ensureBackdrop();
    urlInput.focus();
  }

  hideDialog() {
    if (!this.dialog) return;
    this.dialog.classList.remove('show');
    this.dialog.style.display = 'none';
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    this.backdrop = null;
  }

  createDialog() {
    this.dialog = createElement('div', {
      className: 'modal fade',
      tabIndex: '-1',
      ariaHidden: 'true'
    });

    this.dialog.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Insert Link</h5>
            <button type="button" class="btn-close" aria-label="Close" data-action="cancel"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label" for="sn-link-url">Link URL</label>
              <input type="url" class="form-control" id="sn-link-url" placeholder="https://example.com">
            </div>
            <div class="mb-3">
              <label class="form-label" for="sn-link-text">Link Text</label>
              <input type="text" class="form-control" id="sn-link-text" placeholder="Link text">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="cancel">Cancel</button>
            <button type="button" class="btn btn-danger" data-action="unlink">Remove Link</button>
            <button type="button" class="btn btn-primary" data-action="insert">Insert</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(this.dialog);

    const on = (action, handler) => {
      const el = this.dialog.querySelector(`[data-action="${action}"]`);
      if (el) el.addEventListener('click', handler);
    };
    on('insert', () => this.insertLink());
    on('cancel', () => this.hideDialog());
    on('unlink', () => this.removeLink());
  }

  insertLink() {
    const urlInput = this.dialog.querySelector('#sn-link-url');
    const textInput = this.dialog.querySelector('#sn-link-text');
    const url = (urlInput.value || '').trim();
    const text = (textInput.value || '').trim();
    if (!url) return;

    // Ensure focus; if we have a saved range use it, else place caret at end
    this.ensureFocusAndRange();
    if (this.savedRange) this.restoreRange(this.savedRange);

    let existing = this.getLinkAtCursor();
    if (existing) {
      existing.href = url;
      if (text) existing.textContent = text;
    } else {
      if (text) {
        const a = document.createElement('a');
        a.href = url;
        a.textContent = text;
        this.insertNode(a);
      } else {
        // No selection and no text: insert a link with URL as text
        const a = document.createElement('a');
        a.href = url;
        a.textContent = url;
        this.insertNode(a);
      }
    }

    this.hideDialog();
    this.editor.focus();
    this.emitEvent('inserted', { url, text });
  }

  removeLink() {
    this.ensureFocusAndRange();
    if (this.savedRange) this.restoreRange(this.savedRange);
    document.execCommand('unlink');
    this.hideDialog();
    this.editor.focus();
    this.emitEvent('removed');
  }

  updateButtonState() {
    const button = this.buttons.get('createLink');
    if (!button || !button.element) return;
    const link = this.getLinkAtCursor();
    button.element.classList.toggle('active', !!link);
  }

  // Utilities
  ensureBackdrop() {
    if (this.backdrop) return;
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(this.backdrop);
  }

  saveRange() {
    const sel = window.getSelection();
    return sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
  }

  restoreRange(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  insertNode(node) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
  }

  getSelectedText() {
    const sel = window.getSelection();
    return sel ? sel.toString().trim() : '';
  }

  getLinkAtCursor() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node) return null;
    if (node.tagName === 'A') return node;
    return node.closest('a');
  }

  destroy() {
    if (this.dialog && this.dialog.parentNode) {
      this.dialog.parentNode.removeChild(this.dialog);
    }
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    this.dialog = null;
    this.backdrop = null;
    super.destroy();
  }
}
