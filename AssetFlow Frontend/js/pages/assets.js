// ============================================
// AssetFlow — Asset Registration & Directory (Screen 4)
// ============================================

const AssetsPage = {
  currentView: 'directory', // directory | detail | register

  render(container, params = {}) {
    if (params.id) {
      this.renderDetail(container, params.id);
    } else if (params.action === 'register') {
      this.renderRegisterForm(container);
    } else {
      this.renderDirectory(container, params.search || '');
    }
  },

  renderDirectory(container, searchQuery) {
    const assets = Store.getAll('assets');
    const categories = Store.getAll('categories');
    const departments = Store.getAll('departments');
    const canRegister = Auth.canManageAssets();

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Asset Directory</h2>
            <p class="text-secondary text-sm">${assets.length} assets registered</p>
          </div>
          <div class="page-header-actions">
            ${canRegister ? `<button class="btn btn-primary" id="registerAssetBtn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Register Asset
            </button>` : ''}
          </div>
        </div>
        <div id="assetTable"></div>
      </div>
    `;

    const tableRef = DataTable.render('assetTable', {
      data: assets,
      searchable: true,
      searchPlaceholder: 'Search by name, tag, serial...',
      filters: [
        { key: 'status', label: 'All Statuses', options: ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'].map(s => ({ value: s, label: s })) },
        { key: 'categoryId', label: 'All Categories', options: categories.map(c => ({ value: c.id, label: c.name })) },
        { key: 'departmentId', label: 'All Departments', options: departments.map(d => ({ value: d.id, label: d.name })) }
      ],
      columns: [
        { key: 'assetTag', label: 'Tag', width: '90px', render: (r) => `<span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--brand-400);font-weight:600;">${r.assetTag}</span>` },
        { key: 'name', label: 'Asset Name', render: (r) => `
          <div>
            <div style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(r.name)}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">SN: ${Utils.escapeHtml(r.serialNumber || 'N/A')}</div>
          </div>
        ` },
        { key: 'categoryId', label: 'Category', render: (r) => {
          const cat = categories.find(c => c.id === r.categoryId);
          return cat ? Utils.escapeHtml(cat.name) : '—';
        }},
        { key: 'location', label: 'Location', render: (r) => `<span class="text-secondary">${Utils.escapeHtml(r.location || '—')}</span>` },
        { key: 'condition', label: 'Condition', render: (r) => Utils.escapeHtml(r.condition || '—') },
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${Utils.formatStatus(r.status)}</span>` },
        { key: 'cost', label: 'Cost', render: (r) => Utils.formatCurrency(r.cost), sortable: true }
      ],
      onRowClick: (r) => Router.navigate(`/assets?id=${r.id}`),
      actions: canRegister ? [
        { label: 'View', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>', onClick: (r) => Router.navigate(`/assets?id=${r.id}`) }
      ] : []
    });

    document.getElementById('registerAssetBtn')?.addEventListener('click', () => {
      Router.navigate('/assets?action=register');
    });

    // Auto-focus search with query
    if (searchQuery) {
      setTimeout(() => {
        const input = document.querySelector('#assetTable .search-box input');
        if (input) { input.value = searchQuery; input.dispatchEvent(new Event('input')); }
      }, 100);
    }
  },

  renderRegisterForm(container) {
    const categories = Store.getAll('categories');
    const departments = Store.getAll('departments');
    const nextTag = Utils.generateAssetTag();

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Register New Asset</h2>
            <p class="text-secondary text-sm">Add a new asset to the directory</p>
          </div>
          <button class="btn btn-secondary" onclick="Router.navigate('/assets')">← Back to Directory</button>
        </div>
        <div class="card" style="max-width:800px;">
          <div id="registerFormContainer"></div>
        </div>
      </div>
    `;

    FormBuilder.render('registerFormContainer', {
      values: { assetTag: nextTag, status: 'Available', condition: 'New' },
      fields: [
        { key: 'name', label: 'Asset Name', type: 'text', required: true, placeholder: 'e.g. Dell Latitude 5540' },
        { key: 'assetTag', label: 'Asset Tag', type: 'text', required: true, readOnly: true, hint: 'Auto-generated' },
        { key: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'Manufacturer serial number' },
        { key: 'categoryId', label: 'Category', type: 'select', required: true, options: categories.map(c => ({ value: c.id, label: c.name })) },
        { key: 'departmentId', label: 'Department', type: 'select', options: departments.map(d => ({ value: d.id, label: d.name })) },
        { key: 'acquisitionDate', label: 'Acquisition Date', type: 'date' },
        { key: 'cost', label: 'Acquisition Cost ($)', type: 'number', min: 0, step: '0.01', placeholder: '0.00' },
        { key: 'condition', label: 'Condition', type: 'select', required: true, options: ['New', 'Good', 'Fair', 'Poor'].map(c => ({ value: c, label: c })) },
        { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Floor 2, IT Lab' },
        { key: 'isBookable', label: 'Shared / Bookable Resource', type: 'checkbox', hint: 'Enable if this asset can be booked by time slot (rooms, vehicles, equipment)' },
        { key: 'photo', label: 'Photo', type: 'file', accept: 'image/*', hint: 'Upload asset photo (optional)' }
      ],
      submitLabel: 'Register Asset',
      cancelLabel: 'Cancel',
      onCancel: () => Router.navigate('/assets'),
      onSubmit: (data) => {
        data.status = 'Available';
        const asset = Store.create('assets', data);
        ActivityLogger.log(Auth.getCurrentUser().id, 'ASSET_REGISTERED', 'asset', asset.id, `Registered ${data.name} (${data.assetTag})`);
        Toast.success(`Asset ${data.assetTag} registered successfully`);
        Router.navigate(`/assets?id=${asset.id}`);
      }
    });
  },

  renderDetail(container, assetId) {
    const asset = Store.getById('assets', assetId);
    if (!asset) {
      container.innerHTML = '<div class="empty-state"><h3>Asset not found</h3><button class="btn btn-primary mt-4" onclick="Router.navigate(\'/assets\')">Back to Directory</button></div>';
      return;
    }

    const category = Store.getById('categories', asset.categoryId);
    const department = Store.getById('departments', asset.departmentId);
    const allocations = Store.find('allocations', a => a.assetId === assetId).sort((a, b) => new Date(b.allocatedDate) - new Date(a.allocatedDate));
    const maintenance = Store.getMaintenanceByAsset(assetId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const currentAlloc = allocations.find(a => a.status === 'Active');
    const canManage = Auth.canManageAssets();

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <div class="flex items-center gap-3">
              <button class="btn btn-icon btn-ghost" onclick="Router.navigate('/assets')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                <h2>${Utils.escapeHtml(asset.name)}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--brand-400);font-weight:600;">${asset.assetTag}</span>
                  <span class="${Utils.getBadgeClass(asset.status)}">${Utils.formatStatus(asset.status)}</span>
                  ${asset.isBookable ? '<span class="badge" style="background:rgba(99,102,241,0.15);color:var(--brand-400);">Bookable</span>' : ''}
                </div>
              </div>
            </div>
          </div>
          <div class="page-header-actions">
            ${canManage && asset.status === 'Available' ? `<button class="btn btn-primary" onclick="Router.navigate('/allocation?assetId=${asset.id}')">Allocate</button>` : ''}
            ${asset.isBookable && asset.status !== 'Retired' && asset.status !== 'Disposed' ? `<button class="btn btn-secondary" onclick="Router.navigate('/booking?assetId=${asset.id}')">Book</button>` : ''}
            <button class="btn btn-secondary" onclick="Router.navigate('/maintenance?assetId=${asset.id}')">Raise Maintenance</button>
            ${canManage ? `
              <div class="dropdown" style="display:inline-block;">
                <button class="btn btn-ghost" id="assetMoreBtn">More ▾</button>
                <div class="dropdown-menu" id="assetMoreMenu">
                  ${asset.status !== 'Retired' ? `<button class="dropdown-item" onclick="AssetsPage.changeStatus('${asset.id}','Retired')">Retire Asset</button>` : ''}
                  ${asset.status !== 'Disposed' ? `<button class="dropdown-item" onclick="AssetsPage.changeStatus('${asset.id}','Disposed')">Dispose Asset</button>` : ''}
                  ${asset.status === 'Lost' ? `<button class="dropdown-item" onclick="AssetsPage.changeStatus('${asset.id}','Available')">Mark Found</button>` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="asset-detail-grid">
          <!-- Left: Photo & Info -->
          <div>
            <div class="asset-photo-card">
              ${asset.photo
                ? `<img src="${asset.photo}" alt="${Utils.escapeHtml(asset.name)}" class="asset-photo">`
                : `<div class="asset-photo"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>`
              }
              <div class="p-4">
                <div class="asset-info-grid">
                  <div class="info-item"><span class="info-label">Category</span><span class="info-value">${Utils.escapeHtml(category?.name || '—')}</span></div>
                  <div class="info-item"><span class="info-label">Department</span><span class="info-value">${Utils.escapeHtml(department?.name || '—')}</span></div>
                  <div class="info-item"><span class="info-label">Serial Number</span><span class="info-value">${Utils.escapeHtml(asset.serialNumber || '—')}</span></div>
                  <div class="info-item"><span class="info-label">Location</span><span class="info-value">${Utils.escapeHtml(asset.location || '—')}</span></div>
                  <div class="info-item"><span class="info-label">Condition</span><span class="info-value">${Utils.escapeHtml(asset.condition || '—')}</span></div>
                  <div class="info-item"><span class="info-label">Acquisition Date</span><span class="info-value">${Utils.formatDate(asset.acquisitionDate)}</span></div>
                  <div class="info-item"><span class="info-label">Acquisition Cost</span><span class="info-value">${Utils.formatCurrency(asset.cost)}</span></div>
                  <div class="info-item"><span class="info-label">Registered</span><span class="info-value">${Utils.formatDate(asset.createdAt)}</span></div>
                </div>
              </div>
            </div>

            ${currentAlloc ? `
              <div class="card mt-4">
                <div class="card-header"><h3>Current Assignment</h3></div>
                <div class="flex items-center gap-3">
                  ${(() => { const emp = Store.getById('users', currentAlloc.employeeId); return emp ? `
                    <div class="avatar" style="background:${Utils.stringToColor(emp.name)}">${Utils.getInitials(emp.name)}</div>
                    <div>
                      <div style="font-weight:500;">${Utils.escapeHtml(emp.name)}</div>
                      <div class="text-xs text-tertiary">Since ${Utils.formatDate(currentAlloc.allocatedDate)}</div>
                      ${currentAlloc.expectedReturnDate ? `<div class="text-xs ${Utils.isOverdue(currentAlloc.expectedReturnDate) ? 'text-danger' : 'text-tertiary'}">Return by ${Utils.formatDate(currentAlloc.expectedReturnDate)}</div>` : ''}
                    </div>
                  ` : ''; })()}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Right: History -->
          <div>
            <div class="card mb-4">
              <div class="card-header"><h3>Allocation History</h3></div>
              ${allocations.length === 0 ? '<p class="text-tertiary text-sm">No allocation history</p>' : `
                <div class="timeline">
                  ${allocations.map(a => {
                    const emp = Store.getById('users', a.employeeId);
                    return `
                      <div class="timeline-item">
                        <div class="timeline-dot" style="background:${a.status === 'Active' ? 'var(--color-success-500)' : 'var(--text-tertiary)'}"></div>
                        <div class="timeline-date">${Utils.formatDate(a.allocatedDate)} ${a.actualReturnDate ? `→ ${Utils.formatDate(a.actualReturnDate)}` : ''}</div>
                        <div class="timeline-content">
                          Allocated to <strong>${Utils.escapeHtml(emp?.name || 'Unknown')}</strong>
                          <span class="badge badge-dot badge-${a.status === 'Active' ? 'active' : 'completed'}" style="margin-left:8px;">${a.status}</span>
                          ${a.returnNotes ? `<div class="text-xs text-tertiary mt-1">Return notes: ${Utils.escapeHtml(a.returnNotes)}</div>` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <div class="card">
              <div class="card-header"><h3>Maintenance History</h3></div>
              ${maintenance.length === 0 ? '<p class="text-tertiary text-sm">No maintenance history</p>' : `
                <div class="timeline">
                  ${maintenance.map(m => `
                    <div class="timeline-item">
                      <div class="timeline-dot" style="background:${m.status === 'Resolved' ? 'var(--color-success-500)' : 'var(--color-warning-500)'}"></div>
                      <div class="timeline-date">${Utils.formatDate(m.createdAt)}</div>
                      <div class="timeline-content">
                        ${Utils.escapeHtml(Utils.truncate(m.description, 80))}
                        <div class="flex items-center gap-2 mt-1">
                          <span class="${Utils.getBadgeClass(m.status)}">${Utils.formatStatus(m.status)}</span>
                          <span class="${Utils.getBadgeClass(m.priority)}">${m.priority}</span>
                        </div>
                        ${m.resolutionNotes ? `<div class="text-xs text-tertiary mt-1">Resolution: ${Utils.escapeHtml(m.resolutionNotes)}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // More dropdown
    const moreBtn = document.getElementById('assetMoreBtn');
    const moreMenu = document.getElementById('assetMoreMenu');
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.classList.toggle('show');
      });
      document.addEventListener('click', () => moreMenu.classList.remove('show'), { once: true });
    }
  },

  changeStatus(assetId, newStatus) {
    Modal.confirm('Change Asset Status', `Are you sure you want to mark this asset as "${newStatus}"?`, () => {
      Store.update('assets', assetId, { status: newStatus });
      const asset = Store.getById('assets', assetId);
      ActivityLogger.log(Auth.getCurrentUser().id, 'ASSET_STATUS_CHANGED', 'asset', assetId, `${asset.name} (${asset.assetTag}) status changed to ${newStatus}`);
      Toast.success(`Asset status updated to ${newStatus}`);
      Router.navigate(`/assets?id=${assetId}`);
    });
  },

  destroy() {}
};
