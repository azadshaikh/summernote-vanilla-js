/**
 * Summernote Editor v2.0
 * Main editor class - No jQuery dependency
 *
 * @fires summernote.init - Fired when editor is initialized
 * @fires summernote.change - Fired when content changes
 * @fires summernote.focus - Fired when editor receives focus
 * @fires summernote.blur - Fired when editor loses focus
 * @fires summernote.keydown - Fired on keydown in editor
 * @fires summernote.paste - Fired on paste event
 * @fires summernote.destroy - Fired when editor is destroyed
 *
 * Event naming convention:
 * - Core events: summernote.[event]
 * - Plugin events: plugin.[plugin-name].[event]
 *
 * @example
 * // Subscribe to events
 * editor.on('summernote.change', (content) => {
 *   console.log('Content changed:', content);
 * });
 *
 * // One-time subscription
 * editor.once('summernote.init', () => {
 *   console.log('Editor initialized');
 * });
 *
 * // Unsubscribe
 * const handler = (content) => console.log(content);
 * editor.on('summernote.change', handler);
 * editor.off('summernote.change', handler);
 */

import { $, $$, addClass, removeClass, hasClass, createElement, remove } from './dom.js';
import { on, off, trigger, ready } from './events.js';
import EventEmitter from './EventEmitter.js';

/**
 * Default editor configuration
 */
const defaultOptions = {
  height: 300,
  minHeight: null,
  maxHeight: null,
  focus: false,
  toolbar: [
    ['style', ['bold', 'italic', 'underline']],
    ['para', ['ul', 'ol']],
    ['insert', ['link']]
  ],
  placeholder: 'Type something...',
  disableDragAndDrop: false,
  shortcuts: true,
  tabSize: 4,
  callbacks: {}
};

/**
 * Main Editor Class
 */
export default class Editor extends EventEmitter {
  /**
   * Constructor
   * @param {string|Element} target - Target element selector or element
   * @param {Object} options - Editor configuration options
   */
  constructor(target, options = {}) {
    super(); // Initialize EventEmitter

    this.target = typeof target === 'string' ? $(target) : target;

    if (!this.target) {
      throw new Error('Summernote: Target element not found');
    }

    this.options = { ...defaultOptions, ...options };
    this.plugins = new Map();
    this.initialized = false;
    this.editable = null;
    this.toolbar = null;
    this.wrapper = null;

    // Bind methods
    this.handleInput = this.handleInput.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  /**
   * Initialize the editor
   * @fires summernote.init
   */
  init() {
    if (this.initialized) {
      console.warn('Summernote: Editor already initialized');
      return this;
    }

    // Create editor structure
    this.createEditorStructure();

    // Setup event handlers
    this.attachEventHandlers();

    // Set initial content
    const initialContent = this.target.value || this.target.innerHTML || '';
    this.setContent(initialContent);

    // Set placeholder
    if (this.options.placeholder) {
      this.editable.setAttribute('data-placeholder', this.options.placeholder);
    }

    // Focus if specified
    if (this.options.focus) {
      this.focus();
    }

    this.initialized = true;

    // Trigger init callback
    this.triggerCallback('onInit');

    // Emit init event
    this.emit('summernote.init');

    return this;
  }

  /**
   * Create editor DOM structure
   */
  createEditorStructure() {
    // Hide original element
    this.target.style.display = 'none';

    // Create wrapper
    this.wrapper = createElement('div', {
      className: 'summernote-wrapper'
    });

    // Create toolbar container
    this.toolbar = createElement('div', {
      className: 'summernote-toolbar'
    });

    // Create editable area
    this.editable = createElement('div', {
      className: 'summernote-editable',
      contenteditable: 'true',
      style: {
        minHeight: this.options.minHeight ? `${this.options.minHeight}px` : null,
        maxHeight: this.options.maxHeight ? `${this.options.maxHeight}px` : null,
        height: this.options.height ? `${this.options.height}px` : null,
        overflow: 'auto',
        outline: 'none'
      }
    });

    // Build structure
    this.wrapper.appendChild(this.toolbar);
    this.wrapper.appendChild(this.editable);

    // Insert after target
    this.target.parentNode.insertBefore(this.wrapper, this.target.nextSibling);
  }

  /**
   * Attach event handlers to editable area
   */
  attachEventHandlers() {
    on(this.editable, 'input', this.handleInput);
    on(this.editable, 'focus', this.handleFocus);
    on(this.editable, 'blur', this.handleBlur);
    on(this.editable, 'keydown', this.handleKeydown);
    on(this.editable, 'paste', this.handlePaste);
  }

  /**
   * Handle input event
   */
  handleInput(event) {
    this.updateOriginalElement();
    this.triggerCallback('onChange', this.getContent());
    this.emit('summernote.change', this.getContent()); // Use EventEmitter
  }

  /**
   * Handle focus event
   */
  handleFocus(event) {
    addClass(this.wrapper, 'summernote-focused');
    this.triggerCallback('onFocus');
    this.emit('summernote.focus'); // Use EventEmitter
  }

  /**
   * Handle blur event
   */
  handleBlur(event) {
    removeClass(this.wrapper, 'summernote-focused');
    this.updateOriginalElement();
    this.triggerCallback('onBlur');
    this.emit('summernote.blur'); // Use EventEmitter
  }

  /**
   * Handle keydown event
   */
  handleKeydown(event) {
    this.triggerCallback('onKeydown', event);
    this.emit('summernote.keydown', event); // Use EventEmitter

    // Handle shortcuts if enabled
    if (this.options.shortcuts) {
      this.handleShortcuts(event);
    }
  }

  /**
   * Handle paste event
   */
  handlePaste(event) {
    this.triggerCallback('onPaste', event);
    this.emit('summernote.paste', event); // Use EventEmitter
  }

  /**
   * Handle keyboard shortcuts
   */
  handleShortcuts(event) {
    const isMac = /Mac/.test(navigator.platform);
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

    // Tab key handling
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      document.execCommand('insertText', false, '\t');
    }
  }

