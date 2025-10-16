/*
 * ImageTool - Corner/edge resize handles for images
 * Shows resize handles (8 blue squares) when user clicks an <img> inside the editor
 * Allows drag-to-resize with visual feedback
 */

export default class ImageTool {
  constructor(editor) {
    this.editor = editor;
    this.editable = editor.editable;
    this.wrapper = editor.wrapper;
    this.handleBox = null;
    this.overlay = null;
    this.menuButton = null;
    this.dropdown = null;
    this.currentImage = null;
    this.handles = [];
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;
    this.currentHandle = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleDocClick = this.handleDocClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleSizeClick = this.handleSizeClick.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleUnlinkClick = this.handleUnlinkClick.bind(this);
    this.handleWrapClick = this.handleWrapClick.bind(this);
    this.handleAltClick = this.handleAltClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    if (!this.editable) return;
    this.createHandleBox();
    this.editable.addEventListener('click', this.handleClick);
    // Track scroll on the editable itself to avoid stale overlays
    this.editable.addEventListener('scroll', this.handleScroll, { passive: true });
    document.addEventListener('click', this.handleDocClick);
    window.addEventListener('scroll', this.handleScroll, true); // Use capture for all scroll events
    window.addEventListener('resize', this.handleResize);
  }

  createHandleBox() {
    // Container for handles (positioned absolutely around image)
    this.handleBox = document.createElement('div');
    this.handleBox.className = 'asteronote-image-handles';
    this.handleBox.style.position = 'absolute';
    this.handleBox.style.display = 'none';
  this.handleBox.style.zIndex = '1020'; // Below toolbar popovers but above content
    this.handleBox.style.pointerEvents = 'none'; // allow clicks through to image

    // Create overlay (light semi-transparent background)
    this.overlay = document.createElement('div');
    this.overlay.className = 'asteronote-image-overlay';
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.background = 'rgba(0, 123, 255, 0.25)'; // light blue overlay
    this.overlay.style.pointerEvents = 'none';
    this.handleBox.appendChild(this.overlay);

    // Create Bootstrap dropdown structure (btn-group with data-bs-toggle)
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.style.position = 'absolute';
    btnGroup.style.top = '8px';
    btnGroup.style.right = '8px';
    btnGroup.style.pointerEvents = 'auto';
    btnGroup.style.zIndex = '1045'; // Above toolbar

    // Menu button with Bootstrap dropdown toggle
    this.menuButton = document.createElement('button');
    this.menuButton.className = 'btn asteronote-image-menu-btn';
    this.menuButton.innerHTML = '<i class="ri-more-2-fill"></i>';
    this.menuButton.type = 'button';
    this.menuButton.setAttribute('data-bs-toggle', 'dropdown');
    this.menuButton.setAttribute('aria-expanded', 'false');
    this.menuButton.style.width = '32px';
    this.menuButton.style.height = '32px';
    this.menuButton.style.padding = '0';
    this.menuButton.style.background = 'var(--bs-body-bg)';
    this.menuButton.style.border = '1px solid rgba(0,0,0,0.1)';
    this.menuButton.style.borderRadius = '6px';
    this.menuButton.style.display = 'flex';
    this.menuButton.style.alignItems = 'center';
    this.menuButton.style.justifyContent = 'center';
    this.menuButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    btnGroup.appendChild(this.menuButton);

    // Create dropdown menu (Bootstrap will handle positioning)
    this.dropdown = document.createElement('ul');
    this.dropdown.className = 'dropdown-menu';

    // Alignment section - Icon grid (4 buttons in a row)
    let li = document.createElement('li');
    const alignHeader = document.createElement('h6');
    alignHeader.className = 'dropdown-header';
    alignHeader.style.fontSize = '11px';
    alignHeader.style.padding = '8px 12px 4px';
    alignHeader.textContent = 'ALIGNMENT';
    li.appendChild(alignHeader);
    this.dropdown.appendChild(li);

    li = document.createElement('li');
    const alignGrid = document.createElement('div');
    alignGrid.style.display = 'grid';
    alignGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    alignGrid.style.gap = '4px';
    alignGrid.style.padding = '0 12px 8px';

    const alignments = [
      { icon: 'ri-align-left', value: 'left', title: 'Left' },
      { icon: 'ri-align-center', value: 'center', title: 'Center' },
      { icon: 'ri-align-right', value: 'right', title: 'Right' },
      { icon: 'ri-align-justify', value: 'none', title: 'Default' }
    ];

    alignments.forEach(align => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary';
      btn.style.padding = '6px';
      btn.style.fontSize = '16px';
      btn.title = align.title;
      btn.innerHTML = `<i class="${align.icon}"></i>`;
      btn.addEventListener('click', () => this.handleAlignClick(align.value));
      alignGrid.appendChild(btn);
    });
    li.appendChild(alignGrid);
    this.dropdown.appendChild(li);

