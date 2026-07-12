// ============================================
// AssetFlow — Modal Component
// ============================================

const Modal = {
  // Open a modal
  open(title, contentHtml, options = {}) {
    const { size = '', actions = [], onClose = null } = options;

    // Remove existing modal
    this.close();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modalBackdrop';
    backdrop.innerHTML = `
      <div class="modal ${size ? `modal-${size}` : ''}">
        <div class="modal-header">
          <h3>${Utils.escapeHtml(title)}</h3>
          <button class="modal-close" id="modalCloseBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">${contentHtml}</div>
        ${actions.length > 0 ? `
          <div class="modal-footer" id="modalFooter">
            ${actions.map((a, i) => `
              <button class="btn ${a.class || 'btn-secondary'}" id="modalAction${i}">${a.label}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(backdrop);

    // Animate in
    requestAnimationFrame(() => backdrop.classList.add('active'));

    // Bind close events
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
      this.close();
      if (onClose) onClose();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
        if (onClose) onClose();
      }
    });

    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        if (onClose) onClose();
      }
    });

    // Bind action buttons
    actions.forEach((a, i) => {
      const btn = document.getElementById(`modalAction${i}`);
      if (btn && a.onClick) {
        btn.addEventListener('click', a.onClick);
      }
    });

    return backdrop;
  },

  // Close the modal
  close() {
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => backdrop.remove(), 250);
    }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  },

  // Confirm dialog
  confirm(title, message, onConfirm, options = {}) {
    const { confirmLabel = 'Confirm', confirmClass = 'btn-danger', icon = 'alert-triangle' } = options;

    const content = `
      <div class="confirm-body">
        <div class="confirm-icon" style="background:rgba(239,68,68,0.15); color:var(--color-danger-400);">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <h4>${Utils.escapeHtml(title)}</h4>
        <p>${Utils.escapeHtml(message)}</p>
      </div>
    `;

    this.open(title, content, {
      actions: [
        { label: 'Cancel', class: 'btn-secondary', onClick: () => this.close() },
        { label: confirmLabel, class: confirmClass, onClick: () => { this.close(); onConfirm(); } }
      ]
    });
  }
};
