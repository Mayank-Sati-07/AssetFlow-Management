// ============================================
// AssetFlow — Charts Component (Chart.js Wrapper)
// ============================================

const Charts = {
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#a0a0c0',
          font: { family: "'Inter', sans-serif", size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#252540',
        titleColor: '#f1f1f8',
        bodyColor: '#a0a0c0',
        borderColor: 'rgba(100,100,160,0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: "'Inter', sans-serif", weight: '600' },
        bodyFont: { family: "'Inter', sans-serif" }
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b6b8d', font: { family: "'Inter', sans-serif", size: 11 } },
        grid: { color: 'rgba(100,100,160,0.1)' },
        border: { color: 'rgba(100,100,160,0.2)' }
      },
      y: {
        ticks: { color: '#6b6b8d', font: { family: "'Inter', sans-serif", size: 11 } },
        grid: { color: 'rgba(100,100,160,0.1)' },
        border: { color: 'rgba(100,100,160,0.2)' },
        beginAtZero: true
      }
    }
  },

  colors: [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6'
  ],

  alphaColors: [
    'rgba(99,102,241,0.6)', 'rgba(139,92,246,0.6)', 'rgba(168,85,247,0.6)',
    'rgba(236,72,153,0.6)', 'rgba(244,63,94,0.6)', 'rgba(239,68,68,0.6)',
    'rgba(249,115,22,0.6)', 'rgba(234,179,8,0.6)', 'rgba(34,197,94,0.6)',
    'rgba(20,184,166,0.6)', 'rgba(6,182,212,0.6)', 'rgba(59,130,246,0.6)'
  ],

  // Doughnut Chart
  renderDoughnut(canvasId, labels, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.colors.slice(0, data.length),
          borderColor: '#161625',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          ...this.defaultOptions.plugins,
          legend: {
            ...this.defaultOptions.plugins.legend,
            position: options.legendPosition || 'bottom'
          }
        },
        ...options
      }
    });
  },

  // Bar Chart
  renderBar(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const chartDatasets = datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || this.alphaColors[i % this.alphaColors.length],
      borderColor: ds.borderColor || this.colors[i % this.colors.length],
      borderWidth: 1,
      borderRadius: 6,
      barPercentage: 0.7,
      ...ds
    }));

    return new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: chartDatasets },
      options: {
        ...this.defaultOptions,
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          legend: {
            ...this.defaultOptions.plugins.legend,
            display: datasets.length > 1
          }
        }
      }
    });
  },

  // Line Chart
  renderLine(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const chartDatasets = datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color || this.colors[i % this.colors.length],
      backgroundColor: ds.bgColor || `${this.colors[i % this.colors.length]}20`,
      fill: ds.fill !== undefined ? ds.fill : true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: ds.color || this.colors[i % this.colors.length],
      borderWidth: 2,
      ...ds
    }));

    return new Chart(canvas, {
      type: 'line',
      data: { labels, datasets: chartDatasets },
      options: {
        ...this.defaultOptions,
        ...options
      }
    });
  },

  // Horizontal Bar
  renderHorizontalBar(canvasId, labels, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.alphaColors.slice(0, data.length),
          borderColor: this.colors.slice(0, data.length),
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6
        }]
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y',
        plugins: {
          ...this.defaultOptions.plugins,
          legend: { display: false }
        },
        ...options
      }
    });
  },

  // Destroy chart
  destroy(chart) {
    if (chart) chart.destroy();
  }
};
