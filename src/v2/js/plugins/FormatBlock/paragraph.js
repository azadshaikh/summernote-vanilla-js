/**
 * Paragraph Action - Converts selection to normal paragraph
 */

/**
 * Convert current block to paragraph
 */
export function applyParagraph() {
  document.execCommand('formatBlock', false, '<p>');
}

/**
 * Check if current selection is inside a paragraph
 * @param {HTMLElement} editable - The editable element
 * @returns {boolean} True if inside paragraph
 */
export function isInsideParagraph(editable) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  let node = sel.anchorNode;
  if (!node) return false;

  while (node && node !== editable) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}

/**
 * Get paragraph icon
 * @returns {string} HTML icon string
 */
export function getParagraphIcon() {
  return '<i class="ri-paragraph"></i>';
}