  /**
   * Get editor content
   * @returns {string} HTML content
   */
  getContent() {
    return this.editable ? this.editable.innerHTML : '';
  }

  /**
   * Set editor content
   * @param {string} content - HTML content to set
   */
  setContent(content) {
    if (this.editable) {
      this.editable.innerHTML = content || '';
      this.updateOriginalElement();
    }
  }

  /**
   * Update original element with current content
   */
  updateOriginalElement() {
    const content = this.getContent();

    if (this.target.tagName === 'TEXTAREA' || this.target.tagName === 'INPUT') {
      this.target.value = content;
    } else {
      this.target.innerHTML = content;
    }
  }

  /**
   * Focus the editor
   */
  focus() {
    if (this.editable) {
      this.editable.focus();
    }
  }

  /**
   * Blur the editor
   */
  blur() {
    if (this.editable) {
      this.editable.blur();
    }
  }

  /**
   * Check if editor is focused
   * @returns {boolean}
   */
  hasFocus() {
    return document.activeElement === this.editable;
  }

  /**
   * Register a plugin
   * @param {string} name - Plugin name
   * @param {Object} plugin - Plugin instance
   */
  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      console.warn(`Summernote: Plugin '${name}' is already registered`);
      return;
    }

    this.plugins.set(name, plugin);

    if (typeof plugin.init === 'function') {
      plugin.init(this);
    }
  }

  /**
   * Get registered plugin
   * @param {string} name - Plugin name
   * @returns {Object|null}
   */
  getPlugin(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Trigger callback function
   * @param {string} name - Callback name
   * @param {...*} args - Arguments to pass to callback
   */
  triggerCallback(name, ...args) {
    const callback = this.options.callbacks[name];
    if (typeof callback === 'function') {
      callback.apply(this, args);
    }
  }

  /**
   * Destroy the editor and cleanup
   * @fires summernote.destroy
   */
  destroy() {
    if (!this.initialized) {
      return;
    }

    // Update original element one last time
    this.updateOriginalElement();

    // Destroy all plugins
    this.plugins.forEach(plugin => {
      if (typeof plugin.destroy === 'function') {
        plugin.destroy();
      }
    });
    this.plugins.clear();

    // Remove event handlers
    off(this.editable, 'input', this.handleInput);
    off(this.editable, 'focus', this.handleFocus);
    off(this.editable, 'blur', this.handleBlur);
    off(this.editable, 'keydown', this.handleKeydown);
    off(this.editable, 'paste', this.handlePaste);

    // Clean up EventEmitter listeners
    this.removeAllListeners();

    // Remove editor structure
    if (this.wrapper && this.wrapper.parentNode) {
      remove(this.wrapper);
    }

    // Show original element
    this.target.style.display = '';

    this.initialized = false;

    // Trigger destroy callback
    this.triggerCallback('onDestroy');

    // Emit destroy event
    this.emit('summernote.destroy');
  }

  /**
   * Static method to initialize editor on selector
   * @param {string} selector - CSS selector
   * @param {Object} options - Editor options
   * @returns {Editor|Editor[]}
   */
  static init(selector = '[data-summernote]', options = {}) {
    const elements = $$(selector);

    if (elements.length === 0) {
      return null;
    }

    if (elements.length === 1) {
      return new Editor(elements[0], options).init();
    }

    return elements.map(el => new Editor(el, options).init());
  }
}

// Auto-initialize on DOM ready
ready(() => {
  const autoInit = $$('[data-summernote]');
  autoInit.forEach(el => {
    const options = {};
    // Read data attributes for configuration
    if (el.dataset.height) options.height = parseInt(el.dataset.height);
    if (el.dataset.placeholder) options.placeholder = el.dataset.placeholder;

    new Editor(el, options).init();
  });
});
