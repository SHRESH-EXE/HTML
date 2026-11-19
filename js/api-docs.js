/**
 * CivicPulse - Database Schema & Backend Architecture Explorer
 * Interactive Entity-Relationship Viewer, PostgreSQL DDL Generator, REST API Runner, and GraphQL Playground
 */

class ApiDocsExplorer {
  constructor() {
    this.activeSubtab = 'schema'; // 'schema' | 'rest' | 'graphql'
    this.initEvents();
  }

  initEvents() {
    document.querySelectorAll('.arch-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.arch-subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchSubtab(btn.dataset.subtab);
      });
    });

    // REST test buttons
    document.querySelectorAll('.btn-rest-execute').forEach(btn => {
      btn.addEventListener('click', () => {
        const endpoint = btn.dataset.endpoint;
        this.executeRestEndpoint(endpoint, btn);
      });
    });

    // Copy SQL DDL
    const copySqlBtn = document.getElementById('btn-copy-sql-ddl');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        const sqlText = document.getElementById('sql-ddl-code')?.innerText || '';
        navigator.clipboard.writeText(sqlText).then(() => {
          window.App.showToast('PostgreSQL Schema DDL copied to clipboard!', 'success');
        });
      });
    }
  }

  switchSubtab(subtab) {
    this.activeSubtab = subtab;
    document.getElementById('arch-view-schema').style.display = subtab === 'schema' ? 'block' : 'none';
    document.getElementById('arch-view-rest').style.display = subtab === 'rest' ? 'block' : 'none';
    document.getElementById('arch-view-graphql').style.display = subtab === 'graphql' ? 'block' : 'none';
    if (window.lucide) window.lucide.createIcons();
  }

  executeRestEndpoint(endpoint, btn) {
    const outputContainer = btn.closest('.rest-endpoint-card').querySelector('.rest-response-viewer');
    if (!outputContainer) return;

    outputContainer.style.display = 'block';
    outputContainer.innerHTML = `<div class="p-3 text-xs text-blue-600 font-mono"><i data-lucide="loader" class="animate-spin inline-block mr-1"></i> Sending request to simulated server...</div>`;
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      let responseData = {};
      let status = 200;

      switch (endpoint) {
        case 'GET_ISSUES':
          responseData = {
            status: 'success',
            meta: { total: window.CivicDB.getIssues().length, page: 1, limit: 10 },
            data: window.CivicDB.getIssues().slice(0, 3)
          };
          break;

        case 'CHECK_DUPLICATES':
          const duplicates = window.CivicDB.findNearbyDuplicates(12.9785, 77.6409, 'Pothole', 100);
          responseData = {
            status: 'success',
            query: { lat: 12.9785, lng: 77.6409, radius_meters: 100, category: 'Pothole' },
            matches_count: duplicates.length,
            duplicates: duplicates
          };
          break;

        case 'GET_USERS':
          responseData = {
            status: 'success',
            users: window.CivicDB.getUsers().map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              ward_id: u.ward_id,
              department_id: u.department_id
            }))
          };
          break;

        case 'GET_HELPDESK':
          responseData = {
            status: 'success',
            total_tickets: window.CivicDB.getHelpDeskTickets().length,
            inbox: window.CivicDB.getHelpDeskTickets().slice(0, 2)
          };
          break;

        default:
          responseData = { status: 'success', message: 'Executed' };
      }

      outputContainer.innerHTML = `
        <div class="response-header">
          <span class="response-status status-200">HTTP/1.1 ${status} OK</span>
          <span class="response-latency">18ms</span>
        </div>
        <pre class="response-json"><code>${JSON.stringify(responseData, null, 2)}</code></pre>
      `;
    }, 280);
  }
}

window.ApiDocsExplorer = new ApiDocsExplorer();
