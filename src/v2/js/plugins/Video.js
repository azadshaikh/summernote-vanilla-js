/**
 * Video Plugin - Insert embeddable videos from common providers (v2, no jQuery)
 */

import BasePlugin from '../core/BasePlugin.js';
import { createElement } from '../core/dom.js';

export default class VideoPlugin extends BasePlugin {
  static pluginName = 'video';
  static dependencies = [];

  init() {
    this.dialog = null;
    this.backdrop = null;
    this.savedRange = null;

    this.addButton({
      name: 'video',
      icon: '<i class="ri-video-add-line"></i>',
      tooltip: 'Insert Video',
      callback: () => this.showDialog(),
      className: 'asteronote-btn-video'
    });

    setTimeout(() => this.updateButtonState(), 0);
  }

  showDialog() {
    this.ensureFocusAndRange();
    this.savedRange = this.saveRange();
    if (!this.dialog) this.createDialog();

    const urlInput = this.dialog.querySelector('#asteronote-video-url');
    urlInput.value = '';

    this.dialog.style.display = 'block';
    this.dialog.classList.add('show');
    this.ensureBackdrop();
    urlInput.focus();
  }

  hideDialog() {
    if (!this.dialog) return;
    this.dialog.classList.remove('show');
    this.dialog.style.display = 'none';
    if (this.backdrop && this.backdrop.parentNode) this.backdrop.parentNode.removeChild(this.backdrop);
    this.backdrop = null;
  }

  ensureBackdrop() {
    if (this.backdrop) return;
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop fade show';
    document.body.appendChild(bd);
    this.backdrop = bd;
  }

  createDialog() {
    this.dialog = createElement('div', { className: 'modal fade', tabIndex: '-1', ariaHidden: 'true' });
    this.dialog.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Insert Video</h5>
            <button type="button" class="btn-close" data-action="cancel" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <label class="form-label small" for="asteronote-video-url">Video URL <small class="text-muted">(YouTube, Vimeo, DailyMotion, direct mp4)</small></label>
            <input type="url" class="form-control" id="asteronote-video-url" placeholder="https://www.youtube.com/watch?v=...">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="cancel">Cancel</button>
            <button type="button" class="btn btn-primary" data-action="insert">Insert Video</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(this.dialog);

    // Actions
    this.dialog.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'insert') this.insertVideo();
      if (action === 'cancel') this.hideDialog();
    });

    // Close when clicking outside the content
    this.dialog.addEventListener('mousedown', (e) => {
      if (!e.target.closest('.modal-dialog')) this.hideDialog();
    });
  }

  parseVideo(url) {
    if (!url) return null;
    const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{6,})/i.exec(url);
    if (yt) {
      return { type: 'youtube', src: `https://www.youtube.com/embed/${yt[1]}` };
    }
    const vimeo = /vimeo\.com\/(?:channels\/\w+\/|groups\/\w+\/videos\/)?([0-9]+)/i.exec(url);
    if (vimeo) {
      return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeo[1]}` };
    }
    const dm = /(?:dailymotion\.com\/video\/|dai\.ly\/)([A-Za-z0-9]+)/i.exec(url);
    if (dm) {
      return { type: 'dailymotion', src: `https://www.dailymotion.com/embed/video/${dm[1]}` };
    }
    // Direct media file
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
      return { type: 'video', src: url };
    }
    return null;
  }

  buildEmbed(info) {
    if (info.type === 'video') {
      const video = document.createElement('video');
      video.src = info.src;
      video.controls = true;
      video.style.maxWidth = '100%';
      video.style.display = 'block';
      return video;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'asteronote-video-wrapper';
    const iframe = document.createElement('iframe');
    iframe.src = info.src;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.title = 'Embedded video';
    wrapper.appendChild(iframe);
    return wrapper;
  }

  insertVideo() {
    const input = this.dialog.querySelector('#asteronote-video-url');
    const url = (input.value || '').trim();
    if (!url) return;

    const info = this.parseVideo(url);
    if (!info) {
      input.classList.add('is-invalid');
      setTimeout(() => input.classList.remove('is-invalid'), 1200);
      return;
    }

    this.ensureFocusAndRange();
    if (this.savedRange) this.restoreRange(this.savedRange);

    const node = this.buildEmbed(info);
    this.insertNode(node);
    this._placeCaretAfter(node);

    this.hideDialog();
    this.editor.focus();
    this.emitEvent('inserted', { url, provider: info.type });
    this.editor.emit('asteronote.change', this.editor.getContent());
  }

  _placeCaretAfter(el) {
    const r = document.createRange();
    r.setStartAfter(el);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  insertNode(node) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.editor.editable.appendChild(node);
      return;
    }
    const r = sel.getRangeAt(0);
    r.deleteContents();
    r.insertNode(node);
  }

  updateButtonState() {}
}

