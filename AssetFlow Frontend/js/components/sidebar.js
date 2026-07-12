// ============================================
// AssetFlow — Sidebar Component
// ============================================

const Sidebar = {
  render(container) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const isAdmin = user.role === 'Admin';
    const isManager = user.role === 'AssetManager';
    const isDeptHead = user.role === 'DeptHead';
    const unreadCount = NotificationEngine.getUnreadCount();

    container.innerHTML = `
      <div class="sidebar-header">
        <img src="assets/logo.svg" alt="AssetFlow" class="sidebar-logo">
        <span class="sidebar-brand">AssetFlow</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Main</div>
          <a class="nav-item" data-route="/dashboard" href="#/dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span>Dashboard</span>
          </a>
          ${isAdmin ? `
          <a class="nav-item" data-route="/org-setup" href="#/org-setup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg>
            <span>Organization Setup</span>
          </a>
          ` : ''}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Asset Management</div>
          <a class="nav-item" data-route="/assets" href="#/assets">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span>Asset Directory</span>
          </a>
          <a class="nav-item" data-route="/allocation" href="#/allocation">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
            <span>Allocation & Transfer</span>
          </a>
          <a class="nav-item" data-route="/booking" href="#/booking">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
            <span>Resource Booking</span>
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Operations</div>
          <a class="nav-item" data-route="/maintenance" href="#/maintenance">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <span>Maintenance</span>
          </a>
          <a class="nav-item" data-route="/audit" href="#/audit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"/><path d="M6 9.01V9"/><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/></svg>
            <span>Asset Audit</span>
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Insights</div>
          ${isAdmin || isManager || isDeptHead ? `
          <a class="nav-item" data-route="/reports" href="#/reports">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Reports & Analytics</span>
          </a>
          ` : ''}
          <a class="nav-item" data-route="/activity" href="#/activity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span>Notifications</span>
            ${unreadCount > 0 ? `<span class="nav-badge">${unreadCount}</span>` : ''}
          </a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar" style="background:${Utils.stringToColor(user.name)}">${Utils.getInitials(user.name)}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${Utils.escapeHtml(user.name)}</div>
            <div class="sidebar-user-role">${Utils.formatStatus(user.role)}</div>
          </div>
        </div>
      </div>
    `;
  },

  setActive(path) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === path);
    });
  },

  refresh() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) this.render(sidebar);
  }
};
