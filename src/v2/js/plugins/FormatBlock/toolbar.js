/**
 * Toolbar UI for FormatBlock Plugin
 */

import { getHeadingIcon, headingItems, applyHeading } from './heading.js';
import { getParagraphIcon, applyParagraph } from './paragraph.js';
import { getSmallIcon, toggleSmall } from './small.js';
import { getSubscriptIcon, getSuperscriptIcon, toggleSubscript, toggleSuperscript } from './subsup.js';
import { getBlockquoteIcon, toggleBlockquote } from './blockquote.js';
import { getCodeIcon, toggleCode } from './code.js';
import { getHighlightIcon, toggleHighlight } from './highlight.js';

/**
 * Create toolbar buttons for FormatBlock plugin
 * @param {Object} plugin - Plugin instance with addButton method
 */
export function createToolbarButtons(plugin) {
  // Main Format dropdown button (with T icon)
  plugin.addButton({
    name: 'format',
    icon: '<i class="ri-text"></i>',
    tooltip: 'Format',
    callback: () => {}, // Bootstrap handles dropdown
    className: 'asteronote-btn-format dropdown-toggle'
  });

  // Add Bootstrap dropdown attributes
  const button = plugin.buttons.get('format');
  if (button && button.element) {
    button.element.setAttribute('data-bs-toggle', 'dropdown');
    button.element.setAttribute('aria-expanded', 'false');
  }

  // Create dropdown menu
  createFormatDropdown(plugin, button);

  // Individual format buttons (optional - can be used separately)
  createIndividualButtons(plugin);
}

/**
 * Create the main format dropdown menu
 * @param {Object} plugin - Plugin instance
 * @param {Object} button - Button object
 */
