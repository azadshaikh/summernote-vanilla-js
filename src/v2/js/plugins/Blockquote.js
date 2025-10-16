/**
 * Blockquote Plugin - Toggles blockquote formatting for the current block/selection
 */

import BasePlugin from '../core/BasePlugin.js';

export default class BlockquotePlugin extends BasePlugin {
  static pluginName = 'blockquote';
  static dependencies = [];

  init() {
    // Add toolbar button
    this.addButton({
      name: 'blockquote',
      icon: '<i class="ri-double-quotes-l"></i>',
      tooltip: 'Blockquote',
      callback: () => this.toggle(),
      className: 'asteronote-btn-blockquote'
    });

    // Listen to selection changes to update button state
    this.on('asteronote.keyup', () => this.updateButtonState());
    this.on('asteronote.mouseup', () => this.updateButtonState());
    this.on('asteronote.selectionchange', () => this.updateButtonState());

    // Initial state
    setTimeout(() => this.updateButtonState(), 0);
  }

  /**
   * Toggle blockquote formatting
   */
  toggle() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const bq = this.findBlockquoteAncestor(range.commonAncestorContainer);

    if (bq) {
      this.unwrapBlockquote(bq);
      this.emitEvent('toggled', { active: false });
    } else {
      this.applyBlockquote();
      this.emitEvent('toggled', { active: true });
    }

    this.updateButtonState();
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  /**
   * Apply blockquote using native command with manual fallback
   */
  applyBlockquote() {
    // Try native execCommand first
    try {
      this.execCommand('formatBlock', '<blockquote>');
      // If execCommand worked, we're done
      return;
    } catch (e) {
      // Fallback to manual wrap
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // Find the closest block inside editor
    const block = this.findClosestBlock(range.startContainer);

    const blockquote = document.createElement('blockquote');

    if (block && this.editor.editable && this.editor.editable.contains(block)) {
      block.parentNode.insertBefore(blockquote, block);
      blockquote.appendChild(block);
      this.placeCaretInside(block);
    } else {
      // Insert a fresh empty paragraph inside
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      blockquote.appendChild(p);
      const container = this.editor.editable || document.body;
      container.appendChild(blockquote);
      this.placeCaretInside(p);
    }
  }

  /**
   * Unwrap a blockquote element by moving its children out
   */
  unwrapBlockquote(bq) {
    const parent = bq.parentNode;
    if (!parent) return;

    // Remember a node to restore caret later
    let target = null;
    if (bq.firstChild) target = bq.firstChild;

    while (bq.firstChild) {
      parent.insertBefore(bq.firstChild, bq);
    }
    parent.removeChild(bq);
    parent.normalize();

    if (target) this.placeCaretInside(target);
  }

  /**
   * Update button active state based on whether selection is inside a blockquote
   */
  updateButtonState() {
    const button = this.buttons.get('blockquote');
    if (!button || !button.element) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      button.element.classList.remove('active');
      return;
    }
    const range = sel.getRangeAt(0);
    const active = !!this.findBlockquoteAncestor(range.commonAncestorContainer);
    if (active) button.element.classList.add('active');
    else button.element.classList.remove('active');
  }

  /**
   * Find nearest blockquote ancestor within the editor
   */
  findBlockquoteAncestor(node) {
    if (!node) return null;
    let el = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    while (el && el !== this.editor.editable) {
      if (el.nodeType === Node.ELEMENT_NODE && el.tagName === 'BLOCKQUOTE') return el;
      el = el.parentNode;
    }
    return null;
  }

  /**
   * Find closest block element from a node
   */
  findClosestBlock(node) {
    if (!node) return null;
    let el = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    const isBlock = (n) => n && n.nodeType === Node.ELEMENT_NODE && (
      /^(P|DIV|H[1-6]|UL|OL|LI|BLOCKQUOTE)$/).test(n.tagName);
    while (el && el !== this.editor.editable) {
      if (isBlock(el)) return el;
      el = el.parentNode;
    }
    return null;
  }

  /**
   * Place caret inside an element at the end
   */
  placeCaretInside(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  destroy() {
    super.destroy();
  }
}

