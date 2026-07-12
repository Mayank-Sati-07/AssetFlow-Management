// ============================================
// AssetFlow — Authentication Module
// ============================================

const Auth = {
  // Hash password using SHA-256
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Sign up (creates Employee role only)
  async signup(name, email, password) {
    // Check if email already exists
    const existing = Store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = await this.hashPassword(password);
    const user = Store.create('users', {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'Employee',
      departmentId: null,
      status: 'Active',
      avatar: null
    });

    // Log activity
    ActivityLogger.log(user.id, 'SIGNUP', 'user', user.id, `${name} created an account`);

    return { success: true, user };
  },

  // Login
  async login(email, password) {
    const user = Store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }
    if (user.status === 'Inactive') {
      return { success: false, error: 'This account has been deactivated. Contact your administrator.' };
    }

    const passwordHash = await this.hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Incorrect password.' };
    }

    // Create session
    this.setSession(user);

    // Log activity
    ActivityLogger.log(user.id, 'LOGIN', 'user', user.id, `${user.name} logged in`);

    return { success: true, user };
  },

  // Logout
  logout() {
    const user = this.getCurrentUser();
    if (user) {
      ActivityLogger.log(user.id, 'LOGOUT', 'user', user.id, `${user.name} logged out`);
    }
    sessionStorage.removeItem('af_session');
    window.location.hash = '#/login';
  },

  // Get current logged-in user
  getCurrentUser() {
    try {
      const session = sessionStorage.getItem('af_session');
      if (!session) return null;
      const { userId } = JSON.parse(session);
      return Store.getById('users', userId);
    } catch {
      return null;
    }
  },

  // Set session
  setSession(user) {
    sessionStorage.setItem('af_session', JSON.stringify({
      userId: user.id,
      loginAt: Utils.now()
    }));
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  // Check user role
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  },

  // Check if user is admin
  isAdmin() {
    return this.hasRole('Admin');
  },

  // Check if user can manage assets (Admin or Asset Manager)
  canManageAssets() {
    return this.hasRole(['Admin', 'AssetManager']);
  },

  // Check if user can approve (Admin, Asset Manager, or Dept Head)
  canApprove() {
    return this.hasRole(['Admin', 'AssetManager', 'DeptHead']);
  },

  // Reset password (simulated)
  async resetPassword(email) {
    const user = Store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }
    const newHash = await this.hashPassword('password123');
    Store.update('users', user.id, { passwordHash: newHash });

    ActivityLogger.log(user.id, 'PASSWORD_RESET', 'user', user.id, `Password reset for ${user.name}`);

    return { success: true, message: 'Password has been reset to "password123". Please login and change it.' };
  }
};
