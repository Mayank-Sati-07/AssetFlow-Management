// ============================================
// AssetFlow — Dashboard Page (Screen 2)
// ============================================

const DashboardPage = {
  charts: [],

  render(container) {
    const user = Auth.getCurrentUser();
    const isAdmin = Auth.isAdmin();
    const isManagerOrAbove = Auth.canManageAssets();

    // KPI Data
    const assets = Store.getAll('assets');
    const available = assets.filter(a => a.status === 'Available').length;
    const allocated = assets.filter(a => a.status === 'Allocated').length;
    const maintenanceToday = Store.find('maintenance_requests', m =>
      m.status !== 'Resolved' && m.status !== 'Rejected'
    ).length;
    const activeBookings = Store.find('bookings', b =>
      b.status === 'Upcoming' || b.status === 'Ongoing'
    ).length;
    const pendingTransfers = Store.find('transfers', t => t.status === 'Requested').length;
    const overdueAllocations = Store.getOverdueAllocations();
    const upcomingReturns = Store.find('allocations', a =>
      a.status === 'Active' && a.expectedReturnDate && !Utils.isOverdue(a.expectedReturnDate)
    );

    container.innerHTML = `
      <div class="fade-in">
        <!-- KPI Cards -->
        <div class="dashboard-kpis stagger-children">
          <div class="kpi-card kpi-success">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Available</div>
              <div class="kpi-value">${available}</div>
              <div class="kpi-trend text-success">Ready to use</div>
            </div>
          </div>
          <div class="kpi-card kpi-brand">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Allocated</div>
              <div class="kpi-value">${allocated}</div>
              <div class="kpi-trend text-brand">In use</div>
            </div>
          </div>
          <div class="kpi-card kpi-warning">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Maintenance</div>
              <div class="kpi-value">${maintenanceToday}</div>
              <div class="kpi-trend text-warning">Active requests</div>
            </div>
          </div>
          <div class="kpi-card kpi-info">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Active Bookings</div>
              <div class="kpi-value">${activeBookings}</div>
              <div class="kpi-trend text-info">Scheduled</div>
            </div>
          </div>
          <div class="kpi-card kpi-brand">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Pending Transfers</div>
              <div class="kpi-value">${pendingTransfers}</div>
              <div class="kpi-trend">Awaiting approval</div>
            </div>
          </div>
          <div class="kpi-card ${overdueAllocations.length > 0 ? 'kpi-danger' : 'kpi-success'}">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Overdue Returns</div>
              <div class="kpi-value">${overdueAllocations.length}</div>
              <div class="kpi-trend ${overdueAllocations.length > 0 ? 'text-danger' : 'text-success'}">${overdueAllocations.length > 0 ? 'Action needed' : 'All on time'}</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-section">
          <div class="quick-actions">
            ${isManagerOrAbove ? `
              <button class="quick-action-btn" onclick="Router.navigate('/assets?action=register')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Register Asset
              </button>
            ` : ''}
            <button class="quick-action-btn" onclick="Router.navigate('/booking')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              Book Resource
            </button>
            <button class="quick-action-btn" onclick="Router.navigate('/maintenance')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              Raise Maintenance
            </button>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="dashboard-grid">
          <!-- Asset Status Chart -->
          <div class="card">
            <div class="card-header">
              <h3>Asset Status Distribution</h3>
            </div>
            <div class="chart-container" style="height:220px;">
              <canvas id="assetStatusChart"></canvas>
            </div>
          </div>

          <!-- Overdue Returns -->
          <div class="card" style="grid-column: span 2;">
            <div class="card-header">
              <h3>${overdueAllocations.length > 0 ? '⚠️ Overdue Returns' : 'Upcoming Returns'}</h3>
              <a href="#/allocation" class="btn btn-ghost btn-sm">View All</a>
            </div>
            ${this.renderOverdueTable(overdueAllocations, upcomingReturns)}
          </div>

          <!-- Recent Activity -->
          <div class="card" style="grid-column: span 2;">
            <div class="card-header">
              <h3>Recent Activity</h3>
              <a href="#/activity" class="btn btn-ghost btn-sm">View All</a>
            </div>
            ${this.renderActivityFeed()}
          </div>

          <!-- Department Allocation -->
          <div class="card">
            <div class="card-header">
              <h3>Assets by Department</h3>
            </div>
            <div class="chart-container" style="height:220px;">
              <canvas id="deptAllocationChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initCharts();
  },

  renderOverdueTable(overdue, upcoming) {
    const items = overdue.length > 0 ? overdue : upcoming.slice(0, 5);
    if (items.length === 0) {
      return '<div class="empty-state" style="padding:24px;"><p>No returns pending</p></div>';
    }

    return `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Assigned To</th>
              <th>Expected Return</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(a => {
              const asset = Store.getById('assets', a.assetId);
              const emp = Store.getById('users', a.employeeId);
              const isOd = Utils.isOverdue(a.expectedReturnDate);
              const daysOd = Utils.getDaysOverdue(a.expectedReturnDate);
              return `
                <tr class="${isOd ? 'row-overdue' : ''}">
                  <td>
                    <div style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(asset?.name || 'Unknown')}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${asset?.assetTag || ''}</div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="avatar avatar-sm" style="background:${Utils.stringToColor(emp?.name)}">${Utils.getInitials(emp?.name)}</div>
                      <span>${Utils.escapeHtml(emp?.name || 'Unknown')}</span>
                    </div>
                  </td>
                  <td>${Utils.formatDate(a.expectedReturnDate)}</td>
                  <td>
                    ${isOd
                      ? `<span class="badge badge-dot badge-overdue">${daysOd} day${daysOd !== 1 ? 's' : ''} overdue</span>`
                      : `<span class="badge badge-dot badge-upcoming">Due soon</span>`
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderActivityFeed() {
    const logs = Store.getActivityLogs(8);
    if (logs.length === 0) {
      return '<div class="empty-state" style="padding:24px;"><p>No activity yet</p></div>';
    }

    const actionIcons = {
      ASSET_REGISTERED: { bg: 'rgba(16,185,129,0.15)', color: 'var(--color-success-400)' },
      ASSET_ALLOCATED: { bg: 'rgba(59,130,246,0.15)', color: 'var(--color-info-400)' },
      MAINTENANCE_RAISED: { bg: 'rgba(245,158,11,0.15)', color: 'var(--color-warning-400)' },
      BOOKING_CREATED: { bg: 'rgba(99,102,241,0.15)', color: 'var(--brand-400)' },
      LOGIN: { bg: 'rgba(100,100,160,0.15)', color: 'var(--text-tertiary)' },
      DEFAULT: { bg: 'rgba(100,100,160,0.15)', color: 'var(--text-tertiary)' }
    };

    return `
      <div class="activity-feed">
        ${logs.map(l => {
          const user = Store.getById('users', l.userId);
          const style = actionIcons[l.action] || actionIcons.DEFAULT;
          return `
            <div class="activity-item">
              <div class="activity-icon" style="background:${style.bg};color:${style.color};">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <div class="activity-text">
                <strong>${Utils.escapeHtml(user?.name || 'System')}</strong> ${Utils.escapeHtml(l.details)}
              </div>
              <div class="activity-time">${Utils.timeAgo(l.createdAt)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  initCharts() {
    // Destroy old charts
    this.charts.forEach(c => Charts.destroy(c));
    this.charts = [];

    // Asset Status Doughnut
    const statusCounts = Store.getAssetStatusCounts();
    const statuses = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);
    if (statuses.length > 0) {
      const chart1 = Charts.renderDoughnut('assetStatusChart', statuses, statusValues);
      if (chart1) this.charts.push(chart1);
    }

    // Department Allocation Bar
    const deptData = Store.getDepartmentAssetCounts();
    if (deptData.length > 0) {
      const chart2 = Charts.renderBar('deptAllocationChart',
        deptData.map(d => d.department),
        [{ label: 'Assets', data: deptData.map(d => d.count) }]
      );
      if (chart2) this.charts.push(chart2);
    }
  },

  destroy() {
    this.charts.forEach(c => Charts.destroy(c));
    this.charts = [];
  }
};
