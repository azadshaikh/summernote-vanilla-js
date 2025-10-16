/**
 * Table Plugin - Create and edit tables (Bootstrap styled)
 * Features:
 *  - Insert table via grid selector (up to 10x10)
 *  - Add/Delete row (above/below, current)
 *  - Add/Delete column (left/right, current)
 *  - Delete table
 *  - Toggle header row / header column
 */

import BasePlugin from '../core/BasePlugin.js';

export default class TablePlugin extends BasePlugin {
  static pluginName = 'table';
  static dependencies = [];

  init() {
    this.currentCell = null;

    // Toolbar button with dropdown
    this.addButton({
      name: 'table',
      icon: '<i class="ri-table-2"></i>',
      tooltip: 'Table',
      callback: () => {},
      className: 'asteronote-btn-table dropdown-toggle'
    });

    const button = this.buttons.get('table');
    if (button && button.element) {
      button.element.setAttribute('data-bs-toggle', 'dropdown');
      button.element.setAttribute('aria-expanded', 'false');
    }

    this.createDropdown();

    // Update active state based on selection inside table
    const refresh = () => this.updateButtonState();
    this.on('asteronote.keyup', refresh);
    this.on('asteronote.mouseup', refresh);
    this.on('asteronote.selectionchange', refresh);
    setTimeout(refresh, 0);
  }

