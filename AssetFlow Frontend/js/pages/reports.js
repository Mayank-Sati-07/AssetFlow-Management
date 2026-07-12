// ============================================
// AssetFlow — Reports & Analytics (Screen 9)
// ============================================

const ReportsPage = {
  charts: [],

  render(container) {
    const assets = Store.getAll('assets');
    const allocations = Store.getAll('allocations');
    const maintenance = Store.getAll('maintenance_requests');
    const bookings = Store.getAll('bookings');
    const departments = Store.getAll('departments');
    const categories = Store.getAll('categories');

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Reports & Analytics</h2>
            <p class="text-secondary text-sm">Operational insights and data exports</p>
          </div>
          <button class="btn btn-secondary" id="exportAllBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export All (CSV)
          </button>
        </div>

        <div class="reports-grid">
          <!-- Total Assets (Stat Card) -->
          <div class="report-card" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
            <h4 style="color:#a0a0c0; margin-bottom: 12px; font-weight:600;">Total Assets</h4>
            <div style="font-size: 3.5rem; font-weight: 700; color: #f1f1f8; line-height:1;">${assets.length}</div>
          </div>

          <!-- Assets by Category -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Assets by Category</h4>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="categoryChart"></canvas></div>
            </div>
          </div>

          <!-- Assets by Status -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Assets by Status</h4>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="statusChart"></canvas></div>
            </div>
          </div>

          <!-- Assigned vs Available -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Assigned vs Available</h4>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="assignedChart"></canvas></div>
            </div>
          </div>

          <!-- Top Department by Assets -->
          <div class="report-card" style="grid-column: span 2;">
            <div class="report-card-header">
              <h4>Top Department by Assets</h4>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="topDeptChart"></canvas></div>
            </div>
          </div>

          <!-- Monthly Asset Additions -->
          <div class="report-card" style="grid-column: span 2;">
            <div class="report-card-header">
              <h4>Monthly Asset Additions (${new Date().getFullYear()})</h4>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:250px;"><canvas id="additionsChart"></canvas></div>
            </div>
          </div>

          <!-- Asset Utilization -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Asset Utilization</h4>
              <button class="btn btn-ghost btn-sm export-btn" data-report="utilization">Export</button>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="utilizationChart"></canvas></div>
            </div>
          </div>

          <!-- Maintenance Frequency -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Maintenance by Category</h4>
              <button class="btn btn-ghost btn-sm export-btn" data-report="maintenance">Export</button>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="maintenanceChart"></canvas></div>
            </div>
          </div>

          <!-- Department Allocation -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Department Allocation Summary</h4>
              <button class="btn btn-ghost btn-sm export-btn" data-report="deptAlloc">Export</button>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:220px;"><canvas id="deptAllocChart"></canvas></div>
            </div>
          </div>

          <!-- Booking Heatmap -->
          <div class="report-card">
            <div class="report-card-header">
              <h4>Booking Heatmap</h4>
            </div>
            <div class="report-card-body">
              ${this.renderHeatmap(bookings)}
            </div>
          </div>

          <!-- Assets Nearing Retirement -->
          <div class="report-card" style="grid-column: span 2;">
            <div class="report-card-header">
              <h4>Assets Nearing Retirement</h4>
              <button class="btn btn-ghost btn-sm export-btn" data-report="retirement">Export</button>
            </div>
            <div class="report-card-body">
              ${this.renderRetirementTable(assets)}
            </div>
          </div>

          <!-- Most Used Assets -->
          <div class="report-card" style="grid-column: span 2;">
            <div class="report-card-header">
              <h4>Most vs. Least Used Assets</h4>
              <button class="btn btn-ghost btn-sm export-btn" data-report="usage">Export</button>
            </div>
            <div class="report-card-body">
              <div class="chart-container" style="height:250px;"><canvas id="usageChart"></canvas></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initCharts(assets, allocations, maintenance, bookings, departments, categories);
    this.bindExports(assets, allocations, maintenance, departments, categories);
  },

  initCharts(assets, allocations, maintenance, bookings, departments, categories) {
    this.charts.forEach(c => Charts.destroy(c));
    this.charts = [];

    // --- NEW CHARTS ---
    // Assets by Category
    const catCounts = {};
    assets.forEach(a => {
      const cat = categories.find(c => c.id === a.categoryId)?.name || 'Unknown';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const ccChart = Charts.renderDoughnut('categoryChart', Object.keys(catCounts), Object.values(catCounts));
    if (ccChart) this.charts.push(ccChart);

    // Assets by Status
    const statusCounts = {};
    assets.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const scChart = Charts.renderDoughnut('statusChart', Object.keys(statusCounts), Object.values(statusCounts));
    if (scChart) this.charts.push(scChart);

    // Assigned vs Available
    const assigned = assets.filter(a => a.status === 'Allocated').length;
    const available = assets.filter(a => a.status === 'Available').length;
    const aaChart = Charts.renderDoughnut('assignedChart', ['Assigned', 'Available'], [assigned, available], {
      plugins: { legend: { position: 'bottom' } }
    });
    if (aaChart) this.charts.push(aaChart);

    // Top Department by Assets
    const deptAssets = departments.map(d => {
      return { name: d.name, count: assets.filter(a => a.departmentId === d.id).length };
    }).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5
    const tdChart = Charts.renderHorizontalBar('topDeptChart', deptAssets.map(d => d.name), deptAssets.map(d => d.count));
    if (tdChart) this.charts.push(tdChart);

    // Monthly Asset Additions
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const additionsByMonth = new Array(12).fill(0);
    assets.forEach(a => {
      if (a.acquisitionDate) {
        const d = new Date(a.acquisitionDate);
        if (d.getFullYear() === currentYear) {
          additionsByMonth[d.getMonth()]++;
        }
      }
    });
    const addChart = Charts.renderLine('additionsChart', months, [{ label: 'New Assets', data: additionsByMonth, fill: true, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' }]);
    if (addChart) this.charts.push(addChart);
    // --- END NEW CHARTS ---

    // 1. Asset Utilization — allocation count per asset
    const allocCounts = {};
    allocations.forEach(a => { allocCounts[a.assetId] = (allocCounts[a.assetId] || 0) + 1; });
    const topAssets = Object.entries(allocCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const utilLabels = topAssets.map(([id]) => Store.getById('assets', id)?.assetTag || id);
    const utilData = topAssets.map(([, c]) => c);
    const c1 = Charts.renderBar('utilizationChart', utilLabels, [{ label: 'Allocations', data: utilData }]);
    if (c1) this.charts.push(c1);

    // 2. Maintenance by Category
    const maintByCat = {};
    maintenance.forEach(m => {
      const asset = Store.getById('assets', m.assetId);
      const cat = asset ? Store.getById('categories', asset.categoryId)?.name : 'Unknown';
      maintByCat[cat] = (maintByCat[cat] || 0) + 1;
    });
    const c2 = Charts.renderDoughnut('maintenanceChart', Object.keys(maintByCat), Object.values(maintByCat));
    if (c2) this.charts.push(c2);

    // 3. Department Allocation
    const deptData = departments.map(d => ({
      name: d.name,
      allocated: assets.filter(a => a.departmentId === d.id && a.status === 'Allocated').length,
      available: assets.filter(a => a.departmentId === d.id && a.status === 'Available').length,
      other: assets.filter(a => a.departmentId === d.id && !['Allocated', 'Available'].includes(a.status)).length
    }));
    const c3 = Charts.renderBar('deptAllocChart',
      deptData.map(d => d.name),
      [
        { label: 'Allocated', data: deptData.map(d => d.allocated), color: 'rgba(59,130,246,0.6)', borderColor: '#3b82f6' },
        { label: 'Available', data: deptData.map(d => d.available), color: 'rgba(16,185,129,0.6)', borderColor: '#10b981' },
        { label: 'Other', data: deptData.map(d => d.other), color: 'rgba(100,100,160,0.4)', borderColor: '#6464a0' }
      ],
      { scales: { ...Charts.defaultOptions.scales, x: { ...Charts.defaultOptions.scales.x, stacked: true }, y: { ...Charts.defaultOptions.scales.y, stacked: true } } }
    );
    if (c3) this.charts.push(c3);

    // 4. Most/Least Used
    const usageData = assets.filter(a => a.status !== 'Disposed' && a.status !== 'Retired').map(a => ({
      name: a.assetTag,
      count: allocations.filter(al => al.assetId === a.id).length + bookings.filter(b => b.assetId === a.id).length
    })).sort((a, b) => b.count - a.count);

    const top5 = usageData.slice(0, 5);
    const bottom5 = usageData.filter(d => d.count === 0).slice(0, 5);
    const combined = [...top5, ...bottom5.filter(b => !top5.find(t => t.name === b.name))];

    const c4 = Charts.renderHorizontalBar('usageChart',
      combined.map(d => d.name),
      combined.map(d => d.count)
    );
    if (c4) this.charts.push(c4);
  },

  renderHeatmap(bookings) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];

    // Build heatmap data
    const grid = {};
    hours.forEach(h => { grid[h] = {}; days.forEach(d => { grid[h][d] = 0; }); });

    bookings.filter(b => b.status !== 'Cancelled').forEach(b => {
      const date = new Date(b.date);
      const dayIdx = date.getDay();
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIdx];
      const startHour = parseInt(b.startTime?.split(':')[0] || '0');
      hours.forEach((h, i) => {
        const hourVal = 8 + i;
        if (startHour <= hourVal && parseInt(b.endTime?.split(':')[0] || '0') > hourVal) {
          if (grid[h]?.[dayName] !== undefined) grid[h][dayName]++;
        }
      });
    });

    const maxVal = Math.max(1, ...Object.values(grid).flatMap(row => Object.values(row)));

    return `
      <div class="heatmap-grid">
        <div></div>${days.map(d => `<div class="heatmap-label" style="justify-content:center;font-weight:600;">${d}</div>`).join('')}
        ${hours.map(h => `
          <div class="heatmap-label">${h}</div>
          ${days.map(d => {
            const val = grid[h]?.[d] || 0;
            const level = val === 0 ? 0 : val <= maxVal * 0.25 ? 1 : val <= maxVal * 0.5 ? 2 : val <= maxVal * 0.75 ? 3 : 4;
            return `<div class="heatmap-cell level-${level}" title="${d} ${h}: ${val} bookings">${val || ''}</div>`;
          }).join('')}
        `).join('')}
      </div>
    `;
  },

  renderRetirementTable(assets) {
    // Assets older than 3 years
    const threshold = new Date();
    threshold.setFullYear(threshold.getFullYear() - 3);
    const aging = assets.filter(a => a.acquisitionDate && new Date(a.acquisitionDate) < threshold && a.status !== 'Retired' && a.status !== 'Disposed');

    if (aging.length === 0) return '<p class="text-tertiary text-sm">No assets nearing retirement threshold (3+ years old)</p>';

    return `
      <div style="overflow-x:auto;max-height:200px;overflow-y:auto;">
        <table class="data-table">
          <thead><tr><th>Tag</th><th>Name</th><th>Acquired</th><th>Age</th><th>Condition</th><th>Status</th></tr></thead>
          <tbody>
            ${aging.sort((a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate)).map(a => {
              const age = Math.round(Utils.daysBetween(a.acquisitionDate, new Date()) / 365 * 10) / 10;
              return `<tr><td>${a.assetTag}</td><td>${Utils.escapeHtml(a.name)}</td><td>${Utils.formatDate(a.acquisitionDate)}</td><td>${age} yrs</td><td>${a.condition}</td><td><span class="${Utils.getBadgeClass(a.status)}">${a.status}</span></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  bindExports(assets, allocations, maintenance, departments, categories) {
    // Export all
    document.getElementById('exportAllBtn')?.addEventListener('click', () => {
      Utils.exportToCSV(assets, 'assetflow_assets', [
        { key: 'assetTag', label: 'Asset Tag' },
        { key: 'name', label: 'Name' },
        { label: 'Category', value: (r) => categories.find(c => c.id === r.categoryId)?.name || '' },
        { key: 'serialNumber', label: 'Serial Number' },
        { key: 'status', label: 'Status' },
        { key: 'condition', label: 'Condition' },
        { key: 'location', label: 'Location' },
        { key: 'cost', label: 'Cost' },
        { key: 'acquisitionDate', label: 'Acquisition Date' },
        { label: 'Department', value: (r) => departments.find(d => d.id === r.departmentId)?.name || '' }
      ]);
      Toast.success('Assets exported to CSV');
    });

    // Individual exports
    document.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const report = btn.dataset.report;
        if (report === 'utilization' || report === 'usage') {
          Utils.exportToCSV(assets, 'asset_utilization', [
            { key: 'assetTag', label: 'Tag' },
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
            { label: 'Allocations', value: (r) => allocations.filter(a => a.assetId === r.id).length }
          ]);
        } else if (report === 'maintenance') {
          Utils.exportToCSV(maintenance, 'maintenance_report', [
            { label: 'Asset', value: (r) => Store.getById('assets', r.assetId)?.name || '' },
            { key: 'description', label: 'Issue' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Date' }
          ]);
        } else if (report === 'retirement') {
          const threshold = new Date(); threshold.setFullYear(threshold.getFullYear() - 3);
          const aging = assets.filter(a => a.acquisitionDate && new Date(a.acquisitionDate) < threshold);
          Utils.exportToCSV(aging, 'retirement_report', [
            { key: 'assetTag', label: 'Tag' },
            { key: 'name', label: 'Name' },
            { key: 'acquisitionDate', label: 'Acquired' },
            { key: 'condition', label: 'Condition' },
            { key: 'status', label: 'Status' }
          ]);
        }
        Toast.success('Report exported to CSV');
      });
    });
  },

  destroy() {
    this.charts.forEach(c => Charts.destroy(c));
    this.charts = [];
  }
};
