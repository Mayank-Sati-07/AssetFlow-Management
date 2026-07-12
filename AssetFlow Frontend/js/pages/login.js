// ============================================
// AssetFlow — Login Page (Screen 1)
// ============================================

const LoginPage = {
  currentView: 'login', // login | signup | forgot

  render(container) {
    this.currentView = 'login';
    this.renderView(container);
  },

  renderView(container) {
    const c = container || document.getElementById('app');
    c.innerHTML = `
      <div class="login-layout">
        <div class="login-brand">
          <div class="login-brand-content slide-up">
            <img src="assets/logo.svg" alt="AssetFlow" class="logo-large">
            <h1>AssetFlow</h1>
            <p>Enterprise Asset & Resource Management System. Track, allocate, and maintain your organization's assets with ease.</p>
            <div class="login-features">
              <div class="login-feature">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                </div>
                <span>Full asset lifecycle tracking from registration to disposal</span>
              </div>
              <div class="login-feature">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                </div>
                <span>Smart resource booking with overlap prevention</span>
              </div>
              <div class="login-feature">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <span>Structured maintenance workflows with approval routing</span>
              </div>
              <div class="login-feature">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <span>Real-time dashboards and exportable reports</span>
              </div>
            </div>
          </div>
        </div>
        <div class="login-form-side">
          <div class="login-form-container fade-in" id="loginFormContainer">
            ${this.getFormHtml()}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(c);
  },

  getFormHtml() {
    if (this.currentView === 'signup') {
      return `
        <div class="login-form-header">
          <h2>Create Account</h2>
          <p>Join your organization on AssetFlow</p>
        </div>
        <form class="login-form" id="authForm">
          <div class="form-group">
            <label class="form-label" for="signupName">Full Name</label>
            <input class="form-input" type="text" id="signupName" placeholder="Enter your full name" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="signupEmail">Email Address</label>
            <input class="form-input" type="email" id="signupEmail" placeholder="you@company.com" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="signupPassword">Password</label>
            <input class="form-input" type="password" id="signupPassword" placeholder="Create a password" required minlength="6">
          </div>
          <div class="form-group">
            <label class="form-label" for="signupConfirm">Confirm Password</label>
            <input class="form-input" type="password" id="signupConfirm" placeholder="Confirm your password" required>
          </div>
          <div id="authError" class="form-error" style="text-align:center;margin-bottom:12px;"></div>
          <button type="submit" class="btn btn-primary w-full btn-lg">Create Account</button>
        </form>
        <div class="login-footer">
          Already have an account? <a href="#" id="switchToLogin">Sign in</a>
        </div>
      `;
    }

    if (this.currentView === 'forgot') {
      return `
        <div class="login-form-header">
          <h2>Reset Password</h2>
          <p>Enter your email to reset your password</p>
        </div>
        <form class="login-form" id="authForm">
          <div class="form-group">
            <label class="form-label" for="forgotEmail">Email Address</label>
            <input class="form-input" type="email" id="forgotEmail" placeholder="you@company.com" required>
          </div>
          <div id="authError" class="form-error" style="text-align:center;margin-bottom:12px;"></div>
          <div id="authSuccess" style="text-align:center;margin-bottom:12px;color:var(--color-success-400);font-size:var(--text-sm);"></div>
          <button type="submit" class="btn btn-primary w-full btn-lg">Reset Password</button>
        </form>
        <div class="login-footer">
          Remember your password? <a href="#" id="switchToLogin">Sign in</a>
        </div>
      `;
    }

    // Login (default)
    return `
      <div class="login-form-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your AssetFlow account</p>
      </div>
      <form class="login-form" id="authForm">
        <div class="form-group">
          <label class="form-label" for="loginEmail">Email Address</label>
          <input class="form-input" type="email" id="loginEmail" placeholder="you@company.com" required value="admin@assetflow.com">
        </div>
        <div class="form-group">
          <label class="form-label" for="loginPassword">Password</label>
          <input class="form-input" type="password" id="loginPassword" placeholder="Enter your password" required value="admin123">
        </div>
        <a href="#" class="forgot-link" id="switchToForgot">Forgot password?</a>
        <div id="authError" class="form-error" style="text-align:center;margin-bottom:12px;"></div>
        <button type="submit" class="btn btn-primary w-full btn-lg">Sign In</button>
      </form>
      <div class="login-divider">or</div>
      <div class="login-footer">
        Don't have an account? <a href="#" id="switchToSignup">Create one</a>
        <div style="margin-top:12px;font-size:var(--text-xs);color:var(--text-tertiary);">
          Demo: admin@assetflow.com / admin123
        </div>
      </div>
    `;
  },

  bindEvents(container) {
    const form = container.querySelector('#authForm');
    const errorEl = container.querySelector('#authError');

    // Switch views
    const switchToLogin = container.querySelector('#switchToLogin');
    const switchToSignup = container.querySelector('#switchToSignup');
    const switchToForgot = container.querySelector('#switchToForgot');

    if (switchToLogin) {
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentView = 'login';
        this.animateSwitch(container);
      });
    }
    if (switchToSignup) {
      switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentView = 'signup';
        this.animateSwitch(container);
      });
    }
    if (switchToForgot) {
      switchToForgot.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentView = 'forgot';
        this.animateSwitch(container);
      });
    }

    // Form submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) errorEl.textContent = '';

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Please wait...';

        try {
          if (this.currentView === 'login') {
            const email = container.querySelector('#loginEmail').value.trim();
            const password = container.querySelector('#loginPassword').value;
            const result = await Auth.login(email, password);
            if (result.success) {
              window.location.hash = '#/dashboard';
            } else {
              if (errorEl) errorEl.textContent = result.error;
            }
          } else if (this.currentView === 'signup') {
            const name = container.querySelector('#signupName').value.trim();
            const email = container.querySelector('#signupEmail').value.trim();
            const password = container.querySelector('#signupPassword').value;
            const confirm = container.querySelector('#signupConfirm').value;

            if (password !== confirm) {
              if (errorEl) errorEl.textContent = 'Passwords do not match.';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create Account';
              return;
            }
            if (password.length < 6) {
              if (errorEl) errorEl.textContent = 'Password must be at least 6 characters.';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create Account';
              return;
            }

            const result = await Auth.signup(name, email, password);
            if (result.success) {
              Toast.success('Account created! Please sign in.');
              this.currentView = 'login';
              this.animateSwitch(container);
            } else {
              if (errorEl) errorEl.textContent = result.error;
            }
          } else if (this.currentView === 'forgot') {
            const email = container.querySelector('#forgotEmail').value.trim();
            const result = await Auth.resetPassword(email);
            const successEl = container.querySelector('#authSuccess');
            if (result.success) {
              if (successEl) successEl.textContent = result.message;
              if (errorEl) errorEl.textContent = '';
            } else {
              if (errorEl) errorEl.textContent = result.error;
            }
          }
        } catch (err) {
          if (errorEl) errorEl.textContent = 'An unexpected error occurred.';
        }

        submitBtn.disabled = false;
        if (this.currentView === 'login') submitBtn.textContent = 'Sign In';
        else if (this.currentView === 'signup') submitBtn.textContent = 'Create Account';
        else submitBtn.textContent = 'Reset Password';
      });
    }
  },

  animateSwitch(container) {
    const formContainer = container.querySelector('#loginFormContainer') || container.querySelector('.login-form-container');
    if (formContainer) {
      formContainer.style.opacity = '0';
      formContainer.style.transform = 'translateY(10px)';
      setTimeout(() => {
        formContainer.innerHTML = this.getFormHtml();
        this.bindEvents(container);
        formContainer.style.transition = 'all 0.3s ease';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
      }, 200);
    }
  },

  destroy() {}
};
