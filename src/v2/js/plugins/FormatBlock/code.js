/**
 * Code Action - Toggles inline code formatting
 */

/**
 * Toggle inline code formatting
 */
export function toggleCode() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const codeElement = findCodeParent(range.commonAncestorContainer);

  if (codeElement) {
    removeCode(codeElement);
  } else {
    addCode(range);
  }
}

/**
 * Add code tag to selection
 * @param {Range} range - Selection range
 */
function addCode(range) {
  if (range.collapsed) return;

  const code = document.createElement('code');

  try {
    range.surroundContents(code);
  } catch (e) {
    // If surroundContents fails, extract and wrap
    const contents = range.extractContents();
    code.appendChild(contents);
    range.insertNode(code);
  }

  // Restore selection
  const newRange = document.createRange();
  newRange.selectNodeContents(code);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(newRange);
}

/**
 * Remove code tag
 * @param {HTMLElement} codeElement - Code element to remove
 */
function removeCode(codeElement) {
  const parent = codeElement.parentNode;
  while (codeElement.firstChild) {
    parent.insertBefore(codeElement.firstChild, codeElement);
  }
  parent.removeChild(codeElement);
  parent.normalize();
}

/**
 * Find code tag parent
 * @param {Node} node - Starting node
 * @returns {HTMLElement|null} Code element or null
 */
function findCodeParent(node) {
  while (node && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'CODE') {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Check if selection is inside code tag
 * @returns {boolean} True if inside code tag
 */
export function isCodeActive() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  return findCodeParent(range.commonAncestorContainer) !== null;
}

/**
 * Get code icon
 * @returns {string} HTML icon string
 */
export function getCodeIcon() {
  return '<i class="ri-code-line"></i>';
}
