// ============================================
// AssetFlow — Maintenance Management (Screen 7)
// ============================================

const MaintenancePage = {
  render(container, params = {}) {
    const requests = Store.getAll('maintenance_requests').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const canApprove = Auth.canManageAssets();
    const user = Auth.getCurrentUser();

    // Pipeline counts
    const pipeline = {
      Pending: requests.filter(r => r.status === 'Pending'),
      Approved: requests.filter(r => r.status === 'Approved'),
      'In Progress': requests.filter(r => r.status === 'In Progress'),
      Resolved: requests.filter(r => r.status === 'Resolved'),
      Rejected: requests.filter(r => r.status === 'Rejected')
    };

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Maintenance Management</h2>
            <p class="text-secondary text-sm">${requests.length} total requests</p>
          </div>
          <button class="btn btn-primary" id="raiseMaintenanceBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Raise Request
          </button>
        </div>

        <!-- Pipeline View -->
        <div class="maintenance-pipeline stagger-children">
          ${Object.entries(pipeline).map(([stage, items]) => {
            const colors = {
              Pending: 'var(--color-warning-400)', Approved: 'var(--color-info-400)',
              'In Progress': 'var(--brand-400)', Resolved: 'var(--color-success-400)',
              Rejected: 'var(--color-danger-400)'
            };
            return `
              <div class="pipeline-stage">
                <div class="pipeline-stage-header">
                  <span class="pipeline-stage-title" style="color:${colors[stage]}">${stage}</span>
                  <span class="pipeline-stage-count">${items.length}</span>
                </div>
                ${items.length === 0 ? '<p class="text-tertiary text-xs p-2">No requests</p>' : items.slice(0, 5).map(r => {
                  const asset = Store.getById('assets', r.assetId);
                  const reporter = Store.getById('users', r.reportedBy);
                  return `
                    <div class="pipeline-card" data-request-id="${r.id}">
                      <div style="font-weight:500;font-size:var(--text-xs);color:var(--text-primary);margin-bottom:4px;">${Utils.escapeHtml(asset?.name || '—')}</div>
                      <div class="text-xs text-tertiary" style="margin-bottom:4px;">${Utils.escapeHtml(Utils.truncate(r.description, 40))}</div>
                      <div class="flex items-center justify-between">
                        <span class="${Utils.getBadgeClass(r.priority)}" style="font-size:10px;">${r.priority}</span>
                        <span class="text-xs text-tertiary">${Utils.timeAgo(r.createdAt)}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Table View -->
        <div class="card mt-6">
          <div class="card-header"><h3>All Requests</h3></div>
          <div id="maintenanceTable"></div>
        </div>
      </div>
    `;

    // Pipeline card clicks
    container.querySelectorAll('.pipeline-card').forEach(card => {
      card.addEventListener('click', () => {
        const req = Store.getById('maintenance_requests', card.dataset.requestId);
        if (req) this.showRequestDetail(req, canApprove);
      });
    });

    // Table
    DataTable.render('maintenanceTable', {
      data: requests,
      searchable: true,
      searchPlaceholder: 'Search requests...',
      filters: [
        { key: 'status', label: 'All Statuses', options: ['Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'].map(s => ({ value: s, label: s })) },
        { key: 'priority', label: 'All Priorities', options: ['Critical', 'High', 'Medium', 'Low'].map(s => ({ value: s, label: s })) }
      ],
      columns: [
        { key: 'assetId', label: 'Asset', render: (r) => {
          const asset = Store.getById('assets', r.assetId);
          return `<div><div style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(asset?.name || '—')}</div><div class="text-xs text-tertiary">${asset?.assetTag || ''}</div></div>`;
        }},
        { key: 'description', label: 'Issue', render: (r) => `<span class="text-secondary">${Utils.escapeHtml(Utils.truncate(r.description, 50))}</span>` },
        { key: 'reportedBy', label: 'Reported By', render: (r) => { const u = Store.getById('users', r.reportedBy); return Utils.escapeHtml(u?.name || '—'); }},
        { key: 'priority', label: 'Priority', render: (r) => `<span class="${Utils.getBadgeClass(r.priority)}">${r.priority}</span>` },
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${Utils.formatStatus(r.status)}</span>` },
        { key: 'createdAt', label: 'Date', render: (r) => Utils.formatDate(r.createdAt) }
      ],
      onRowClick: (r) => this.showRequestDetail(r, canApprove),
      actions: canApprove ? [
        { label: 'View', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>', onClick: (r) => this.showRequestDetail(r, canApprove) }
      ] : []
    });

    document.getElementById('raiseMaintenanceBtn')?.addEventListener('click', () => this.openRaiseModal(params.assetId));
  },

  openRaiseModal(presetAssetId) {
    const assets = Store.find('assets', a => a.status !== 'Retired' && a.status !== 'Disposed');
    const content = `<div id="maintFormContainer"></div>`;
    Modal.open('Raise Maintenance Request', content);

    FormBuilder.render('maintFormContainer', {
      values: presetAssetId ? { assetId: presetAssetId } : {},
      fields: [
        { key: 'assetId', label: 'Asset', type: 'select', required: true, options: assets.map(a => ({ value: a.id, label: `${a.name} (${a.assetTag})` })) },
        { key: 'description', label: 'Issue Description', type: 'textarea', required: true, placeholder: 'Describe the issue in detail...' },
        { key: 'priority', label: 'Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'].map(p => ({ value: p, label: p })) },
        { key: 'photo', label: 'Photo (optional)', type: 'file', accept: 'image/*' }
      ],
      submitLabel: 'Submit Request',
      onSubmit: (data) => {
        const asset = Store.getById('assets', data.assetId);
        const req = Store.create('maintenance_requests', {
          ...data,
          reportedBy: Auth.getCurrentUser().id,
          status: 'Pending'
        });
        NotificationEngine.notifyRole('AssetManager', 'GENERAL', `New maintenance request for ${asset?.name} (${asset?.assetTag}) — Priority: ${data.priority}`);
        ActivityLogger.log(Auth.getCurrentUser().id, 'MAINTENANCE_RAISED', 'maintenance', req.id, `Raised maintenance request for ${asset?.name} — ${Utils.truncate(data.description, 50)}`);
        Toast.success('Maintenance request submitted');
        Modal.close();
        Router.navigate('/maintenance');
      }
    });
  },

  showRequestDetail(req, canApprove) {
    const asset = Store.getById('assets', req.assetId);
    const reporter = Store.getById('users', req.reportedBy);
    const assignee = req.assignedTo ? Store.getById('users', req.assignedTo) : null;
    const users = Store.find('users', u => u.status === 'Active');

    const content = `
      <div class="asset-info-grid mb-4">
        <div class="info-item"><span class="info-label">Asset</span><span class="info-value">${Utils.escapeHtml(asset?.name || '—')} (${asset?.assetTag || ''})</span></div>
        <div class="info-item"><span class="info-label">Reported By</span><span class="info-value">${Utils.escapeHtml(reporter?.name || '—')}</span></div>
        <div class="info-item"><span class="info-label">Priority</span><span class="info-value"><span class="${Utils.getBadgeClass(req.priority)}">${req.priority}</span></span></div>
        <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="${Utils.getBadgeClass(req.status)}">${Utils.formatStatus(req.status)}</span></span></div>
        <div class="info-item"><span class="info-label">Submitted</span><span class="info-value">${Utils.formatDateTime(req.createdAt)}</span></div>
        <div class="info-item"><span class="info-label">Assigned To</span><span class="info-value">${assignee ? Utils.escapeHtml(assignee.name) : '<span class="text-tertiary">Unassigned</span>'}</span></div>
      </div>
      <div class="mb-4"><span class="info-label">Issue Description</span><p class="text-sm mt-1">${Utils.escapeHtml(req.description)}</p></div>
      ${req.photo ? `<div class="mb-4"><span class="info-label">Photo</span><img src="${req.photo}" style="max-width:200px;border-radius:var(--radius-md);margin-top:8px;border:1px solid var(--border-default);"></div>` : ''}
      ${req.resolutionNotes ? `<div class="mb-4"><span class="info-label">Resolution Notes</span><p class="text-sm mt-1">${Utils.escapeHtml(req.resolutionNotes)}</p></div>` : ''}
      ${req.resolutionCost ? `<div class="mb-4"><span class="info-label">Resolution Cost</span><p class="text-sm mt-1">${Utils.formatCurrency(req.resolutionCost)}</p></div>` : ''}

      ${canApprove && req.status === 'Pending' ? `
        <div class="form-actions" style="border-top:1px solid var(--border-default);padding-top:16px;margin-top:16px;">
          <button class="btn btn-danger" id="rejectMaintBtn">Reject</button>
          <button class="btn btn-success" id="approveMaintBtn">Approve</button>
        </div>
      ` : ''}

      ${canApprove && req.status === 'Approved' ? `
        <div style="border-top:1px solid var(--border-default);padding-top:16px;margin-top:16px;">
          <div class="form-group mb-3">
            <label class="form-label">Assign Technician</label>
            <select class="form-select" id="technicianSelect">
              <option value="">Select technician...</option>
              ${users.map(u => `<option value="${u.id}" ${req.assignedTo === u.id ? 'selected' : ''}>${Utils.escapeHtml(u.name)}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" id="assignTechBtn">Assign & Start Work</button>
        </div>
      ` : ''}

      ${canApprove && req.status === 'In Progress' ? `
        <div style="border-top:1px solid var(--border-default);padding-top:16px;margin-top:16px;">
          <div class="form-group mb-3">
            <label class="form-label">Resolution Notes</label>
            <textarea class="form-textarea" id="resolutionNotes" placeholder="Describe what was done..."></textarea>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Cost ($)</label>
            <input class="form-input" type="number" id="resolutionCost" min="0" step="0.01" placeholder="0.00">
          </div>
          <button class="btn btn-success" id="resolveMaintBtn">Mark Resolved</button>
        </div>
      ` : ''}
    `;

    Modal.open('Maintenance Request', content, { size: 'lg' });

    // Action handlers
    document.getElementById('approveMaintBtn')?.addEventListener('click', () => {
      Store.update('maintenance_requests', req.id, { status: 'Approved' });
      Store.update('assets', req.assetId, { status: 'Under Maintenance' });
      NotificationEngine.create(req.reportedBy, 'MAINTENANCE_APPROVED', `Your maintenance request for ${asset?.name} has been approved.`);
      ActivityLogger.log(Auth.getCurrentUser().id, 'MAINTENANCE_APPROVED', 'maintenance', req.id, `Approved maintenance for ${asset?.name}`);
      Toast.success('Request approved');
      Modal.close();
      Router.navigate('/maintenance');
    });

    document.getElementById('rejectMaintBtn')?.addEventListener('click', () => {
      Store.update('maintenance_requests', req.id, { status: 'Rejected' });
      NotificationEngine.create(req.reportedBy, 'MAINTENANCE_REJECTED', `Your maintenance request for ${asset?.name} has been rejected.`);
      ActivityLogger.log(Auth.getCurrentUser().id, 'MAINTENANCE_REJECTED', 'maintenance', req.id, `Rejected maintenance for ${asset?.name}`);
      Toast.info('Request rejected');
      Modal.close();
      Router.navigate('/maintenance');
    });

    document.getElementById('assignTechBtn')?.addEventListener('click', () => {
      const techId = document.getElementById('technicianSelect')?.value;
      if (!techId) { Toast.warning('Please select a technician'); return; }
      Store.update('maintenance_requests', req.id, { status: 'In Progress', assignedTo: techId });
      const tech = Store.getById('users', techId);
      NotificationEngine.create(techId, 'GENERAL', `You have been assigned to fix ${asset?.name} (${asset?.assetTag}).`);
      ActivityLogger.log(Auth.getCurrentUser().id, 'TECHNICIAN_ASSIGNED', 'maintenance', req.id, `Assigned ${tech?.name} to ${asset?.name} maintenance`);
      Toast.success(`${tech?.name} assigned`);
      Modal.close();
      Router.navigate('/maintenance');
    });

    document.getElementById('resolveMaintBtn')?.addEventListener('click', () => {
      const notes = document.getElementById('resolutionNotes')?.value || '';
      const cost = parseFloat(document.getElementById('resolutionCost')?.value) || 0;
      Store.update('maintenance_requests', req.id, { status: 'Resolved', resolutionNotes: notes, resolutionCost: cost, resolvedAt: Utils.now() });
      Store.update('assets', req.assetId, { status: 'Available' });
      NotificationEngine.create(req.reportedBy, 'MAINTENANCE_RESOLVED', `Maintenance for ${asset?.name} has been resolved.`);
      ActivityLogger.log(Auth.getCurrentUser().id, 'MAINTENANCE_RESOLVED', 'maintenance', req.id, `Resolved maintenance for ${asset?.name}`);
      Toast.success('Maintenance resolved — asset is now Available');
      Modal.close();
      Router.navigate('/maintenance');
    });
  },

  destroy() {}
};
