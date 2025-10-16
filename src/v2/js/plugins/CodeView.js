/**
 * Code View Plugin - Toggle raw HTML editing view using Monaco Editor (lazy-loaded)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class CodeViewPlugin extends BasePlugin {
  static pluginName = 'codeview';
  static dependencies = [];

  init() {
    this.active = false;
    this.monacoEditor = null; // Monaco editor instance
    this.monacoContainer = null; // DOM node for Monaco
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

    // Build codeview container
    this.container = document.createElement('div');
    this.container.className = 'asteronote-code-view';
    const editableHeight = this.getEditableHeight();
    if (editableHeight) this.container.style.height = `${editableHeight}px`;

    // Insert container and observe size
    this.editor.wrapper.insertBefore(this.container, this.editor.editable);
    this.observeEditableResize();

    // Lazy-load Monaco and initialize editor
    this.loadMonaco()
      .then(() => this.buildMonacoEditor(html))
      .catch(() => this.buildTextareaFallback(html))
      .finally(() => {
        this.active = true;
        this.updateButtonState();
        this.emitEvent('toggled', { active: true });
        this.editor.emit('asteronote.selectionchange');
        if (this.monacoEditor && typeof this.monacoEditor.focus === 'function') {
          this.monacoEditor.focus();
        } else if (this.codable && typeof this.codable.focus === 'function') {
          this.codable.focus();
        }
      });
  }

  /**
   * Ensure Monaco is available. Loads AMD loader and editor on demand.
   * Returns a Promise that resolves when window.monaco.editor is ready.
   */
  loadMonaco() {
    const loaderUrl = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.min.js';
    const vsBase = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs';

    const ready = () => new Promise((resolve, reject) => {
      if (window.monaco && window.monaco.editor) return resolve();
      if (typeof window.require !== 'function') return reject(new Error('AMD loader missing'));

      try {
        if (window.require && window.require.config) {
          window.require.config({ paths: { vs: vsBase } });
        }
        window.MonacoEnvironment = window.MonacoEnvironment || {};
        window.MonacoEnvironment.getWorkerUrl = function () {
          return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`
            self.MonacoEnvironment = { baseUrl: '${vsBase.replace(/\//g, '\\/')}/../' };
            importScripts('${vsBase}/base/worker/workerMain.js');
          `);
        };

        window.require(['vs/editor/editor.main'], () => resolve());
      } catch (e) { reject(e); }
    });

    // If already present, no load required
    if (window.monaco && window.monaco.editor) {
      return Promise.resolve();
    }

    // Ensure AMD loader present; if not, inject it first
    if (typeof window.require !== 'function') {
      return this.injectScript(loaderUrl).then(() => ready());
    }

    return ready();
  }

  injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load script: ' + src));
      document.head.appendChild(s);
    });
  }

  buildMonacoEditor(html) {
    const mount = document.createElement('div');
    mount.className = 'asteronote-monaco';
    mount.style.width = '100%';
    mount.style.height = '100%';
    this.container.appendChild(mount);
    this.monacoContainer = mount;

    const monaco = window.monaco;
    try {
      monaco.editor.setTheme('vs-dark');
    } catch (_) {}

    this.monacoEditor = monaco.editor.create(mount, {
      value: html || '',
      language: 'html',
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: 'on',
      wordWrap: 'on',
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false
    });
    this.monacoEditor.onDidChangeModelContent(() => {
      this.emitEvent('change', { length: this.monacoEditor.getValue().length });
    });
    this.monacoEditor.onDidBlurEditorText(() => {
      this.emitEvent('blur', { length: this.monacoEditor.getValue().length });
    });
  }

  /** Minimal non-Prism fallback: plain textarea if Monaco fails to load */
  buildTextareaFallback(html) {
    const ta = document.createElement('textarea');
    ta.value = html || '';
    ta.style.width = '100%';
    ta.style.height = '100%';
    // Insert 4 spaces on Tab key
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const val = ta.value;
        const insert = '    ';
        ta.value = val.slice(0, start) + insert + val.slice(end);
        const pos = start + insert.length;
        ta.selectionStart = ta.selectionEnd = pos;
        this.emitEvent('change', { length: ta.value.length });
      }
    });
    ta.addEventListener('input', () => this.emitEvent('change', { length: ta.value.length }));
    ta.addEventListener('blur', () => this.emitEvent('blur', { length: ta.value.length }));
    this.container.appendChild(ta);
    this.codable = ta;
  }

  deactivate() {
    if (!this.active) return;

    let newHtml = '';
    if (this.monacoEditor) {
      try { newHtml = this.monacoEditor.getValue(); } catch (_) { newHtml = ''; }
    } else {
      newHtml = this.codable ? this.codable.value : '';
    }

    // Remove codeview UI and show WYSIWYG
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    // Stop observing size changes
    this.unobserveEditableResize();

    if (this.monacoEditor) {
      try { this.monacoEditor.dispose(); } catch (_) {}
    }
    this.monacoEditor = null;
    this.monacoContainer = null;
    this.container = null;
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
