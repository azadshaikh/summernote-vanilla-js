/**
 * History Manager - Manages undo/redo history with configurable stack size
 */

export default class History {
  constructor(editor, options = {}) {
    this.editor = editor;
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = options.maxSize || 100; // Store up to 100 actions by default
    this.isRecording = true;
    this.lastContent = '';
    this.ignoreChange = false;

    // Initialize with current content
    this.lastContent = this.editor.getContent();

    // Listen to editor changes
    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Record changes on input/paste/etc
    this.editor.on('asteronote.keyup', () => {
      if (!this.ignoreChange && this.isRecording) {
        this.recordIfChanged();
      }
    });

    this.editor.on('asteronote.paste', () => {
      if (!this.ignoreChange && this.isRecording) {
        setTimeout(() => this.recordIfChanged(), 10);
      }
    });

    // Also record on specific plugin actions
    this.editor.on('asteronote.change', () => {
      if (!this.ignoreChange && this.isRecording) {
        this.recordIfChanged();
      }
    });
  }

  /**
   * Record content if it has changed
   */
  recordIfChanged() {
    const currentContent = this.editor.getContent();
    
    if (currentContent !== this.lastContent) {
      this.record(this.lastContent);
      this.lastContent = currentContent;
    }
  }

  /**
   * Record a state to the undo stack
   */
  record(content) {
    // Don't record if we're already at max size
    if (this.undoStack.length >= this.maxSize) {
      this.undoStack.shift(); // Remove oldest entry
    }

    this.undoStack.push(content);
    
    // Clear redo stack when new action is recorded
    this.redoStack = [];
  }

  /**
   * Undo the last action
   */
  undo() {
    if (this.undoStack.length === 0) {
      return false;
    }

    // Get current content before undo
    const currentContent = this.editor.getContent();
    
    // Get previous content from undo stack
    const previousContent = this.undoStack.pop();
    
    // Save current content to redo stack
    this.redoStack.push(currentContent);
    
    // Don't record this change
    this.ignoreChange = true;
    this.isRecording = false;
    
    // Restore previous content
    this.editor.setContent(previousContent);
    this.lastContent = previousContent;
    
    // Re-enable recording after a short delay
    setTimeout(() => {
      this.ignoreChange = false;
      this.isRecording = true;
    }, 50);

    return true;
  }

  /**
   * Redo the last undone action
   */
  redo() {
    if (this.redoStack.length === 0) {
      return false;
    }

    // Get current content before redo
    const currentContent = this.editor.getContent();
    
    // Get next content from redo stack
    const nextContent = this.redoStack.pop();
    
    // Save current content to undo stack
    this.undoStack.push(currentContent);
    
    // Don't record this change
    this.ignoreChange = true;
    this.isRecording = false;
    
    // Restore next content
    this.editor.setContent(nextContent);
    this.lastContent = nextContent;
    
    // Re-enable recording after a short delay
    setTimeout(() => {
      this.ignoreChange = false;
      this.isRecording = true;
    }, 50);

    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Clear history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.lastContent = this.editor.getContent();
  }

  /**
   * Get history size
   */
  getSize() {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length
    };
  }
}
