/**
 * DOM Utilities - Vanilla JavaScript replacements for jQuery
 * Provides helper functions for common DOM operations
 */

/**
 * Query selector wrapper - Returns single element
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {Element|null}
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query selector all wrapper - Returns array of elements
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {Element[]}
 */
export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Add class to element
 * @param {Element} el - DOM element
 * @param {string} className - Class name to add
 */
export function addClass(el, className) {
  if (!el) return;
  el.classList.add(className);
}

/**
 * Remove class from element
 * @param {Element} el - DOM element
 * @param {string} className - Class name to remove
 */
export function removeClass(el, className) {
  if (!el) return;
  el.classList.remove(className);
}

/**
 * Toggle class on element
 * @param {Element} el - DOM element
 * @param {string} className - Class name to toggle
 * @returns {boolean} - True if class is now present
 */
export function toggleClass(el, className) {
  if (!el) return false;
  return el.classList.toggle(className);
}

/**
 * Check if element has class
 * @param {Element} el - DOM element
 * @param {string} className - Class name to check
 * @returns {boolean}
 */
export function hasClass(el, className) {
  if (!el) return false;
  return el.classList.contains(className);
}

/**
 * Find closest ancestor matching selector
 * @param {Element} el - Starting element
 * @param {string} selector - CSS selector
 * @returns {Element|null}
 */
export function closest(el, selector) {
  if (!el) return null;
  return el.closest(selector);
}

/**
 * Event delegation helper
 * @param {Element} parent - Parent element to attach listener
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {string} selector - CSS selector for target elements
 * @param {Function} handler - Event handler function
 * @returns {Function} - Cleanup function to remove listener
 */
export function delegate(parent, eventType, selector, handler) {
  if (!parent) return () => {};

  const listener = (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event);
    }
  };

  parent.addEventListener(eventType, listener);

  // Return cleanup function
  return () => {
    parent.removeEventListener(eventType, listener);
  };
}

/**
 * Create element with optional attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Optional attributes object
 * @param {string|Element|Element[]} content - Optional content
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, content = null) {
  const el = document.createElement(tag);

  // Set attributes
  Object.keys(attrs).forEach(key => {
    if (key === 'className') {
      el.className = attrs[key];
    } else if (key === 'style' && typeof attrs[key] === 'object') {
      Object.assign(el.style, attrs[key]);
    } else {
      el.setAttribute(key, attrs[key]);
    }
  });

  // Set content
  if (content !== null) {
    if (typeof content === 'string') {
      el.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(child => el.appendChild(child));
    } else if (content instanceof Element) {
      el.appendChild(content);
    }
  }

  return el;
}

/**
 * Remove element from DOM
 * @param {Element} el - Element to remove
 */
export function remove(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Get/Set element attribute
 * @param {Element} el - DOM element
 * @param {string} name - Attribute name
 * @param {string} value - Optional value to set
 * @returns {string|null|undefined}
 */
export function attr(el, name, value) {
  if (!el) return null;

  if (value === undefined) {
    return el.getAttribute(name);
  }

  el.setAttribute(name, value);
}

/**
 * Get/Set element data attribute
 * @param {Element} el - DOM element
 * @param {string} key - Data key (without 'data-' prefix)
 * @param {string} value - Optional value to set
 * @returns {string|null|undefined}
 */
export function data(el, key, value) {
  if (!el) return null;

  if (value === undefined) {
    return el.dataset[key];
  }

  el.dataset[key] = value;
}
