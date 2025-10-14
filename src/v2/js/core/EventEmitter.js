/**
 * EventEmitter - Simple event management system
 * Provides pub/sub pattern for editor events
 */

export default class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name (supports namespacing with dots)
   * @param {Function} handler - Event handler function
   * @returns {EventEmitter} - Returns this for chaining
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event).push(handler);
    return this;
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Optional specific handler to remove
   * @returns {EventEmitter} - Returns this for chaining
   */
  off(event, handler) {
    if (!this.events.has(event)) {
      return this;
    }

    if (!handler) {
      // Remove all handlers for this event
      this.events.delete(event);
    } else {
      // Remove specific handler
      const handlers = this.events.get(event);
      const index = handlers.indexOf(handler);

      if (index !== -1) {
        handlers.splice(index, 1);
      }

      // Clean up if no handlers remain
      if (handlers.length === 0) {
        this.events.delete(event);
      }
    }

    return this;
  }

  /**
   * Subscribe to an event for one-time execution
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {EventEmitter} - Returns this for chaining
   */
  once(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a function');
    }

    const onceHandler = (...args) => {
      handler.apply(this, args);
      this.off(event, onceHandler);
    };

    return this.on(event, onceHandler);
  }

  /**
   * Emit an event with optional arguments
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to handlers
   * @returns {boolean} - Returns true if event had listeners
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }

    const handlers = this.events.get(event).slice(); // Copy to avoid issues if handlers modify the list

    handlers.forEach(handler => {
      try {
        handler.apply(this, args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });

    return true;
  }

  /**
   * Get all event names that have listeners
   * @returns {string[]} - Array of event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get count of listeners for an event
   * @param {string} event - Event name
   * @returns {number} - Number of listeners
   */
  listenerCount(event) {
    if (!this.events.has(event)) {
      return 0;
    }
    return this.events.get(event).length;
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.events.clear();
  }

  /**
   * Listen for wildcard events (basic implementation)
   * @param {Function} handler - Handler for all events
   * @returns {EventEmitter} - Returns this for chaining
   */
  onAny(handler) {
    return this.on('*', handler);
  }

  /**
   * Remove wildcard listener
   * @param {Function} handler - Handler to remove
   * @returns {EventEmitter} - Returns this for chaining
   */
  offAny(handler) {
    return this.off('*', handler);
  }
}
