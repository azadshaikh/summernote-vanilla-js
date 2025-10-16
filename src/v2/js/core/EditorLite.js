/**
 * EditorLite - Lightweight Editor without ImageTool
 * Extends base Editor but excludes ImageTool to reduce bundle size
 */

import Editor from './Editor.js';

/**
 * EditorLite class - Same as Editor but without ImageTool
 * Default toolbar alignment: left (vs center in full version)
 */
export default class EditorLite extends Editor {
  /**
   * Constructor - Override to prevent ImageTool initialization
   */
  constructor(target, options = {}) {
    // Set default toolbar alignment to 'left' for lite version (unless explicitly provided)
    const liteOptions = {
      toolbarAlign: 'left',
      ...options
    };

    // Pass null as ImageToolClass to parent to prevent ImageTool initialization
    super(target, liteOptions, null);
  }
}
