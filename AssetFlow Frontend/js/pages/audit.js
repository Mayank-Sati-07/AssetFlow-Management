// ============================================
// AssetFlow — Asset Audit (Screen 8)
// ============================================

const AuditPage = {
  render(container, params = {}) {
    const cycles = Store.getAll('audit_cycles').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const canCreate = Auth.canManageAssets();

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Asset Audit</h2>
            <p class="text-secondary text-sm">Run structured verification cycles</p>
          </div>
          ${canCreate ? `<button class="btn btn-primary" id="createAuditBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Create Audit Cycle
          </button>` : ''}
        </div>
        <div id="auditTable"></div>
      </div>
    `;

    DataTable.render('auditTable', {
      data: cycles,
      searchable: true,
      columns: [
        { key: 'name', label: 'Audit Name', render: (r) => `<span style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(r.name)}</span>` },
        { key: 'scope', label: 'Scope', render: (r) => {
          const val = r.scope === 'department' ? Store.getById('departments', r.scopeValue)?.name : r.scopeValue;
          return `${Utils.capitalize(r.scope)}: ${Utils.escapeHtml(val || '—')}`;
        }},
        { key: 'auditorIds', label: 'Auditors', render: (r) => (r.auditorIds || []).map(id => {
          const u = Store.getById('users', id);
          return u ? `<div class="avatar avatar-sm" title="${Utils.escapeHtml(u.name)}" style="background:${Utils.stringToColor(u.name)};display:inline-flex;margin-right:2px;">${Utils.getInitials(u.name)}</div>` : '';
        }).join('')},
        { key: '_progress', label: 'Progress', render: (r) => {
          const items = Store.getAuditItemsByCycle(r.id);
          const checked = items.filter(i => i.status !== 'Pending').length;
          const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;
          return `<div class="audit-progress"><div class="progress-bar-container" style="width:80px;"><div class="progress-bar-fill" style="width:${pct}%"></div></div><span class="progress-text">${checked}/${items.length}</span></div>`;
        }},
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${Utils.formatStatus(r.status)}</span>` },
        { key: 'startDate', label: 'Period', render: (r) => `${Utils.formatDate(r.startDate)} – ${Utils.formatDate(r.endDate)}` }
      ],
      onRowClick: (r) => this.openAuditExecution(r),
      actions: [
        { label: 'Execute', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>', onClick: (r) => this.openAuditExecution(r) }
      ]
    });

    document.getElementById('createAuditBtn')?.addEventListener('click', () => this.openCreateModal());
  },

  openCreateModal() {
    const departments = Store.getAll('departments');
    const users = Store.find('users', u => u.status === 'Active');
    const content = `<div id="auditFormContainer"></div>`;
    Modal.open('Create Audit Cycle', content, { size: 'lg' });

    FormBuilder.render('auditFormContainer', {
      fields: [
        { key: 'name', label: 'Audit Name', type: 'text', required: true, placeholder: 'e.g. Q3 2026 IT Asset Audit' },
        { key: 'scope', label: 'Scope', type: 'select', required: true, options: [{ value: 'department', label: 'Department' }, { value: 'location', label: 'Location' }] },
        { key: 'scopeValue', label: 'Scope Value', type: 'select', options: departments.map(d => ({ value: d.id, label: d.name })), hint: 'Select department (or type location in scope)' },
        { key: 'startDate', label: 'Start Date', type: 'date', required: true },
        { key: 'endDate', label: 'End Date', type: 'date', required: true },
        { key: 'auditorIds', label: 'Assign Auditors', type: 'multiselect', required: true, options: users.map(u => ({ value: u.id, label: `${u.name} (${Utils.formatStatus(u.role)})` })) }
      ],
      submitLabel: 'Create Audit Cycle',
      onSubmit: (data) => {
        const cycle = Store.create('audit_cycles', { ...data, status: 'Open' });

        // Auto-generate audit items for assets in scope
        let assetsInScope = [];
        if (data.scope === 'department') {
          assetsInScope = Store.getAssetsByDepartment(data.scopeValue).filter(a => a.status !== 'Disposed');
        } else {
          assetsInScope = Store.find('assets', a => a.location?.toLowerCase().includes(data.scopeValue?.toLowerCase()) && a.status !== 'Disposed');
        }

        assetsInScope.forEach(a => {
          Store.create('audit_items', { auditCycleId: cycle.id, assetId: a.id, status: 'Pending', notes: '', checkedBy: null, checkedAt: null });
        });

        // Notify auditors
        (data.auditorIds || []).forEach(uid => {
          NotificationEngine.create(uid, 'AUDIT_ASSIGNED', `You have been assigned as an auditor for "${data.name}".`);
        });

        ActivityLogger.log(Auth.getCurrentUser().id, 'AUDIT_CREATED', 'audit', cycle.id, `Created audit cycle: ${data.name} with ${assetsInScope.length} assets`);
        Toast.success(`Audit cycle created with ${assetsInScope.length} assets to verify`);
        Modal.close();
        Router.navigate('/audit');
      }
    });
  },

  openAuditExecution(cycle) {
    const items = Store.getAuditItemsByCycle(cycle.id);
    const checked = items.filter(i => i.status !== 'Pending').length;
    const total = items.length;
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
    const isClosed = cycle.status === 'Closed';

    const discrepancies = items.filter(i => i.status === 'Missing' || i.status === 'Damaged');

    const content = `
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">Progress: ${checked}/${total} assets checked (${pct}%)</span>
          <span class="${Utils.getBadgeClass(cycle.status)}">${Utils.formatStatus(cycle.status)}</span>
        </div>
        <div class="progress-bar-container"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      </div>

      ${!isClosed ? `
        <div class="audit-checklist" style="max-height:400px;overflow-y:auto;">
          ${items.map(item => {
            const asset = Store.getById('assets', item.assetId);
            return `
              <div class="audit-checklist-item" data-item-id="${item.id}">
                <div class="asset-info" style="flex:1;">
                  <div style="font-weight:500;font-size:var(--text-sm);color:var(--text-primary);">${Utils.escapeHtml(asset?.name || '—')}</div>
                  <div class="text-xs text-tertiary">${asset?.assetTag || ''} • ${Utils.escapeHtml(asset?.location || '')}</div>
                  ${item.notes ? `<div class="text-xs text-secondary mt-1">${Utils.escapeHtml(item.notes)}</div>` : ''}
                </div>
                <div class="audit-actions">
                  <button class="audit-action-btn ${item.status === 'Verified' ? 'selected-verified' : ''}" data-status="Verified" data-item="${item.id}">✓ Verified</button>
                  <button class="audit-action-btn ${item.status === 'Missing' ? 'selected-missing' : ''}" data-status="Missing" data-item="${item.id}">✕ Missing</button>
                  <button class="audit-action-btn ${item.status === 'Damaged' ? 'selected-damaged' : ''}" data-status="Damaged" data-item="${item.id}">⚠ Damaged</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${discrepancies.length > 0 ? `
        <div class="mt-4">
          <h4 class="text-sm font-semibold mb-3" style="color:var(--color-danger-400);">Discrepancy Report (${discrepancies.length} items)</h4>
          <table class="data-table">
            <thead><tr><th>Asset</th><th>Tag</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>
              ${discrepancies.map(d => {
                const a = Store.getById('assets', d.assetId);
                return `<tr><td>${Utils.escapeHtml(a?.name || '—')}</td><td>${a?.assetTag || ''}</td><td><span class="${Utils.getBadgeClass(d.status)}">${d.status}</span></td><td>${Utils.escapeHtml(d.notes || '—')}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;

    const actions = [];
    if (!isClosed && Auth.canManageAssets()) {
      actions.push({
        label: 'Close Audit', class: 'btn-danger', onClick: () => {
          Modal.confirm('Close Audit Cycle', 'Closing the audit will lock all checks and update asset statuses for missing items. Continue?', () => {
            // Update asset statuses
            items.filter(i => i.status === 'Missing').forEach(i => {
              Store.update('assets', i.assetId, { status: 'Lost' });
            });
            Store.update('audit_cycles', cycle.id, { status: 'Closed', closedAt: Utils.now() });
            ActivityLogger.log(Auth.getCurrentUser().id, 'AUDIT_CLOSED', 'audit', cycle.id, `Closed audit: ${cycle.name} — ${discrepancies.length} discrepancies`);
            if (discrepancies.length > 0) {
              NotificationEngine.notifyRole('Admin', 'AUDIT_DISCREPANCY', `Audit "${cycle.name}" closed with ${discrepancies.length} discrepancies.`);
            }
            Toast.success('Audit cycle closed');
            Modal.close();
            Router.navigate('/audit');
          });
        }
      });
    }
    actions.push({ label: 'Close', class: 'btn-secondary', onClick: () => Modal.close() });

    Modal.open(cycle.name, content, { size: 'xl', actions });

    // Bind audit action buttons
    document.querySelectorAll('.audit-action-btn[data-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.item;
        const status = btn.dataset.status;
        const user = Auth.getCurrentUser();

        // Prompt for notes if flagging
        if (status === 'Missing' || status === 'Damaged') {
          const notes = prompt(`Add notes for this ${status.toLowerCase()} item (optional):`);
          Store.update('audit_items', itemId, { status, notes: notes || '', checkedBy: user.id, checkedAt: Utils.now() });
        } else {
          Store.update('audit_items', itemId, { status, notes: '', checkedBy: user.id, checkedAt: Utils.now() });
        }

        // Update button styles
        const parent = btn.closest('.audit-checklist-item');
        parent.querySelectorAll('.audit-action-btn').forEach(b => {
          b.classList.remove('selected-verified', 'selected-missing', 'selected-damaged');
        });
        btn.classList.add(`selected-${status.toLowerCase()}`);

        // Update progress
        const updatedItems = Store.getAuditItemsByCycle(cycle.id);
        const newChecked = updatedItems.filter(i => i.status !== 'Pending').length;
        const newPct = total > 0 ? Math.round((newChecked / total) * 100) : 0;
        const progressFill = document.querySelector('.progress-bar-fill');
        if (progressFill) progressFill.style.width = `${newPct}%`;
        const progressText = document.querySelector('.text-sm.font-medium');
        if (progressText) progressText.textContent = `Progress: ${newChecked}/${total} assets checked (${newPct}%)`;

        // Update cycle status
        if (cycle.status === 'Open') {
          Store.update('audit_cycles', cycle.id, { status: 'In Progress' });
        }
      });
    });
  },

  destroy() {}
};
