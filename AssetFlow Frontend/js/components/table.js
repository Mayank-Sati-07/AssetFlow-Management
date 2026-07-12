// ============================================
// AssetFlow — Data Table Component
// ============================================

const DataTable = {
  /**
   * Render a data table
   * @param {string} containerId - Container element ID
   * @param {object} config - Table configuration
   *   columns: [{ key, label, sortable, render, width }]
   *   data: array of objects
   *   searchable: boolean
   *   searchPlaceholder: string
   *   filters: [{ key, label, options: [{ value, label }] }]
   *   actions: [{ label, icon, class, onClick }]
   *   rowClass: function(row) => string
   *   onRowClick: function(row)
   *   pageSize: number
   *   toolbar: extra HTML for toolbar
   */
  render(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const state = {
      data: config.data || [],
      filtered: config.data || [],
      sortKey: null,
      sortDir: 'asc',
      page: 1,
      pageSize: config.pageSize || 10,
      searchQuery: '',
      filters: {}
    };

    const renderTable = () => {
      // Apply search
      let filtered = [...state.data];
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(row =>
          config.columns.some(col => {
            const val = typeof col.render === 'function'
              ? ''
              : String(row[col.key] || '').toLowerCase();
            return val.includes(q);
          }) || JSON.stringify(row).toLowerCase().includes(q)
        );
      }

      // Apply filters
      Object.keys(state.filters).forEach(key => {
        const val = state.filters[key];
        if (val) {
          filtered = filtered.filter(row => String(row[key]) === val);
        }
      });

      // Apply sort
      if (state.sortKey) {
        filtered.sort((a, b) => {
          let va = a[state.sortKey] || '';
          let vb = b[state.sortKey] || '';
          if (typeof va === 'number' && typeof vb === 'number') {
            return state.sortDir === 'asc' ? va - vb : vb - va;
          }
          va = String(va).toLowerCase();
          vb = String(vb).toLowerCase();
          return state.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });
      }

      state.filtered = filtered;

      // Pagination
      const totalPages = Math.ceil(filtered.length / state.pageSize) || 1;
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * state.pageSize;
      const paged = filtered.slice(start, start + state.pageSize);

      container.innerHTML = `
        <div class="table-container">
          ${config.searchable || (config.filters && config.filters.length) || config.toolbar ? `
            <div class="table-toolbar">
              <div class="flex items-center gap-3" style="flex:1;">
                ${config.searchable ? `
                  <div class="search-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="${config.searchPlaceholder || 'Search...'}" value="${Utils.escapeHtml(state.searchQuery)}" id="${containerId}_search">
                  </div>
                ` : ''}
                ${config.filters ? `
                  <div class="table-filters">
                    ${config.filters.map(f => `
                      <select class="form-select" id="${containerId}_filter_${f.key}">
                        <option value="">${f.label}</option>
                        ${f.options.map(o => `<option value="${o.value}" ${state.filters[f.key] === o.value ? 'selected' : ''}>${Utils.escapeHtml(o.label)}</option>`).join('')}
                      </select>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-tertiary">${filtered.length} record${filtered.length !== 1 ? 's' : ''}</span>
                ${config.toolbar || ''}
              </div>
            </div>
          ` : ''}
          <table class="data-table">
            <thead>
              <tr>
                ${config.columns.map(col => `
                  <th ${col.sortable !== false ? `class="${state.sortKey === col.key ? 'sorted' : ''}" data-sort="${col.key}"` : ''} ${col.width ? `style="width:${col.width}"` : ''}>
                    ${col.label}
                    ${col.sortable !== false ? `<span class="sort-icon">${state.sortKey === col.key ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>` : ''}
                  </th>
                `).join('')}
                ${config.actions ? '<th style="width:100px; text-align:right;">Actions</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${paged.length === 0 ? `
                <tr><td colspan="${config.columns.length + (config.actions ? 1 : 0)}" style="text-align:center; padding:48px;">
                  <div class="text-tertiary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 8px;display:block;"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                    <p>No records found</p>
                  </div>
                </td></tr>
              ` : paged.map(row => `
                <tr class="${config.rowClass ? config.rowClass(row) : ''}" ${config.onRowClick ? `style="cursor:pointer" data-row-id="${row.id}"` : ''}>
                  ${config.columns.map(col => `
                    <td>${col.render ? col.render(row) : Utils.escapeHtml(String(row[col.key] || '—'))}</td>
                  `).join('')}
                  ${config.actions ? `
                    <td>
                      <div class="row-actions">
                        ${config.actions.map((a, i) => {
                          if (a.visible && !a.visible(row)) return '';
                          return `<button class="btn btn-icon btn-ghost btn-sm" title="${a.label}" data-action="${i}" data-row-id="${row.id}">
                            ${a.icon || a.label}
                          </button>`;
                        }).join('')}
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${totalPages > 1 ? `
            <div class="table-pagination">
              <span>Page ${state.page} of ${totalPages}</span>
              <div class="page-buttons">
                <button class="page-btn" data-page="prev" ${state.page <= 1 ? 'disabled' : ''}>←</button>
                ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5) {
                    if (state.page <= 3) p = i + 1;
                    else if (state.page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = state.page - 2 + i;
                  }
                  return `<button class="page-btn ${p === state.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
                }).join('')}
                <button class="page-btn" data-page="next" ${state.page >= totalPages ? 'disabled' : ''}>→</button>
              </div>
            </div>
          ` : ''}
        </div>
      `;

      // ---- Bind Events ----

      // Sort
      container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.dataset.sort;
          if (state.sortKey === key) {
            state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            state.sortKey = key;
            state.sortDir = 'asc';
          }
          renderTable();
        });
      });

      // Search
      const searchInput = document.getElementById(`${containerId}_search`);
      if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce((e) => {
          state.searchQuery = e.target.value;
          state.page = 1;
          renderTable();
        }, 250));
        searchInput.focus();
      }

      // Filters
      if (config.filters) {
        config.filters.forEach(f => {
          const sel = document.getElementById(`${containerId}_filter_${f.key}`);
          if (sel) {
            sel.addEventListener('change', (e) => {
              state.filters[f.key] = e.target.value;
              state.page = 1;
              renderTable();
            });
          }
        });
      }

      // Pagination
      container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = btn.dataset.page;
          if (p === 'prev') state.page = Math.max(1, state.page - 1);
          else if (p === 'next') state.page = Math.min(totalPages, state.page + 1);
          else state.page = parseInt(p);
          renderTable();
        });
      });

      // Row click
      if (config.onRowClick) {
        container.querySelectorAll('tr[data-row-id]').forEach(tr => {
          tr.addEventListener('click', (e) => {
            if (e.target.closest('.row-actions')) return;
            const row = state.filtered.find(r => r.id === tr.dataset.rowId);
            if (row) config.onRowClick(row);
          });
        });
      }

      // Action buttons
      if (config.actions) {
        container.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const actionIdx = parseInt(btn.dataset.action);
            const row = state.filtered.find(r => r.id === btn.dataset.rowId);
            if (row && config.actions[actionIdx]?.onClick) {
              config.actions[actionIdx].onClick(row);
            }
          });
        });
      }
    };

    renderTable();

    // Return refresh function
    return {
      refresh(newData) {
        state.data = newData;
        renderTable();
      },
      getFiltered() {
        return state.filtered;
      }
    };
  }
};
