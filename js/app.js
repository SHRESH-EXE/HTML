/**
 * CivicPulse - Master Application Coordinator
 * Navigation routing, role switcher, toast notifications, and event orchestration
 */

class Application {
  constructor() {
    this.currentView = 'resident'; // 'auth' | 'resident' | 'municipal' | 'helpdesk' | 'api-docs'
    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindGlobalEvents();

    // Initialize state
    const user = window.Auth.getCurrentUser();
    this.updateUserUI(user);

    // Initial view based on user role
    if (!window.Auth.isLoggedIn()) {
      this.switchView('auth');
    } else {
      this.switchView(this.getHomeView(user));
    }
  }

  getHomeView(user) {
    if (!user) return 'auth';
    if (user.role === 'field_team' || user.role === 'admin') return 'municipal';
    if (user.role === 'help_desk') return 'helpdesk';
    return 'resident';
  }

  isViewAllowed(user, viewName) {
    if (viewName === 'auth') return true;
    if (!user) return false;
    if (user.role === 'resident') return viewName === 'resident' || viewName === 'helpdesk';
    if (user.role === 'field_team' || user.role === 'admin') return viewName === 'municipal';
    if (user.role === 'help_desk') return viewName === 'helpdesk';
    return false;
  }

  goHome() {
    const user = window.Auth.getCurrentUser();
    this.switchView(this.getHomeView(user));
  }

