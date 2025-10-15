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
    this.popover = null;
    this._hideTimer = null;
    this._popoverPinnedUntil = 0;
    this._onDocPointerDown = (e) => this.onDocumentPointerDown(e);
    this._onDialogKeydown = (e) => this.onDialogKeydown(e);

    // Toolbar button with Bootstrap Icon
    this.addButton({
      name: 'createLink',
      icon: '<i class="bi bi-link-45deg"></i>',
      tooltip: 'Insert Link (Ctrl+K)',
      callback: () => this.showLinkDialog(),
      className: 'asteronote-btn-link'
    });

    this.addShortcut('Ctrl+K', () => this.showLinkDialog());
    // Merge typed characters into adjacent links so typing next to a link continues the link
    this.on('asteronote.keydown', (e) => this.maybeMergeTypingIntoAdjacentLink(e));

    // Keep state in sync and manage popover visibility
    const refresh = () => { this.updateButtonState(); this.maybeShowLinkPopover(); };
    this.on('asteronote.keyup', refresh);
    this.on('asteronote.mouseup', refresh);
    this.on('asteronote.selectionchange', refresh);
    setTimeout(() => this.updateButtonState(), 0);

    // Hover popover
    this.createPopover();
    this.bindHoverHandlers();
  }

  showLinkDialog() {
    // Ensure we have a valid caret/range inside editor
    this.ensureFocusAndRange();
    this.savedRange = this.saveRange();
    const existing = this.getLinkAtCursor();
    const existingUrl = existing ? (existing.getAttribute('href') || '') : '';
    const existingText = existing ? existing.textContent : '';

    if (!this.dialog) this.createDialog();

    const urlInput = this.dialog.querySelector('#asteronote-link-url');
    const textInput = this.dialog.querySelector('#asteronote-link-text');
    const targetInput = this.dialog.querySelector('#asteronote-link-target');
    const relInput = this.dialog.querySelector('#asteronote-link-rel');
    urlInput.value = existingUrl;
    textInput.value = existingText || this.getSelectedText();
    if (targetInput) targetInput.value = existing ? (existing.target || '_blank') : '_blank';
    if (relInput) relInput.value = existing ? (existing.rel || 'noopener noreferrer') : 'noopener noreferrer';

    // Show minimal Bootstrap-like modal
    this.dialog.style.display = 'block';
    this.dialog.classList.add('show');
    this.ensureBackdrop();
    // Keyboard handling for Enter (update) and Escape (cancel)
    this.dialog.removeEventListener('keydown', this._onDialogKeydown);
    this.dialog.addEventListener('keydown', this._onDialogKeydown);
    urlInput.focus();
  }

  hideDialog() {
    if (!this.dialog) return;
    this.dialog.removeEventListener('keydown', this._onDialogKeydown);
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small" for="asteronote-link-url">Link URL</label>
              <input type="url" class="form-control" id="asteronote-link-url" placeholder="https://example.com">
            </div>
            <div class="mb-3">
              <label class="form-label small" for="asteronote-link-text">Link Text</label>
              <input type="text" class="form-control" id="asteronote-link-text" placeholder="Link text">
            </div>
            <div class="mb-2">
              <button type="button" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" data-action="toggle-advanced">
                <i class="bi bi-caret-right-fill me-1" data-role="adv-icon"></i>
                Additional Props
              </button>
              <div class="collapse mt-2" id="asteronote-advanced">
                <div class="mb-2">
                  <label class="form-label small" for="asteronote-link-target">Link Target</label>
                  <input type="text" class="form-control" id="asteronote-link-target" placeholder="_blank">
                </div>
                <div class="mb-2">
                  <label class="form-label small" for="asteronote-link-rel">Link rel</label>
                  <input type="text" class="form-control" id="asteronote-link-rel" placeholder="noopener noreferrer">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="cancel">Cancel</button>
            <button type="button" class="btn btn-danger" data-action="unlink">Remove Link</button>
            <button type="button" class="btn btn-primary" data-action="insert">Update Link</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(this.dialog);

    // Delegated interaction inside modal
    this.dialog.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-action');
      if (action === 'insert') this.insertLink();
      if (action === 'cancel') this.hideDialog();
      if (action === 'unlink') this.removeLink();
      if (action === 'toggle-advanced') this.toggleAdvanced();
    });

    // Close when click outside dialog content
    this.dialog.addEventListener('mousedown', (e) => {
      const isOutside = !e.target.closest('.modal-dialog');
      if (isOutside) this.hideDialog();
    });
  }

  insertLink() {
    const urlInput = this.dialog.querySelector('#asteronote-link-url');
    const textInput = this.dialog.querySelector('#asteronote-link-text');
    const targetInput = this.dialog.querySelector('#asteronote-link-target');
    const relInput = this.dialog.querySelector('#asteronote-link-rel');
    const url = (urlInput.value || '').trim();
    const text = (textInput.value || '').trim();
    const target = (targetInput && targetInput.value || '').trim();
    const rel = (relInput && relInput.value || '').trim();
    if (!url) return;

    // Ensure focus; if we have a saved range use it, else place caret at end
    this.ensureFocusAndRange();
    if (this.savedRange) this.restoreRange(this.savedRange);

    // Trim whitespace from selection so spaces aren't included in the link
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const trimmed = this.trimRangeWhitespace(r);
      if (trimmed && !trimmed.collapsed) {
        sel.removeAllRanges();
        sel.addRange(trimmed);
      }
    }

    let existing = this.getLinkAtCursor();
    if (existing) {
      existing.setAttribute('href', url);
      if (text) existing.textContent = text;
      if (target) existing.target = target; else existing.removeAttribute('target');
      if (rel) existing.rel = rel; else existing.removeAttribute('rel');
      // Move caret to end of the updated link
      this._placeCaretAfter(existing);
    } else {
      if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
        // If there is a selection, use execCommand to preserve formatting, then update text if provided
        document.execCommand('createLink', false, url);
        const newLink = this.getLinkAtCursor();
        if (newLink) {
          newLink.setAttribute('href', url);
          if (text) newLink.textContent = text;
          newLink.target = target || '_blank';
          newLink.rel = rel || 'noopener noreferrer';
          this._placeCaretAfter(newLink);
        }
      } else {
        // No selection: insert link node at caret
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.textContent = text || url;
        a.target = target || '_blank';
        a.rel = rel || 'noopener noreferrer';
        this.insertNode(a);
        this._placeCaretAfter(a);
      }
    }

    this.hideDialog();
    this.editor.focus();
    this.emitEvent('inserted', { url, text });
  }

  removeLink() {
    this.ensureFocusAndRange();
    if (this.savedRange) this.restoreRange(this.savedRange);
    // Try native unlink first
    document.execCommand('unlink');
    // If still inside a link, unwrap manually
    const current = this.getLinkAtCursor();
    if (current) {
      const text = document.createTextNode(current.textContent || current.href);
      const parent = current.parentNode;
      parent.replaceChild(text, current);
      const range = document.createRange();
      range.setStartAfter(text);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
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
    this.backdrop.addEventListener('click', () => this.hideDialog());
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

  // Trim whitespace-only edges from a range (text nodes only)
  trimRangeWhitespace(range) {
    const r = range.cloneRange();
    while (r.startContainer && r.startContainer.nodeType === Node.TEXT_NODE) {
      const t = r.startContainer.data || '';
      if (r.startOffset < t.length && /\s/.test(t.charAt(r.startOffset))) r.setStart(r.startContainer, r.startOffset + 1);
      else break;
    }
    while (r.endContainer && r.endContainer.nodeType === Node.TEXT_NODE) {
      const t = r.endContainer.data || '';
      if (r.endOffset > 0 && /\s/.test(t.charAt(r.endOffset - 1))) r.setEnd(r.endContainer, r.endOffset - 1);
      else break;
    }
    return r;
  }

  // If typing next to a link with no space, move caret inside the link
  maybeMergeTypingIntoAdjacentLink(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1) return; // printable only
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return;
    if (this.getLinkAtCursor()) return;

    const left = this._adjacentAnchor(range, 'left');
    const right = this._adjacentAnchor(range, 'right');
    if (left) this._placeCaretAtEdge(left, 'end');
    else if (right) this._placeCaretAtEdge(right, 'start');
  }

  _adjacentAnchor(range, side) {
    const c = range.startContainer;
    let node = null;
    if (c.nodeType === Node.TEXT_NODE) {
      if (side === 'left') {
        if (range.startOffset === 0) node = c.previousSibling;
      } else if (range.startOffset === c.textContent.length) {
        node = c.nextSibling;
      }
    } else {
      const idx = range.startOffset;
      if (side === 'left' && idx > 0) node = c.childNodes[idx - 1];
      if (side === 'right' && idx < c.childNodes.length) node = c.childNodes[idx];
    }
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) return null; // there's text between caret and link
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'A') return node;
      return node.closest ? node.closest('a') : null;
    }
    return null;
  }

  _placeCaretAtEdge(anchor, edge) {
    const r = document.createRange();
    r.selectNodeContents(anchor);
    r.collapse(edge === 'start');
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  _placeCaretAfter(node) {
    if (!node || !node.parentNode) return;
    const r = document.createRange();
    r.setStartAfter(node);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  toggleAdvanced() {
    const adv = this.dialog.querySelector('#asteronote-advanced');
    const icon = this.dialog.querySelector('[data-role="adv-icon"]');
    if (!adv) return;
    const shown = adv.classList.contains('show');
    adv.classList.toggle('show', !shown);
    if (icon) {
      icon.classList.toggle('bi-caret-right-fill', shown);
      icon.classList.toggle('bi-caret-down-fill', !shown);
    }
  }

  createPopover() {
    if (this.popover) return;
    const pop = document.createElement('div');
    pop.className = 'popover bs-popover-auto fade';
    pop.setAttribute('role', 'tooltip');
    pop.style.position = 'fixed';
    pop.style.display = 'none';
    pop.dataset.popperPlacement = 'top';
    pop.innerHTML = `
      <div class="popover-body d-flex align-items-center gap-1 py-1 px-2 small" style="max-width:380px">
        <i class="bi bi-link-45deg"></i><span class="text-truncate" style="max-width:320px" data-role="url"></span>
        <button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1" data-action="open-link" title="Open in new tab">
          <i class="bi bi-box-arrow-up-right"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1" data-action="edit-link" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1" data-action="remove-link" title="Remove">
          <i class="bi bi-trash"></i>
        </button>
      </div>`;
    document.body.appendChild(pop);
    this.popover = pop;

    pop.addEventListener('mouseenter', () => {
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this.pinPopoverFor(600);
    });
    pop.addEventListener('mouseleave', () => this.hidePopoverDelayed(250));
    pop.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'open-link') {
        if (this._hoverLink) {
          const raw = this._hoverLink.getAttribute('href') || '';
          if (raw) window.open(raw, '_blank');
        }
      } else if (action === 'edit-link') {
        if (this._hoverLink) {
          const range = document.createRange();
          range.selectNodeContents(this._hoverLink);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        this.hidePopover();
        this.showLinkDialog();
      } else if (action === 'remove-link') {
        // Remove the hovered link directly
        if (this._hoverLink) {
          const text = document.createTextNode(this._hoverLink.textContent || this._hoverLink.getAttribute('href') || '');
          const parent = this._hoverLink.parentNode;
          const after = this._hoverLink.nextSibling;
          parent.replaceChild(text, this._hoverLink);
          // place caret after removed link text
          const range = document.createRange();
          range.setStartAfter(text);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          this.emitEvent('removed');
          this.hidePopover();
        }
      }
    });
  }

  bindHoverHandlers() {
    const el = this.editor && this.editor.editable;
    if (!el) return;
    el.addEventListener('mouseover', (e) => {
      const a = e.target && e.target.closest('a');
      if (!a || !el.contains(a)) return;
      this.showPopoverFor(a, 'hover');
    });
    el.addEventListener('mouseleave', () => this.hidePopoverDelayed(200));
    // Touch support: show on touchend if caret is in link
    el.addEventListener('touchend', () => this.maybeShowLinkPopover(), { passive: true });
  }

  showPopoverFor(link, trigger = 'hover') {
    this._hoverLink = link;
    const urlSpan = this.popover.querySelector('[data-role="url"]');
    if (urlSpan) urlSpan.textContent = (link.getAttribute('href') || link.textContent || '');
    const linkRect = link.getBoundingClientRect();
    const wrapper = this.editor && this.editor.wrapper ? this.editor.wrapper : document.body;
    const wrapRect = wrapper.getBoundingClientRect();
    const pop = this.popover;
    pop.style.display = 'block';
    pop.classList.add('show');
    // Position relative to wrapper to keep inside editor
    const pw = pop.offsetWidth || 220;
    const ph = pop.offsetHeight || 40;
    let left = linkRect.left - wrapRect.left + (linkRect.width / 2) - (pw / 2);
    // Prefer below; if insufficient space, place above
    const spaceBelow = (wrapRect.bottom - linkRect.bottom);
    const spaceAbove = (linkRect.top - wrapRect.top);
    const placeBelow = spaceBelow >= ph + 8 || spaceBelow >= spaceAbove;
    let top = placeBelow ? (linkRect.bottom - wrapRect.top + 6) : (linkRect.top - wrapRect.top - ph - 6);
    // Clamp within wrapper bounds
    left = Math.max(8, Math.min(left, (wrapRect.width - pw - 8)));
    // Apply absolute positioning within wrapper
    pop.style.position = 'absolute';
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
    pop.dataset.popperPlacement = placeBelow ? 'bottom' : 'top';
    // No arrow used
    // Ensure popover element is attached to wrapper
    if (pop.parentNode !== wrapper) {
      wrapper.appendChild(pop);
    }

    // Pin based on trigger to prevent flicker on mobile
    if (trigger === 'touch') this.pinPopoverFor(2000);
    else if (trigger === 'selection') this.pinPopoverFor(1200);

    // Close when clicking outside
    document.addEventListener('pointerdown', this._onDocPointerDown, true);
  }

  /**
   * Show popover whenever the caret or selection is within a link (mobile friendly)
   */
  maybeShowLinkPopover() {
    const link = this.getLinkAtCursor();
    if (link) {
      this.showPopoverFor(link, 'selection');
    } else {
      this.hidePopover();
    }
  }

  hidePopover() {
    const now = Date.now();
    const remaining = this._popoverPinnedUntil - now;
    if (remaining > 0) {
      this.hidePopoverDelayed(remaining + 50);
      return;
    }
    if (this._hideTimer) clearTimeout(this._hideTimer);
    if (this.popover) {
      this.popover.classList.remove('show');
      this.popover.style.display = 'none';
    }
    this._hoverLink = null;
    this._popoverPinnedUntil = 0;
    document.removeEventListener('pointerdown', this._onDocPointerDown, true);
  }

  hidePopoverDelayed(ms = 150) {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this.hidePopover(), ms);
  }

  pinPopoverFor(ms) {
    const until = Date.now() + ms;
    this._popoverPinnedUntil = Math.max(this._popoverPinnedUntil, until);
  }

  onDocumentPointerDown(e) {
    const pop = this.popover;
    const wrapper = this.editor && this.editor.wrapper;
    if (!pop || !wrapper) return;
    const target = e.target;
    if (pop.contains(target)) return; // clicking inside popover
    if (wrapper.contains(target) && target.closest && target.closest('a')) return; // interacting with link
    this.hidePopover();
  }

  onDialogKeydown(e) {
    const key = e.key;
    if (key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.insertLink();
    } else if (key === 'Escape' || key === 'Esc') {
      e.preventDefault();
      e.stopPropagation();
      this.hideDialog();
    }
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


