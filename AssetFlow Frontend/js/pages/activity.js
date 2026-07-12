// ============================================
// AssetFlow — Activity Logs & Notifications (Screen 10)
// ============================================

const ActivityPage = {
  activeTab: 'notifications',

  render(container) {
    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Activity & Notifications</h2>
            <p class="text-secondary text-sm">Stay informed about asset operations</p>
          </div>
        </div>
        <div class="tab-group">
          <button class="tab-btn ${this.activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">Notifications</button>
          <button class="tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">Activity Log</button>
        </div>
        <div id="activityTabContent"></div>
      </div>
    `;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderTab();
      });
    });

    this.renderTab();
  },

  renderTab() {
    const content = document.getElementById('activityTabContent');
    if (this.activeTab === 'notifications') this.renderNotifications(content);
    else this.renderActivityLog(content);
  },

  renderNotifications(content) {
    const notifications = NotificationEngine.getForCurrentUser();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Your Notifications (${unreadCount} unread)</h3>
          ${unreadCount > 0 ? `<button class="btn btn-ghost btn-sm" id="markAllReadActivity">Mark all as read</button>` : ''}
        </div>
        ${notifications.length === 0 ? '<div class="empty-state" style="padding:48px;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><h3>No notifications</h3><p>You\'re all caught up!</p></div>' : `
          <div style="max-height:500px;overflow-y:auto;">
            ${notifications.map(n => {
              const typeInfo = NotificationEngine.getTypeInfo(n.type);
              const colorMap = { info: 'var(--color-info-400)', success: 'var(--color-success-400)', warning: 'var(--color-warning-400)', danger: 'var(--color-danger-400)' };
              const bgMap = { info: 'rgba(59,130,246,0.15)', success: 'rgba(16,185,129,0.15)', warning: 'rgba(245,158,11,0.15)', danger: 'rgba(239,68,68,0.15)' };
              return `
                <div class="notification-item ${n.isRead ? '' : 'unread'}" data-notif-id="${n.id}" style="cursor:pointer;">
                  <div class="notification-icon" style="background:${bgMap[typeInfo.color]};color:${colorMap[typeInfo.color]};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  </div>
                  <div class="notification-text" style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                      <span class="badge" style="background:${bgMap[typeInfo.color]};color:${colorMap[typeInfo.color]};font-size:10px;">${typeInfo.label}</span>
                    </div>
                    <p>${Utils.escapeHtml(n.message)}</p>
                    <div class="time">${Utils.timeAgo(n.createdAt)}</div>
                  </div>
                  ${!n.isRead ? `<button class="btn btn-ghost btn-sm" data-mark-read="${n.id}" title="Mark as read" style="flex-shrink:0;">✓</button>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Mark all read
    document.getElementById('markAllReadActivity')?.addEventListener('click', () => {
      NotificationEngine.markAllAsRead();
      Toast.success('All notifications marked as read');
      this.renderTab();
      Sidebar.refresh();
    });

    // Individual mark read
    content.querySelectorAll('[data-mark-read]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        NotificationEngine.markAsRead(btn.dataset.markRead);
        this.renderTab();
        Sidebar.refresh();
      });
    });

    // Click notification to mark read
    content.querySelectorAll('[data-notif-id]').forEach(item => {
      item.addEventListener('click', () => {
        const n = Store.getById('notifications', item.dataset.notifId);
        if (n && !n.isRead) NotificationEngine.markAsRead(n.id);
        if (n?.link) Router.navigate(n.link);
        else { this.renderTab(); Sidebar.refresh(); }
      });
    });
  },

  renderActivityLog(content) {
    const isAdmin = Auth.isAdmin() || Auth.canManageAssets();
    const currentUser = Auth.getCurrentUser();
    let logs = Store.getAll('activity_logs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Non-admin sees only their own logs
    if (!isAdmin) {
      logs = logs.filter(l => l.userId === currentUser.id);
    }

    content.innerHTML = '<div id="activityLogTable"></div>';

    DataTable.render('activityLogTable', {
      data: logs,
      searchable: true,
      searchPlaceholder: 'Search activity logs...',
      pageSize: 15,
      columns: [
        { key: 'userId', label: 'User', render: (r) => {
          const u = Store.getById('users', r.userId);
          return u ? `<div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${Utils.stringToColor(u.name)}">${Utils.getInitials(u.name)}</div>${Utils.escapeHtml(u.name)}</div>` : 'System';
        }},
        { key: 'action', label: 'Action', render: (r) => `<span class="badge" style="background:var(--bg-tertiary);color:var(--text-secondary);">${Utils.formatStatus(r.action)}</span>` },
        { key: 'details', label: 'Details', render: (r) => `<span class="text-secondary">${Utils.escapeHtml(Utils.truncate(r.details, 60))}</span>` },
        { key: 'createdAt', label: 'When', render: (r) => `<span title="${Utils.formatDateTime(r.createdAt)}">${Utils.timeAgo(r.createdAt)}</span>` }
      ]
    });
  },

  destroy() {}
};
