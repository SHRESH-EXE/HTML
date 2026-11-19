/**
 * CivicPulse - Issue Detail View, Status Timeline, Resolution Photo Enforcer & Dual Comments
 * Enforces 'After' photo requirement on status -> Resolved and role-restricted internal notes
 */

class IssueDetailView {
  constructor() {
    this.currentIssueId = null;
    this.activeCommentTab = 'public'; // 'public' | 'internal'
    this.initEvents();
  }

  initEvents() {
    // Comment tab switching
    document.querySelectorAll('.comment-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchCommentTab(tab);
      });
    });

    // Close button
    const closeBtn = document.getElementById('issue-detail-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    const modal = document.getElementById('issue-detail-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }

    // Comment submission
    const commentForm = document.getElementById('issue-comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitComment();
      });
    }

    // Quick @mention chips
    document.querySelectorAll('.mention-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const mention = chip.dataset.mention;
        const textarea = document.getElementById('comment-input-text');
        if (textarea) {
          textarea.value = (textarea.value + ' ' + mention + ' ').trimStart();
          textarea.focus();
        }
      });
    });

    // Resolution Modal
    const resolveCancel = document.getElementById('btn-cancel-resolve');
    if (resolveCancel) {
      resolveCancel.addEventListener('click', () => this.closeResolveModal());
    }

    const resolveConfirm = document.getElementById('btn-confirm-resolve');
    if (resolveConfirm) {
      resolveConfirm.addEventListener('click', () => this.confirmResolution());
    }

    // Resolve after-photo file upload & sample presets
    const afterFileInput = document.getElementById('resolve-after-file');
    if (afterFileInput) {
      afterFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.setResolutionPhotoPreview(evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    document.querySelectorAll('.preset-after-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.setResolutionPhotoPreview(chip.dataset.url);
      });
    });
  }

  open(issueId) {
    this.currentIssueId = issueId;
    this.activeCommentTab = 'public';
    this.render();

    const modal = document.getElementById('issue-detail-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    const modal = document.getElementById('issue-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  render() {
    const issue = window.CivicDB.getIssueById(this.currentIssueId);
    if (!issue) return;

    const user = window.Auth.getCurrentUser();
    const isStaff = user && (user.role === 'field_team' || user.role === 'help_desk' || user.role === 'admin');
    const isResident = !user || user.role === 'resident';

    // Basic fields
    document.getElementById('detail-issue-id').textContent = issue.id;
    document.getElementById('detail-issue-title').textContent = issue.title;
    document.getElementById('detail-issue-desc').textContent = issue.description;
    document.getElementById('detail-issue-address').textContent = issue.address;
    document.getElementById('detail-created-time').textContent = new Date(issue.created_at).toLocaleString();

    // Upvote count & button (Only Residents can upvote)
    const upvotesCountEl = document.getElementById('detail-upvotes-count');
    if (upvotesCountEl) upvotesCountEl.textContent = issue.upvotes_count || 1;

    const upvoteBtn = document.getElementById('detail-upvote-btn');
    if (upvoteBtn) {
      if (isResident) {
        upvoteBtn.style.display = 'inline-flex';
        upvoteBtn.onclick = () => {
          const newCount = window.CivicDB.upvoteIssue(issue.id, user ? user.id : 'usr-res-1');
          upvotesCountEl.textContent = newCount;
          window.App.showToast(`Issue #${issue.id} endorsed! Total upvotes: ${newCount}`, 'success');
        };
      } else {
        upvoteBtn.style.display = 'none';
      }
    }

    // Internal Team Notes tab is strictly hidden for Residents
    const internalTabBtn = document.getElementById('detail-internal-tab-btn');
    if (internalTabBtn) {
      internalTabBtn.style.display = isStaff ? 'inline-flex' : 'none';
    }
    if (!isStaff && this.activeCommentTab === 'internal') {
      this.activeCommentTab = 'public';
      document.querySelectorAll('.comment-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === 'public');
      });
    }

    // Routing Department & SLA Info
    const dept = window.CivicDB.getDepartmentById(issue.assigned_department);
    const deptNameEl = document.getElementById('detail-assigned-dept');
    if (deptNameEl) deptNameEl.textContent = dept ? dept.name : 'Unassigned';

    const slaStatus = window.RoutingEngine.calculateSLAStatus(issue);
    const slaEl = document.getElementById('detail-sla-status');
    if (slaEl) {
      slaEl.textContent = slaStatus.text;
      slaEl.className = `badge-sla ${slaStatus.class}`;
    }

    // Assignee Info
    const assignee = window.CivicDB.getUserById(issue.assigned_to_id);
    const assigneeEl = document.getElementById('detail-assignee-name');
    const assigneeAvatar = document.getElementById('detail-assignee-avatar');
    if (assigneeEl) assigneeEl.textContent = assignee ? assignee.name : 'Awaiting Field Dispatch';
    if (assigneeAvatar) {
      assigneeAvatar.src = assignee ? assignee.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    }

    // Horizontal Status Timeline
    this.renderTimeline(issue);

    // Photos Gallery (Before & After)
    this.renderMediaGallery(issue);

    // Staff Actions (Status Update Buttons)
    this.renderStaffActions(issue, isStaff);

    // Comments Section
    this.renderComments(issue, isStaff);

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Horizontal Status Progress Bar with timestamps
   */
  renderTimeline(issue) {
    const steps = [
      { key: 'submitted', label: '1. Submitted' },
      { key: 'assigned', label: '2. Assigned' },
      { key: 'in_progress', label: '3. In Progress' },
      { key: 'resolved', label: '4. Resolved' }
    ];

    const statusHierarchy = {
      'submitted': 1,
      'assigned': 2,
      'in_progress': 3,
      'resolved': 4,
      'closed': 4
    };

    const currentLevel = statusHierarchy[issue.status] || 1;
    const timelineEvents = issue.timeline || [];

    const timelineContainer = document.getElementById('horizontal-status-timeline');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = steps.map((step, idx) => {
      const stepLevel = idx + 1;
      const isPast = stepLevel < currentLevel;
      const isCurrent = stepLevel === currentLevel;
      const isFuture = stepLevel > currentLevel;

      // Find recorded event timestamp
      const event = timelineEvents.find(e => e.status === step.key);
      const timeStr = event ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : (isFuture ? 'Pending' : 'Completed');
      const noteStr = event ? event.note : '';

      let nodeClass = 'timeline-node';
      if (isPast) nodeClass += ' completed';
      if (isCurrent) nodeClass += ' current';
      if (isFuture) nodeClass += ' future';

      return `
        <div class="${nodeClass}">
          <div class="node-circle">
            ${isPast ? '<i data-lucide="check"></i>' : (isCurrent ? '<span class="pulsing-dot"></span>' : idx + 1)}
          </div>
          <div class="node-meta">
            <span class="node-label">${step.label}</span>
            <span class="node-time">${timeStr}</span>
            ${noteStr ? `<span class="node-note" title="${noteStr}">${noteStr}</span>` : ''}
          </div>
          ${idx < steps.length - 1 ? `<div class="node-connector ${stepLevel < currentLevel ? 'active' : ''}"></div>` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Before & After Media Comparison Gallery
   */
  renderMediaGallery(issue) {
    const media = window.CivicDB.getIssueMedia(issue.id);
    const beforeList = media.filter(m => m.media_type === 'before');
    const afterList = media.filter(m => m.media_type === 'after');

    const container = document.getElementById('detail-media-gallery');
    if (!container) return;

    let html = `
      <div class="media-comparison-grid">
        <div class="media-column">
          <div class="media-column-header">
            <span class="media-badge before"><i data-lucide="camera"></i> Initial Report ("Before")</span>
            <span class="media-count">${beforeList.length} photo(s)</span>
          </div>
          <div class="media-photo-stack">
            ${beforeList.map(m => `
              <div class="media-photo-card" onclick="window.open('${m.image_url}', '_blank')">
                <img src="${m.image_url}" alt="Before Issue Photo" />
                <span class="zoom-hint"><i data-lucide="maximize-2"></i></span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="media-column">
          <div class="media-column-header">
            <span class="media-badge after"><i data-lucide="check-circle-2"></i> Municipal Resolution ("After")</span>
            <span class="media-count">${afterList.length} photo(s)</span>
          </div>
          <div class="media-photo-stack">
            ${afterList.length > 0 ? afterList.map(m => `
              <div class="media-photo-card after-proof" onclick="window.open('${m.image_url}', '_blank')">
                <img src="${m.image_url}" alt="After Resolution Photo" />
                <span class="verified-stamp">VERIFIED ON-SITE</span>
              </div>
            `).join('') : `
              <div class="after-photo-pending">
                <i data-lucide="shield-alert"></i>
                <p>Resolution Proof Required</p>
                <small>Staff must upload timestamped site photo when marking issue as Resolved.</small>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Role-Specific Workflow Controls:
   * - Resident: Escalate to Help Desk
   * - Worker (field_team): Mark In Progress / Resolve Issue (Requires Photo)
   * - IAS / Admin (admin): Assign Field Worker / Re-route Department
   * - Help Desk (help_desk): Escalate Priority
   */
  renderStaffActions(issue, isStaff) {
    const container = document.getElementById('detail-staff-actions');
    if (!container) return;

    const user = window.Auth.getCurrentUser();
    const role = user ? user.role : 'resident';

    if (role === 'resident') {
      if (issue.status === 'resolved' || issue.status === 'closed') {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = `
        <div class="resident-action-box">
          <p class="text-sm text-slate-600">Are you experiencing prolonged delays or an emergency?</p>
          <button class="btn btn-warning btn-sm" onclick="window.HelpDeskModule.openEscalateForm('${issue.id}')">
            <i data-lucide="alert-octagon"></i> Escalate to Civic Help Desk
          </button>
        </div>
      `;
      return;
    }

    if (role === 'field_team') {
      // Worker View: Mark In Progress & Resolve Issue ONLY
      container.innerHTML = `
        <div class="staff-action-bar">
          <span class="staff-action-label"><i data-lucide="hard-hat"></i> Worker Actions:</span>
          <div class="staff-action-buttons">
            ${issue.status !== 'in_progress' && issue.status !== 'resolved' ? `
              <button class="btn btn-outline btn-sm" id="btn-status-in-progress">
                <i data-lucide="play"></i> Mark In Progress
              </button>
            ` : ''}

            ${issue.status !== 'resolved' ? `
              <button class="btn btn-emerald btn-sm" id="btn-status-resolve">
                <i data-lucide="check-circle"></i> Resolve Issue (Requires Photo)
              </button>
            ` : `
              <span class="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <i data-lucide="check-circle-2"></i> Issue marked Resolved
              </span>
            `}
          </div>
        </div>
      `;

      const inProgBtn = document.getElementById('btn-status-in-progress');
      if (inProgBtn) {
        inProgBtn.addEventListener('click', () => {
          window.CivicDB.updateIssueStatus(issue.id, 'in_progress', 'Field technician arrived on site with equipment', null, user?.name);
          window.App.showToast(`Issue #${issue.id} status updated to IN PROGRESS`, 'info');
          this.render();
          window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: { issueId: issue.id } }));
        });
      }

      const resolveBtn = document.getElementById('btn-status-resolve');
      if (resolveBtn) {
        resolveBtn.addEventListener('click', () => {
          this.openResolveModal(issue);
        });
      }
      return;
    }

    if (role === 'admin') {
      // IAS / Commissioner View: Assign Worker & Re-route Department ONLY
      const fieldStaff = window.CivicDB.getUsers().filter(u => u.role === 'field_team');
      container.innerHTML = `
        <div class="staff-action-bar">
          <span class="staff-action-label"><i data-lucide="shield-check"></i> Commissioner Assignment:</span>
          <div class="staff-action-buttons flex flex-wrap items-center gap-2">
            <select id="detail-assign-worker-select" class="filter-select text-xs">
              <option value="">-- Select Field Worker --</option>
              ${fieldStaff.map(s => `<option value="${s.id}" ${issue.assigned_to_id === s.id ? 'selected' : ''}>${s.name} (${s.title || 'Field Staff'})</option>`).join('')}
            </select>
            <button type="button" class="btn btn-primary btn-sm" id="btn-detail-assign-worker">
              <i data-lucide="user-check"></i> Assign Worker
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-reassign-dept">
              <i data-lucide="arrow-right-left"></i> Re-route Dept
            </button>
          </div>
        </div>
      `;

      const assignBtn = document.getElementById('btn-detail-assign-worker');
      if (assignBtn) {
        assignBtn.addEventListener('click', () => {
          const select = document.getElementById('detail-assign-worker-select');
          const staffId = select ? select.value : '';
          if (!staffId) {
            window.App.showToast('Please select a worker to assign.', 'warning');
            return;
          }
          const staff = window.CivicDB.getUserById(staffId);
          window.CivicDB.bulkAssignIssues([issue.id], staffId, staff ? staff.department_id : null);
          window.App.showToast(`Assigned #${issue.id} to ${staff ? staff.name : 'Worker'}`, 'success');
          this.render();
          window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: { issueId: issue.id } }));
        });
      }

      const reassignBtn = document.getElementById('btn-reassign-dept');
      if (reassignBtn) {
        reassignBtn.addEventListener('click', () => {
          const nextDept = issue.assigned_department === 'dept-pw' ? 'dept-elec' : 'dept-pw';
          const d = window.CivicDB.getDepartmentById(nextDept);
          window.CivicDB.updateIssue(issue.id, { assigned_department: nextDept });
          window.App.showToast(`Re-routed #${issue.id} to ${d.name}`, 'info');
          this.render();
          window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: { issueId: issue.id } }));
        });
      }
      return;
    }

    if (role === 'help_desk') {
      // Help Desk View: Priority Escalation ONLY
      container.innerHTML = `
        <div class="staff-action-bar">
          <span class="staff-action-label"><i data-lucide="headphones"></i> Help Desk Actions:</span>
          <div class="staff-action-buttons">
            ${issue.priority !== 'critical' ? `
              <button type="button" class="btn btn-warning btn-sm" id="btn-detail-escalate-critical">
                <i data-lucide="zap"></i> Escalate to Critical Priority
              </button>
            ` : `
              <span class="text-xs font-semibold text-rose-700">Already Critical Priority</span>
            `}
          </div>
        </div>
      `;

      const escBtn = document.getElementById('btn-detail-escalate-critical');
      if (escBtn) {
        escBtn.addEventListener('click', () => {
          window.CivicDB.updateIssue(issue.id, { priority: 'critical' });
          window.App.showToast(`Escalated #${issue.id} to CRITICAL priority.`, 'warning');
          this.render();
          window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: { issueId: issue.id } }));
        });
      }
    }
  }

  /**
   * Resolution modal enforcement
   */
  openResolveModal(issue) {
    this.pendingResolvePhoto = null;
    const modal = document.getElementById('resolve-photo-modal');
    const previewContainer = document.getElementById('resolve-photo-preview');
    const noteInput = document.getElementById('resolve-note-input');

    if (previewContainer) previewContainer.innerHTML = '';
    if (noteInput) noteInput.value = '';

    if (modal) {
      modal.classList.add('active');
    }
  }

  closeResolveModal() {
    const modal = document.getElementById('resolve-photo-modal');
    if (modal) modal.classList.remove('active');
  }

  setResolutionPhotoPreview(url) {
    this.pendingResolvePhoto = url;
    const previewContainer = document.getElementById('resolve-photo-preview');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="resolve-preview-box">
          <img src="${url}" alt="Resolution Proof" />
          <span class="preview-tag">Attached Resolution Evidence</span>
        </div>
      `;
    }
  }

  confirmResolution() {
    if (!this.pendingResolvePhoto) {
      window.App.showToast('MANDATORY: You must upload or select an "After" resolution photo to close this issue.', 'error');
      return;
    }

    const noteInput = document.getElementById('resolve-note-input');
    const note = noteInput && noteInput.value.trim() ? noteInput.value.trim() : 'Repair verified complete on-site with photographic proof.';

    const user = window.Auth.getCurrentUser();
    window.CivicDB.updateIssueStatus(
      this.currentIssueId,
      'resolved',
      note,
      this.pendingResolvePhoto,
      user ? user.name : 'Municipal Staff'
    );

    this.closeResolveModal();
    window.App.showToast(`Issue #${this.currentIssueId} has been successfully RESOLVED with verified photo!`, 'success');
    this.render();
    window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: { issueId: this.currentIssueId } }));
  }

  /**
   * Two-Tab Discussion: Public Updates vs Internal Team Notes
   */
  switchCommentTab(tab) {
    this.activeCommentTab = tab;
    document.querySelectorAll('.comment-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const user = window.Auth.getCurrentUser();
    const isStaff = user && (user.role === 'field_team' || user.role === 'help_desk' || user.role === 'admin');

    const issue = window.CivicDB.getIssueById(this.currentIssueId);
    this.renderComments(issue, isStaff);
  }

  renderComments(issue, isStaff) {
    const allComments = window.CivicDB.getComments(issue.id);
    const container = document.getElementById('comments-list-container');
    const formContainer = document.getElementById('comment-input-area');
    if (!container) return;

    if (this.activeCommentTab === 'internal' && !isStaff) {
      // Resident is trying to view internal notes
      container.innerHTML = `
        <div class="restricted-tab-alert">
          <i data-lucide="lock"></i>
          <h4>Internal Team Notes Restricted</h4>
          <p>These notes contain technical work orders, contractor dispatches, and supervisor communications visible only to Municipal Field Staff and Help Desk Agents.</p>
        </div>
      `;
      if (formContainer) formContainer.style.display = 'none';
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    if (formContainer) formContainer.style.display = 'block';

    const comments = allComments.filter(c => this.activeCommentTab === 'internal' ? c.is_internal : !c.is_internal);

    if (comments.length === 0) {
      container.innerHTML = `
        <div class="empty-comments-state">
          <i data-lucide="message-square"></i>
          <p>No ${this.activeCommentTab === 'internal' ? 'internal team notes' : 'public updates'} yet. Be the first to post!</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = comments.map(c => {
      const author = window.CivicDB.getUserById(c.user_id) || { name: 'Civic Member', role: 'resident', avatar: '' };
      const isAuthorStaff = author.role === 'field_team' || author.role === 'help_desk' || author.role === 'admin';
      const roleBadge = isAuthorStaff ? `<span class="comment-role-badge staff">${author.title || 'Municipal Staff'}</span>` : `<span class="comment-role-badge resident">Resident</span>`;

      return `
        <div class="comment-bubble ${c.is_internal ? 'internal-note' : ''}">
          <img src="${author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="comment-avatar" alt="${author.name}" />
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author-name">${author.name}</span>
              ${roleBadge}
              ${c.is_internal ? '<span class="badge-internal-tag"><i data-lucide="shield-check"></i> Internal Team</span>' : ''}
              <span class="comment-time">${new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
            </div>
            <div class="comment-message">${this.formatCommentMessage(c.message)}</div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  formatCommentMessage(text) {
    // Highlight @mentions in blue
    return text.replace(/(@[a-zA-Z0-9_.-]+)/g, '<span class="mention-tag">$1</span>');
  }

  submitComment() {
    const textEl = document.getElementById('comment-input-text');
    if (!textEl) return;
    const message = textEl.value.trim();
    if (!message) return;

    const user = window.Auth.getCurrentUser();
    const isInternal = this.activeCommentTab === 'internal';

    window.CivicDB.createComment({
      issue_id: this.currentIssueId,
      user_id: user ? user.id : 'usr-res-1',
      message: message,
      is_internal: isInternal
    });

    textEl.value = '';
    window.App.showToast('Comment posted', 'info');
    const issue = window.CivicDB.getIssueById(this.currentIssueId);
    const isStaff = user && (user.role === 'field_team' || user.role === 'help_desk' || user.role === 'admin');
    this.renderComments(issue, isStaff);
  }
}

window.IssueDetailView = new IssueDetailView();
