/**
 * CivicPulse - Issue Submission Wizard & Duplicate Detection Engine
 * Multi-step report wizard (Category & Hazard -> Location & Duplicate Check -> Photos & Details)
 */

class IssueReportWizard {
  constructor() {
    this.currentStep = 1;
    this.formData = {
      category: 'Pothole',
      priority: 'medium',
      isHazard: false,
      ward_id: 'ward-1',
      latitude: 12.9785,
      longitude: 77.6409,
      address: '',
      title: '',
      description: '',
      photos: []
    };
    this.activeDuplicateMatches = [];
    this.initEvents();
  }

  initEvents() {
    // Category selection grid
    document.querySelectorAll('.category-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = btn.dataset.category;
        this.selectCategory(cat);
      });
    });

    // Priority selector buttons
    document.querySelectorAll('.priority-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.formData.isHazard) return; // Locked if immediate safety hazard
        const prio = btn.dataset.priority;
        this.selectPriority(prio);
      });
    });

    // Safety Hazard Toggle
    const hazardToggle = document.getElementById('hazard-toggle-input');
    if (hazardToggle) {
      hazardToggle.addEventListener('change', (e) => {
        this.toggleSafetyHazard(e.target.checked);
      });
    }

    // Step Navigation
    const nextBtn = document.getElementById('report-wizard-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    const prevBtn = document.getElementById('report-wizard-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevStep());
    }

    const submitBtn = document.getElementById('report-wizard-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitReport());
    }

    // Ward / City inputs change
    const reportCityInput = document.getElementById('report-city-input');
    const reportAreaInput = document.getElementById('report-area-input');
    const updateLocation = () => {
      const city = reportCityInput ? reportCityInput.value.trim() : '';
      const area = reportAreaInput ? reportAreaInput.value.trim() : '';
      if (city && window.CivicDB) {
        const ward = window.CivicDB.findOrCreateWard(city, area || 'General Locality');
        this.formData.ward_id = ward.id;
        this.formData.city = city;
        this.formData.area = area;
        this.formData.latitude = ward.lat;
        this.formData.longitude = ward.lng;
        this.checkDuplicates(ward.lat, ward.lng, this.formData.category);
      }
    };
    if (reportCityInput) reportCityInput.addEventListener('change', updateLocation);
    if (reportAreaInput) reportAreaInput.addEventListener('change', updateLocation);

    const wardSelect = document.getElementById('report-ward-select');
    if (wardSelect) {
      wardSelect.addEventListener('change', (e) => {
        const wardId = e.target.value;
        this.formData.ward_id = wardId;
        const ward = window.CivicDB ? window.CivicDB.getWardById(wardId) : null;
        if (ward) {
          this.formData.latitude = ward.lat;
          this.formData.longitude = ward.lng;
          this.checkDuplicates(ward.lat, ward.lng, this.formData.category);
        }
      });
    }

    // Drag and drop photo upload
    this.initPhotoUploader();
  }

  open() {
    this.currentStep = 1;
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const defaultWardId = (user && user.ward_id) ? user.ward_id : 'ward-1';
    const ward = window.CivicDB ? window.CivicDB.getWardById(defaultWardId) : null;

    this.formData = {
      category: 'Pothole',
      priority: 'medium',
      isHazard: false,
      ward_id: defaultWardId,
      latitude: ward ? ward.lat : 12.9785,
      longitude: ward ? ward.lng : 77.6409,
      address: '',
      title: '',
      description: '',
      photos: []
    };

    const cityInput = document.getElementById('report-city-input');
    const areaInput = document.getElementById('report-area-input');
    const addrInput = document.getElementById('report-address-input');

    if (cityInput) {
      cityInput.value = (user && user.city) || (ward && ward.city) || 'New Delhi';
    }
    if (areaInput) {
      areaInput.value = (user && user.area) || (ward && ward.name) || 'Connaught Place';
    }
    if (addrInput) {
      addrInput.value = (user && user.address) || '';
    }

    // Reset hazard toggle
    const hazardToggle = document.getElementById('hazard-toggle-input');
    if (hazardToggle) hazardToggle.checked = false;

    // Reset form fields
    const titleInput = document.getElementById('report-title-input');
    const descInput = document.getElementById('report-desc-input');
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';

    this.selectCategory('Pothole');
    this.selectPriority('medium');
    this.renderPhotoThumbnails();
    this.updateStepUI();

    const modal = document.getElementById('report-issue-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    const modal = document.getElementById('report-issue-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    this.hideDuplicateSlideover();
  }

  selectCategory(category) {
    this.formData.category = category;
    document.querySelectorAll('.category-card-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.category === category);
    });

    // Auto-update department routing preview
    const routing = window.RoutingEngine.resolveRouting(category, this.formData.isHazard, this.formData.priority);
    this.updateRoutingPreview(routing);

    // Re-check duplicates if on step 2
    if (this.currentStep === 2) {
      this.checkDuplicates(this.formData.latitude, this.formData.longitude, category);
    }
  }

  selectPriority(priority) {
    this.formData.priority = priority;
    document.querySelectorAll('.priority-pill-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.priority === priority);
    });

    const routing = window.RoutingEngine.resolveRouting(this.formData.category, this.formData.isHazard, priority);
    this.updateRoutingPreview(routing);
  }

  toggleSafetyHazard(isHazard) {
    this.formData.isHazard = isHazard;
    const hazardBanner = document.getElementById('hazard-alert-banner');
    const prioritySelector = document.getElementById('priority-selector-wrapper');

    if (isHazard) {
      this.formData.priority = 'critical';
      this.selectPriority('critical');
      if (hazardBanner) hazardBanner.classList.remove('hidden');
      if (prioritySelector) prioritySelector.classList.add('disabled-lock');
    } else {
      this.formData.priority = 'medium';
      this.selectPriority('medium');
      if (hazardBanner) hazardBanner.classList.add('hidden');
      if (prioritySelector) prioritySelector.classList.remove('disabled-lock');
    }
  }

  updateRoutingPreview(routing) {
    const deptBadge = document.getElementById('routing-dept-badge');
    const slaBadge = document.getElementById('routing-sla-badge');
    if (deptBadge) deptBadge.textContent = routing.departmentName;
    if (slaBadge) slaBadge.textContent = `${routing.slaHours}h Target SLA`;
  }

  nextStep() {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      this.updateStepUI();
      this.checkDuplicates(this.formData.latitude, this.formData.longitude, this.formData.category);
      return;
    }

    if (this.currentStep === 2) {
      const cityInput = document.getElementById('report-city-input');
      const areaInput = document.getElementById('report-area-input');
      const addrInput = document.getElementById('report-address-input');

      const city = cityInput ? cityInput.value.trim() : '';
      const area = areaInput ? areaInput.value.trim() : '';
      const street = addrInput ? addrInput.value.trim() : '';

      if (!city) {
        window.App.showToast('Please enter or select a city in India.', 'error');
        if (cityInput) cityInput.focus();
        return;
      }
      if (!area) {
        window.App.showToast('Please enter a locality, ward, or neighborhood.', 'error');
        if (areaInput) areaInput.focus();
        return;
      }
      if (!street) {
        window.App.showToast('Please enter a street, road, or nearby landmark.', 'error');
        if (addrInput) addrInput.focus();
        return;
      }

      const fullAddress = `${street}, ${area}, ${city}`;
      this.formData.address = fullAddress;
      this.formData.city = city;
      this.formData.area = area;

      if (window.CivicDB) {
        const ward = window.CivicDB.findOrCreateWard(city, area);
        this.formData.ward_id = ward.id;
        this.formData.ward_name = ward.name;
        this.formData.latitude = ward.lat;
        this.formData.longitude = ward.lng;
        this.checkDuplicates(ward.lat, ward.lng, this.formData.category);
      }

      this.currentStep = 3;
      this.updateStepUI();
      return;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
      this.updateStepUI();
    }
  }

  updateStepUI() {
    // Step indicators
    document.querySelectorAll('.wizard-step-node').forEach(node => {
      const stepNum = parseInt(node.dataset.step, 10);
      node.classList.toggle('active', stepNum === this.currentStep);
      node.classList.toggle('completed', stepNum < this.currentStep);
    });

    // Step views
    document.getElementById('wizard-step-1').classList.toggle('active', this.currentStep === 1);
    document.getElementById('wizard-step-2').classList.toggle('active', this.currentStep === 2);
    document.getElementById('wizard-step-3').classList.toggle('active', this.currentStep === 3);

    // Button states
    const prevBtn = document.getElementById('report-wizard-prev');
    const nextBtn = document.getElementById('report-wizard-next');
    const submitBtn = document.getElementById('report-wizard-submit');

    if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
    if (nextBtn) nextBtn.style.display = this.currentStep === 3 ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = this.currentStep === 3 ? 'inline-flex' : 'none';

    if (window.lucide) window.lucide.createIcons();
  }

  checkDuplicates(lat, lng, category) {
    const duplicates = window.CivicDB.findNearbyDuplicates(lat, lng, category, 100);
    this.handleDuplicateResults(duplicates);
  }

  handleDuplicateResults(duplicates) {
    this.activeDuplicateMatches = duplicates;
    const slideover = document.getElementById('duplicate-slideover-card');
    if (!slideover) return;

    if (duplicates && duplicates.length > 0) {
      const match = duplicates[0];
      const matchPhoto = match.primaryPhoto || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80';
      
      slideover.innerHTML = `
        <div class="duplicate-header">
          <div class="duplicate-warning-icon">
            <i data-lucide="alert-triangle"></i>
          </div>
          <div>
            <h4 class="duplicate-title">Wait! Has this already been reported?</h4>
            <p class="duplicate-subtitle">We found an active <strong>${match.category}</strong> report only <strong>${match.distanceMeters}m away</strong>.</p>
          </div>
        </div>

        <div class="duplicate-match-preview">
          <div class="duplicate-photo" style="background-image: url('${matchPhoto}')"></div>
          <div class="duplicate-info">
            <h5 class="duplicate-issue-title">${match.title}</h5>
            <p class="duplicate-address">${match.address}</p>
            <p class="duplicate-votes">${match.upvotes_count || 1} neighbors already following this</p>
          </div>
        </div>

        <div class="duplicate-actions">
          <button class="btn btn-emerald btn-sm" id="btn-upvote-duplicate" data-issue-id="${match.id}">
            Upvote & Follow This Issue (+1)
          </button>
          <button class="btn btn-outline btn-sm" id="btn-dismiss-duplicate">
            No, create a new report
          </button>
        </div>
      `;

      slideover.classList.add('visible');
      if (window.lucide) window.lucide.createIcons();

      // Bind button events
      document.getElementById('btn-upvote-duplicate').addEventListener('click', () => {
        this.upvoteAndFollow(match.id, match.title);
      });

      document.getElementById('btn-dismiss-duplicate').addEventListener('click', () => {
        this.hideDuplicateSlideover();
      });
    } else {
      this.hideDuplicateSlideover();
    }
  }

  hideDuplicateSlideover() {
    const slideover = document.getElementById('duplicate-slideover-card');
    if (slideover) slideover.classList.remove('visible');
  }

  upvoteAndFollow(issueId, title) {
    const user = window.Auth.getCurrentUser();
    const newCount = window.CivicDB.upvoteIssue(issueId, user ? user.id : 'usr-res-1');

    window.App.showToast(`Upvoted! You are now following issue #${issueId}. (${newCount} endorsements)`, 'success');
    this.close();

    // Open detail of the followed issue
    setTimeout(() => {
      window.IssueDetailView.open(issueId);
    }, 400);
  }

  initPhotoUploader() {
    const dropzone = document.getElementById('photo-dropzone');
    const fileInput = document.getElementById('photo-file-input');

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.add('drag-active'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.remove('drag-active'));
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      this.handleSelectedFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
      this.handleSelectedFiles(e.target.files);
    });

    // Preset sample photos for quick demo testing
    document.querySelectorAll('.preset-photo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const url = chip.dataset.url;
        if (this.formData.photos.length >= 3) {
          window.App.showToast('Maximum 3 photos allowed per report.', 'warning');
          return;
        }
        this.formData.photos.push(url);
        this.renderPhotoThumbnails();
      });
    });
  }

  handleSelectedFiles(files) {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (this.formData.photos.length >= 3) {
        window.App.showToast('Maximum 3 photos per report reached.', 'warning');
        break;
      }
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.formData.photos.length < 3) {
          this.formData.photos.push(e.target.result);
          this.renderPhotoThumbnails();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  renderPhotoThumbnails() {
    const container = document.getElementById('photo-preview-grid');
    if (!container) return;

    if (this.formData.photos.length === 0) {
      container.innerHTML = `<p class="photo-empty-hint">No photos attached yet. Drag & drop up to 3 photos above or click a quick sample preset below.</p>`;
      return;
    }

    container.innerHTML = this.formData.photos.map((src, index) => `
      <div class="photo-thumb-card">
        <img src="${src}" alt="Evidence Photo ${index + 1}" />
        <button type="button" class="btn-remove-photo" data-index="${index}" title="Remove Photo">
          <i data-lucide="x"></i>
        </button>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll('.btn-remove-photo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        this.formData.photos.splice(idx, 1);
        this.renderPhotoThumbnails();
      });
    });
  }

  submitReport() {
    const titleInput = document.getElementById('report-title-input');
    const descInput = document.getElementById('report-desc-input');

    const title = titleInput ? titleInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';

    if (!title) {
      window.App.showToast('Please provide an issue title.', 'error');
      if (titleInput) titleInput.focus();
      return;
    }

    if (!description) {
      window.App.showToast('Please provide a brief description of the issue.', 'error');
      if (descInput) descInput.focus();
      return;
    }

    // Default sample photo if resident didn't upload one
    if (this.formData.photos.length === 0) {
      let defaultImg = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
      if (this.formData.category === 'Streetlight') defaultImg = 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80';
      if (this.formData.category === 'Waste') defaultImg = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80';
      if (this.formData.category === 'Water') defaultImg = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';
      this.formData.photos.push(defaultImg);
    }

    const user = window.Auth.getCurrentUser();
    const routing = window.RoutingEngine.resolveRouting(this.formData.category, this.formData.isHazard, this.formData.priority);

    const newIssue = window.CivicDB.createIssue({
      reporter_id: user ? user.id : 'usr-res-1',
      reporter_name: user ? user.name : 'Resident',
      category: this.formData.category,
      title: title,
      description: description,
      latitude: this.formData.latitude,
      longitude: this.formData.longitude,
      address: this.formData.address,
      city: this.formData.city || (user ? user.city : 'India'),
      ward_id: this.formData.ward_id || (user ? user.ward_id : 'ward-1'),
      ward_name: this.formData.ward_name || (user ? user.area : 'General Area'),
      priority: routing.priority,
      assigned_department: routing.departmentId,
      photos: this.formData.photos
    });

    window.App.showToast(`Report #${newIssue.id} submitted! Auto-routed to ${routing.departmentName}.`, 'success');
    this.close();

    // Trigger dashboard updates
    window.dispatchEvent(new CustomEvent('civic:issue-created', { detail: { issue: newIssue } }));

    // Open detail
    setTimeout(() => {
      window.IssueDetailView.open(newIssue.id);
    }, 400);
  }
}

window.IssueReportWizard = IssueReportWizard;
