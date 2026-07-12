// ============================================
// AssetFlow — Utility Functions
// ============================================

const Utils = {
  // Generate a unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Generate an asset tag like AF-0001
  generateAssetTag() {
    const assets = Store.getAll('assets');
    const maxNum = assets.reduce((max, a) => {
      const match = a.assetTag?.match(/AF-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `AF-${String(maxNum + 1).padStart(4, '0')}`;
  },

  // Format date to readable string
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Format date and time
  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  // Format time (HH:MM)
  formatTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  },

  // Time ago (e.g., "2 hours ago")
  timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return Utils.formatDate(dateStr);
  },

  // Check if a date is overdue (past today)
  isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  },

  // Days between two dates
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  // Check if two time slots overlap
  isOverlapping(date1, start1, end1, date2, start2, end2) {
    if (date1 !== date2) return false;
    return start1 < end2 && start2 < end1;
  },

  // Debounce function
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Export data to CSV
  exportToCSV(data, filename, columns) {
    if (!data.length) return;
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        let val = typeof c.value === 'function' ? c.value(row) : row[c.key] || '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Get initials from name
  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },

  // Generate a color from a string (for avatars)
  stringToColor(str) {
    if (!str) return '#6366f1';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
      '#06b6d4', '#3b82f6', '#6366f1'
    ];
    return colors[Math.abs(hash) % colors.length];
  },

  // Get badge class from status
  getBadgeClass(status) {
    if (!status) return '';
    const s = status.toLowerCase().replace(/[\s_]/g, '-');
    return `badge badge-dot badge-${s}`;
  },

  // Format currency
  formatCurrency(amount) {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Get today's date as YYYY-MM-DD
  today() {
    return new Date().toISOString().split('T')[0];
  },

  // Get current timestamp
  now() {
    return new Date().toISOString();
  },

  // Truncate text
  truncate(str, len = 50) {
    if (!str || str.length <= len) return str || '';
    return str.substring(0, len) + '...';
  },

  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Format status for display
  formatStatus(status) {
    if (!status) return '';
    return status.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Get days overdue
  getDaysOverdue(dateStr) {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diff = Math.ceil((today - date) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  },

  // Simple file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
