/**
 * CivicPulse - Routing Rules Engine & SLA Monitor
 * Auto-routes citizen grievances to Indian Municipal Bodies (PWD, BESCOM, SWM, BWSSB, Horticulture)
 */

const RoutingEngine = {
  routingRules: {
    'Pothole': {
      departmentId: 'dept-pw',
      departmentName: 'Public Works Dept (PWD)',
      defaultPriority: 'medium',
      slaHours: 48,
      hazardAutoEscalate: 'critical',
      tags: ['asphalt', 'roadway', 'traffic-safety']
    },
    'Streetlight': {
      departmentId: 'dept-elec',
      departmentName: 'Electricity Board (BESCOM)',
      defaultPriority: 'high',
      slaHours: 24,
      hazardAutoEscalate: 'critical',
      tags: ['electrical', 'public-safety', 'lighting']
    },
    'Waste': {
      departmentId: 'dept-san',
      departmentName: 'Solid Waste Mgmt (SWM)',
      defaultPriority: 'medium',
      slaHours: 36,
      hazardAutoEscalate: 'high',
      tags: ['sanitation', 'garbage', 'swachhta']
    },
    'Water': {
      departmentId: 'dept-water',
      departmentName: 'Jal Board (BWSSB)',
      defaultPriority: 'critical',
      slaHours: 12,
      hazardAutoEscalate: 'critical',
      tags: ['pipeline', 'potable-water', 'drainage']
    },
    'Other': {
      departmentId: 'dept-admin',
      departmentName: 'Horticulture & Parks Vibhag',
      defaultPriority: 'low',
      slaHours: 72,
      hazardAutoEscalate: 'high',
      tags: ['parks', 'trees', 'urban-environment']
    }
  },

  resolveRouting(category, isImmediateSafetyHazard = false, manualPriority = null) {
    const rule = this.routingRules[category] || this.routingRules['Other'];
    let priority = manualPriority || rule.defaultPriority;

    if (isImmediateSafetyHazard) {
      priority = rule.hazardAutoEscalate || 'critical';
    }

    return {
      departmentId: rule.departmentId,
      departmentName: rule.departmentName,
      priority: priority,
      slaHours: priority === 'critical' ? Math.min(rule.slaHours, 12) : rule.slaHours,
      tags: rule.tags
    };
  },

  calculateSLAStatus(issue) {
    if (issue.status === 'resolved' || issue.status === 'closed') {
      return { isBreached: false, hoursElapsed: 0, text: 'Resolved', class: 'sla-resolved' };
    }

    const createdTime = new Date(issue.created_at).getTime();
    const now = Date.now();
    const hoursElapsed = Math.round((now - createdTime) / (1000 * 60 * 60));

    const rule = this.routingRules[issue.category] || this.routingRules['Other'];
    const maxSLA = issue.priority === 'critical' ? 12 : rule.slaHours;

    const isBreached = hoursElapsed > maxSLA;
    const hoursRemaining = maxSLA - hoursElapsed;

    return {
      isBreached,
      hoursElapsed,
      maxSLA,
      hoursRemaining,
      text: isBreached ? `SLA Breached (${hoursElapsed}h / ${maxSLA}h)` : `${hoursRemaining}h left (${hoursElapsed}h / ${maxSLA}h)`,
      class: isBreached ? 'sla-breached' : (hoursRemaining <= 6 ? 'sla-warning' : 'sla-ok')
    };
  },

  getCategoryIcon(category) {
    switch (category) {
      case 'Pothole': return 'wrench';
      case 'Streetlight': return 'zap';
      case 'Waste': return 'trash-2';
      case 'Water': return 'droplet';
      case 'Other':
      default: return 'help-circle';
    }
  },

  getStatusColor(status) {
    switch (status) {
      case 'submitted': return '#dc2626'; // Red
      case 'assigned': return '#d97706'; // Amber
      case 'in_progress': return '#2563eb'; // Blue
      case 'resolved': return '#059669'; // Green
      case 'closed': return '#64748b'; // Slate Gray
      default: return '#64748b';
    }
  },

  getPriorityBadge(priority) {
    const p = (priority || 'medium').toLowerCase();
    switch (p) {
      case 'critical': return { label: 'CRITICAL', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
      case 'high': return { label: 'HIGH', bg: '#ffedd5', color: '#c2410c', border: '#fdba74' };
      case 'medium': return { label: 'MEDIUM', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'low': return { label: 'LOW', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
      default: return { label: p.toUpperCase(), bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  }
};

window.RoutingEngine = RoutingEngine;
