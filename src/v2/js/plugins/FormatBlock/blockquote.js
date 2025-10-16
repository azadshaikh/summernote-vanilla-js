/**
 * Blockquote Action - Toggles blockquote formatting
 */

/**
 * Toggle blockquote formatting
 */
export function toggleBlockquote(editable) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const bq = findBlockquoteAncestor(range.commonAncestorContainer);

  if (bq) {
    unwrapBlockquote(bq);
  } else {
    applyBlockquote(editable);
  }
}

/**
 * Apply blockquote formatting
 * @param {HTMLElement} editable - The editable element
 */
function applyBlockquote(editable) {
  // Try native execCommand first
  try {
    document.execCommand('formatBlock', false, '<blockquote>');
    return;
  } catch (e) {
    // Fallback to manual wrap
  }

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  // Find the closest block inside editor
  const block = findClosestBlock(range.startContainer, editable);
  const blockquote = document.createElement('blockquote');

  if (block && editable && editable.contains(block)) {
    block.parentNode.insertBefore(blockquote, block);
    blockquote.appendChild(block);
    placeCaretInside(block);
  } else {
    // Insert a fresh empty paragraph inside
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    blockquote.appendChild(p);
    editable.appendChild(blockquote);
    placeCaretInside(p);
  }
}

/**
 * Unwrap blockquote element
 * @param {HTMLElement} bq - Blockquote element
 */
function unwrapBlockquote(bq) {
  const parent = bq.parentNode;
  if (!parent) return;

  let target = null;
  if (bq.firstChild) target = bq.firstChild;

  while (bq.firstChild) {
    parent.insertBefore(bq.firstChild, bq);
  }
  parent.removeChild(bq);

  if (target) {
    placeCaretInside(target);
  }
}

/**
 * Find blockquote ancestor
 * @param {Node} node - Starting node
 * @returns {HTMLElement|null} Blockquote element or null
 */
function findBlockquoteAncestor(node) {
  while (node && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BLOCKQUOTE') {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Find closest block element
 * @param {Node} node - Starting node
 * @param {HTMLElement} editable - Editable container
 * @returns {HTMLElement|null} Block element or null
 */
function findClosestBlock(node, editable) {
  const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH'];

  while (node && node !== editable && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node.nodeType === Node.ELEMENT_NODE && blockTags.includes(node.tagName)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Place caret inside element
 * @param {HTMLElement} el - Element to place caret in
 */
function placeCaretInside(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Check if selection is inside blockquote
 * @returns {boolean} True if inside blockquote
 */
export function isBlockquoteActive() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  const range = sel.getRangeAt(0);
  return findBlockquoteAncestor(range.commonAncestorContainer) !== null;
}

/**
 * Get blockquote icon
 * @returns {string} HTML icon string
 */
export function getBlockquoteIcon() {
  return '<i class="ri-double-quotes-l"></i>';
}
