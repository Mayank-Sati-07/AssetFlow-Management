// ============================================
// AssetFlow — Topbar Component
// ============================================

const Topbar = {
  render(container) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const unreadCount = NotificationEngine.getUnreadCount();

    container.innerHTML = `
      <div class="topbar-left">
        <button class="topbar-toggle" id="sidebarToggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div>
          <div class="page-title" id="pageTitle">Dashboard</div>
          <div class="page-subtitle" id="pageSubtitle"></div>
        </div>
      </div>
      <div class="topbar-right">
        <div class="topbar-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search assets, employees..." id="globalSearch">
        </div>
        <div class="dropdown">
          <button class="topbar-icon-btn" id="notificationBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="badge-count notification-badge-count" style="display:${unreadCount > 0 ? 'flex' : 'none'}">${unreadCount}</span>
          </button>
          <div class="dropdown-menu" id="notificationDropdown" style="min-width:340px; max-height:400px; overflow-y:auto;">
            <div style="padding:12px 16px; border-bottom:1px solid var(--border-default); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; font-size:var(--text-sm);">Notifications</span>
              <button class="btn btn-ghost btn-sm" id="markAllReadBtn">Mark all read</button>
            </div>
            <div id="notificationList"></div>
            <div style="padding:8px 16px; border-top:1px solid var(--border-default); text-align:center;">
              <a href="#/activity" style="font-size:var(--text-xs); font-weight:500;">View All Notifications</a>
            </div>
          </div>
        </div>
        <div class="dropdown">
          <button class="topbar-user-btn" id="userMenuBtn">
            <div class="avatar avatar-sm" style="background:${Utils.stringToColor(user.name)}">${Utils.getInitials(user.name)}</div>
            <span class="topbar-user-name">${Utils.escapeHtml(user.name)}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="dropdown-menu" id="userDropdown">
            <div style="padding:8px 12px; border-bottom:1px solid var(--border-default);">
              <div style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary);">${Utils.escapeHtml(user.name)}</div>
              <div style="font-size:var(--text-xs); color:var(--text-tertiary);">${Utils.escapeHtml(user.email)}</div>
              <span class="badge badge-dot badge-active" style="margin-top:4px;">${Utils.formatStatus(user.role)}</span>
            </div>
            <button class="dropdown-item" onclick="Auth.logout()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.loadNotifications();
  },

  bindEvents() {
    // Sidebar toggle
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('open');
      });
    }

    // Notification dropdown toggle
    const notifBtn = document.getElementById('notificationBtn');
    const notifDropdown = document.getElementById('notificationDropdown');
    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
        document.getElementById('userDropdown')?.classList.remove('show');
        this.loadNotifications();
      });
    }

    // User dropdown toggle
    const userBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userBtn) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
        notifDropdown?.classList.remove('show');
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.show').forEach(d => d.classList.remove('show'));
    });

    // Mark all read
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        NotificationEngine.markAllAsRead();
        this.loadNotifications();
        Sidebar.refresh();
      });
    }

    // Global search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) {
            Router.navigate(`/assets?search=${encodeURIComponent(q)}`);
            searchInput.value = '';
          }
        }
      });
    }
  },

  loadNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    const notifications = NotificationEngine.getForCurrentUser().slice(0, 8);
    if (notifications.length === 0) {
      list.innerHTML = `<div class="empty-state" style="padding:24px;"><p style="font-size:var(--text-sm);">No notifications yet</p></div>`;
      return;
    }

    list.innerHTML = notifications.map(n => {
      const typeInfo = NotificationEngine.getTypeInfo(n.type);
      const colorMap = { info: 'var(--color-info-400)', success: 'var(--color-success-400)', warning: 'var(--color-warning-400)', danger: 'var(--color-danger-400)' };
      const bgMap = { info: 'rgba(59,130,246,0.15)', success: 'rgba(16,185,129,0.15)', warning: 'rgba(245,158,11,0.15)', danger: 'rgba(239,68,68,0.15)' };
      return `
        <div class="notification-item ${n.isRead ? '' : 'unread'}" data-id="${n.id}" onclick="Topbar.handleNotificationClick('${n.id}', '${n.link || ''}')">
          <div class="notification-icon" style="background:${bgMap[typeInfo.color]}; color:${colorMap[typeInfo.color]};">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <div class="notification-text">
            <p>${Utils.escapeHtml(n.message)}</p>
            <div class="time">${Utils.timeAgo(n.createdAt)}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleNotificationClick(id, link) {
    NotificationEngine.markAsRead(id);
    if (link) Router.navigate(link);
    document.getElementById('notificationDropdown')?.classList.remove('show');
    this.loadNotifications();
    Sidebar.refresh();
  },

  setTitle(title, subtitle = '') {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  },

  refresh() {
    const topbar = document.getElementById('topbar');
    if (topbar) this.render(topbar);
  }
};