  bindNavigation() {
    // Nav links
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        this.switchView(targetView);
      });
    });

    // Report issue buttons (Trigger 3-step modal - Residents only)
    document.querySelectorAll('.btn-open-report-wizard').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = window.Auth.getCurrentUser();
        if (!user) {
          this.switchView('auth');
          this.showToast('Please login as a resident to submit a civic report.', 'info');
          return;
        }
        if (user.role !== 'resident') {
          this.showToast('Only residents can file new civic issues.', 'warning');
          return;
        }
        window.IssueReportWizard.open();
      });
    });

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.IssueReportWizard.close();
        window.IssueDetailView.close();
        document.getElementById('emergency-action-modal')?.classList.remove('active');
        document.getElementById('merge-duplicates-modal')?.classList.remove('active');
      }
    });

    // Auth tab toggling (Login vs Register)
    const loginTabBtn = document.getElementById('auth-tab-login');
    const registerTabBtn = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');

    if (loginTabBtn && registerTabBtn) {
      loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
      });

      registerTabBtn.addEventListener('click', () => {
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
      });
    }

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const result = window.Auth.login(email, pass);
        if (result.success) {
          this.showToast(`Welcome back, ${result.user.name}!`, 'success');
          this.switchView((result.user.role === 'field_team' || result.user.role === 'admin') ? 'municipal' : (result.user.role === 'help_desk' ? 'helpdesk' : 'resident'));
        } else {
          this.showToast(result.error, 'error');
        }
      });
    }

    // Register Form Submit
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-fullname').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const ward_id = document.getElementById('reg-ward').value;
        const password = document.getElementById('reg-password').value;

        const result = window.Auth.register({ name, email, phone, ward_id, password });
        if (result.success) {
          this.showToast(`Account created for ${result.user.name}!`, 'success');
          this.switchView('resident');
        } else {
          this.showToast(result.error, 'error');
        }
      });
    }

    // Demo Quick-Role Login Buttons
    document.querySelectorAll('.btn-demo-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.demoRole;
        const result = window.Auth.loginAs(role);
        if (result.success) {
          this.showToast(`Logged in as ${result.user.name}`, 'success');
          this.switchView((result.user.role === 'field_team' || result.user.role === 'admin') ? 'municipal' : (result.user.role === 'help_desk' ? 'helpdesk' : 'resident'));
        }
      });
    });

    // Logout
    const logoutBtn = document.getElementById('btn-nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.Auth.logout();
        this.showToast('Signed out successfully.', 'info');
        this.switchView('auth');
      });
    }
  }

  bindGlobalEvents() {
    window.addEventListener('civic:user-changed', (e) => {
      this.updateUserUI(e.detail.user);
      this.refreshActiveView();
    });

    window.addEventListener('civic:issue-created', () => {
      this.refreshActiveView();
    });

    window.addEventListener('civic:issue-updated', () => {
      this.refreshActiveView();
    });
  }

  updateUserUI(user) {
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');

    const resTab = document.getElementById('nav-tab-resident');
    const muniTab = document.getElementById('nav-tab-municipal');
    const helpTab = document.getElementById('nav-tab-helpdesk');

    if (!user) {
      if (nameEl) nameEl.textContent = 'Guest';
      if (roleEl) roleEl.textContent = 'Not Signed In';
      if (resTab) resTab.style.display = 'none';
      if (muniTab) muniTab.style.display = 'none';
      if (helpTab) helpTab.style.display = 'none';
      return;
    }

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.title || user.role.replace('_', ' ').toUpperCase();
    if (avatarEl) avatarEl.src = user.avatar;

    const isResident = user.role === 'resident';
    const isWorker = user.role === 'field_team';
    const isAdmin = user.role === 'admin';
    const isHelpDesk = user.role === 'help_desk';

    // Strict Role-Based Navigation Tabs
    if (resTab) resTab.style.display = isResident ? 'inline-flex' : 'none';
    if (muniTab) {
      muniTab.style.display = (isWorker || isAdmin) ? 'inline-flex' : 'none';
      const muniBtn = muniTab.querySelector('.nav-link-btn');
      if (muniBtn) {
        muniBtn.textContent = isAdmin ? 'Assignment Desk' : 'Work Orders';
      }
    }
    if (helpTab) {
      helpTab.style.display = (isResident || isHelpDesk) ? 'inline-flex' : 'none';
      const helpBtn = helpTab.querySelector('.nav-link-btn');
      if (helpBtn) {
        helpBtn.textContent = isHelpDesk ? 'Support Inbox' : 'Help Desk';
      }
    }

    // "Report an Issue" button is strictly for Residents only
    document.querySelectorAll('.btn-open-report-wizard').forEach(btn => {
      btn.style.display = isResident ? 'inline-flex' : 'none';
    });
  }

  switchView(viewName) {
    const user = window.Auth.getCurrentUser();
    if (viewName !== 'auth' && !this.isViewAllowed(user, viewName)) {
      viewName = this.getHomeView(user);
    }

    this.currentView = viewName;

    // View containers
    const views = {
      'auth': document.getElementById('view-auth'),
      'resident': document.getElementById('view-resident'),
      'municipal': document.getElementById('view-municipal'),
      'helpdesk': document.getElementById('view-helpdesk')
    };

    // Hide all
    Object.values(views).forEach(v => {
      if (v) v.style.display = 'none';
    });

    // Show target view
    if (views[viewName]) {
      views[viewName].style.display = 'block';
    }

    // Update active nav link
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Top navbar visibility
    const mainNav = document.getElementById('app-main-navbar');
    if (mainNav) {
      mainNav.style.display = (viewName === 'auth' && !window.Auth.isLoggedIn()) ? 'none' : 'block';
    }

    // Refresh view data
    this.refreshActiveView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  refreshActiveView() {
    if (this.currentView === 'resident') {
      window.ResidentDashboard.render();
    } else if (this.currentView === 'municipal') {
      window.MunicipalDashboard.render();
    } else if (this.currentView === 'helpdesk') {
      window.HelpDeskModule.render();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `civic-toast toast-${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check-circle-2';
    if (type === 'error') icon = 'alert-octagon';
    if (type === 'warning') icon = 'alert-triangle';

    toast.innerHTML = `
      <div class="toast-content">
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close-btn">&times;</button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    const remove = () => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close-btn').addEventListener('click', remove);
    setTimeout(remove, 4500);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App = new Application();
  window.IssueReportWizard = new window.IssueReportWizard();
});
