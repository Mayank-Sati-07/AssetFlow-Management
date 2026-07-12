// ============================================
// AssetFlow — Asset Allocation & Transfer (Screen 5)
// ============================================

const AllocationPage = {
  render(container, params = {}) {
    const assets = Store.getAll('assets');
    const users = Store.find('users', u => u.status === 'Active' && u.role !== 'Admin');
    const departments = Store.getAll('departments');
    const allocations = Store.getActiveAllocations();
    const overdueAllocations = Store.getOverdueAllocations();
    const transfers = Store.getAll('transfers').sort((a, b) => new Date(b.requestDate || b.createdAt) - new Date(a.requestDate || a.createdAt));
    const canAllocate = Auth.canApprove();

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Asset Allocation & Transfer</h2>
            <p class="text-secondary text-sm">${allocations.length} active allocations${overdueAllocations.length > 0 ? ` • <span class="text-danger">${overdueAllocations.length} overdue</span>` : ''}</p>
          </div>
          ${canAllocate ? `<button class="btn btn-primary" id="newAllocationBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Allocate Asset
          </button>` : ''}
        </div>

        <div class="tab-group">
          <button class="tab-btn active" data-tab="active">Active Allocations</button>
          <button class="tab-btn" data-tab="transfers">Transfer Requests ${transfers.filter(t => t.status === 'Requested').length > 0 ? `<span class="nav-badge" style="margin-left:6px;">${transfers.filter(t => t.status === 'Requested').length}</span>` : ''}</button>
          <button class="tab-btn" data-tab="history">History</button>
        </div>

        <div id="allocTabContent"></div>
      </div>
    `;

    let activeTab = 'active';
    const renderTab = () => {
      const tabContent = document.getElementById('allocTabContent');
      if (activeTab === 'active') this.renderActiveAllocations(tabContent, allocations, canAllocate);
      else if (activeTab === 'transfers') this.renderTransfers(tabContent, transfers, canAllocate);
      else this.renderHistory(tabContent);
    };

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTab();
      });
    });

    renderTab();

    document.getElementById('newAllocationBtn')?.addEventListener('click', () => this.openAllocateModal(params.assetId));
  },

  renderActiveAllocations(content, allocations, canAllocate) {
    content.innerHTML = '<div id="allocTable"></div>';

    DataTable.render('allocTable', {
      data: allocations,
      searchable: true,
      searchPlaceholder: 'Search allocations...',
      columns: [
        { key: 'assetId', label: 'Asset', render: (r) => {
          const asset = Store.getById('assets', r.assetId);
          return `<div><div style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(asset?.name || '—')}</div><div class="text-xs text-tertiary">${asset?.assetTag || ''}</div></div>`;
        }},
        { key: 'employeeId', label: 'Assigned To', render: (r) => {
          const emp = Store.getById('users', r.employeeId);
          return emp ? `<div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${Utils.stringToColor(emp.name)}">${Utils.getInitials(emp.name)}</div>${Utils.escapeHtml(emp.name)}</div>` : '—';
        }},
        { key: 'allocatedDate', label: 'Allocated', render: (r) => Utils.formatDate(r.allocatedDate) },
        { key: 'expectedReturnDate', label: 'Expected Return', render: (r) => {
          if (!r.expectedReturnDate) return '<span class="text-tertiary">No date set</span>';
          const isOd = Utils.isOverdue(r.expectedReturnDate);
          return `<span class="${isOd ? 'text-danger font-medium' : ''}">${Utils.formatDate(r.expectedReturnDate)} ${isOd ? `<span class="badge badge-dot badge-overdue" style="margin-left:4px;">${Utils.getDaysOverdue(r.expectedReturnDate)}d overdue</span>` : ''}</span>`;
        }},
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${r.status}</span>` }
      ],
      rowClass: (r) => Utils.isOverdue(r.expectedReturnDate) ? 'row-overdue' : '',
      actions: canAllocate ? [
        { label: 'Return', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>', onClick: (r) => this.openReturnModal(r) }
      ] : []
    });
  },

  renderTransfers(content, transfers, canApprove) {
    content.innerHTML = '<div id="transferTable"></div>';

    DataTable.render('transferTable', {
      data: transfers,
      searchable: true,
      columns: [
        { key: 'assetId', label: 'Asset', render: (r) => {
          const asset = Store.getById('assets', r.assetId);
          return `<div style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(asset?.name || '—')} <span class="text-tertiary">(${asset?.assetTag || ''})</span></div>`;
        }},
        { key: 'fromEmployeeId', label: 'From', render: (r) => { const u = Store.getById('users', r.fromEmployeeId); return Utils.escapeHtml(u?.name || '—'); }},
        { key: 'toEmployeeId', label: 'To', render: (r) => { const u = Store.getById('users', r.toEmployeeId); return Utils.escapeHtml(u?.name || '—'); }},
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${r.status}</span>` },
        { key: 'requestDate', label: 'Requested', render: (r) => Utils.formatDate(r.requestDate || r.createdAt) }
      ],
      actions: canApprove ? [
        { label: 'Approve', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
          visible: (r) => r.status === 'Requested',
          onClick: (r) => this.approveTransfer(r) },
        { label: 'Reject', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
          visible: (r) => r.status === 'Requested',
          onClick: (r) => this.rejectTransfer(r) }
      ] : []
    });
  },

  renderHistory(content) {
    const all = Store.find('allocations', a => a.status === 'Returned');
    content.innerHTML = '<div id="histTable"></div>';

    DataTable.render('histTable', {
      data: all,
      searchable: true,
      columns: [
        { key: 'assetId', label: 'Asset', render: (r) => { const a = Store.getById('assets', r.assetId); return Utils.escapeHtml(a?.name || '—'); }},
        { key: 'employeeId', label: 'Employee', render: (r) => { const u = Store.getById('users', r.employeeId); return Utils.escapeHtml(u?.name || '—'); }},
        { key: 'allocatedDate', label: 'Allocated', render: (r) => Utils.formatDate(r.allocatedDate) },
        { key: 'actualReturnDate', label: 'Returned', render: (r) => Utils.formatDate(r.actualReturnDate) },
        { key: 'returnCondition', label: 'Condition', render: (r) => Utils.escapeHtml(r.returnCondition || '—') }
      ]
    });
  },

  openAllocateModal(preselectedAssetId = null) {
    const availableAssets = Store.find('assets', a => a.status === 'Available');
    const users = Store.find('users', u => u.status === 'Active' && u.role !== 'Admin');

    const content = `<div id="allocFormContainer"></div><div id="conflictBanner"></div>`;
    Modal.open('Allocate Asset', content);

    FormBuilder.render('allocFormContainer', {
      values: preselectedAssetId ? { assetId: preselectedAssetId } : {},
      fields: [
        { key: 'assetId', label: 'Asset', type: 'select', required: true,
          options: Store.getAll('assets').filter(a => a.status !== 'Retired' && a.status !== 'Disposed').map(a => ({
            value: a.id,
            label: `${a.name} (${a.assetTag}) — ${a.status}`
          }))
        },
        { key: 'employeeId', label: 'Assign To', type: 'select', required: true,
          options: users.map(u => ({ value: u.id, label: `${u.name} (${Utils.formatStatus(u.role)})` }))
        },
        { key: 'expectedReturnDate', label: 'Expected Return Date', type: 'date', hint: 'Optional' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Allocation notes...' }
      ],
      submitLabel: 'Allocate',
      onSubmit: (data) => {
        const asset = Store.getById('assets', data.assetId);
        const employee = Store.getById('users', data.employeeId);

        // Check conflict
        if (asset.status === 'Allocated') {
          const existingAlloc = Store.getAllocationByAsset(data.assetId);
          const holder = existingAlloc ? Store.getById('users', existingAlloc.employeeId) : null;
          const banner = document.getElementById('conflictBanner');
          banner.innerHTML = `
            <div class="conflict-banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <p>This asset is currently held by <strong>${Utils.escapeHtml(holder?.name || 'someone')}</strong>. You can request a transfer instead.</p>
              <button class="btn btn-sm btn-primary" id="transferInsteadBtn">Request Transfer</button>
            </div>
          `;
          document.getElementById('transferInsteadBtn')?.addEventListener('click', () => {
            // Create transfer request
            Store.create('transfers', {
              assetId: data.assetId,
              allocationId: existingAlloc.id,
              fromEmployeeId: existingAlloc.employeeId,
              toEmployeeId: data.employeeId,
              requestedBy: Auth.getCurrentUser().id,
              status: 'Requested',
              requestDate: Utils.today()
            });
            NotificationEngine.notifyRole('AssetManager', 'TRANSFER_REQUESTED', `Transfer request: ${asset.name} (${asset.assetTag}) from ${holder?.name} to ${employee?.name}`);
            ActivityLogger.log(Auth.getCurrentUser().id, 'TRANSFER_REQUESTED', 'asset', data.assetId, `Transfer requested for ${asset.name} from ${holder?.name} to ${employee?.name}`);
            Toast.success('Transfer request submitted');
            Modal.close();
            Router.navigate('/allocation');
          });
          return;
        }

        // Allocate
        Store.create('allocations', {
          assetId: data.assetId,
          employeeId: data.employeeId,
          departmentId: employee.departmentId,
          allocatedDate: Utils.today(),
          expectedReturnDate: data.expectedReturnDate || null,
          status: 'Active'
        });
        Store.update('assets', data.assetId, { status: 'Allocated' });
        NotificationEngine.create(data.employeeId, 'ASSET_ASSIGNED', `${asset.name} (${asset.assetTag}) has been allocated to you.`);
        ActivityLogger.log(Auth.getCurrentUser().id, 'ASSET_ALLOCATED', 'asset', data.assetId, `Allocated ${asset.name} to ${employee.name}`);
        Toast.success(`${asset.name} allocated to ${employee.name}`);
        Modal.close();
        Router.navigate('/allocation');
      }
    });
  },

  openReturnModal(allocation) {
    const asset = Store.getById('assets', allocation.assetId);
    const content = `<div id="returnFormContainer"></div>`;
    Modal.open('Return Asset', content);

    FormBuilder.render('returnFormContainer', {
      fields: [
        { key: 'returnCondition', label: 'Condition on Return', type: 'select', required: true, options: ['New', 'Good', 'Fair', 'Poor', 'Damaged'].map(c => ({ value: c, label: c })) },
        { key: 'returnNotes', label: 'Check-in Notes', type: 'textarea', placeholder: 'Any notes about the asset condition...' }
      ],
      submitLabel: 'Confirm Return',
      onSubmit: (data) => {
        Store.update('allocations', allocation.id, { status: 'Returned', actualReturnDate: Utils.today(), ...data });
        Store.update('assets', allocation.assetId, { status: 'Available', condition: data.returnCondition });
        const emp = Store.getById('users', allocation.employeeId);
        NotificationEngine.create(allocation.employeeId, 'ASSET_RETURNED', `${asset.name} (${asset.assetTag}) has been returned.`);
        ActivityLogger.log(Auth.getCurrentUser().id, 'ASSET_RETURNED', 'asset', allocation.assetId, `${asset.name} returned by ${emp?.name}`);
        Toast.success('Asset returned successfully');
        Modal.close();
        Router.navigate('/allocation');
      }
    });
  },

  approveTransfer(transfer) {
    const asset = Store.getById('assets', transfer.assetId);
    const toEmp = Store.getById('users', transfer.toEmployeeId);
    const fromEmp = Store.getById('users', transfer.fromEmployeeId);

    // Close old allocation
    if (transfer.allocationId) {
      Store.update('allocations', transfer.allocationId, { status: 'Returned', actualReturnDate: Utils.today(), returnNotes: 'Transferred' });
    }

    // Create new allocation
    Store.create('allocations', { assetId: transfer.assetId, employeeId: transfer.toEmployeeId, departmentId: toEmp?.departmentId, allocatedDate: Utils.today(), status: 'Active' });
    Store.update('transfers', transfer.id, { status: 'Approved', approvedBy: Auth.getCurrentUser().id, approvalDate: Utils.today() });

    NotificationEngine.create(transfer.toEmployeeId, 'TRANSFER_APPROVED', `Transfer approved: ${asset?.name} (${asset?.assetTag}) is now assigned to you.`);
    NotificationEngine.create(transfer.fromEmployeeId, 'TRANSFER_APPROVED', `Transfer approved: ${asset?.name} (${asset?.assetTag}) has been transferred to ${toEmp?.name}.`);
    ActivityLogger.log(Auth.getCurrentUser().id, 'TRANSFER_APPROVED', 'asset', transfer.assetId, `Approved transfer of ${asset?.name} from ${fromEmp?.name} to ${toEmp?.name}`);
    Toast.success('Transfer approved');
    Router.navigate('/allocation');
  },

  rejectTransfer(transfer) {
    Store.update('transfers', transfer.id, { status: 'Rejected', approvedBy: Auth.getCurrentUser().id, approvalDate: Utils.today() });
    NotificationEngine.create(transfer.requestedBy, 'TRANSFER_REJECTED', `Your transfer request has been rejected.`);
    Toast.info('Transfer rejected');
    Router.navigate('/allocation');
  },

  destroy() {}
};
