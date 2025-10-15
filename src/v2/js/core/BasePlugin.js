/**
 * BasePlugin - Base class for all AsteroNote plugins
 * Defines the standard plugin interface and provides common functionality
 *
 * All plugins MUST extend this class and implement the required methods
 *
 * @example
 * class MyPlugin extends BasePlugin {
 *   static pluginName = 'myPlugin';
 *   static dependencies = ['bold']; // Optional dependencies
 *
 *   init() {
 *     this.addButton({
 *       name: 'myButton',
 *       icon: '<i class="icon"></i>',
 *       callback: () => this.doSomething()
 *     });
 *   }
 * }
 */

export default class BasePlugin {
  /**
   * Plugin name - MUST be defined in subclass as static property
   * @type {string}
   */
  static pluginName = '';

  /**
   * Plugin dependencies - Optional array of plugin names this plugin depends on
   * @type {string[]}
   */
  static dependencies = [];

  /**
   * Constructor
   * @param {Object} editor - Editor instance
   * @param {string} instanceName - Unique instance name (for supporting multiple instances)
   */
  constructor(editor, instanceName = null) {
    if (!editor) {
      throw new Error('Plugin requires an editor instance');
    }

    this.editor = editor;
    this.enabled = true;
    this.buttons = new Map();
    this.shortcuts = new Map();
    this.instanceName = instanceName || this.constructor.pluginName || this.constructor.name;
  }

  /**
   * Initialize the plugin - MUST be implemented by subclass
   * Called when plugin is registered and initialized by PluginRegistry
   */
  init() {
    throw new Error('Plugin must implement init() method');
  }

  /**
   * Destroy/cleanup the plugin - Should be implemented by subclass if needed
   * Called when editor is destroyed or plugin is unregistered
   */
  destroy() {
    // Cleanup buttons
    this.buttons.forEach((button, name) => {
      this.removeButton(name);
    });
    this.buttons.clear();

    // Cleanup shortcuts
    this.shortcuts.clear();

    // Remove any event listeners
    // Subclasses should override and call super.destroy()
  }

  /**
   * Enable the plugin
   */
  enable() {
    this.enabled = true;
    this.editor.emit(`plugin.${this.constructor.pluginName}.enabled`);
  }

  /**
   * Disable the plugin
   */
  disable() {
    this.enabled = false;
    this.editor.emit(`plugin.${this.constructor.pluginName}.disabled`);
  }

  /**
   * Check if plugin is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Add a toolbar button
   * @param {Object} config - Button configuration
   * @param {string} config.name - Button name/identifier
   * @param {string} config.icon - Button icon HTML
   * @param {string} config.tooltip - Button tooltip text
   * @param {Function} config.callback - Click handler function
   * @param {string} config.className - Additional CSS classes
   */
  addButton(config) {
    const { name, icon, tooltip, callback, className = '' } = config;

    if (!name || !callback) {
      throw new Error('Button must have a name and callback');
    }

    // Store button config
    this.buttons.set(name, {
      name,
      icon: icon || '',
      tooltip: tooltip || '',
      callback,
      className,
      element: null
    });

    // Create button element
    const button = this.createButtonElement(config);

    // Add to toolbar
    if (this.editor.toolbar) {
      // Prefer configured group container when available
      const groupEl = typeof this.editor.getToolbarGroupForAction === 'function'
        ? this.editor.getToolbarGroupForAction(name)
        : null;
      const container = groupEl || this.editor.toolbar;
      container.appendChild(button);
      this.buttons.get(name).element = button;
    }

    return button;
  }

