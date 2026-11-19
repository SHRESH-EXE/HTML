/**
 * CivicPulse - Resident Dashboard
 * Top stats row, Card List View, Filter Bar, Notification Dropdown
 */

class ResidentDashboard {
  constructor() {
    this.activeCategoryFilter = 'all';
    this.searchQuery = '';
    this.initEvents();
  }

  initEvents() {
    // Category filter pills
    document.querySelectorAll('.resident-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.resident-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategoryFilter = pill.dataset.category;
        this.render();
      });
    });

    // Search input
    const searchInput = document.getElementById('resident-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Notification Bell toggle
    const bellBtn = document.getElementById('notification-bell-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    if (bellBtn && notifDropdown) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
        this.renderNotifications();
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !bellBtn.contains(e.target)) {
          notifDropdown.classList.remove('active');
        }
      });
    }

    // Mark all read button
    const markReadBtn = document.getElementById('btn-mark-all-read');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const user = window.Auth.getCurrentUser();
        if (user) {
          window.CivicDB.markAllNotificationsAsRead(user.id);
          this.renderNotifications();
          this.updateNotificationBadge();
          window.App.showToast('All notifications marked as read', 'info');
        }
      });
    }
  }

  getFilteredIssues() {
    let issues = window.CivicDB.getIssues();

    // Category filter
    if (this.activeCategoryFilter !== 'all') {
      issues = issues.filter(i => i.category.toLowerCase() === this.activeCategoryFilter.toLowerCase());
    }

    // Search query filter
    if (this.searchQuery) {
      issues = issues.filter(i => 
        i.title.toLowerCase().includes(this.searchQuery) ||
        i.description.toLowerCase().includes(this.searchQuery) ||
        i.address.toLowerCase().includes(this.searchQuery) ||
        i.id.toLowerCase().includes(this.searchQuery)
      );
    }

    return issues;
  }

  render() {
    this.renderStats();
    this.updateNotificationBadge();

    const filtered = this.getFilteredIssues();
    this.renderCardList(filtered);

    if (window.lucide) window.lucide.createIcons();
  }

  renderStats() {
    const user = window.Auth.getCurrentUser();
    const allIssues = window.CivicDB.getIssues();
    const myIssues = allIssues.filter(i => user && i.reporter_id === user.id);

    const myReportsCount = myIssues.length;
    const inProgressCount = allIssues.filter(i => i.status === 'in_progress' || i.status === 'assigned').length;
    const resolvedCount = allIssues.filter(i => i.status === 'resolved').length;
    const totalUpvotes = allIssues.reduce((acc, curr) => acc + (curr.upvotes_count || 1), 0);

    const elMyReports = document.getElementById('stat-my-reports');
    const elInProgress = document.getElementById('stat-in-progress');
    const elResolved = document.getElementById('stat-resolved');
    const elUpvotes = document.getElementById('stat-community-upvotes');

    if (elMyReports) elMyReports.textContent = myReportsCount;
    if (elInProgress) elInProgress.textContent = inProgressCount;
    if (elResolved) elResolved.textContent = resolvedCount;
    if (elUpvotes) elUpvotes.textContent = totalUpvotes;
  }

  renderCardList(issues) {
    const container = document.getElementById('resident-card-list-container');
    if (!container) return;

    if (issues.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-full">
          <i data-lucide="inbox"></i>
          <h3>No reports matching your filter</h3>
          <p>Try searching for a different keyword or change your category selection.</p>
          <button class="btn btn-primary btn-sm" onclick="window.IssueReportWizard.open()">
            Report a New Issue
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = issues.map(issue => {
      const media = window.CivicDB.getIssueMedia(issue.id);
      const thumbnail = media.length > 0 ? media[0].image_url : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80';
      const user = window.Auth.getCurrentUser();
      const isMine = user && issue.reporter_id === user.id;

      return `
        <div class="civic-issue-card">
          <div class="card-image-wrap">
            <img src="${thumbnail}" alt="${issue.title}" loading="lazy" />
          </div>

          <div class="card-content">
            <h3 class="card-title" onclick="window.IssueDetailView.open('${issue.id}')">${issue.title}</h3>
            <p class="card-description">${issue.description}</p>
            <p class="card-address">${issue.address}</p>

            <div class="card-footer">
              <button class="btn-upvote-inline" data-issue-id="${issue.id}">
                Endorse (<span class="vote-count">${issue.upvotes_count || 1}</span>)
              </button>

              <button class="btn btn-outline btn-xs" onclick="window.IssueDetailView.open('${issue.id}')">
                Details & Timeline
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind inline upvotes
    container.querySelectorAll('.btn-upvote-inline').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.issueId;
        const user = window.Auth.getCurrentUser();
        const newCount = window.CivicDB.upvoteIssue(id, user ? user.id : 'usr-res-1');
        btn.querySelector('.vote-count').textContent = newCount;
        btn.classList.add('voted');
        window.App.showToast(`Upvoted #${id} (+1)`, 'success');
      });
    });
  }

  updateNotificationBadge() {
    const user = window.Auth.getCurrentUser();
    if (!user) return;

    const notifs = window.CivicDB.getNotifications(user.id);
    const unreadCount = notifs.filter(n => !n.is_read).length;

    const badge = document.getElementById('notif-unread-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  renderNotifications() {
    const user = window.Auth.getCurrentUser();
    const container = document.getElementById('notif-items-list');
    if (!container || !user) return;

    const notifs = window.CivicDB.getNotifications(user.id);

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="notif-empty-state">
          <i data-lucide="bell-off"></i>
          <p>No notifications yet</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.is_read ? 'read' : 'unread'}" data-notif-id="${n.id}" data-issue-id="${n.issue_id || ''}">
        <div class="notif-indicator"></div>
        <div class="notif-body">
          <p class="notif-msg">${n.message}</p>
          <span class="notif-time">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const notifId = item.dataset.notifId;
        const issueId = item.dataset.issueId;

        window.CivicDB.markNotificationAsRead(notifId);
        this.updateNotificationBadge();
        item.classList.remove('unread');
        item.classList.add('read');

        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) dropdown.classList.remove('active');

        if (issueId) {
          window.IssueDetailView.open(issueId);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}

window.ResidentDashboard = new ResidentDashboard();
