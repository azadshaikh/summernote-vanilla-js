/**
 * Subscript and Superscript Actions
 */

/**
 * Toggle subscript formatting
 */
export function toggleSubscript() {
  document.execCommand('subscript');
}

/**
 * Toggle superscript formatting
 */
export function toggleSuperscript() {
  document.execCommand('superscript');
}

/**
 * Check if selection has subscript
 * @returns {boolean} True if subscript is active
 */
export function isSubscriptActive() {
  return document.queryCommandState('subscript');
}

/**
 * Check if selection has superscript
 * @returns {boolean} True if superscript is active
 */
export function isSuperscriptActive() {
  return document.queryCommandState('superscript');
}

/**
 * Get subscript icon
 * @returns {string} HTML icon string
 */
export function getSubscriptIcon() {
  return '<i class="ri-subscript-2"></i>';
}

/**
 * Get superscript icon
 * @returns {string} HTML icon string
 */
export function getSuperscriptIcon() {
  return '<i class="ri-superscript-2"></i>';
}
