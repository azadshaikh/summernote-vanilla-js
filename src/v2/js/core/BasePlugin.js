/**
 * BasePlugin - Base class for all Summernote plugins
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
   */
  constructor(editor) {
    if (!editor) {
      throw new Error('Plugin requires an editor instance');
    }

    this.editor = editor;
    this.enabled = true;
    this.buttons = new Map();
    this.shortcuts = new Map();
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
    // Use Bootstrap 5 button classes; allow extensions via className
    const bootstrapBtn = 'btn btn-outline-secondary';
    button.className = `${bootstrapBtn} summernote-btn summernote-btn-${name} ${className}`.trim();
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
      if (this.enabled) {
        callback.call(this, e);
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

    // Build shortcut string
    let shortcut = '';
    if (ctrl) shortcut += 'Ctrl+';
    if (shift) shortcut += 'Shift+';
    if (alt) shortcut += 'Alt+';
    shortcut += key;

    // Check if we have a handler
    const handler = this.shortcuts.get(shortcut);
    if (handler) {
      event.preventDefault();
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
      document.execCommand(command, false, value);
      this.editor.emit('summernote.change', this.editor.getContent());
    }
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
