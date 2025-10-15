/**
 * Asteronote Editor v2.0
 * Main editor class - No jQuery dependency
 *
 * @fires asteronote.init - Fired when editor is initialized
 * @fires asteronote.change - Fired when content changes
 * @fires asteronote.focus - Fired when editor receives focus
 * @fires asteronote.blur - Fired when editor loses focus
 * @fires asteronote.keydown - Fired on keydown in editor
 * @fires asteronote.paste - Fired on paste event
 * @fires asteronote.destroy - Fired when editor is destroyed
 *
 * Event naming convention:
 * - Core events: asteronote.[event]
 * - Plugin events: plugin.[plugin-name].[event]
 *
 * @example
 * // Subscribe to events
 * editor.on('asteronote.change', (content) => {
 *   console.log('Content changed:', content);
 * });
 *
 * // One-time subscription
 * editor.once('asteronote.init', () => {
 *   console.log('Editor initialized');
 * });
 *
 * // Unsubscribe
 * const handler = (content) => console.log(content);
 * editor.on('asteronote.change', handler);
 * editor.off('asteronote.change', handler);
 */

import { $, $$, addClass, removeClass, hasClass, createElement, remove } from './dom.js';
import { on, off, trigger, ready } from './events.js';
import EventEmitter from './EventEmitter.js';
import PluginRegistry from './PluginRegistry.js';

/**
 * Default editor configuration
 */
