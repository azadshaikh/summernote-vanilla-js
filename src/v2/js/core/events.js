/**
 * Event Utilities - Vanilla JavaScript replacements for jQuery events
 * Provides helper functions for common event operations
 */

/**
 * Add event listener to element
 * @param {Element|Window|Document} el - Target element
 * @param {string} eventType - Event type (e.g., 'click', 'keydown')
 * @param {Function} handler - Event handler function
 * @param {Object|boolean} options - Optional event listener options
 */
export function on(el, eventType, handler, options = false) {
  if (!el) return;
  el.addEventListener(eventType, handler, options);
}

/**
 * Remove event listener from element
 * @param {Element|Window|Document} el - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object|boolean} options - Optional event listener options
 */
export function off(el, eventType, handler, options = false) {
  if (!el) return;
  el.removeEventListener(eventType, handler, options);
}

/**
 * Add one-time event listener
 * @param {Element|Window|Document} el - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object} options - Optional event listener options
 */
export function once(el, eventType, handler, options = {}) {
  if (!el) return;

  const wrappedHandler = (event) => {
    handler.call(el, event);
    off(el, eventType, wrappedHandler, options);
  };

  on(el, eventType, wrappedHandler, options);
}

/**
 * Trigger/dispatch custom event on element
 * @param {Element} el - Target element
 * @param {string} eventType - Event type/name
 * @param {*} detail - Optional data to pass with event
 * @param {Object} options - Optional CustomEvent options
 */
export function trigger(el, eventType, detail = null, options = {}) {
  if (!el) return;

  const event = new CustomEvent(eventType, {
    bubbles: options.bubbles !== false,
    cancelable: options.cancelable !== false,
    detail: detail,
    ...options
  });

  el.dispatchEvent(event);
}

/**
 * Stop event propagation
 * @param {Event} event - Event object
 */
export function stopPropagation(event) {
  if (event) {
    event.stopPropagation();
  }
}

/**
 * Prevent default event behavior
 * @param {Event} event - Event object
 */
export function preventDefault(event) {
  if (event) {
    event.preventDefault();
  }
}

/**
 * Stop propagation and prevent default
 * @param {Event} event - Event object
 */
export function stopEvent(event) {
  stopPropagation(event);
  preventDefault(event);
}

/**
 * Check if event target matches selector
 * @param {Event} event - Event object
 * @param {string} selector - CSS selector
 * @returns {Element|null} - Matched element or null
 */
export function matches(event, selector) {
  if (!event || !event.target) return null;
  const target = event.target;
  return target.matches(selector) ? target : target.closest(selector);
}

/**
 * Wait for DOM content to be loaded
 * @param {Function} callback - Function to call when DOM is ready
 */
export function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

/**
 * Debounce function - Delays execution until after wait milliseconds
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 250) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - Limits execution to once per wait milliseconds
 * @param {Function} func - Function to throttle
 * @param {number} wait - Milliseconds to wait between executions
 * @returns {Function} - Throttled function
 */
export function throttle(func, wait = 250) {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}
