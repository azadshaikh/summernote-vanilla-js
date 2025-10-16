/**
 * Heading Action - Applies heading levels (H1-H6) or paragraph
 */

/**
 * Get Remix icon for heading level
 * @param {string} level - Heading level ('H', 'H1', 'H2', etc.)
 * @returns {string} HTML icon string
 */
export function getHeadingIcon(level) {
  const ri = {
    'H': 'ri-heading',
    'H1': 'ri-h-1',
    'H2': 'ri-h-2',
    'H3': 'ri-h-3',
    'H4': 'ri-h-4',
    'H5': 'ri-h-5',
    'H6': 'ri-h-6'
  };
  const cls = ri[level] || ri['H'];
  return `<i class="${cls}"></i>`;
}

/**
 * Apply heading format
 * @param {number} level - Heading level (0 for paragraph, 1-6 for headings)
 */
export function applyHeading(level) {
  if (level === 0) {
    // Convert to paragraph
    document.execCommand('formatBlock', false, '<p>');
  } else {
    // Apply heading level
    document.execCommand('formatBlock', false, `<h${level}>`);
  }
}

/**
 * Get current heading level at cursor
 * @param {HTMLElement} editable - The editable element
 * @returns {number|null} Current heading level (1-6) or null
 */
export function getCurrentHeadingLevel(editable) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  let node = sel.anchorNode;
  if (!node) return null;

  // Walk up the DOM tree to find heading
  while (node && node !== editable) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName;
      if (tagName && tagName.match(/^H[1-6]$/)) {
        return parseInt(tagName.charAt(1));
      }
    }
    node = node.parentNode;
  }

  return null;
}

/**
 * Heading dropdown items configuration
 */
export const headingItems = [
  { level: 1, label: 'Heading 1', tag: 'H1' },
  { level: 2, label: 'Heading 2', tag: 'H2' },
  { level: 3, label: 'Heading 3', tag: 'H3' },
  { level: 4, label: 'Heading 4', tag: 'H4' },
  { level: 5, label: 'Heading 5', tag: 'H5' },
  { level: 6, label: 'Heading 6', tag: 'H6' }
];
