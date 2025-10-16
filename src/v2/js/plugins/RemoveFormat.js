/**
 * RemoveFormat Plugin - Removes all formatting from selected text
 * Keyboard shortcut: Ctrl+\ (Windows/Linux) or Cmd+\ (Mac)
 */

import BasePlugin from '../core/BasePlugin.js';

export default class RemoveFormatPlugin extends BasePlugin {
  static pluginName = 'removeFormat';
  static dependencies = [];

  /**
   * Initialize the RemoveFormat plugin
   */
  init() {
    // Add toolbar button
    this.addButton({
      name: 'removeFormat',
      icon: '<i class="ri-eraser-line"></i>',
      tooltip: 'Clear Formatting (Ctrl+\\)',
      callback: () => this.removeFormat(),
      className: 'asteronote-btn-remove-format'
    });

    // Add keyboard shortcut
    this.addShortcut('Ctrl+\\', () => this.removeFormat());
  }

  /**
   * Remove all formatting from selected text
   * Removes: class attributes, style attributes, and data-* attributes
   * Preserves: HTML structure/tags and their content
   * Protects: The editor's editable container itself from being cleaned
   */
  removeFormat() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const editable = this.editor.editable;

    // If nothing is selected, clean the entire editable area's children
    if (range.collapsed) {
      if (editable) {
        // Clean all children but NOT the editable container itself
        const children = editable.querySelectorAll('*');
        children.forEach(child => {
          this.removeFormattingAttributes(child);
        });
        this.editor.focus();
        this.emitEvent('removed');
        this.editor.emit('asteronote.change');
      }
      return;
    }

    // Get the common ancestor container
    const container = range.commonAncestorContainer;

    // If the container is the editable itself, clean all its children
    if (container === editable || (container.nodeType === Node.TEXT_NODE && container.parentNode === editable)) {
      const children = editable.querySelectorAll('*');
      children.forEach(child => {
        this.removeFormattingAttributes(child);
      });
    } else {
      // For partial selection, clean the affected elements in-place
      // Get all elements that intersect with the selection
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      // Find the parent elements
      let startElement = startContainer.nodeType === Node.ELEMENT_NODE ? startContainer : startContainer.parentElement;
      let endElement = endContainer.nodeType === Node.ELEMENT_NODE ? endContainer : endContainer.parentElement;

      // Clean all elements between start and end, but NOT the editable container
      let current = startElement;
      const elementsToClean = [];

      if (current && current !== editable) {
        elementsToClean.push(current);
      }

      while (current && current !== endElement && editable.contains(current)) {
        if (current.nextElementSibling) {
          current = current.nextElementSibling;
          if (current !== editable) {
            elementsToClean.push(current);
          }
        } else if (current.parentElement && current.parentElement !== editable) {
          current = current.parentElement;
          if (current !== editable && !elementsToClean.includes(current)) {
            elementsToClean.push(current);
          }
        } else {
          break;
        }
      }

      // Clean all the collected elements and their descendants
      elementsToClean.forEach(el => {
        if (el && el !== editable && editable.contains(el)) {
          // Clean the element itself
          this.removeFormattingAttributes(el);
          // Clean all its descendants
          const descendants = el.querySelectorAll('*');
          descendants.forEach(desc => {
            this.removeFormattingAttributes(desc);
          });
        }
      });
    }

    // Focus back to editor
    this.editor.focus();

    // Emit event
    this.emitEvent('removed');

    // Trigger change event to update the content
    this.editor.emit('asteronote.change');
  }

  /**
   * Remove class, style, and data-* attributes from a single element
   * @param {HTMLElement} element - The element to clean
   */
  removeFormattingAttributes(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    // Remove class attribute
    element.removeAttribute('class');

    // Remove style attribute
    element.removeAttribute('style');

    // Remove all data-* attributes
    const dataAttributes = [];
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name.startsWith('data-')) {
        dataAttributes.push(attr.name);
      }
    }

    dataAttributes.forEach(attr => {
      element.removeAttribute(attr);
    });
  }

  /**
   * Clean up when plugin is destroyed
   */
  destroy() {
    // Base class handles button removal and event cleanup
    super.destroy();
  }
}