function createFormatDropdown(plugin, button) {
  if (!button || !button.element) return;

  // Wrap button in btn-group for Bootstrap dropdown
  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';
  button.element.parentNode.insertBefore(btnGroup, button.element);
  btnGroup.appendChild(button.element);

  // Create dropdown container
  const dropdown = document.createElement('ul');
  dropdown.className = 'dropdown-menu';

  // Add heading options
  headingItems.forEach(({ level, label, tag }) => {
    const li = document.createElement('li');
    const item = document.createElement('button');
    item.className = 'dropdown-item d-flex align-items-center';
    item.type = 'button';
    item.setAttribute('data-format', `h${level}`);
    item.innerHTML = `
      <span class="me-2" style="min-width: 24px; font-weight: bold;">${tag}</span>
      <span>${label}</span>
    `;

    item.addEventListener('click', (e) => {
      e.preventDefault();
      applyHeading(level);
      plugin.updateButtonState();
      plugin.emitEvent('heading-changed', { level });
    });

    li.appendChild(item);
    dropdown.appendChild(li);
  });

  // Add separator
  const separator1 = document.createElement('li');
  separator1.innerHTML = '<hr class="dropdown-divider">';
  dropdown.appendChild(separator1);

  // Add paragraph option
  const liParagraph = document.createElement('li');
  const itemParagraph = document.createElement('button');
  itemParagraph.className = 'dropdown-item d-flex align-items-center';
  itemParagraph.type = 'button';
  itemParagraph.setAttribute('data-format', 'paragraph');
  itemParagraph.innerHTML = `
    ${getParagraphIcon()}
    <span class="ms-2">Paragraph</span>
  `;
  itemParagraph.addEventListener('click', (e) => {
    e.preventDefault();
    applyParagraph();
    plugin.updateButtonState();
    plugin.emitEvent('paragraph-changed');
  });
  liParagraph.appendChild(itemParagraph);
  dropdown.appendChild(liParagraph);

  // Add separator
  const separator2 = document.createElement('li');
  separator2.innerHTML = '<hr class="dropdown-divider">';
  dropdown.appendChild(separator2);

  // Add blockquote option
  const liBlockquote = document.createElement('li');
  const itemBlockquote = document.createElement('button');
  itemBlockquote.className = 'dropdown-item d-flex align-items-center';
  itemBlockquote.type = 'button';
  itemBlockquote.setAttribute('data-format', 'blockquote');
  itemBlockquote.innerHTML = `
    ${getBlockquoteIcon()}
    <span class="ms-2">Blockquote</span>
  `;
  itemBlockquote.addEventListener('click', (e) => {
    e.preventDefault();
    toggleBlockquote(plugin.editor.editable);
    plugin.updateButtonState();
    plugin.emitEvent('blockquote-toggled');
  });
  liBlockquote.appendChild(itemBlockquote);
  dropdown.appendChild(liBlockquote);

  // Add code option
  const liCode = document.createElement('li');
  const itemCode = document.createElement('button');
  itemCode.className = 'dropdown-item d-flex align-items-center';
  itemCode.type = 'button';
  itemCode.setAttribute('data-format', 'code');
  itemCode.innerHTML = `
    ${getCodeIcon()}
    <span class="ms-2">Inline Code</span>
  `;
  itemCode.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCode();
    plugin.updateButtonState();
    plugin.emitEvent('code-toggled');
  });
  liCode.appendChild(itemCode);
  dropdown.appendChild(liCode);

  // Add separator
  const separator3 = document.createElement('li');
  separator3.innerHTML = '<hr class="dropdown-divider">';
  dropdown.appendChild(separator3);

  // Add highlight option
  const liHighlight = document.createElement('li');
  const itemHighlight = document.createElement('button');
  itemHighlight.className = 'dropdown-item d-flex align-items-center';
  itemHighlight.type = 'button';
  itemHighlight.setAttribute('data-format', 'highlight');
  itemHighlight.innerHTML = `
    ${getHighlightIcon()}
    <span class="ms-2">Highlight</span>
  `;
  itemHighlight.addEventListener('click', (e) => {
    e.preventDefault();
    toggleHighlight();
    plugin.updateButtonState();
    plugin.emitEvent('highlight-toggled');
  });
  liHighlight.appendChild(itemHighlight);
  dropdown.appendChild(liHighlight);

  // Add small text option
  const liSmall = document.createElement('li');
  const itemSmall = document.createElement('button');
  itemSmall.className = 'dropdown-item d-flex align-items-center';
  itemSmall.type = 'button';
  itemSmall.setAttribute('data-format', 'small');
  itemSmall.innerHTML = `
    ${getSmallIcon()}
    <span class="ms-2">Small Text</span>
  `;
  itemSmall.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSmall();
    plugin.updateButtonState();
    plugin.emitEvent('small-toggled');
  });
  liSmall.appendChild(itemSmall);
  dropdown.appendChild(liSmall);

  // Add subscript option
  const liSubscript = document.createElement('li');
  const itemSubscript = document.createElement('button');
  itemSubscript.className = 'dropdown-item d-flex align-items-center';
  itemSubscript.type = 'button';
  itemSubscript.setAttribute('data-format', 'subscript');
  itemSubscript.innerHTML = `
    ${getSubscriptIcon()}
    <span class="ms-2">Subscript</span>
  `;
  itemSubscript.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSubscript();
    plugin.updateButtonState();
    plugin.emitEvent('subscript-toggled');
  });
  liSubscript.appendChild(itemSubscript);
  dropdown.appendChild(liSubscript);

  // Add superscript option
  const liSuperscript = document.createElement('li');
  const itemSuperscript = document.createElement('button');
  itemSuperscript.className = 'dropdown-item d-flex align-items-center';
  itemSuperscript.type = 'button';
  itemSuperscript.setAttribute('data-format', 'superscript');
  itemSuperscript.innerHTML = `
    ${getSuperscriptIcon()}
    <span class="ms-2">Superscript</span>
  `;
  itemSuperscript.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSuperscript();
    plugin.updateButtonState();
    plugin.emitEvent('superscript-toggled');
  });
  liSuperscript.appendChild(itemSuperscript);
  dropdown.appendChild(liSuperscript);

  // Append dropdown to btn-group
  btnGroup.appendChild(dropdown);

  // Store dropdown reference
  plugin.dropdown = dropdown;
}

/**
 * Create individual format buttons (for toolbar customization)
 * @param {Object} plugin - Plugin instance
 */
function createIndividualButtons(plugin) {
  // These are optional and can be used if users want separate buttons
  // instead of the dropdown. By default, they're not added to toolbar.
  // Users can enable them via plugin options.
}
