// ============================================
// AssetFlow — Organization Setup (Screen 3)
// ============================================

const OrgSetupPage = {
  activeTab: 'departments',

  render(container) {
    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Organization Setup</h2>
            <p class="text-secondary text-sm">Manage departments, asset categories, and employees</p>
          </div>
        </div>
        <div class="tab-group">
          <button class="tab-btn ${this.activeTab === 'departments' ? 'active' : ''}" data-tab="departments">Departments</button>
          <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">Asset Categories</button>
          <button class="tab-btn ${this.activeTab === 'employees' ? 'active' : ''}" data-tab="employees">Employee Directory</button>
        </div>
        <div id="tabContent"></div>
      </div>
    `;

    // Tab switching
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
    const content = document.getElementById('tabContent');
    if (!content) return;
    if (this.activeTab === 'departments') this.renderDepartments(content);
    else if (this.activeTab === 'categories') this.renderCategories(content);
    else this.renderEmployees(content);
  },

  // ---- DEPARTMENTS TAB ----
  renderDepartments(content) {
    const departments = Store.getAll('departments');
    const users = Store.getAll('users');

    content.innerHTML = `<div id="deptTable"></div>`;

    DataTable.render('deptTable', {
      data: departments,
      searchable: true,
      searchPlaceholder: 'Search departments...',
      toolbar: `<button class="btn btn-primary btn-sm" id="addDeptBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add Department
      </button>`,
      columns: [
        { key: 'name', label: 'Department', render: (r) => `<span style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(r.name)}</span>` },
        { key: 'description', label: 'Description', render: (r) => `<span class="text-secondary">${Utils.escapeHtml(Utils.truncate(r.description, 40))}</span>` },
        { key: 'headId', label: 'Department Head', render: (r) => {
          const head = users.find(u => u.id === r.headId);
          return head ? `<div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${Utils.stringToColor(head.name)}">${Utils.getInitials(head.name)}</div>${Utils.escapeHtml(head.name)}</div>` : '<span class="text-tertiary">Not assigned</span>';
        }},
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${r.status}</span>` },
        { key: '_count', label: 'Employees', render: (r) => users.filter(u => u.departmentId === r.id).length }
      ],
      actions: [
        { label: 'Edit', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>', onClick: (r) => this.openDeptModal(r) },
        { label: 'Deactivate', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>', onClick: (r) => {
          const newStatus = r.status === 'Active' ? 'Inactive' : 'Active';
          Modal.confirm('Change Status', `${newStatus === 'Inactive' ? 'Deactivate' : 'Activate'} ${r.name}?`, () => {
            Store.update('departments', r.id, { status: newStatus });
            ActivityLogger.log(Auth.getCurrentUser().id, 'DEPT_UPDATED', 'department', r.id, `${r.name} ${newStatus === 'Inactive' ? 'deactivated' : 'activated'}`);
            Toast.success(`${r.name} ${newStatus === 'Inactive' ? 'deactivated' : 'activated'}`);
            this.renderTab();
          });
        }}
      ]
    });

    document.getElementById('addDeptBtn')?.addEventListener('click', () => this.openDeptModal());
  },

  openDeptModal(dept = null) {
    const users = Store.find('users', u => u.status === 'Active');
    const departments = Store.getAll('departments');

    const content = `<div id="deptFormContainer"></div>`;
    Modal.open(dept ? 'Edit Department' : 'Add Department', content);

    FormBuilder.render('deptFormContainer', {
      values: dept || {},
      fields: [
        { key: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'e.g. Information Technology' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description...' },
        { key: 'headId', label: 'Department Head', type: 'select', options: users.map(u => ({ value: u.id, label: `${u.name} (${Utils.formatStatus(u.role)})` })) },
        { key: 'parentId', label: 'Parent Department', type: 'select', options: departments.filter(d => d.id !== dept?.id).map(d => ({ value: d.id, label: d.name })) },
        { key: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] }
      ],
      submitLabel: dept ? 'Update' : 'Create',
      onSubmit: (data) => {
        if (dept) {
          Store.update('departments', dept.id, data);
          ActivityLogger.log(Auth.getCurrentUser().id, 'DEPT_UPDATED', 'department', dept.id, `Updated department: ${data.name}`);
          Toast.success('Department updated');
        } else {
          const newDept = Store.create('departments', data);
          ActivityLogger.log(Auth.getCurrentUser().id, 'DEPT_CREATED', 'department', newDept.id, `Created department: ${data.name}`);
          Toast.success('Department created');
        }
        Modal.close();
        this.renderTab();
      }
    });
  },

  // ---- CATEGORIES TAB ----
  renderCategories(content) {
    const categories = Store.getAll('categories');
    const assets = Store.getAll('assets');

    content.innerHTML = `<div id="catTable"></div>`;

    DataTable.render('catTable', {
      data: categories,
      searchable: true,
      searchPlaceholder: 'Search categories...',
      toolbar: `<button class="btn btn-primary btn-sm" id="addCatBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add Category
      </button>`,
      columns: [
        { key: 'name', label: 'Category', render: (r) => `<span style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(r.name)}</span>` },
        { key: 'description', label: 'Description', render: (r) => `<span class="text-secondary">${Utils.escapeHtml(Utils.truncate(r.description, 50))}</span>` },
        { key: '_fields', label: 'Custom Fields', render: (r) => (r.customFields || []).map(f => `<span class="badge" style="background:var(--bg-tertiary);color:var(--text-secondary);margin-right:4px;">${Utils.escapeHtml(f.key)}</span>`).join('') || '<span class="text-tertiary">None</span>' },
        { key: '_count', label: 'Assets', render: (r) => assets.filter(a => a.categoryId === r.id).length }
      ],
      actions: [
        { label: 'Edit', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>', onClick: (r) => this.openCatModal(r) }
      ]
    });

    document.getElementById('addCatBtn')?.addEventListener('click', () => this.openCatModal());
  },

  openCatModal(cat = null) {
    const existingFields = cat?.customFields || [];
    const content = `
      <div id="catFormContainer"></div>
      <div style="margin-top:16px;">
        <div class="form-section-title">Custom Fields</div>
        <div id="customFieldsList">
          ${existingFields.map((f, i) => `
            <div class="flex items-center gap-2 mb-2">
              <input class="form-input" value="${Utils.escapeHtml(f.key)}" placeholder="Field name" data-cf-idx="${i}">
              <button class="btn btn-icon btn-ghost btn-sm" onclick="this.parentElement.remove()">✕</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-sm" id="addCfBtn" type="button">+ Add Custom Field</button>
      </div>
    `;

    Modal.open(cat ? 'Edit Category' : 'Add Category', content);

    FormBuilder.render('catFormContainer', {
      values: cat || {},
      fields: [
        { key: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g. Electronics' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description...' }
      ],
      submitLabel: cat ? 'Update' : 'Create',
      onSubmit: (data) => {
        // Collect custom fields
        const cfInputs = document.querySelectorAll('#customFieldsList input');
        data.customFields = Array.from(cfInputs).map(i => ({ key: i.value.trim(), type: 'text' })).filter(f => f.key);

        if (cat) {
          Store.update('categories', cat.id, data);
          Toast.success('Category updated');
        } else {
          Store.create('categories', data);
          Toast.success('Category created');
        }
        Modal.close();
        this.renderTab();
      }
    });

    document.getElementById('addCfBtn')?.addEventListener('click', () => {
      const list = document.getElementById('customFieldsList');
      const div = document.createElement('div');
      div.className = 'flex items-center gap-2 mb-2';
      div.innerHTML = `<input class="form-input" placeholder="Field name"><button class="btn btn-icon btn-ghost btn-sm" onclick="this.parentElement.remove()">✕</button>`;
      list.appendChild(div);
    });
  },

  // ---- EMPLOYEES TAB ----
  renderEmployees(content) {
    const users = Store.find('users', u => u.role !== 'Admin' || u.id === 'user_admin');
    const departments = Store.getAll('departments');

    content.innerHTML = `<div id="empTable"></div>`;

    DataTable.render('empTable', {
      data: users.filter(u => u.id !== 'user_admin'),
      searchable: true,
      searchPlaceholder: 'Search employees...',
      filters: [
        { key: 'departmentId', label: 'All Departments', options: departments.map(d => ({ value: d.id, label: d.name })) },
        { key: 'role', label: 'All Roles', options: [
          { value: 'Employee', label: 'Employee' },
          { value: 'DeptHead', label: 'Department Head' },
          { value: 'AssetManager', label: 'Asset Manager' }
        ]},
        { key: 'status', label: 'All Statuses', options: [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
      ],
      columns: [
        { key: 'name', label: 'Name', render: (r) => `
          <div class="flex items-center gap-3">
            <div class="avatar avatar-sm" style="background:${Utils.stringToColor(r.name)}">${Utils.getInitials(r.name)}</div>
            <div>
              <div style="font-weight:500;color:var(--text-primary);">${Utils.escapeHtml(r.name)}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${Utils.escapeHtml(r.email)}</div>
            </div>
          </div>
        ` },
        { key: 'departmentId', label: 'Department', render: (r) => {
          const dept = departments.find(d => d.id === r.departmentId);
          return dept ? Utils.escapeHtml(dept.name) : '<span class="text-tertiary">Unassigned</span>';
        }},
        { key: 'role', label: 'Role', render: (r) => `
          <select class="form-select" style="padding:4px 28px 4px 8px;font-size:var(--text-xs);min-width:140px;" data-user-role="${r.id}">
            <option value="Employee" ${r.role === 'Employee' ? 'selected' : ''}>Employee</option>
            <option value="DeptHead" ${r.role === 'DeptHead' ? 'selected' : ''}>Department Head</option>
            <option value="AssetManager" ${r.role === 'AssetManager' ? 'selected' : ''}>Asset Manager</option>
          </select>
        ` },
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${r.status}</span>` }
      ],
      actions: [
        { label: 'Toggle Status', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>', onClick: (r) => {
          const newStatus = r.status === 'Active' ? 'Inactive' : 'Active';
          Store.update('users', r.id, { status: newStatus });
          Toast.success(`${r.name} ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
          this.renderTab();
        }}
      ]
    });

    // Role change handlers
    setTimeout(() => {
      content.querySelectorAll('[data-user-role]').forEach(sel => {
        sel.addEventListener('change', (e) => {
          e.stopPropagation();
          const userId = sel.dataset.userRole;
          const newRole = sel.value;
          const user = Store.getById('users', userId);
          Store.update('users', userId, { role: newRole });
          ActivityLogger.log(Auth.getCurrentUser().id, 'ROLE_CHANGED', 'user', userId, `Changed ${user.name}'s role to ${Utils.formatStatus(newRole)}`);
          NotificationEngine.create(userId, 'ROLE_CHANGED', `Your role has been updated to ${Utils.formatStatus(newRole)}.`);
          Toast.success(`${user.name}'s role updated to ${Utils.formatStatus(newRole)}`);
        });
      });
    }, 100);
  },

  destroy() {}
};
