// ============================================
// AssetFlow — Router (Hash-based SPA)
// ============================================

const Router = {
  routes: {},
  currentPage: null,

  // Define routes
  init() {
    this.routes = {
      '/login':       { page: LoginPage,       title: 'Login',                auth: false },
      '/dashboard':   { page: DashboardPage,   title: 'Dashboard',            auth: true },
      '/org-setup':   { page: OrgSetupPage,    title: 'Organization Setup',   auth: true, roles: ['Admin'] },
      '/assets':      { page: AssetsPage,      title: 'Asset Directory',      auth: true },
      '/allocation':  { page: AllocationPage,  title: 'Asset Allocation',     auth: true },
      '/booking':     { page: BookingPage,     title: 'Resource Booking',     auth: true },
      '/maintenance': { page: MaintenancePage, title: 'Maintenance',          auth: true },
      '/audit':       { page: AuditPage,       title: 'Asset Audit',         auth: true },
      '/reports':     { page: ReportsPage,     title: 'Reports & Analytics',  auth: true },
      '/activity':    { page: ActivityPage,    title: 'Activity & Notifications', auth: true }
    };

    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  // Handle route changes
  handleRoute() {
    const hash = window.location.hash || '#/login';
    const path = hash.replace('#', '').split('?')[0];
    const params = this.getParams(hash);

    const route = this.routes[path];

    // Unknown route
    if (!route) {
      window.location.hash = Auth.isAuthenticated() ? '#/dashboard' : '#/login';
      return;
    }

    // Auth guard
    if (route.auth && !Auth.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    // Already logged in, redirect away from login
    if (path === '/login' && Auth.isAuthenticated()) {
      window.location.hash = '#/dashboard';
      return;
    }

    // Role guard
    if (route.roles && !Auth.hasRole(route.roles)) {
      Toast.show('Access denied. You don\'t have permission to view this page.', 'error');
      window.location.hash = '#/dashboard';
      return;
    }

    // Render the page
    this.renderPage(route, path, params);
  },

  // Get query params from hash
  getParams(hash) {
    const params = {};
    const queryString = hash.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }
    return params;
  },

  // Render a page
  renderPage(route, path, params) {
    const app = document.getElementById('app');
    if (!app) return;

    // Update document title
    document.title = `${route.title} | AssetFlow`;

    // Clear previous page
    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }

    // Login page has no shell
    if (path === '/login') {
      app.innerHTML = '';
      route.page.render(app, params);
      this.currentPage = route.page;
      return;
    }

    // Render app shell if not already present
    if (!document.querySelector('.app-shell')) {
      app.innerHTML = `
        <div class="app-shell">
          <div class="sidebar-overlay" id="sidebarOverlay"></div>
          <aside class="sidebar" id="sidebar"></aside>
          <div class="main-content">
            <header class="topbar" id="topbar"></header>
            <main class="page-container" id="pageContent"></main>
          </div>
        </div>
      `;
      Sidebar.render(document.getElementById('sidebar'));
      Topbar.render(document.getElementById('topbar'));

      // Sidebar overlay click
      document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
      });
    }

    // Update sidebar active state
    Sidebar.setActive(path);

    // Update topbar title
    Topbar.setTitle(route.title);

    // Render page content
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = '';
    route.page.render(pageContent, params);
    this.currentPage = route.page;

    // Update notification badge
    NotificationEngine.updateBadge();

    // Scroll to top
    pageContent.scrollTo(0, 0);
  },

  // Navigate to a route
  navigate(path) {
    window.location.hash = `#${path}`;
  }
};