  createDropdown() {
    const button = this.buttons.get('table');
    if (!button || !button.element) return;

    // Wrap button in btn-group
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    button.element.parentNode.insertBefore(btnGroup, button.element);
    btnGroup.appendChild(button.element);

    // Dropdown container
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu p-2';
    // Width will be computed dynamically from grid size below

    // Grid selector (10x10)
    const gridWrap = document.createElement('div');
    gridWrap.className = 'asteronote-table-grid d-grid';
    gridWrap.style.display = 'grid';
    // Define max sizes before using in styles
    const maxRows = 8; const maxCols = 8;
    gridWrap.style.gridTemplateColumns = `repeat(${maxCols}, 20px)`;
    gridWrap.style.gridAutoRows = '20px';
    gridWrap.style.gap = '2px';
    gridWrap.style.padding = '4px';
    gridWrap.style.borderBottom = '1px solid var(--bs-border-color)';

    const indicator = document.createElement('div');
    indicator.className = 'small text-muted px-1 py-1';
    indicator.textContent = '0 x 0';
    for (let r = 1; r <= maxRows; r++) {
      for (let c = 1; c <= maxCols; c++) {
        const cell = document.createElement('div');
        cell.className = 'asteronote-table-grid-cell';
        cell.style.border = '1px solid var(--bs-border-color)';
        cell.style.background = 'var(--bs-body-bg)';
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        cell.addEventListener('mouseenter', () => this.highlightGrid(gridWrap, r, c, indicator));
        cell.addEventListener('mousedown', (e) => { e.preventDefault(); });
        cell.addEventListener('click', (e) => {
          e.preventDefault();
          this.insertTable(r, c);
        });
        gridWrap.appendChild(cell);
      }
    }

    // Compute responsive min width based on grid size
    const cell = 20; // px
    const gap = 2;   // px
    const gridWidth = (maxCols * cell) + ((maxCols - 1) * gap) + 8 * 2; // grid width + horizontal padding estimate
    const toolsMin = 200; // ensure tools area has room
    menu.style.minWidth = `${Math.max(gridWidth, toolsMin)}px`;

    menu.appendChild(gridWrap);
    menu.appendChild(indicator);

    // Tools
    const tools = document.createElement('div');
    tools.className = 'px-1 pt-1';
    tools.innerHTML = `
      <div class="d-grid gap-1" style="grid-template-columns: repeat(2, 1fr);">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-row-above" title="Add row above"><i class="ri-insert-row-top"></i></button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-row-below" title="Add row below"><i class="ri-insert-row-bottom"></i></button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-col-left" title="Add column left"><i class="ri-insert-column-left"></i></button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-col-right" title="Add column right"><i class="ri-insert-column-right"></i></button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="del-row" title="Delete row"><i class="ri-delete-row"></i></button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="del-col" title="Delete column"><i class="ri-delete-column"></i></button>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="del-table" title="Delete table"><i class="ri-delete-bin-6-line"></i></button>
      </div>
    `;

    tools.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      e.preventDefault();
      const action = btn.getAttribute('data-action');
      this.ensureFocusAndRange();
      switch (action) {
        case 'add-row-above': this.addRow('above'); break;
        case 'add-row-below': this.addRow('below'); break;
        case 'add-col-left': this.addColumn('left'); break;
        case 'add-col-right': this.addColumn('right'); break;
        case 'del-row': this.deleteRow(); break;
        case 'del-col': this.deleteColumn(); break;
        case 'del-table': this.deleteTable(); break;
      }
      setTimeout(() => this.updateButtonState(), 0);
    });

    menu.appendChild(tools);
    btnGroup.appendChild(menu);
  }

  highlightGrid(gridWrap, rows, cols, indicator) {
    const cells = gridWrap.querySelectorAll('.asteronote-table-grid-cell');
    cells.forEach((cell) => {
      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      if (r <= rows && c <= cols) {
        cell.style.background = 'var(--bs-secondary-bg, #e9ecef)';
      } else {
        cell.style.background = 'var(--bs-body-bg)';
      }
    });
    indicator.textContent = `${rows} x ${cols}`;
  }

  insertTable(rows, cols) {
    rows = Math.max(1, Math.min(100, rows|0));
    cols = Math.max(1, Math.min(100, cols|0));
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    const tbody = document.createElement('tbody');
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        td.innerHTML = '<p><br></p>';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    this.insertNode(table);
    this.placeCaretInCell(table.querySelector('td,th'));
    this.emitEvent('inserted', { rows, cols });
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  placeCaretInCell(cell) {
    if (!cell) return;
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  getCurrentCell() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    return node ? (node.closest ? node.closest('td,th') : null) : null;
  }

  getTableContext() {
    const cell = this.getCurrentCell();
    if (!cell) return null;
    const tr = cell.parentElement;
    const table = tr ? tr.closest('table') : null;
    if (!table) return null;
    const rowIndex = Array.prototype.indexOf.call(tr.parentElement.children, tr);
    let colIndex = 0;
    for (let i = 0; i < tr.children.length; i++) {
      if (tr.children[i] === cell) { colIndex = i; break; }
    }
    return { table, tbody: tr.parentElement, tr, cell, rowIndex, colIndex };
  }

  addRow(where = 'below') {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { tbody, tr, colIndex } = ctx;
    const newTr = document.createElement('tr');
    const cols = tr.children.length;
    for (let i = 0; i < cols; i++) {
      const td = document.createElement('td');
      td.innerHTML = '<p><br></p>';
      newTr.appendChild(td);
    }
    if (where === 'above') tbody.insertBefore(newTr, tr);
    else tbody.insertBefore(newTr, tr.nextSibling);
    this.placeCaretInCell(newTr.children[colIndex] || newTr.firstElementChild);
    this.emitEvent('row-added', { where });
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  addColumn(where = 'right') {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { table, tr, colIndex } = ctx;
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      const td = document.createElement('td');
      td.innerHTML = '<p><br></p>';
      if (where === 'left') row.insertBefore(td, row.children[colIndex] || row.firstElementChild);
      else row.insertBefore(td, row.children[colIndex + 1] || null);
    });
    const target = (where === 'left') ? tr.children[colIndex] : tr.children[colIndex + 1];
    this.placeCaretInCell(target || tr.lastElementChild);
    this.emitEvent('col-added', { where });
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  deleteRow() {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { tbody, tr } = ctx;
    const next = tr.nextElementSibling || tr.previousElementSibling;
    tbody.removeChild(tr);
    if (!tbody.querySelector('tr')) {
      // remove entire table if no rows left
      const table = tbody.parentElement;
      table.parentElement.removeChild(table);
    } else if (next) {
      this.placeCaretInCell(next.firstElementChild);
    }
    this.emitEvent('row-deleted');
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  deleteColumn() {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { table, tr, colIndex } = ctx;
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      if (row.children[colIndex]) row.removeChild(row.children[colIndex]);
    });
    if (!table.querySelector('td,th')) {
      table.parentElement.removeChild(table);
    } else {
      const targetRow = tr.nextElementSibling || tr.previousElementSibling || tr;
      this.placeCaretInCell(targetRow.firstElementChild);
    }
    this.emitEvent('col-deleted');
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  deleteTable() {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { table } = ctx;
    const after = table.nextSibling;
    table.parentElement.removeChild(table);
    if (after) {
      const range = document.createRange();
      range.setStartBefore(after);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    this.emitEvent('table-deleted');
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  toggleHeaderRow() {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { tbody } = ctx;
    const first = tbody.querySelector('tr');
    if (!first) return;
    Array.from(first.children).forEach((cell) => {
      if (cell.tagName === 'TD') {
        const th = document.createElement('th');
        th.innerHTML = cell.innerHTML || '<p><br></p>';
        cell.parentElement.replaceChild(th, cell);
      } else if (cell.tagName === 'TH') {
        const td = document.createElement('td');
        td.innerHTML = cell.innerHTML || '<p><br></p>';
        cell.parentElement.replaceChild(td, cell);
      }
    });
    this.emitEvent('header-row-toggled');
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  toggleHeaderColumn() {
    const ctx = this.getTableContext();
    if (!ctx) return;
    const { table } = ctx;
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      const first = row.firstElementChild;
      if (!first) return;
      if (first.tagName === 'TD') {
        const th = document.createElement('th');
        th.innerHTML = first.innerHTML || '<p><br></p>';
        row.replaceChild(th, first);
      } else if (first.tagName === 'TH') {
        const td = document.createElement('td');
        td.innerHTML = first.innerHTML || '<p><br></p>';
        row.replaceChild(td, first);
      }
    });
    this.emitEvent('header-col-toggled');
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  updateButtonState() {
    const button = this.buttons.get('table');
    if (!button || !button.element) return;
    const inTable = !!this.getCurrentCell();
    button.element.classList.toggle('active', inTable);
  }

  insertNode(node) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.editor.editable.appendChild(node);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
  }
}
