// ============================================
// AssetFlow — Form Builder Component
// ============================================

const FormBuilder = {
  /**
   * Render a form
   * @param {string} containerId
   * @param {object} config - { fields, onSubmit, submitLabel, values }
   *   fields: [{ key, label, type, required, placeholder, options, accept, hint }]
   *   type: text, email, password, number, date, select, textarea, file, checkbox
   */
  render(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const values = config.values || {};

    const fieldsHtml = config.fields.map(f => {
      const val = values[f.key] || '';
      const req = f.required ? '<span class="required">*</span>' : '';

      if (f.type === 'checkbox') {
        return `
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" id="ff_${f.key}" name="${f.key}" ${val ? 'checked' : ''}>
              ${Utils.escapeHtml(f.label)}
            </label>
            ${f.hint ? `<span class="form-hint">${Utils.escapeHtml(f.hint)}</span>` : ''}
          </div>
        `;
      }

      if (f.type === 'select') {
        return `
          <div class="form-group">
            <label class="form-label" for="ff_${f.key}">${Utils.escapeHtml(f.label)} ${req}</label>
            <select class="form-select" id="ff_${f.key}" name="${f.key}" ${f.required ? 'required' : ''}>
              <option value="">Select ${f.label.toLowerCase()}...</option>
              ${(f.options || []).map(o => `<option value="${o.value}" ${val === o.value ? 'selected' : ''}>${Utils.escapeHtml(o.label)}</option>`).join('')}
            </select>
            ${f.hint ? `<span class="form-hint">${Utils.escapeHtml(f.hint)}</span>` : ''}
            <span class="form-error" id="ff_${f.key}_error"></span>
          </div>
        `;
      }

      if (f.type === 'textarea') {
        return `
          <div class="form-group">
            <label class="form-label" for="ff_${f.key}">${Utils.escapeHtml(f.label)} ${req}</label>
            <textarea class="form-textarea" id="ff_${f.key}" name="${f.key}" placeholder="${Utils.escapeHtml(f.placeholder || '')}" ${f.required ? 'required' : ''} rows="${f.rows || 3}">${Utils.escapeHtml(val)}</textarea>
            ${f.hint ? `<span class="form-hint">${Utils.escapeHtml(f.hint)}</span>` : ''}
            <span class="form-error" id="ff_${f.key}_error"></span>
          </div>
        `;
      }

      if (f.type === 'file') {
        return `
          <div class="form-group">
            <label class="form-label">${Utils.escapeHtml(f.label)} ${req}</label>
            <div class="file-upload" id="ff_${f.key}_dropzone">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              <p>Click to upload or drag and drop</p>
              <span class="file-name" id="ff_${f.key}_name">${val ? 'File selected' : ''}</span>
              <input type="file" id="ff_${f.key}" name="${f.key}" accept="${f.accept || '*'}" style="display:none">
            </div>
            ${f.hint ? `<span class="form-hint">${Utils.escapeHtml(f.hint)}</span>` : ''}
          </div>
        `;
      }

      if (f.type === 'multiselect') {
        const selected = Array.isArray(val) ? val : [];
        return `
          <div class="form-group">
            <label class="form-label">${Utils.escapeHtml(f.label)} ${req}</label>
            <div style="display:flex;flex-direction:column;gap:4px;max-height:150px;overflow-y:auto;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border-default);border-radius:var(--radius-md);">
              ${(f.options || []).map(o => `
                <label class="form-checkbox" style="padding:4px 0;">
                  <input type="checkbox" name="${f.key}" value="${o.value}" ${selected.includes(o.value) ? 'checked' : ''}>
                  ${Utils.escapeHtml(o.label)}
                </label>
              `).join('')}
            </div>
            ${f.hint ? `<span class="form-hint">${Utils.escapeHtml(f.hint)}</span>` : ''}
          </div>
        `;
      }

      return `
        <div class="form-group">
          <label class="form-label" for="ff_${f.key}">${Utils.escapeHtml(f.label)} ${req}</label>
          <input class="form-input" type="${f.type || 'text'}" id="ff_${f.key}" name="${f.key}" value="${Utils.escapeHtml(String(val))}" placeholder="${Utils.escapeHtml(f.placeholder || '')}" ${f.required ? 'required' : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} ${f.readOnly ? 'readonly' : ''} ${f.step ? `step="${f.step}"` : ''}>
          ${f.hint ? `<span class="form-hint">${Utils.escapeHtml(f.hint)}</span>` : ''}
          <span class="form-error" id="ff_${f.key}_error"></span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <form id="ff_form" novalidate>
        ${fieldsHtml}
        <div class="form-actions">
          ${config.cancelLabel ? `<button type="button" class="btn btn-secondary" id="ff_cancel">${config.cancelLabel}</button>` : ''}
          <button type="submit" class="btn btn-primary">${config.submitLabel || 'Submit'}</button>
        </div>
      </form>
    `;

    // File upload bindings
    config.fields.filter(f => f.type === 'file').forEach(f => {
      const input = document.getElementById(`ff_${f.key}`);
      const dropzone = document.getElementById(`ff_${f.key}_dropzone`);
      const nameEl = document.getElementById(`ff_${f.key}_name`);
      if (dropzone) {
        dropzone.addEventListener('click', () => input.click());
        input.addEventListener('change', () => {
          if (input.files[0]) {
            nameEl.textContent = input.files[0].name;
          }
        });
      }
    });

    // Cancel
    const cancelBtn = document.getElementById('ff_cancel');
    if (cancelBtn && config.onCancel) {
      cancelBtn.addEventListener('click', config.onCancel);
    }

    // Submit
    const form = document.getElementById('ff_form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate
      let valid = true;
      const data = {};

      for (const f of config.fields) {
        const el = document.getElementById(`ff_${f.key}`);
        const errEl = document.getElementById(`ff_${f.key}_error`);

        if (f.type === 'checkbox') {
          data[f.key] = el ? el.checked : false;
          continue;
        }

        if (f.type === 'multiselect') {
          const checked = form.querySelectorAll(`input[name="${f.key}"]:checked`);
          data[f.key] = Array.from(checked).map(c => c.value);
          if (f.required && data[f.key].length === 0) {
            valid = false;
            if (errEl) errEl.textContent = `${f.label} is required`;
          }
          continue;
        }

        if (f.type === 'file') {
          if (el && el.files[0]) {
            data[f.key] = await Utils.fileToBase64(el.files[0]);
          } else {
            data[f.key] = values[f.key] || null;
          }
          continue;
        }

        const val = el ? el.value.trim() : '';
        data[f.key] = f.type === 'number' ? (val ? parseFloat(val) : null) : val;

        if (errEl) errEl.textContent = '';
        if (el) el.classList.remove('error');

        if (f.required && !val) {
          valid = false;
          if (errEl) errEl.textContent = `${f.label} is required`;
          if (el) el.classList.add('error');
        }

        if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          valid = false;
          if (errEl) errEl.textContent = 'Invalid email address';
          if (el) el.classList.add('error');
        }
      }

      if (valid && config.onSubmit) {
        config.onSubmit(data);
      }
    });
  }
};