  /**
   * Create button element
   * @param {Object} config - Button configuration
   * @returns {HTMLElement}
   */
  createButtonElement(config) {
    const { name, icon, tooltip, callback, className } = config;

    const button = document.createElement('button');
    button.type = 'button';
    // Use Bootstrap 5 button classes with spacing for individual buttons
    const bootstrapBtn = 'btn';
    button.className = `${bootstrapBtn} asteronote-btn asteronote-btn-${name} ${className}`.trim();
    button.innerHTML = icon;
    button.setAttribute('data-plugin', this.constructor.pluginName);
    button.setAttribute('data-action', name);

    if (tooltip) {
      button.title = tooltip;
      button.setAttribute('aria-label', tooltip);
    }

    // Attach click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      // Ensure editor has focus and a valid range before executing
      this.ensureFocusAndRange();
      if (this.enabled) {
        callback.call(this, e);
        // Prompt immediate state refresh for snappy UI
        if (this.editor && typeof this.editor.emit === 'function') {
          this.editor.emit('asteronote.selectionchange');
        }
      }
    });

    return button;
  }

  /**
   * Remove a toolbar button
   * @param {string} name - Button name
   */
  removeButton(name) {
    const button = this.buttons.get(name);
    if (button && button.element && button.element.parentNode) {
      button.element.parentNode.removeChild(button.element);
    }
    this.buttons.delete(name);
  }

  /**
   * Register a keyboard shortcut
   * @param {string} keys - Keyboard shortcut (e.g., 'Ctrl+B', 'Cmd+B')
   * @param {Function} callback - Handler function
   */
  addShortcut(keys, callback) {
    this.shortcuts.set(keys, callback);
  }

  /**
   * Handle keyboard shortcut
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {boolean} - True if shortcut was handled
   */
  handleShortcut(event) {
    if (!this.enabled) return false;

    const isMac = /Mac/.test(navigator.platform);
    const ctrl = isMac ? event.metaKey : event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const key = event.key;

    // Build shortcut string - normalize key to uppercase for consistency
    let shortcut = '';
    if (ctrl) shortcut += 'Ctrl+';
    if (shift) shortcut += 'Shift+';
    if (alt) shortcut += 'Alt+';
    shortcut += key.toUpperCase();

    // Check if we have a handler
    const handler = this.shortcuts.get(shortcut);
    if (handler) {
      event.preventDefault();
      event.stopPropagation(); // Prevent browser from handling the shortcut
      handler.call(this, event);
      return true;
    }

    return false;
  }

  /**
   * Execute a command in the editor
   * @param {string} command - Command name (e.g., 'bold', 'italic')
   * @param {*} value - Optional command value
   */
  execCommand(command, value = null) {
    if (this.editor.editable) {
      this.ensureFocusAndRange();
      document.execCommand(command, false, value);
      this.editor.emit('asteronote.change', this.editor.getContent());
      // Trigger quick UI refresh
      this.editor.emit('asteronote.selectionchange');
    }
  }

  /**
   * Ensure the editor has focus and a caret/range inside the editable area.
   * If selection is outside, place caret at end of the editor.
   */
  ensureFocusAndRange() {
    if (!this.editor || !this.editor.editable) return;
    const sel = this.getSelection();
    const within = this.isSelectionInsideEditor(sel);
    if (!within) {
      this.editor.placeCaretAtEnd();
    } else {
      // If no range, also place caret at end
      if (!sel || sel.rangeCount === 0) {
        this.editor.placeCaretAtEnd();
      }
    }
    this.editor.focus();
  }

  /**
   * Check whether current selection is inside the editor
   */
  isSelectionInsideEditor(sel) {
    if (!sel || sel.rangeCount === 0) return false;
    let node = sel.anchorNode;
    if (!node) return false;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node) return false;
    return !!(this.editor.editable && (node === this.editor.editable || this.editor.editable.contains(node)));
  }

  /**
   * Get current selection
   * @returns {Selection}
   */
  getSelection() {
    return window.getSelection();
  }

  /**
   * Get current selection range
   * @returns {Range|null}
   */
  getRange() {
    const selection = this.getSelection();
    return selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  }

  /**
   * Save current selection
   * @returns {Range|null}
   */
  saveRange() {
    return this.getRange();
  }

  /**
   * Restore saved selection
   * @param {Range} range - Previously saved range
   */
  restoreRange(range) {
    if (range) {
      const selection = this.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Emit a plugin-specific event
   * @param {string} eventName - Event name (without plugin prefix)
   * @param {...*} args - Event arguments
   */
  emitEvent(eventName, ...args) {
    const fullEventName = `plugin.${this.constructor.pluginName}.${eventName}`;
    this.editor.emit(fullEventName, ...args);
  }

  /**
   * Listen to editor events
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  on(eventName, handler) {
    this.editor.on(eventName, handler);
  }

  /**
   * Stop listening to editor events
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  off(eventName, handler) {
    this.editor.off(eventName, handler);
  }
}
