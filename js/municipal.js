/**
 * CivicPulse - Municipal / Field Operations Dashboard
 * KPI metrics bar, Filterable Data Table, Kanban Board, and Bulk-Assignment
 */

class MunicipalDashboard {
  constructor() {
    this.currentViewMode = 'table'; // 'table' | 'kanban'
    this.selectedIssueIds = new Set();
    this.filters = {
      category: 'all',
      priority: 'all',
      ward: 'all',
      assignee: 'all',
      search: ''
    };
    this.initEvents();
  }

  initEvents() {
    // View Switcher (Table vs Kanban)
    const tableBtn = document.getElementById('muni-toggle-table');
    const kanbanBtn = document.getElementById('muni-toggle-kanban');

    if (tableBtn) {
      tableBtn.addEventListener('click', () => this.setViewMode('table'));
    }
    if (kanbanBtn) {
      kanbanBtn.addEventListener('click', () => this.setViewMode('kanban'));
    }

    // Filter selects
    const catSelect = document.getElementById('muni-filter-category');
    const prioSelect = document.getElementById('muni-filter-priority');
    const wardSelect = document.getElementById('muni-filter-ward');
    const assignSelect = document.getElementById('muni-filter-assignee');
    const searchInput = document.getElementById('muni-filter-search');

    if (catSelect) catSelect.addEventListener('change', (e) => { this.filters.category = e.target.value; this.render(); });
    if (prioSelect) prioSelect.addEventListener('change', (e) => { this.filters.priority = e.target.value; this.render(); });
    if (wardSelect) wardSelect.addEventListener('change', (e) => { this.filters.ward = e.target.value; this.render(); });
    if (assignSelect) assignSelect.addEventListener('change', (e) => { this.filters.assignee = e.target.value; this.render(); });
    if (searchInput) searchInput.addEventListener('input', (e) => { this.filters.search = e.target.value.toLowerCase().trim(); this.render(); });

    // Master checkbox for bulk select
    const masterCheckbox = document.getElementById('muni-master-checkbox');
    if (masterCheckbox) {
      masterCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const visibleIssues = this.getFilteredIssues();
        if (isChecked) {
          visibleIssues.forEach(i => this.selectedIssueIds.add(i.id));
        } else {
          this.selectedIssueIds.clear();
        }
        this.renderTableRows(visibleIssues);
        this.updateBulkActionBar();
      });
    }

    // Bulk Assign button
    const bulkAssignBtn = document.getElementById('btn-execute-bulk-assign');
    if (bulkAssignBtn) {
      bulkAssignBtn.addEventListener('click', () => {
        const selectStaff = document.getElementById('bulk-assignee-select');
        const assignedToId = selectStaff ? selectStaff.value : null;

        if (!assignedToId) {
          window.App.showToast('Please select a field team member to assign.', 'warning');
          return;
        }

        const staff = window.CivicDB.getUserById(assignedToId);
        const ids = Array.from(this.selectedIssueIds);

        window.CivicDB.bulkAssignIssues(ids, assignedToId, staff ? staff.department_id : null);
        window.App.showToast(`Successfully assigned ${ids.length} ticket(s) to ${staff ? staff.name : 'Field Staff'}!`, 'success');

        this.selectedIssueIds.clear();
        this.render();
        window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: {} }));
      });
    }

    // Clear selection button
    const clearSelectBtn = document.getElementById('btn-clear-selection');
    if (clearSelectBtn) {
      clearSelectBtn.addEventListener('click', () => {
        this.selectedIssueIds.clear();
        this.render();
      });
    }
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    const tableContainer = document.getElementById('muni-table-view-container');
    const kanbanContainer = document.getElementById('muni-kanban-view-container');
    const tableBtn = document.getElementById('muni-toggle-table');
    const kanbanBtn = document.getElementById('muni-toggle-kanban');

    if (mode === 'table') {
      if (tableContainer) tableContainer.style.display = 'block';
      if (kanbanContainer) kanbanContainer.style.display = 'none';
      if (tableBtn) tableBtn.classList.add('active');
      if (kanbanBtn) kanbanBtn.classList.remove('active');
    } else {
      if (tableContainer) tableContainer.style.display = 'none';
      if (kanbanContainer) kanbanContainer.style.display = 'grid';
      if (tableBtn) tableBtn.classList.remove('active');
      if (kanbanBtn) kanbanBtn.classList.add('active');
    }

    this.render();
  }

  getFilteredIssues() {
    let issues = window.CivicDB.getIssues();
    const user = window.Auth ? window.Auth.getCurrentUser() : null;

    // Workers only see tickets assigned to them or their department
    if (user && user.role === 'field_team') {
      issues = issues.filter(i => i.assigned_to_id === user.id || i.assigned_department === user.department_id);
    }

    // Category
    if (this.filters.category !== 'all') {
      issues = issues.filter(i => i.category.toLowerCase() === this.filters.category.toLowerCase());
    }

    // Priority
    if (this.filters.priority !== 'all') {
      issues = issues.filter(i => i.priority.toLowerCase() === this.filters.priority.toLowerCase());
    }

    // Ward
    if (this.filters.ward !== 'all') {
      issues = issues.filter(i => i.ward_id === this.filters.ward);
    }

    // Assignee (Admin filter)
    if (user && user.role === 'admin' && this.filters.assignee !== 'all') {
      if (this.filters.assignee === 'unassigned') {
        issues = issues.filter(i => !i.assigned_to_id);
      } else {
        issues = issues.filter(i => i.assigned_to_id === this.filters.assignee);
      }
    }

    // Search query
    if (this.filters.search) {
      issues = issues.filter(i =>
        i.title.toLowerCase().includes(this.filters.search) ||
        i.id.toLowerCase().includes(this.filters.search) ||
        i.address.toLowerCase().includes(this.filters.search) ||
        i.category.toLowerCase().includes(this.filters.search)
      );
    }

    return issues;
  }

  render() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const isAdmin = user && user.role === 'admin';
    const isWorker = user && user.role === 'field_team';

    // Update page heading and role-specific UI controls
    const titleEl = document.getElementById('muni-page-title');
    const subtitleEl = document.getElementById('muni-page-subtitle');
    const thCheckbox = document.getElementById('muni-th-checkbox');
    const assigneeFilter = document.getElementById('muni-filter-assignee');

    if (isAdmin) {
      if (titleEl) titleEl.textContent = 'Commissioner Assignment & Oversight';
      if (subtitleEl) subtitleEl.textContent = 'Assign field engineers, monitor SLAs, and route grievances to departments.';
      if (thCheckbox) thCheckbox.style.display = 'table-cell';
      if (assigneeFilter) assigneeFilter.style.display = 'inline-block';
    } else if (isWorker) {
      if (titleEl) titleEl.textContent = 'Field Worker Tasks & Resolution';
      if (subtitleEl) subtitleEl.textContent = 'Update on-site work progress and resolve assigned issues with photo proof.';
      if (thCheckbox) thCheckbox.style.display = 'none';
      if (assigneeFilter) assigneeFilter.style.display = 'none';
      this.selectedIssueIds.clear();
    }

    this.renderKPIs();
    const filteredIssues = this.getFilteredIssues();

    if (this.currentViewMode === 'table') {
      this.renderTableRows(filteredIssues);
    } else {
      this.renderKanbanColumns(filteredIssues);
    }

    this.updateBulkActionBar();
    if (window.lucide) window.lucide.createIcons();
  }

  renderKPIs() {
    const allIssues = window.CivicDB.getIssues();
    const openTickets = allIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
    const highPrioTickets = allIssues.filter(i => (i.priority === 'high' || i.priority === 'critical') && (i.status !== 'resolved' && i.status !== 'closed')).length;
    
    // SLA breaches > 48h
    const breaches = allIssues.filter(i => {
      if (i.status === 'resolved' || i.status === 'closed') return false;
      const created = new Date(i.created_at).getTime();
      const elapsedHours = (Date.now() - created) / (3600 * 1000);
      return elapsedHours > 48;
    }).length;

    const resolved = allIssues.filter(i => i.status === 'resolved').length;
    const rate = allIssues.length > 0 ? Math.round((resolved / allIssues.length) * 100) : 0;

    const elOpen = document.getElementById('kpi-open-tickets');
    const elHigh = document.getElementById('kpi-high-priority');
    const elBreach = document.getElementById('kpi-sla-breaches');
    const elRate = document.getElementById('kpi-resolution-rate');

    if (elOpen) elOpen.textContent = openTickets;
    if (elHigh) elHigh.textContent = highPrioTickets;
    if (elBreach) elBreach.textContent = breaches;
    if (elRate) elRate.textContent = `${rate}%`;
  }

  renderTableRows(issues) {
    const tbody = document.getElementById('muni-table-tbody');
    if (!tbody) return;

    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const isAdmin = user && user.role === 'admin';
    const isWorker = user && user.role === 'field_team';
    const fieldStaff = window.CivicDB.getUsers().filter(u => u.role === 'field_team');

    // Update last table column header based on role
    const lastTh = document.querySelector('#muni-table-view-container thead th:last-child');
    if (lastTh) {
      lastTh.textContent = isWorker ? 'Action' : 'Assign Worker';
    }

    if (issues.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${isAdmin ? 5 : 4}" class="text-center py-8 text-slate-500">
            No civic issues match your current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = issues.map(issue => {
      const isSelected = this.selectedIssueIds.has(issue.id);
      const sla = window.RoutingEngine.calculateSLAStatus(issue);
      const dept = window.CivicDB.getDepartmentById(issue.assigned_department);
      const ward = window.CivicDB.getWardById(issue.ward_id);
      const assignee = window.CivicDB.getUserById(issue.assigned_to_id);

      const actionCellHtml = isAdmin ? `
        <select class="filter-select text-xs inline-assign-select" data-issue-id="${issue.id}" onclick="event.stopPropagation()">
          <option value="">-- Unassigned --</option>
          ${fieldStaff.map(s => `<option value="${s.id}" ${issue.assigned_to_id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
        <span class="text-slate-400 text-[10px] block mt-0.5">${dept ? dept.code : 'MUNI'} • ${ward ? ward.zone : ''}</span>
      ` : `
        <div class="flex items-center gap-2">
          ${issue.status !== 'resolved' && issue.status !== 'closed' ? `
            <button type="button" class="btn btn-emerald btn-xs btn-table-resolve" data-issue-id="${issue.id}">
              Resolve
            </button>
          ` : `<span class="text-xs font-semibold text-emerald-700">Resolved</span>`}
        </div>
      `;

      return `
        <tr class="${isSelected ? 'row-selected' : ''}" data-issue-id="${issue.id}">
          ${isAdmin ? `
            <td class="td-checkbox">
              <input type="checkbox" class="issue-row-checkbox" data-issue-id="${issue.id}" ${isSelected ? 'checked' : ''} />
            </td>
          ` : ''}
          <td class="td-id font-mono font-semibold text-blue-600 cursor-pointer" onclick="window.IssueDetailView.open('${issue.id}')">
            ${issue.id}
          </td>
          <td class="td-issue">
            <div class="issue-title-cell" onclick="window.IssueDetailView.open('${issue.id}')">
              <span class="font-medium text-slate-900 cursor-pointer hover:text-blue-600">${issue.title}</span>
              <span class="text-xs text-slate-500 block truncate max-w-xs">${issue.address}</span>
            </div>
          </td>
          <td class="td-sla">
            <span class="badge-sla ${sla.class}">${sla.text}</span>
          </td>
          <td class="td-assignee">
            ${actionCellHtml}
          </td>
        </tr>
      `;
    }).join('');

    // Bind individual checkboxes (Admin only)
    tbody.querySelectorAll('.issue-row-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.issueId;
        if (cb.checked) {
          this.selectedIssueIds.add(id);
        } else {
          this.selectedIssueIds.delete(id);
        }
        this.updateBulkActionBar();
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('row-selected', cb.checked);
      });
    });

    // Bind inline worker assignment (Admin only)
    tbody.querySelectorAll('.inline-assign-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const issueId = sel.dataset.issueId;
        const staffId = sel.value;
        if (!staffId) return;
        const staff = window.CivicDB.getUserById(staffId);
        window.CivicDB.bulkAssignIssues([issueId], staffId, staff ? staff.department_id : null);
        window.App.showToast(`Assigned #${issueId} to ${staff ? staff.name : 'Worker'}`, 'success');
        this.render();
      });
    });

    // Bind quick resolve button (Worker only)
    tbody.querySelectorAll('.btn-table-resolve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const issueId = btn.dataset.issueId;
        window.IssueDetailView.open(issueId);
        setTimeout(() => {
          window.IssueDetailView.openResolveModal(window.CivicDB.getIssueById(issueId));
        }, 250);
      });
    });
  }

  updateBulkActionBar() {
    const bar = document.getElementById('muni-bulk-actions-bar');
    const countEl = document.getElementById('bulk-selected-count');
    const masterCheckbox = document.getElementById('muni-master-checkbox');
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const isAdmin = user && user.role === 'admin';

    if (!bar) return;

    if (!isAdmin) {
      bar.classList.remove('active');
      return;
    }

    const count = this.selectedIssueIds.size;
    if (count > 0) {
      bar.classList.add('active');
      if (countEl) countEl.textContent = `${count} ticket(s) selected`;
    } else {
      bar.classList.remove('active');
    }

    if (masterCheckbox) {
      const visibleIssues = this.getFilteredIssues();
      masterCheckbox.checked = visibleIssues.length > 0 && visibleIssues.every(i => this.selectedIssueIds.has(i.id));
    }
  }

  /**
   * Kanban Board Columns (Submitted, Assigned, In Progress, Resolved)
   */
  renderKanbanColumns(issues) {
    const columns = [
      { key: 'submitted', title: 'Submitted (Triaged)', color: '#ef4444' },
      { key: 'assigned', title: 'Assigned (Queued)', color: '#f59e0b' },
      { key: 'in_progress', title: 'In Progress (On-Site)', color: '#3b82f6' },
      { key: 'resolved', title: 'Resolved (Closed)', color: '#10b981' }
    ];

    const kanbanGrid = document.getElementById('muni-kanban-view-container');
    if (!kanbanGrid) return;

    kanbanGrid.innerHTML = columns.map(col => {
      const colIssues = issues.filter(i => i.status === col.key);

      return `
        <div class="kanban-column" data-status="${col.key}">
          <div class="kanban-column-header">
            <div class="kanban-header-left">
              <span class="kanban-status-indicator" style="background: ${col.color};"></span>
              <h4>${col.title}</h4>
            </div>
            <span class="kanban-col-count">${colIssues.length}</span>
          </div>

          <div class="kanban-cards-list">
            ${colIssues.length === 0 ? `
              <div class="kanban-empty-dropzone">No issues in ${col.title}</div>
            ` : colIssues.map(issue => this.renderKanbanCard(issue)).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Quick move status dropdowns on kanban cards (Worker only)
    kanbanGrid.querySelectorAll('.kanban-status-select').forEach(select => {
      select.addEventListener('change', () => {
        const issueId = select.dataset.issueId;
        const targetStatus = select.value;
        const currentStatus = select.dataset.currentStatus;

        if (targetStatus === currentStatus) return;

        if (targetStatus === 'resolved') {
          window.IssueDetailView.open(issueId);
          setTimeout(() => {
            window.IssueDetailView.openResolveModal(window.CivicDB.getIssueById(issueId));
          }, 300);
        } else {
          window.CivicDB.updateIssueStatus(issueId, targetStatus, `Moved via Kanban board to ${targetStatus}`, null, window.Auth.getCurrentUser()?.name);
          window.App.showToast(`Issue #${issueId} status moved to ${targetStatus.toUpperCase()}`, 'info');
          this.render();
        }
      });
    });

    // Quick assign dropdowns on kanban cards (Admin only)
    kanbanGrid.querySelectorAll('.kanban-assign-select').forEach(select => {
      select.addEventListener('change', () => {
        const issueId = select.dataset.issueId;
        const staffId = select.value;
        if (!staffId) return;
        const staff = window.CivicDB.getUserById(staffId);
        window.CivicDB.bulkAssignIssues([issueId], staffId, staff ? staff.department_id : null);
        window.App.showToast(`Assigned #${issueId} to ${staff ? staff.name : 'Worker'}`, 'success');
        this.render();
      });
    });
  }

  renderKanbanCard(issue) {
    const media = window.CivicDB.getIssueMedia(issue.id);
    const thumb = media.length > 0 ? media[0].image_url : null;
    const assignee = window.CivicDB.getUserById(issue.assigned_to_id);
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const isAdmin = user && user.role === 'admin';
    const isWorker = user && user.role === 'field_team';
    const fieldStaff = window.CivicDB.getUsers().filter(u => u.role === 'field_team');

    let cardFooterControl = '';
    if (isAdmin) {
      cardFooterControl = `
        <select class="kanban-status-select kanban-assign-select" data-issue-id="${issue.id}">
          <option value="">Assign...</option>
          ${fieldStaff.map(s => `<option value="${s.id}" ${issue.assigned_to_id === s.id ? 'selected' : ''}>${s.name.split(' ')[0]}</option>`).join('')}
        </select>
      `;
    } else if (isWorker) {
      cardFooterControl = `
        <select class="kanban-status-select" data-issue-id="${issue.id}" data-current-status="${issue.status}">
          <option value="submitted" ${issue.status === 'submitted' ? 'selected' : ''}>1. Submitted</option>
          <option value="assigned" ${issue.status === 'assigned' ? 'selected' : ''}>2. Assigned</option>
          <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>3. In Progress</option>
          <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>4. Resolved</option>
        </select>
      `;
    }

    return `
      <div class="kanban-card" data-issue-id="${issue.id}">
        <div class="kanban-card-top">
          <span class="font-mono text-[11px] text-slate-500 font-semibold">${issue.id}</span>
        </div>

        ${thumb ? `<div class="kanban-thumb" style="background-image: url('${thumb}')" onclick="window.IssueDetailView.open('${issue.id}')"></div>` : ''}

        <h5 class="kanban-title" onclick="window.IssueDetailView.open('${issue.id}')">${issue.title}</h5>
        <p class="kanban-address">${issue.address}</p>

        <div class="kanban-card-bottom">
          <div class="kanban-assignee">
            <img src="${assignee ? assignee.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="kanban-avatar" alt="Assignee" />
            <span class="truncate max-w-[90px] text-[11px] text-slate-600">${assignee ? assignee.name.split(' ')[0] : 'Unassigned'}</span>
          </div>

          <div class="kanban-move-wrapper">
            ${cardFooterControl}
          </div>
        </div>
      </div>
    `;
  }
}

window.MunicipalDashboard = new MunicipalDashboard();
