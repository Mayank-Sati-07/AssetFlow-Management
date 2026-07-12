// ============================================
// AssetFlow — Notification Engine
// ============================================

const NotificationEngine = {
  // Notification types with metadata
  TYPES: {
    ASSET_ASSIGNED:       { icon: 'package', color: 'info', label: 'Asset Assigned' },
    ASSET_RETURNED:       { icon: 'package-check', color: 'success', label: 'Asset Returned' },
    MAINTENANCE_APPROVED: { icon: 'wrench', color: 'success', label: 'Maintenance Approved' },
    MAINTENANCE_REJECTED: { icon: 'wrench', color: 'danger', label: 'Maintenance Rejected' },
    MAINTENANCE_RESOLVED: { icon: 'check-circle', color: 'success', label: 'Maintenance Resolved' },
    BOOKING_CONFIRMED:    { icon: 'calendar-check', color: 'success', label: 'Booking Confirmed' },
    BOOKING_CANCELLED:    { icon: 'calendar-x', color: 'danger', label: 'Booking Cancelled' },
    BOOKING_REMINDER:     { icon: 'bell', color: 'warning', label: 'Booking Reminder' },
    TRANSFER_REQUESTED:   { icon: 'arrow-right-left', color: 'info', label: 'Transfer Requested' },
    TRANSFER_APPROVED:    { icon: 'check-circle', color: 'success', label: 'Transfer Approved' },
    TRANSFER_REJECTED:    { icon: 'x-circle', color: 'danger', label: 'Transfer Rejected' },
    OVERDUE_RETURN:       { icon: 'alert-triangle', color: 'danger', label: 'Overdue Return' },
    AUDIT_ASSIGNED:       { icon: 'clipboard-check', color: 'info', label: 'Audit Assigned' },
    AUDIT_DISCREPANCY:    { icon: 'alert-circle', color: 'warning', label: 'Audit Discrepancy' },
    ROLE_CHANGED:         { icon: 'shield', color: 'info', label: 'Role Updated' },
    GENERAL:              { icon: 'info', color: 'info', label: 'Notification' }
  },

  // Create a notification
  create(userId, type, message, link = null) {
    const notification = Store.create('notifications', {
      userId,
      type,
      message,
      link,
      isRead: false
    });

    // Update UI badge if the user is currently logged in
    const currentUser = Auth.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.updateBadge();
    }

    return notification;
  },

  // Send notification to multiple users
  createBulk(userIds, type, message, link = null) {
    userIds.forEach(uid => this.create(uid, type, message, link));
  },

  // Notify all users with a specific role
  notifyRole(role, type, message, link = null) {
    const users = Store.find('users', u => u.role === role && u.status === 'Active');
    users.forEach(u => this.create(u.id, type, message, link));
  },

  // Get notifications for current user
  getForCurrentUser() {
    const user = Auth.getCurrentUser();
    if (!user) return [];
    return Store.getNotificationsForUser(user.id);
  },

  // Get unread count for current user
  getUnreadCount() {
    const user = Auth.getCurrentUser();
    if (!user) return 0;
    return Store.getUnreadNotificationCount(user.id);
  },

  // Mark single notification as read
  markAsRead(id) {
    Store.update('notifications', id, { isRead: true });
    this.updateBadge();
  },

  // Mark all as read for current user
  markAllAsRead() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const notifications = Store.find('notifications', n => n.userId === user.id && !n.isRead);
    notifications.forEach(n => Store.update('notifications', n.id, { isRead: true }));
    this.updateBadge();
  },

  // Update the notification badge in the topbar
  updateBadge() {
    const count = this.getUnreadCount();
    const badge = document.querySelector('.notification-badge-count');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  // Get icon info for a notification type
  getTypeInfo(type) {
    return this.TYPES[type] || this.TYPES.GENERAL;
  }
};

// ============================================
// Activity Logger
// ============================================

const ActivityLogger = {
  log(userId, action, targetType, targetId, details) {
    Store.create('activity_logs', {
      userId,
      action,
      targetType,
      targetId,
      details
    });
  }
};
