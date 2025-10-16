/**
 * Highlight Action - Applies highlight formatting (mark tag) to selected text
 */

/**
 * Toggle highlight formatting
 */
export function toggleHighlight() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const markElement = findMarkParent(range.commonAncestorContainer);

  if (markElement) {
    removeHighlight(markElement);
  } else {
    addHighlight(range);
  }
}

/**
 * Add highlight to selection
 * @param {Range} range - Selection range
 */
function addHighlight(range) {
  if (range.collapsed) return;

  const mark = document.createElement('mark');

  try {
    range.surroundContents(mark);
  } catch (e) {
    // If surroundContents fails, extract and wrap
    const contents = range.extractContents();
    mark.appendChild(contents);
    range.insertNode(mark);
  }

  // Restore selection
  const newRange = document.createRange();
  newRange.selectNodeContents(mark);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(newRange);
}

/**
 * Remove highlight from mark element
 * @param {HTMLElement} markElement - The mark element to remove
 */
function removeHighlight(markElement) {
  const parent = markElement.parentNode;
  while (markElement.firstChild) {
    parent.insertBefore(markElement.firstChild, markElement);
  }
  parent.removeChild(markElement);
  parent.normalize();
}

/**
 * Find mark tag parent
 * @param {Node} node - Starting node
 * @returns {HTMLElement|null} Mark element or null
 */
function findMarkParent(node) {
  while (node && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'MARK') {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Check if selection is inside mark tag
 * @returns {boolean} True if inside mark tag
 */
export function isHighlightActive() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  return findMarkParent(range.commonAncestorContainer) !== null;
}

/**
 * Get highlight icon
 * @returns {string} HTML icon string
 */
export function getHighlightIcon() {
  return '<i class="ri-mark-pen-line"></i>';
}
