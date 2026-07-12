// ============================================
// AssetFlow — Data Store (localStorage CRUD)
// ============================================

const Store = {
  // Collections
  COLLECTIONS: [
    'users', 'departments', 'categories', 'assets',
    'allocations', 'transfers', 'bookings',
    'maintenance_requests', 'audit_cycles', 'audit_items',
    'notifications', 'activity_logs'
  ],

  // ---- Core CRUD ----

  getAll(collection) {
    try {
      const data = localStorage.getItem(`af_${collection}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => item.id === id) || null;
  },

  create(collection, item) {
    const items = this.getAll(collection);
    const newItem = {
      ...item,
      id: item.id || Utils.generateId(),
      createdAt: item.createdAt || Utils.now()
    };
    items.push(newItem);
    this._save(collection, items);
    return newItem;
  },

  update(collection, id, updates) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: Utils.now() };
    this._save(collection, items);
    return items[index];
  },

  delete(collection, id) {
    const items = this.getAll(collection);
    const filtered = items.filter(item => item.id !== id);
    this._save(collection, filtered);
    return filtered.length < items.length;
  },

  // ---- Query Helpers ----

  find(collection, predicate) {
    return this.getAll(collection).filter(predicate);
  },

  findOne(collection, predicate) {
    return this.getAll(collection).find(predicate) || null;
  },

  count(collection, predicate) {
    if (!predicate) return this.getAll(collection).length;
    return this.getAll(collection).filter(predicate).length;
  },

  // ---- Relationship Helpers ----

  getAssetsByDepartment(departmentId) {
    return this.find('assets', a => a.departmentId === departmentId);
  },

  getAssetsByCategory(categoryId) {
    return this.find('assets', a => a.categoryId === categoryId);
  },

  getAssetsByStatus(status) {
    return this.find('assets', a => a.status === status);
  },

  getEmployeesByDepartment(departmentId) {
    return this.find('users', u => u.departmentId === departmentId && u.role !== 'Admin');
  },

  getActiveAllocations() {
    return this.find('allocations', a => a.status === 'Active');
  },

  getAllocationByAsset(assetId) {
    return this.findOne('allocations', a => a.assetId === assetId && a.status === 'Active');
  },

  getBookingsByAsset(assetId) {
    return this.find('bookings', b => b.assetId === assetId && b.status !== 'Cancelled');
  },

  getBookingsByDate(assetId, date) {
    return this.find('bookings', b =>
      b.assetId === assetId && b.date === date && b.status !== 'Cancelled'
    );
  },

  getMaintenanceByAsset(assetId) {
    return this.find('maintenance_requests', m => m.assetId === assetId);
  },

  getAuditItemsByCycle(cycleId) {
    return this.find('audit_items', ai => ai.auditCycleId === cycleId);
  },

  getNotificationsForUser(userId) {
    return this.find('notifications', n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUnreadNotificationCount(userId) {
    return this.count('notifications', n => n.userId === userId && !n.isRead);
  },

  getActivityLogs(limit = 50) {
    return this.getAll('activity_logs')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  getOverdueAllocations() {
    const today = Utils.today();
    return this.find('allocations', a =>
      a.status === 'Active' && a.expectedReturnDate && a.expectedReturnDate < today
    );
  },

  getBookableAssets() {
    return this.find('assets', a => a.isBookable && a.status !== 'Retired' && a.status !== 'Disposed');
  },

  // ---- Aggregate Helpers ----

  getAssetStatusCounts() {
    const assets = this.getAll('assets');
    const counts = {};
    assets.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  },

  getDepartmentAssetCounts() {
    const assets = this.getAll('assets');
    const departments = this.getAll('departments');
    return departments.map(d => ({
      department: d.name,
      count: assets.filter(a => a.departmentId === d.id).length
    }));
  },

  // ---- Internal ----

  _save(collection, items) {
    try {
      localStorage.setItem(`af_${collection}`, JSON.stringify(items));
    } catch (e) {
      console.error(`Store: Failed to save ${collection}`, e);
    }
  },

  // Check if data has been seeded
  isSeeded() {
    return localStorage.getItem('af_seeded') === 'true';
  },

  markSeeded() {
    localStorage.setItem('af_seeded', 'true');
  },

  // Clear all data
  clearAll() {
    this.COLLECTIONS.forEach(c => localStorage.removeItem(`af_${c}`));
    localStorage.removeItem('af_seeded');
  }
};