const defaultOptions = {
  height: 300,
  minHeight: null,
  maxHeight: null,
  focus: false,
  // Toolbar: flat array of button names (no grouping)
  // Supports both flat format ['bold', 'italic'] and legacy nested format [['group', ['bold']]]
  toolbar: [
    'bold', 'italic', 'underline', 'strikethrough',
    'removeFormat',
    'list',
    'link'
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
      throw new Error('Asteronote: Target element not found');
    }

    this.options = { ...defaultOptions, ...options };
    this.pluginRegistry = new PluginRegistry();
    this.plugins = new Map(); // Initialized plugin instances
    this.initialized = false;
    this.editable = null;
    this.toolbar = null;
    this.toolbarGroups = new Map();
    this.wrapper = null;

    // Bind methods
    this.handleInput = this.handleInput.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  /**
   * Initialize the editor
   * @fires asteronote.init
   */
  init() {
    if (this.initialized) {
      console.warn('AsteroNote: Editor already initialized');
      return this;
    }

    // Create editor structure
    this.createEditorStructure();

    // Setup event handlers
    this.attachEventHandlers();

    // Initialize plugins if provided in options
    if (this.options.plugins && Array.isArray(this.options.plugins)) {
      this.initializePlugins(this.options.plugins);
    }

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
    this.emit('asteronote.init');

    return this;
  }

  /**
   * Create editor DOM structure
   */
  createEditorStructure() {
    // Hide original element
    this.target.style.display = 'none';

    // Create wrapper (scoped to .asteronote-editor for CSS)
    this.wrapper = createElement('div', {
      className: 'asteronote-editor'
    });

    // Create toolbar container - no button groups, just individual buttons
    this.toolbar = createElement('div', {
      className: 'asteronote-toolbar d-flex flex-wrap',
      role: 'toolbar',
      ariaLabel: 'Editor toolbar'
    });

    this.buildToolbarGroups();

    // Create editable area
    this.editable = createElement('div', {
      className: 'asteronote-editable',
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
   * Build toolbar based on options.toolbar configuration
   * Renders individual buttons without button groups
   */
  buildToolbarGroups() {
    this.toolbarGroups.clear();

    const toolbarConfig = Array.isArray(this.options.toolbar) ? this.options.toolbar : [];

    // Flatten toolbar configuration - can be either nested arrays or flat array
    const actions = [];
    for (const item of toolbarConfig) {
      if (Array.isArray(item)) {
        // Legacy format: [groupName, [action1, action2]]
        if (item.length >= 2 && Array.isArray(item[1])) {
          actions.push(...item[1]);
        } else {
          // Flat nested array
          actions.push(...item);
        }
      } else if (typeof item === 'string') {
        // Direct string action
        actions.push(item);
      }
    }

    // Create individual buttons directly on toolbar (no button groups)
    // Map each action to the toolbar itself
    for (const action of actions) {
      this.toolbarGroups.set(action, this.toolbar);
      // Provide mappings from legacy/short names to command names used by plugins
      if (action === 'ul') this.toolbarGroups.set('insertUnorderedList', this.toolbar);
      if (action === 'ol') this.toolbarGroups.set('insertOrderedList', this.toolbar);
      if (action === 'link') this.toolbarGroups.set('createLink', this.toolbar);
    }
  }

  /**
   * Return the toolbar element for a given action
   * All buttons are added directly to toolbar (no grouping)
   * @param {string} action
   * @returns {HTMLElement|null}
   */
  getToolbarGroupForAction(action) {
    return this.toolbarGroups.get(action) || null;
  }

  /**
   * Attach event handlers to editable area
   */
  attachEventHandlers() {
    on(this.editable, 'input', this.handleInput);
    on(this.editable, 'focus', this.handleFocus);
    on(this.editable, 'blur', this.handleBlur);
    on(this.editable, 'keydown', this.handleKeydown);
    on(this.editable, 'keyup', this.handleKeyup);
    on(this.editable, 'mouseup', this.handleMouseup);
    on(this.editable, 'paste', this.handlePaste);

    // Track selection changes for snappy toolbar state updates
    document.addEventListener('selectionchange', this.handleSelectionChange);
  }

  /**
   * Handle input event
   */
  handleInput(event) {
    this.updateOriginalElement();
    this.triggerCallback('onChange', this.getContent());
    this.emit('asteronote.change', this.getContent()); // Use EventEmitter
  }

  /**
   * Handle focus event
   */
  handleFocus(event) {
    addClass(this.wrapper, 'asteronote-focused');
    this.triggerCallback('onFocus');
    this.emit('asteronote.focus'); // Use EventEmitter
  }

  /**
   * Handle blur event
   */
  handleBlur(event) {
    removeClass(this.wrapper, 'asteronote-focused');
    this.updateOriginalElement();
    this.triggerCallback('onBlur');
    this.emit('asteronote.blur'); // Use EventEmitter
  }

  /**
   * Handle keydown event
   */
  handleKeydown(event) {
    this.triggerCallback('onKeydown', event);
    this.emit('asteronote.keydown', event); // Use EventEmitter

    // Handle shortcuts if enabled
    if (this.options.shortcuts) {
      this.handleShortcuts(event);
    }
  }

  /**
   * Handle keyup event
   */
  handleKeyup(event) {
    this.emit('asteronote.keyup', event);
  }

  /**
   * Handle mouseup event
   */
  handleMouseup(event) {
    this.emit('asteronote.mouseup', event);
  }

  /**
   * Handle paste event
   */
  handlePaste(event) {
    this.triggerCallback('onPaste', event);
    this.emit('asteronote.paste', event); // Use EventEmitter
  }

  /**
   * Handle keyboard shortcuts
   */
  handleShortcuts(event) {
    // Respect handlers that already consumed the event
    if (event.defaultPrevented) return;

    // First, let plugins consume registered shortcuts
    let handled = false;
    if (this.plugins && this.plugins.size > 0) {
      for (const [, plugin] of this.plugins) {
        if (typeof plugin.handleShortcut === 'function' && plugin.handleShortcut(event)) {
          handled = true;
          break;
        }
      }
    }

    if (handled) return; // Plugin handled the key

    // Built-in shortcuts (minimal)
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      document.execCommand('insertText', false, '\t');
      return;
    }
  }

  /**
   * Emit selection change when caret moves inside the editor
   */
  handleSelectionChange() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode;
    if (!anchor) return;
    const within = this.editable && (anchor === this.editable || this.editable.contains(anchor.nodeType === 3 ? anchor.parentElement : anchor));
    if (within) {
      this.emit('asteronote.selectionchange');
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
   * Place caret at the end of the editable area
   */
  placeCaretAtEnd() {
    if (!this.editable) return;
    this.focus();
    const range = document.createRange();
    range.selectNodeContents(this.editable);
    range.collapse(false); // to end
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
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
   * Initialize plugins
   * @param {Array} pluginClasses - Array of plugin classes to register and initialize
   */
  initializePlugins(pluginClasses) {
    // Register all plugins
    pluginClasses.forEach(PluginClass => {
      try {
        this.pluginRegistry.register(PluginClass);
      } catch (error) {
        console.error('Failed to register plugin:', error);
      }
    });

    // Get plugin names to initialize
    const pluginNames = pluginClasses.map(
      PluginClass => PluginClass.pluginName || PluginClass.name
    );

    // Initialize plugins through registry (handles dependencies)
    try {
      this.plugins = this.pluginRegistry.initializePlugins(this, pluginNames);
      console.log(`Initialized ${this.plugins.size} plugins`);
    } catch (error) {
      console.error('Failed to initialize plugins:', error);
      throw error;
    }
  }

  /**
   * Register a plugin dynamically
   * @param {Function} PluginClass - Plugin class to register
   * @returns {Editor} - Returns this for chaining
   */
  registerPlugin(PluginClass) {
    if (!this.initialized) {
      throw new Error('Editor must be initialized before registering plugins');
    }

    try {
      this.pluginRegistry.register(PluginClass);
      const name = PluginClass.pluginName || PluginClass.name;
      const instances = this.pluginRegistry.initializePlugins(this, [name]);

      // Add to plugins map
      instances.forEach((instance, pluginName) => {
        this.plugins.set(pluginName, instance);
      });

      console.log(`Plugin "${name}" registered and initialized`);
    } catch (error) {
      console.error('Failed to register plugin:', error);
      throw error;
    }

    return this;
  }

  /**
   * Get plugin instance by name
   * @param {string} name - Plugin name
   * @returns {Object|null} Plugin instance or null
   */
  getPlugin(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Check if plugin is registered
   * @param {string} name - Plugin name
   * @returns {boolean}
   */
  hasPlugin(name) {
    return this.plugins.has(name);
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
   * @fires asteronote.destroy
   */
  destroy() {
    if (!this.initialized) {
      return;
    }

    // Update original element one last time
    this.updateOriginalElement();

    // Destroy all plugins through registry
    this.pluginRegistry.destroyAll();
    this.plugins.clear();

    // Remove event handlers
    off(this.editable, 'input', this.handleInput);
    off(this.editable, 'focus', this.handleFocus);
    off(this.editable, 'blur', this.handleBlur);
    off(this.editable, 'keydown', this.handleKeydown);
    off(this.editable, 'keyup', this.handleKeyup);
    off(this.editable, 'mouseup', this.handleMouseup);
    off(this.editable, 'paste', this.handlePaste);
    document.removeEventListener('selectionchange', this.handleSelectionChange);

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
    this.emit('asteronote.destroy');
  }

  /**
   * Static method to initialize editor on selector
   * @param {string} selector - CSS selector
   * @param {Object} options - Editor options
   * @returns {Editor|Editor[]}
   */
  static init(selector = '[data-asteronote]', options = {}) {
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
  const autoInit = $$('[data-asteronote]');
  autoInit.forEach(el => {
    const options = {};
    // Read data attributes for configuration
    if (el.dataset.height) options.height = parseInt(el.dataset.height);
    if (el.dataset.placeholder) options.placeholder = el.dataset.placeholder;

    new Editor(el, options).init();
  });
});
