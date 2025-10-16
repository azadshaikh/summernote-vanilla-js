/**
 * Small Tag Action - Wraps selection in <small> tag for smaller text
 */

/**
 * Toggle small tag formatting
 */
export function toggleSmall() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const smallElement = findSmallParent(range.commonAncestorContainer);

  if (smallElement) {
    removeSmall(smallElement);
  } else {
    addSmall(range);
  }
}

/**
 * Add small tag to selection
 * @param {Range} range - Selection range
 */
function addSmall(range) {
  if (range.collapsed) return;

  const small = document.createElement('small');

  try {
    range.surroundContents(small);
  } catch (e) {
    // If surroundContents fails, extract and wrap
    const contents = range.extractContents();
    small.appendChild(contents);
    range.insertNode(small);
  }

  // Restore selection
  const newRange = document.createRange();
  newRange.selectNodeContents(small);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(newRange);
}

/**
 * Remove small tag
 * @param {HTMLElement} smallElement - The small element to remove
 */
function removeSmall(smallElement) {
  const parent = smallElement.parentNode;
  while (smallElement.firstChild) {
    parent.insertBefore(smallElement.firstChild, smallElement);
  }
  parent.removeChild(smallElement);
  parent.normalize();
}

/**
 * Find small tag parent
 * @param {Node} node - Starting node
 * @returns {HTMLElement|null} Small element or null
 */
function findSmallParent(node) {
  while (node && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SMALL') {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Check if selection is inside small tag
 * @returns {boolean} True if inside small tag
 */
export function isSmallActive() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  return findSmallParent(range.commonAncestorContainer) !== null;
}

/**
 * Get small tag icon
 * @returns {string} HTML icon string
 */
export function getSmallIcon() {
  return '<i class="ri-font-size-2"></i>';
}
