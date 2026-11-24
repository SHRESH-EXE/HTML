/**
 * CivicPulse - Help Desk & Escalation Center
 * Resident Escalation Form, Searchable Civic FAQ Accordion, Emergency Quick-Dial Cards,
 * and Help Desk Agent Support Inbox with 1-Click Ping, Escalate Priority, and Merge Duplicates.
 */

class HelpDeskModule {
  constructor() {
    this.activeFaqQuery = '';
    this.selectedTicketId = null;
    this.initEvents();
  }

  initEvents() {
    // FAQ Search Input
    const faqSearch = document.getElementById('faq-search-input');
    if (faqSearch) {
      faqSearch.addEventListener('input', (e) => {
        this.activeFaqQuery = e.target.value.toLowerCase().trim();
        this.renderFAQs();
      });
    }

    // Escalation Form Submit
    const form = document.getElementById('escalate-issue-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitEscalation();
      });
    }

    // Emergency quick-dial cards
    document.querySelectorAll('.btn-emergency-dial').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.emergencyTitle;
        const phone = btn.dataset.emergencyPhone;
        const instruction = btn.dataset.emergencyInstruction;
        this.showEmergencyModal(title, phone, instruction);
      });
    });

    // Close emergency modal
    const closeEmerg = document.getElementById('btn-close-emergency-modal');
    if (closeEmerg) {
      closeEmerg.addEventListener('click', () => {
        document.getElementById('emergency-action-modal')?.classList.remove('active');
      });
    }

    // Agent action: Ping Department
    const pingBtn = document.getElementById('btn-agent-ping-dept');
    if (pingBtn) {
      pingBtn.addEventListener('click', () => this.handleAgentPing());
    }

    // Agent action: Escalate to Critical
    const escalateBtn = document.getElementById('btn-agent-escalate-prio');
    if (escalateBtn) {
      escalateBtn.addEventListener('click', () => this.handleAgentEscalate());
    }

    // Agent action: Merge Duplicates
    const mergeBtn = document.getElementById('btn-agent-merge-dups');
    if (mergeBtn) {
      mergeBtn.addEventListener('click', () => this.openMergeModal());
    }

    // Agent reply form
    const agentReplyForm = document.getElementById('ticket-reply-form');
    if (agentReplyForm) {
      agentReplyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitTicketReply();
      });
    }

    // Merge modal confirm
    const confirmMergeBtn = document.getElementById('btn-confirm-merge-issues');
    if (confirmMergeBtn) {
      confirmMergeBtn.addEventListener('click', () => this.confirmMerge());
    }

    const cancelMergeBtn = document.getElementById('btn-cancel-merge');
    if (cancelMergeBtn) {
      cancelMergeBtn.addEventListener('click', () => {
        document.getElementById('merge-duplicates-modal')?.classList.remove('active');
      });
    }
  }

  render() {
    const user = window.Auth.getCurrentUser();
    const isAgent = user && (user.role === 'help_desk' || user.role === 'admin');

    const residentSection = document.getElementById('helpdesk-resident-section');
    const agentSection = document.getElementById('helpdesk-agent-section');

    if (isAgent) {
      if (residentSection) residentSection.style.display = 'none';
      if (agentSection) agentSection.style.display = 'grid';
      this.renderAgentInbox();
    } else {
      if (residentSection) residentSection.style.display = 'block';
      if (agentSection) agentSection.style.display = 'none';
      this.populateEscalationDropdown();
      this.renderFAQs();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Populate resident's issue dropdown for escalation
   */
  populateEscalationDropdown(preselectIssueId = null) {
    const select = document.getElementById('escalate-issue-select');
    if (!select) return;

    const allIssues = window.CivicDB.getIssues();
    const openIssues = allIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed');

    if (openIssues.length === 0) {
      select.innerHTML = `<option value="">No active issues to escalate</option>`;
      return;
    }

    select.innerHTML = `
      <option value="">-- Choose an overdue or delayed report --</option>
      ${openIssues.map(i => {
        const sla = window.RoutingEngine.calculateSLAStatus(i);
        const selected = (preselectIssueId && preselectIssueId === i.id) ? 'selected' : '';
        return `
          <option value="${i.id}" ${selected}>
            ${i.id}: ${i.title.slice(0, 45)}... [${i.status.toUpperCase()} - ${sla.text}]
          </option>
        `;
      }).join('')}
    `;
  }

  openEscalateForm(issueId) {
    if (window.IssueDetailView) window.IssueDetailView.close();
    window.App.switchView('helpdesk');
    setTimeout(() => {
      this.populateEscalationDropdown(issueId);
      const subjectInput = document.getElementById('escalate-subject-input');
      if (subjectInput) {
        const issue = window.CivicDB.getIssueById(issueId);
        subjectInput.value = `Overdue inquiry on report #${issueId}: ${issue ? issue.title : ''}`;
      }
      const select = document.getElementById('escalate-issue-select');
      if (select) select.value = issueId;
    }, 200);
  }

  submitEscalation() {
    const issueSelect = document.getElementById('escalate-issue-select');
    const subjectInput = document.getElementById('escalate-subject-input');
    const messageInput = document.getElementById('escalate-message-input');
    const prioritySelect = document.getElementById('escalate-urgency-select');

    const relatedIssueId = issueSelect ? issueSelect.value : null;
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    const priority = prioritySelect ? prioritySelect.value : 'high';

    if (!relatedIssueId) {
      window.App.showToast('Please select a report to escalate.', 'warning');
      return;
    }
    if (!subject || !message) {
      window.App.showToast('Please provide both subject and explanation.', 'warning');
      return;
    }

    const user = window.Auth.getCurrentUser();
    const ticket = window.CivicDB.createHelpDeskTicket({
      resident_id: user ? user.id : 'usr-res-1',
      related_issue_id: relatedIssueId,
      subject: subject,
      message: message,
      priority: priority
    });

    window.App.showToast(`Support Ticket #${ticket.id} created! Routed to Help Desk queue.`, 'success');

    // Reset inputs
    if (subjectInput) subjectInput.value = '';
    if (messageInput) messageInput.value = '';

    // Add note to issue timeline
    const issue = window.CivicDB.getIssueById(relatedIssueId);
    if (issue) {
      issue.timeline.push({
        status: issue.status,
        timestamp: new Date().toISOString(),
        note: `Resident opened Help Desk Escalation inquiry #${ticket.id}`
      });
    }
  }

  /**
   * Searchable Civic FAQ accordion
   */
  renderFAQs() {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    const allFaqs = window.CivicDB.getFaqs();
    let faqs = allFaqs;

    if (this.activeFaqQuery) {
      faqs = allFaqs.filter(f =>
        f.question.toLowerCase().includes(this.activeFaqQuery) ||
        f.answer.toLowerCase().includes(this.activeFaqQuery) ||
        f.category.toLowerCase().includes(this.activeFaqQuery)
      );
    }

    if (faqs.length === 0) {
      container.innerHTML = `
        <div class="faq-empty-state">
          <i data-lucide="help-circle"></i>
          <p>No FAQ matching "${this.activeFaqQuery}". Please submit an escalation inquiry above.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = faqs.map((faq, idx) => `
      <div class="faq-accordion-item ${idx === 0 ? 'open' : ''}">
        <button class="faq-accordion-header" type="button">
          <div class="faq-header-content">
            <span class="faq-category-badge">${faq.category}</span>
            <span class="faq-question-text">${faq.question}</span>
          </div>
          <i data-lucide="chevron-down" class="faq-chevron"></i>
        </button>
        <div class="faq-accordion-body">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.faq-accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.faq-accordion-item');
        const isOpen = item.classList.contains('open');
        // Close others
        container.querySelectorAll('.faq-accordion-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Emergency Modal
   */
  showEmergencyModal(title, phone, instruction) {
    const modal = document.getElementById('emergency-action-modal');
    if (!modal) return;

    document.getElementById('emergency-modal-title').textContent = title;
    document.getElementById('emergency-modal-phone').textContent = phone;
    document.getElementById('emergency-modal-instruction').textContent = instruction;

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Help Desk Agent Unified Inbox
   */
  renderAgentInbox() {
    const tickets = window.CivicDB.getHelpDeskTickets();
    const listContainer = document.getElementById('agent-tickets-list');
    if (!listContainer) return;

    if (tickets.length === 0) {
      listContainer.innerHTML = `<div class="p-8 text-center text-slate-500">No support inquiries in queue.</div>`;
      return;
    }

    if (!this.selectedTicketId && tickets.length > 0) {
      this.selectedTicketId = tickets[0].id;
    }

    listContainer.innerHTML = tickets.map(ticket => {
      const isSelected = ticket.id === this.selectedTicketId;
      const resident = window.CivicDB.getUserById(ticket.resident_id);
      const prio = window.RoutingEngine.getPriorityBadge(ticket.priority);

      return `
        <div class="agent-ticket-item ${isSelected ? 'active' : ''}" data-ticket-id="${ticket.id}">
          <div class="ticket-item-top">
            <span class="font-mono text-xs font-bold text-blue-600">${ticket.id}</span>
          </div>
          <h5 class="ticket-item-subject">${ticket.subject}</h5>
          <div class="ticket-item-footer">
            <span class="text-xs text-slate-600">${resident ? resident.name : 'Resident'}</span>
            <span class="text-[11px] text-slate-400">${new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.agent-ticket-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectedTicketId = item.dataset.ticketId;
        this.renderAgentInbox();
      });
    });

    this.renderTicketDetail();
  }

  renderTicketDetail() {
    const ticket = window.CivicDB.getHelpDeskTicketById(this.selectedTicketId);
    const detailContainer = document.getElementById('agent-ticket-detail-pane');
    if (!detailContainer || !ticket) return;

    const resident = window.CivicDB.getUserById(ticket.resident_id);
    const issue = window.CivicDB.getIssueById(ticket.related_issue_id);
    const dept = issue ? window.CivicDB.getDepartmentById(issue.assigned_department) : null;

    detailContainer.innerHTML = `
      <div class="ticket-detail-header">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono font-bold text-blue-700 text-sm">${ticket.id}</span>
          </div>
          <h3 class="ticket-detail-subject">${ticket.subject}</h3>
          <p class="text-xs text-slate-500">From <strong>${resident ? resident.name : 'Aarav Sharma'}</strong> (${resident ? resident.email : ''}) • Created ${new Date(ticket.created_at).toLocaleString()}</p>
        </div>

        <!-- 3 One-Click Agent Actions -->
        <div class="agent-quick-actions">
          <button class="btn btn-warning btn-sm" id="btn-agent-ping-dept">
            Ping Assigned Dept
          </button>
          <button class="btn btn-rose btn-sm" id="btn-agent-escalate-prio">
            Escalate to Critical
          </button>
          <button class="btn btn-outline btn-sm" id="btn-agent-merge-dups">
            Merge Duplicate
          </button>
        </div>
      </div>

      <!-- Linked Civic Issue Preview Box -->
      ${issue ? `
        <div class="linked-issue-box">
          <div class="linked-issue-header">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <i data-lucide="link"></i> Linked Civic Report:
            </span>
            <button class="btn btn-primary btn-xs" onclick="window.IssueDetailView.open('${issue.id}')">
              Open Full Work Order <i data-lucide="external-link"></i>
            </button>
          </div>
          <div class="linked-issue-body">
            <div>
              <p class="font-bold text-slate-900">${issue.title}</p>
              <p class="text-xs text-slate-600 mt-0.5"><i data-lucide="map-pin"></i> ${issue.address}</p>
              <div class="flex items-center gap-2 mt-2 text-xs">
                <span>Dept: <strong>${dept ? dept.name : 'Public Works'}</strong></span>
                <span>•</span>
                <span>Status: <strong class="uppercase text-blue-600">${issue.status}</strong></span>
                <span>•</span>
                <span>Upvotes: <strong>${issue.upvotes_count || 1}</strong></span>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Conversation Messages Thread -->
      <div class="ticket-messages-thread">
        ${ticket.messages.map(m => {
          const isStaff = m.sender_role === 'help_desk' || m.sender_role === 'admin';
          return `
            <div class="ticket-chat-bubble ${isStaff ? 'agent-reply' : 'resident-msg'}">
              <div class="chat-sender-info">
                <strong>${isStaff ? 'Priya Patel (Citizen Support Officer)' : (resident ? resident.name : 'Aarav Sharma')}</strong>
                <span>${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
              </div>
              <p class="chat-text">${m.text}</p>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Agent Reply Box -->
      <form id="ticket-reply-form" class="ticket-reply-form">
        <textarea id="agent-reply-input" rows="2" placeholder="Send an official update to the resident..." required></textarea>
        <button type="submit" class="btn btn-primary btn-sm">
          <i data-lucide="send"></i> Reply to Resident
        </button>
      </form>
    `;

    // Re-bind actions
    document.getElementById('btn-agent-ping-dept')?.addEventListener('click', () => this.handleAgentPing());
    document.getElementById('btn-agent-escalate-prio')?.addEventListener('click', () => this.handleAgentEscalate());
    document.getElementById('btn-agent-merge-dups')?.addEventListener('click', () => this.openMergeModal());
    document.getElementById('ticket-reply-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitTicketReply();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  handleAgentPing() {
    const success = window.CivicDB.pingDepartment(this.selectedTicketId, 'Resident reports severe neighborhood impact and safety urgency.');
    if (success) {
      window.App.showToast(`🚨 High-Priority Ping sent to Assigned Department Supervisor!`, 'success');
      this.render();
    }
  }

  handleAgentEscalate() {
    const success = window.CivicDB.escalateTicketPriority(this.selectedTicketId, 'critical');
    if (success) {
      window.App.showToast(`🔥 Issue Priority escalated to CRITICAL! SLA timer reduced to 12 hours.`, 'success');
      this.render();
    }
  }

  openMergeModal() {
    const ticket = window.CivicDB.getHelpDeskTicketById(this.selectedTicketId);
    if (!ticket || !ticket.related_issue_id) return;

    const modal = document.getElementById('merge-duplicates-modal');
    const container = document.getElementById('merge-candidates-container');
    const masterLabel = document.getElementById('merge-master-issue-label');

    if (masterLabel) masterLabel.textContent = `Master Issue: #${ticket.related_issue_id}`;

    const allIssues = window.CivicDB.getIssues();
    const otherIssues = allIssues.filter(i => i.id !== ticket.related_issue_id && i.status !== 'closed');

    if (container) {
      container.innerHTML = otherIssues.map(i => `
        <label class="merge-issue-row">
          <input type="checkbox" name="merge-candidate" value="${i.id}" />
          <div class="merge-candidate-info">
            <span class="font-mono text-xs font-bold text-slate-800">${i.id}</span>
            <span class="text-xs text-slate-600 block">${i.title}</span>
            <small class="text-slate-400 text-[10px]">${i.address} • Upvotes: ${i.upvotes_count || 1}</small>
          </div>
        </label>
      `).join('');
    }

    if (modal) modal.classList.add('active');
  }

  confirmMerge() {
    const ticket = window.CivicDB.getHelpDeskTicketById(this.selectedTicketId);
    if (!ticket || !ticket.related_issue_id) return;

    const checked = Array.from(document.querySelectorAll('input[name="merge-candidate"]:checked')).map(cb => cb.value);
    if (checked.length === 0) {
      window.App.showToast('Please check at least one duplicate issue to merge.', 'warning');
      return;
    }

    window.CivicDB.mergeIssues(ticket.related_issue_id, checked);
    window.App.showToast(`Merged ${checked.length} duplicate report(s) into Master #${ticket.related_issue_id}! Upvotes consolidated.`, 'success');

    document.getElementById('merge-duplicates-modal')?.classList.remove('active');
    this.render();
    window.dispatchEvent(new CustomEvent('civic:issue-updated', { detail: {} }));
  }

  submitTicketReply() {
    const input = document.getElementById('agent-reply-input');
    if (!input || !input.value.trim()) return;

    const user = window.Auth.getCurrentUser();
    window.CivicDB.addHelpDeskMessage(
      this.selectedTicketId,
      user ? user.id : 'usr-help-1',
      'help_desk',
      input.value.trim()
    );

    window.App.showToast('Reply dispatched to resident inbox.', 'info');
    input.value = '';
    this.renderAgentInbox();
  }
}

window.HelpDeskModule = new HelpDeskModule();
