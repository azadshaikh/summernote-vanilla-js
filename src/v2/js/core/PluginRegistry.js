/**
 * PluginRegistry - Manages plugin registration and lifecycle
 * Handles plugin dependencies, load order, and initialization
 */

export default class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.initialized = new Set();
  }

  /**
   * Register a plugin
   * @param {Object} PluginClass - Plugin class or constructor
   * @throws {Error} If plugin is invalid or already registered
   */
  register(PluginClass) {
    // Validate plugin
    if (!PluginClass || typeof PluginClass !== 'function') {
      throw new TypeError('Plugin must be a class or constructor function');
    }

    // Get plugin name (from static property or class name)
    const name = PluginClass.pluginName || PluginClass.name;

    if (!name) {
      throw new Error('Plugin must have a name (static pluginName property or class name)');
    }

    // Check if already registered
    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered`);
      return this;
    }

    // Store plugin class
    this.plugins.set(name, {
      PluginClass,
      name,
      dependencies: PluginClass.dependencies || [],
      instance: null
    });

    return this;
  }

  /**
   * Get plugin metadata by name
   * @param {string} name - Plugin name
   * @returns {Object|null} Plugin metadata or null
   */
  get(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Check if plugin is registered
   * @param {string} name - Plugin name
   * @returns {boolean}
   */
  has(name) {
    return this.plugins.has(name);
  }

  /**
   * Resolve plugin load order based on dependencies
   * @param {string[]} pluginNames - Array of plugin names to load
   * @returns {string[]} Ordered array of plugin names
   * @throws {Error} If circular dependency detected
   */
  resolveLoadOrder(pluginNames) {
    const resolved = [];
    const seen = new Set();
    const visiting = new Set();

    const visit = (name) => {
      // Check if already resolved
      if (seen.has(name)) return;

      // Check for circular dependency
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      // Check if plugin exists
      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(`Plugin "${name}" is not registered`);
      }

      visiting.add(name);

      // Visit dependencies first
      plugin.dependencies.forEach(depName => {
        visit(depName);
      });

      visiting.delete(name);
      seen.add(name);
      resolved.push(name);
    };

    // Visit each requested plugin
    pluginNames.forEach(name => visit(name));

    return resolved;
  }

  /**
   * Initialize plugins in correct order
   * @param {Object} editor - Editor instance
   * @param {string[]} pluginNames - Array of plugin names to initialize
   * @returns {Map<string, Object>} Map of initialized plugin instances
   */
  initializePlugins(editor, pluginNames = []) {
    // If no plugins specified, initialize all registered plugins
    const toInitialize = pluginNames.length > 0
      ? pluginNames
      : Array.from(this.plugins.keys());

    // Resolve load order
    const orderedNames = this.resolveLoadOrder(toInitialize);

    // Initialize each plugin
    orderedNames.forEach(name => {
      if (this.initialized.has(name)) {
        return; // Already initialized
      }

      const pluginMeta = this.plugins.get(name);

      try {
        // Create plugin instance
        const instance = new pluginMeta.PluginClass(editor);

        // Validate plugin interface
        if (typeof instance.init !== 'function') {
          throw new Error(`Plugin "${name}" must have an init() method`);
        }

        // Store instance
        pluginMeta.instance = instance;

        // Call init
        instance.init();

        // Mark as initialized
        this.initialized.add(name);

        console.log(`Plugin "${name}" initialized`);
      } catch (error) {
        console.error(`Failed to initialize plugin "${name}":`, error);
        throw error;
      }
    });

    // Return map of initialized instances
    const instances = new Map();
    orderedNames.forEach(name => {
      const plugin = this.plugins.get(name);
      if (plugin.instance) {
        instances.set(name, plugin.instance);
      }
    });

    return instances;
  }

  /**
   * Destroy all initialized plugins
   */
  destroyAll() {
    // Destroy in reverse order
    const names = Array.from(this.initialized).reverse();

    names.forEach(name => {
      const plugin = this.plugins.get(name);

      if (plugin && plugin.instance) {
        try {
          if (typeof plugin.instance.destroy === 'function') {
            plugin.instance.destroy();
          }
          plugin.instance = null;
        } catch (error) {
          console.error(`Error destroying plugin "${name}":`, error);
        }
      }
    });

    this.initialized.clear();
  }

  /**
   * Get all registered plugin names
   * @returns {string[]}
   */
  getPluginNames() {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get instance of initialized plugin
   * @param {string} name - Plugin name
   * @returns {Object|null}
   */
  getInstance(name) {
    const plugin = this.plugins.get(name);
    return plugin ? plugin.instance : null;
  }

  /**
   * Check if plugin is initialized
   * @param {string} name - Plugin name
   * @returns {boolean}
   */
  isInitialized(name) {
    return this.initialized.has(name);
  }
}
