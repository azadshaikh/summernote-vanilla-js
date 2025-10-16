/**
 * Code View Plugin - Toggle raw HTML editing view (like v1)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class CodeViewPlugin extends BasePlugin {
  static pluginName = 'codeview';
  static dependencies = [];

  init() {
    this.active = false;
    this.codable = null; // <textarea> for raw HTML (editor)
    this.preview = null; // <pre><code> preview with Prism
    this.container = null; // wrapper for codeview UI
    this._resizeObserver = null; // observes editable height changes

    // Add toolbar button
    this.addButton({
      name: 'codeview',
      icon: '<i class="ri-code-box-line"></i>',
      tooltip: 'Code View',
      callback: () => this.toggle(),
      className: 'asteronote-btn-codeview'
    });

    // Update active state on init
    setTimeout(() => this.updateButtonState(), 0);
  }

  toggle() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    if (this.active) return;
    const html = this.editor.getContent();

    // Hide WYSIWYG area
    if (this.editor.editable) {
      this.editor.editable.style.display = 'none';
    }

    // Build single-surface codeview (textarea editor over Prism-highlighted layer)
    this.container = document.createElement('div');
    // Single hook class; visual/layout handled in CSS
    this.container.className = 'asteronote-code-view';
    // Set initial height to match current editable height for a seamless toggle (behavioral)
    const editableHeight = this.getEditableHeight();
    if (editableHeight) {
      this.container.style.height = `${editableHeight}px`;
    }

    // Highlight layer (behind)
    const pre = document.createElement('pre');
    // Use Prism language class per request
    pre.className = 'language-html';

    const code = document.createElement('code');
    code.className = 'language-html';
    code.textContent = html;
    pre.appendChild(code);

    this.preview = code;

    // Editable textarea (front)
    this.codable = document.createElement('textarea');
    // Input surface; style via CSS, not here
    this.codable.className = 'asteronote-code-view-input';
    this.codable.value = html;
    this.codable.spellcheck = false;

    // Assemble
    this.container.appendChild(pre);
    this.container.appendChild(this.codable);
    this.editor.wrapper.insertBefore(this.container, this.editor.editable);

    // Keep codeview height synced with editable dynamically
    this.observeEditableResize();

    // Sync highlight and scroll
    const syncHighlight = () => {
      if (!this.preview) return;
      this.preview.textContent = this.codable.value;
      if (window.Prism && typeof window.Prism.highlightElement === 'function') {
        window.Prism.highlightElement(this.preview);
      }
      this.emitEvent('change', { length: this.codable.value.length });
    };
    const syncScroll = () => {
      // Keep pre element scrolled to mirror textarea
      pre.scrollTop = this.codable.scrollTop || 0;
      pre.scrollLeft = this.codable.scrollLeft || 0;
    };

    this.codable.addEventListener('input', syncHighlight);
    this.codable.addEventListener('scroll', syncScroll);
    this.codable.addEventListener('blur', () => {
      this.emitEvent('blur', { length: this.codable.value.length });
    });
    // Initial render
    syncHighlight();
    syncScroll();

    this.active = true;
    this.updateButtonState();
    this.emitEvent('toggled', { active: true });
    this.editor.emit('asteronote.selectionchange');
    this.codable.focus();
  }

  deactivate() {
    if (!this.active) return;

    const newHtml = this.codable ? this.codable.value : '';

    // Remove codeview UI and show WYSIWYG
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    // Stop observing size changes
    this.unobserveEditableResize();

    this.container = null;
    this.preview = null;
    this.codable = null;

    if (this.editor.editable) {
      this.editor.editable.style.display = '';
    }

    // Apply content back to editor
    this.editor.setContent(newHtml);

    this.active = false;
    this.updateButtonState();
    this.emitEvent('toggled', { active: false });
    this.editor.emit('asteronote.change', this.editor.getContent());
    this.editor.focus();
  }

  updateButtonState() {
    const button = this.buttons.get('codeview');
    if (!button || !button.element) return;
    if (this.active) button.element.classList.add('active');
    else button.element.classList.remove('active');
  }

  destroy() {
    // Ensure we leave codeview cleanly
    if (this.active) {
      this.deactivate();
    }
    super.destroy();
  }

  /**
   * Get current height of the editable area in pixels
   */
  getEditableHeight() {
    if (!this.editor || !this.editor.editable) return 0;
    const el = this.editor.editable;
    // Prefer explicit height style if set
    const cs = window.getComputedStyle(el);
    const h = parseFloat(cs.height);
    if (!Number.isNaN(h) && h > 0) return h;
    // Fallbacks
    return el.offsetHeight || el.clientHeight || 0;
  }

  /**
   * Observe editable for size changes and sync container height
   */
  observeEditableResize() {
    if (!('ResizeObserver' in window) || !this.editor || !this.editor.editable) return;
    this._resizeObserver = new ResizeObserver(() => {
      if (!this.container) return;
      const h = this.getEditableHeight();
      if (h > 0) this.container.style.height = `${h}px`;
    });
    try { this._resizeObserver.observe(this.editor.editable); } catch (e) { /* ignore */ }
  }

  /**
   * Disconnect resize observer
   */
  unobserveEditableResize() {
    if (this._resizeObserver) {
      try { this._resizeObserver.disconnect(); } catch (e) { /* noop */ }
      this._resizeObserver = null;
    }
  }
}