    // Size section - Icon grid (4 buttons in a row)
    li = document.createElement('li');
    const sizeHeader = document.createElement('h6');
    sizeHeader.className = 'dropdown-header';
    sizeHeader.style.fontSize = '11px';
    sizeHeader.style.padding = '8px 12px 4px';
    sizeHeader.textContent = 'SIZE';
    li.appendChild(sizeHeader);
    this.dropdown.appendChild(li);

    li = document.createElement('li');
    const sizeGrid = document.createElement('div');
    sizeGrid.style.display = 'grid';
    sizeGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    sizeGrid.style.gap = '4px';
    sizeGrid.style.padding = '0 12px 8px';

    const sizes = [
      { label: '25%', value: '25%' },
      { label: '50%', value: '50%' },
      { label: '75%', value: '75%' },
      { label: '100%', value: '100%' }
    ];

    sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary';
      btn.style.padding = '6px 8px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '500';
      btn.textContent = size.label;
      btn.addEventListener('click', () => this.handleSizeClick(size.value));
      sizeGrid.appendChild(btn);
    });
    li.appendChild(sizeGrid);
    this.dropdown.appendChild(li);

    // Text Wrap section - Icon grid (3 buttons in a row)
    li = document.createElement('li');
    const wrapHeader = document.createElement('h6');
    wrapHeader.className = 'dropdown-header';
    wrapHeader.style.fontSize = '11px';
    wrapHeader.style.padding = '8px 12px 4px';
    wrapHeader.textContent = 'TEXT WRAP';
    li.appendChild(wrapHeader);
    this.dropdown.appendChild(li);

    li = document.createElement('li');
    const wrapGrid = document.createElement('div');
    wrapGrid.style.display = 'grid';
    wrapGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    wrapGrid.style.gap = '4px';
    wrapGrid.style.padding = '0 12px 8px';

    const wraps = [
      { icon: 'ri-text-wrap', value: 'none', title: 'No Wrap' },
      { icon: 'ri-indent-decrease', value: 'left', title: 'Wrap Left' },
      { icon: 'ri-indent-increase', value: 'right', title: 'Wrap Right' }
    ];

    wraps.forEach(wrap => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary';
      btn.style.padding = '6px';
      btn.style.fontSize = '16px';
      btn.title = wrap.title;
      btn.innerHTML = `<i class="${wrap.icon}"></i>`;
      btn.addEventListener('click', () => this.handleWrapClick(wrap.value));
      wrapGrid.appendChild(btn);
    });
    li.appendChild(wrapGrid);
    this.dropdown.appendChild(li);

    // Divider
    li = document.createElement('li');
    li.innerHTML = '<hr class="dropdown-divider" style="margin: 4px 0;">';
    this.dropdown.appendChild(li);

    // Alt Text action
    li = document.createElement('li');
    const altItem = document.createElement('button');
    altItem.className = 'dropdown-item d-flex align-items-center';
    altItem.type = 'button';
    altItem.style.fontSize = '14px';
    altItem.style.padding = '6px 12px';
    altItem.innerHTML = `
      <i class="ri-text me-2"></i>
      <span>Edit Alt Text</span>
    `;
    altItem.addEventListener('click', this.handleAltClick);
    li.appendChild(altItem);
    this.dropdown.appendChild(li);

    // Divider
    li = document.createElement('li');
    li.innerHTML = '<hr class="dropdown-divider" style="margin: 4px 0;">';
    this.dropdown.appendChild(li);

    // Link actions - Text items
    li = document.createElement('li');
    const linkItem = document.createElement('button');
    linkItem.className = 'dropdown-item d-flex align-items-center';
    linkItem.type = 'button';
    linkItem.style.fontSize = '14px';
    linkItem.style.padding = '6px 12px';
    linkItem.innerHTML = `
      <i class="ri-link me-2"></i>
      <span>Add Link</span>
    `;
    linkItem.addEventListener('click', this.handleLinkClick);
    li.appendChild(linkItem);
    this.dropdown.appendChild(li);

    // Divider
    li = document.createElement('li');
    li.innerHTML = '<hr class="dropdown-divider" style="margin: 4px 0;">';
    this.dropdown.appendChild(li);

    // Remove action (using Bootstrap dropdown-item)
    li = document.createElement('li');
    const removeItem = document.createElement('button');
    removeItem.className = 'dropdown-item d-flex align-items-center';
    removeItem.type = 'button';
    removeItem.style.fontSize = '14px';
    removeItem.style.padding = '6px 12px';
    removeItem.innerHTML = `
      <i class="ri-delete-bin-line me-2"></i>
      <span>Remove Image</span>
    `;
    removeItem.addEventListener('click', this.handleDeleteClick);
    li.appendChild(removeItem);
    this.dropdown.appendChild(li);

    // Append dropdown to btn-group (Bootstrap structure)
    btnGroup.appendChild(this.dropdown);

    // Append btn-group to handleBox
    this.handleBox.appendChild(btnGroup);

    // Create 8 handles: 4 corners + 4 edges
    const positions = [
      { name: 'nw', cursor: 'nwse-resize', x: 0, y: 0 },
      { name: 'n', cursor: 'ns-resize', x: 0.5, y: 0 },
      { name: 'ne', cursor: 'nesw-resize', x: 1, y: 0 },
      { name: 'e', cursor: 'ew-resize', x: 1, y: 0.5 },
      { name: 'se', cursor: 'nwse-resize', x: 1, y: 1 },
      { name: 's', cursor: 'ns-resize', x: 0.5, y: 1 },
      { name: 'sw', cursor: 'nesw-resize', x: 0, y: 1 },
      { name: 'w', cursor: 'ew-resize', x: 0, y: 0.5 }
    ];

    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = 'asteronote-resize-handle';
      handle.dataset.position = pos.name;
      handle.style.position = 'absolute';
      handle.style.width = '8px';
      handle.style.height = '8px';
      handle.style.background = '#1e90ff'; // blue
      handle.style.border = '1px solid white';
      handle.style.cursor = pos.cursor;
      handle.style.pointerEvents = 'auto'; // handles are clickable
  handle.style.zIndex = '1044'; // Above handleBox but under badge
      handle.dataset.xRatio = String(pos.x);
      handle.dataset.yRatio = String(pos.y);

      handle.addEventListener('mousedown', this.handleMouseDown);
      this.handles.push(handle);
      this.handleBox.appendChild(handle);
    });

    // Append to editor wrapper so it's clipped within the editor bounds
    // and positions can be calculated relative to the editor viewport.
    if (this.wrapper) {
      this.wrapper.appendChild(this.handleBox);
      // Ensure wrapper can be a positioning context
      try { if (getComputedStyle(this.wrapper).position === 'static') this.wrapper.style.position = 'relative'; } catch (e) {}
    } else {
      document.body.appendChild(this.handleBox);
    }
  }

  handleClick(e) {
    const el = e.target;
    if (el && el.tagName === 'IMG') {
      e.stopPropagation();
      this.showForImage(el);
    }
  }

  handleDocClick(e) {
    // Hide handles when clicking outside image or handle box
    const el = e.target;
    if (!this.handleBox) return;

    // Check if click is on menu button, dropdown, or current image
    if (this.currentImage &&
        (el === this.currentImage ||
         this.handleBox.contains(el) ||
         this.menuButton.contains(el) ||
         this.dropdown.contains(el))) {
      return;
    }

    // Hide if clicking outside (Bootstrap will handle dropdown closing)
    this.hide();
  }

  handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.currentImage) return;

    // Save current state to history BEFORE resize starts
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    this.isDragging = true;
    this.currentHandle = e.target;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = this.currentImage.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    // Disable text selection during drag
    document.body.style.userSelect = 'none';

    // Keep the image selected throughout the drag
    this.selectImage(this.currentImage);
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.currentImage || !this.currentHandle) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    const position = this.currentHandle.dataset.position;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;

    // Calculate new dimensions based on handle position
    // Corners: maintain aspect ratio
    // Edges: allow independent width/height adjustment
    const aspectRatio = this.startWidth / this.startHeight;

    switch (position) {
      case 'se': // bottom-right corner
        newWidth = this.startWidth + deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'sw': // bottom-left corner
        newWidth = this.startWidth - deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'ne': // top-right corner
        newWidth = this.startWidth + deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'nw': // top-left corner
        newWidth = this.startWidth - deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'e': // right edge
        newWidth = this.startWidth + deltaX;
        newHeight = this.startHeight; // keep height
        break;
      case 'w': // left edge
        newWidth = this.startWidth - deltaX;
        newHeight = this.startHeight;
        break;
      case 's': // bottom edge
        newHeight = this.startHeight + deltaY;
        newWidth = this.startWidth; // keep width
        break;
      case 'n': // top edge
        newHeight = this.startHeight - deltaY;
        newWidth = this.startWidth;
        break;
    }

    // Enforce minimum size
    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);

    // Apply new size
    this.currentImage.style.width = `${Math.round(newWidth)}px`;
    this.currentImage.style.height = `${Math.round(newHeight)}px`;

    // Update handle positions
    this.updateHandlePositions();

    // Show size feedback
    this.showFeedback(this.currentImage, `${Math.round(newWidth)} × ${Math.round(newHeight)}px`);
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.currentHandle = null;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    // Re-enable text selection
    document.body.style.userSelect = '';

    // Update original element
    this.editor.updateOriginalElement();

    if (this.currentImage) {
      const rect = this.currentImage.getBoundingClientRect();

      // Emit resize event
      this.editor.emit('image.resize', {
        image: this.currentImage,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });

      // Update history with new state
      if (this.editor.history) {
        const newContent = this.editor.getContent();
        this.editor.history.lastContent = newContent;
      }

      // Trigger change event
      this.editor.emit('asteronote.change', this.editor.getContent());

      // Re-select the image so the overlay remains active after resizing
      this.selectImage(this.currentImage);
      this.showForImage(this.currentImage);
    }
  }

  /**
   * Programmatically select the image node to keep selection/overlay
   */
  selectImage(img) {
    if (!img) return;
    try {
      const range = document.createRange();
      range.selectNode(img);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* ignore */ }
  }

  showForImage(img) {
    this.currentImage = img;
    this.handleBox.style.display = 'block';
    this.updateHandlePositions();
  }

  updateHandlePositions() {
    if (!this.currentImage || !this.handleBox) return;

    const imgRect = this.currentImage.getBoundingClientRect();
    const wrapRect = (this.wrapper || document.body).getBoundingClientRect();
    const editRect = (this.editable || this.wrapper || document.body).getBoundingClientRect();

    // Compute intersection of image with editable area to avoid drawing outside editor
    const ix1 = Math.max(imgRect.left, editRect.left);
    const iy1 = Math.max(imgRect.top, editRect.top);
    const ix2 = Math.min(imgRect.right, editRect.right);
    const iy2 = Math.min(imgRect.bottom, editRect.bottom);
    const iW = Math.max(0, ix2 - ix1);
    const iH = Math.max(0, iy2 - iy1);

    if (iW <= 0 || iH <= 0) {
      // Not visible at all inside editor
      this.hide();
      return;
    }

    // Position handle box using coordinates relative to wrapper
    const top = iy1 - wrapRect.top;
    const left = ix1 - wrapRect.left;
    this.handleBox.style.top = `${top}px`;
    this.handleBox.style.left = `${left}px`;
    this.handleBox.style.width = `${iW}px`;
    this.handleBox.style.height = `${iH}px`;

    // Always show handles, but clamp their positions into the visible overlay region.
    // Compute offset of the intersection relative to the image's top-left.
    const offX = ix1 - imgRect.left;
    const offY = iy1 - imgRect.top;
    this.handles.forEach(handle => {
      handle.style.display = 'block';
      const xRatio = parseFloat(handle.dataset.xRatio);
      const yRatio = parseFloat(handle.dataset.yRatio);
      // Ideal position relative to the image box
      let hx = imgRect.width * xRatio - 4;
      let hy = imgRect.height * yRatio - 4;
      // Translate to overlay (intersection) coordinates
      hx = hx - offX;
      hy = hy - offY;
      // Clamp to overlay bounds so handles never render outside
      const maxX = Math.max(0, iW - 8);
      const maxY = Math.max(0, iH - 8);
      if (hx < 0) hx = 0; else if (hx > maxX) hx = maxX;
      if (hy < 0) hy = 0; else if (hy > maxY) hy = maxY;
      handle.style.left = `${hx}px`;
      handle.style.top = `${hy}px`;
    });
  }

  showFeedback(img, text) {
    // Remove existing badge
    const existing = document.querySelector('.asteronote-image-badge');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    const badge = document.createElement('div');
    badge.className = 'asteronote-image-badge';
    badge.textContent = text;
    badge.style.position = 'absolute';
    badge.style.background = 'rgba(0,0,0,0.7)';
    badge.style.color = 'white';
    badge.style.padding = '4px 8px';
    badge.style.borderRadius = '4px';
    badge.style.fontSize = '12px';
  badge.style.zIndex = '1047'; // Above everything (but not permanent)
    badge.style.pointerEvents = 'none';

    const rect = img.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;

    badge.style.top = `${rect.bottom + scrollTop - 28}px`;
    badge.style.left = `${rect.right + scrollLeft - 80}px`;

    document.body.appendChild(badge);

    // Auto-remove during drag, but keep during resize
    if (!this.isDragging) {
      setTimeout(() => {
        if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
      }, 1500);
    }
  }

  handleScroll(e) {
    // Update or hide on scroll to prevent lingering overlay
    if (!this.currentImage || this.handleBox.style.display !== 'block') return;

    // If the image is outside the visible area of the editor wrapper, hide the overlay
    try {
      const imgRect = this.currentImage.getBoundingClientRect();
      const wrapRect = (this.wrapper || this.editable || document.body).getBoundingClientRect();
      const visible = (
        imgRect.right > wrapRect.left &&
        imgRect.left < wrapRect.right &&
        imgRect.bottom > wrapRect.top &&
        imgRect.top < wrapRect.bottom
      );
      if (!visible) {
        this.hide();
        return;
      }
    } catch (_) {}

    this.updateHandlePositions();
  }

  handleResize(e) {
    // Update handle positions on window resize
    if (this.currentImage && this.handleBox.style.display === 'block') {
      this.updateHandlePositions();
    }
  }

  handleDeleteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.currentImage) return;

    // Save state before deletion for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    // Remove the image
    const img = this.currentImage;
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }

    // Hide the controls
    this.hide();

    // Update editor
    this.editor.updateOriginalElement();
    this.editor.emit('image.delete', { image: img });
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  handleAlignClick(alignment) {
    if (!this.currentImage) return;

    // Save state before alignment change for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    const img = this.currentImage;

    // Remove any existing alignment classes and inline styles
    img.style.display = '';
    img.style.marginLeft = '';
    img.style.marginRight = '';
    img.style.float = '';

    // Apply alignment
    switch (alignment) {
      case 'left':
        img.style.display = 'block';
        img.style.marginLeft = '0';
        img.style.marginRight = 'auto';
        break;
      case 'center':
        img.style.display = 'block';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
        break;
      case 'right':
        img.style.display = 'block';
        img.style.marginLeft = 'auto';
        img.style.marginRight = '0';
        break;
      case 'none':
      default:
        // Default block display, no special alignment
        img.style.display = 'block';
        break;
    }

    // Close dropdown using Bootstrap's API
    if (this.menuButton) {
      this.menuButton.click(); // Toggle to close
    }

    // Update editor and emit events
    this.editor.updateOriginalElement();
    this.editor.emit('image.align', { image: img, alignment });
    this.editor.emit('asteronote.change', this.editor.getContent());

    // Update overlay position after alignment change
    setTimeout(() => this.updateHandlePositions(), 10);

    // Show feedback
    const alignmentText = alignment === 'none' ? 'Default' : alignment.charAt(0).toUpperCase() + alignment.slice(1);
    this.showFeedback(img, `Aligned: ${alignmentText}`);
  }

  handleSizeClick(size) {
    if (!this.currentImage) return;

    // Save state before size change for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    const img = this.currentImage;

    // Set the width to the preset percentage
    img.style.width = size;
    img.style.height = 'auto'; // Maintain aspect ratio

    // Close dropdown using Bootstrap's API
    if (this.menuButton) {
      this.menuButton.click(); // Toggle to close
    }

    // Update editor and emit events
    this.editor.updateOriginalElement();
    this.editor.emit('image.resize', { image: img, width: size });
    this.editor.emit('asteronote.change', this.editor.getContent());

    // Update overlay position after size change
    setTimeout(() => this.updateHandlePositions(), 10);

    // Show feedback
    this.showFeedback(img, `Size: ${size}`);
  }

  handleLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.currentImage) return;

    const img = this.currentImage;
    const existingLink = img.parentElement?.tagName === 'A' ? img.parentElement : null;
    const currentUrl = existingLink ? existingLink.href : '';
    const currentTarget = existingLink ? existingLink.target : '';

    // Close dropdown using Bootstrap's API
    if (this.menuButton) {
      this.menuButton.click(); // Toggle to close
    }

    // Prompt for URL
    const url = prompt('Enter image link URL:', currentUrl);

    if (url === null) return; // User cancelled

    // Save state before change for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    if (url.trim() === '') {
      // Empty URL - remove link if exists
      if (existingLink) {
        existingLink.parentNode.insertBefore(img, existingLink);
        existingLink.parentNode.removeChild(existingLink);
      }
    } else {
      // Add or update link
      if (existingLink) {
        existingLink.href = url.trim();
      } else {
        const link = document.createElement('a');
        link.href = url.trim();
        link.target = '_blank'; // Open in new tab by default
        link.rel = 'noopener noreferrer'; // Security best practice
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);
      }
    }

    // Update editor and emit events
    this.editor.updateOriginalElement();
    this.editor.emit('image.link', { image: img, url: url.trim() });
    this.editor.emit('asteronote.change', this.editor.getContent());

    // Show feedback
    this.showFeedback(img, url.trim() ? 'Link added' : 'Link removed');
  }

  handleUnlinkClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.currentImage) return;

    const img = this.currentImage;
    const existingLink = img.parentElement?.tagName === 'A' ? img.parentElement : null;

    if (!existingLink) {
      // No link to remove
      if (this.menuButton) {
        this.menuButton.click(); // Toggle to close
      }
      return;
    }

    // Save state before change for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    // Remove the link wrapper
    existingLink.parentNode.insertBefore(img, existingLink);
    existingLink.parentNode.removeChild(existingLink);

    // Close dropdown using Bootstrap's API
    if (this.menuButton) {
      this.menuButton.click(); // Toggle to close
    }

    // Update editor and emit events
    this.editor.updateOriginalElement();
    this.editor.emit('image.unlink', { image: img });
    this.editor.emit('asteronote.change', this.editor.getContent());

    // Show feedback
    this.showFeedback(img, 'Link removed');
  }

  handleWrapClick(wrapType) {
    if (!this.currentImage) return;

    // Save state before change for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    const img = this.currentImage;

    // Remove existing float/display styles
    img.style.float = '';
    img.style.display = '';
    img.style.margin = '';

    // Apply wrap type
    switch (wrapType) {
      case 'left':
        img.style.float = 'left';
        img.style.marginRight = '1rem';
        img.style.marginBottom = '0.5rem';
        break;
      case 'right':
        img.style.float = 'right';
        img.style.marginLeft = '1rem';
        img.style.marginBottom = '0.5rem';
        break;
      case 'none':
      default:
        // No float - block display
        img.style.display = 'block';
        break;
    }

    // Close dropdown using Bootstrap's API
    if (this.menuButton) {
      this.menuButton.click(); // Toggle to close
    }

    // Update editor and emit events
    this.editor.updateOriginalElement();
    this.editor.emit('image.wrap', { image: img, wrapType });
    this.editor.emit('asteronote.change', this.editor.getContent());

    // Show feedback
    const wrapText = wrapType === 'none' ? 'No Wrap' : `Wrap ${wrapType.charAt(0).toUpperCase() + wrapType.slice(1)}`;
    this.showFeedback(img, wrapText);

    // Update handle positions
    this.updateHandlePositions();
  }

  handleAltClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.currentImage) return;

    const img = this.currentImage;
    const currentAlt = img.getAttribute('alt') || '';

    // Close dropdown using Bootstrap's API
    if (this.menuButton) {
      this.menuButton.click(); // Toggle to close
    }

    // Prompt for alt text
    const altText = prompt('Enter alt text (for accessibility):', currentAlt);

    if (altText === null) return; // User cancelled

    // Save state before change for undo
    if (this.editor.history) {
      const content = this.editor.getContent();
      this.editor.history.record(content);
    }

    // Set alt text
    if (altText.trim() === '') {
      img.removeAttribute('alt');
    } else {
      img.setAttribute('alt', altText.trim());
    }

    // Update editor and emit events
    this.editor.updateOriginalElement();
    this.editor.emit('image.alt', { image: img, alt: altText.trim() });
    this.editor.emit('asteronote.change', this.editor.getContent());

    // Show feedback
    this.showFeedback(img, altText.trim() ? 'Alt text updated' : 'Alt text removed');
  }

  hide() {
    if (this.handleBox) this.handleBox.style.display = 'none';
    // Bootstrap will handle dropdown hide automatically
    this.currentImage = null;

    // Remove any lingering badges
    const badges = document.querySelectorAll('.asteronote-image-badge');
    badges.forEach(b => {
      if (b.parentNode) b.parentNode.removeChild(b);
    });
  }

  destroy() {
    if (this.handleBox && this.handleBox.parentNode) {
      this.handleBox.parentNode.removeChild(this.handleBox);
    }
    // Dropdown is inside handleBox, so it's removed automatically
    this.handleBox = null;
    this.dropdown = null;
    this.handles = [];
    this.currentImage = null;
    this.editable.removeEventListener('click', this.handleClick);
    try { this.editable.removeEventListener('scroll', this.handleScroll); } catch (e) {}
    document.removeEventListener('click', this.handleDocClick);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('resize', this.handleResize);
  }
}
