/**
 * CivicPulse - Authentication & Session Management
 * Handles login, registration, role selection, and quick-fill evaluator buttons
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initSession();
  }

  initSession() {
    const savedUserId = sessionStorage.getItem('civicpulse_active_user');
    if (savedUserId) {
      this.currentUser = window.CivicDB.getUserById(savedUserId);
    }
    // Default to resident if no active session so preview works out of the box
    if (!this.currentUser) {
      this.currentUser = window.CivicDB.getUserById('usr-res-1');
      if (this.currentUser) {
        sessionStorage.setItem('civicpulse_active_user', this.currentUser.id);
      }
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      sessionStorage.setItem('civicpulse_active_user', user.id);
    } else {
      sessionStorage.removeItem('civicpulse_active_user');
    }
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('civic:user-changed', { detail: { user } }));
  }

  login(email, password) {
    const user = window.CivicDB.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }
    // For prototype demo, verify non-empty password
    if (!password || password.length < 3) {
      return { success: false, error: 'Password must be at least 3 characters.' };
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  register(userData) {
    // Validate email
    const existing = window.CivicDB.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (!userData.name || !userData.email || !userData.phone || !userData.password) {
      return { success: false, error: 'Please fill in all required registration fields.' };
    }

    const newUser = window.CivicDB.createUser({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      ward_id: userData.ward_id || 'ward-1',
      role: 'resident'
    });

    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  loginAs(role) {
    let targetId;
    switch (role) {
      case 'resident':
        targetId = 'usr-res-1'; // Elena Rostova
        break;
      case 'municipal':
      case 'field_team':
        targetId = 'usr-field-1'; // Marcus Vance
        break;
      case 'help_desk':
        targetId = 'usr-help-1'; // Sarah Jenkins
        break;
      case 'admin':
        targetId = 'usr-admin-1'; // Chief Officer Ramos
        break;
      default:
        targetId = 'usr-res-1';
    }

    const user = window.CivicDB.getUserById(targetId);
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  }

  logout() {
    this.setCurrentUser(null);
  }
}

window.Auth = new AuthManager();
