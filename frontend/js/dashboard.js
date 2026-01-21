/**
 * Dashboard page behavior:
 * Handles tab switching and loads all data from backend API
 * No hardcoded values - all data comes from API endpoints
 */
(function () {
  let cachedCars = [];

  function $(selector) {
    return document.querySelector(selector);
  }

  function setText(selectorOrEl, value) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el) el.textContent = value;
  }

  function showEl(el) {
    if (el) el.classList.remove('hidden');
  }

  function hideEl(el) {
    if (el) el.classList.add('hidden');
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  function normalizeStatus(s) {
    const v = String(s || '').toUpperCase();
    if (v === 'AVAILABLE' || v === 'NOT_AVAILABLE') return v;
    if (v === 'NOT AVAILABLE' || v === 'NOT-AVAILABLE') return 'NOT_AVAILABLE';
    return 'AVAILABLE';
  }

  function badgeClassForCarStatus(status) {
    const s = normalizeStatus(status);
    return s === 'AVAILABLE' ? 'available' : 'rented';
  }

  function badgeClassForRentalStatus(status) {
    const s = String(status || 'PENDING').toLowerCase();
    if (s === 'accepted') return 'completed';
    if (s === 'rejected') return 'cancelled';
    return 'upcoming';
  }

  function isValidNumber(n) {
    return typeof n === 'number' && Number.isFinite(n);
  }

  function parseDateToMs(value) {
    if (value == null) return null;
    // Backend stores dates as Number; but some clients may send ISO strings
    if (typeof value === 'number') return value;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  function daysBetweenInclusive(startMs, endMs) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((endMs - startMs) / oneDay)) + 1;
  }

  function initCarModal() {
    const modal = $('#car-modal');
    const closeBtn = $('#car-modal-close');
    const cancelBtn = $('#car-cancel-btn');
    const form = $('#car-form');
    const errorEl = $('#car-form-error');

    function openModal(mode, car) {
      if (!modal || !form) return;
      form.reset();
      hideEl(errorEl);
      $('#car-id').value = car?._id || '';
      $('#car-modal-title').textContent = mode === 'edit' ? 'Edit Car' : 'Add New Car';

      // Prefill on edit
      if (car) {
        $('#car-brand').value = car.brand || '';
        $('#car-model').value = car.model || '';
        $('#car-price').value = car.price_per_day ?? '';
        $('#car-fuel').value = car.fuel_type || '';
        $('#car-status').value = normalizeStatus(car.Status);
        $('#car-seats').value = car.seating_capacity ?? '';
      }

      // Backend doesn't support image update on PUT, so only require image on create
      const imageRow = $('#car-image-row');
      const imageInput = $('#car-image');
      if (mode === 'edit') {
        if (imageRow) imageRow.style.display = 'none';
        if (imageInput) imageInput.required = false;
      } else {
        if (imageRow) imageRow.style.display = '';
        if (imageInput) imageInput.required = true;
      }

      modal.setAttribute('aria-hidden', 'false');
      showEl(modal);
    }

    function closeModal() {
      if (!modal) return;
      modal.setAttribute('aria-hidden', 'true');
      hideEl(modal);
    }

    // Expose for other handlers
    window.__openCarModal = openModal;
    window.__closeCarModal = closeModal;

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close when clicking backdrop
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideEl(errorEl);

        const id = $('#car-id').value.trim();
        const brand = $('#car-brand').value.trim();
        const model = $('#car-model').value.trim();
        const price = Number($('#car-price').value);
        const fuel = $('#car-fuel').value;
        const status = $('#car-status').value;
        const seats = Number($('#car-seats').value);

        if (!brand || !model || !fuel || !status || !isValidNumber(price) || !isValidNumber(seats)) {
          errorEl.textContent = 'Please fill all fields with valid values.';
          showEl(errorEl);
          return;
        }

        try {
          if (id) {
            await CarAPI.update(id, {
              brand,
              model,
              price_per_day: price,
              fuel_type: fuel,
              Status: status,
              seating_capacity: seats,
            });
          } else {
            const imageInput = $('#car-image');
            const file = imageInput?.files?.[0];
            if (!file) {
              errorEl.textContent = 'Please choose an image.';
              showEl(errorEl);
              return;
            }

            const fd = new FormData();
            fd.append('brand', brand);
            fd.append('model', model);
            fd.append('price_per_day', String(price));
            fd.append('fuel_type', fuel);
            fd.append('Status', status);
            fd.append('seating_capacity', String(seats));
            fd.append('image', file);

            await CarAPI.create(fd);
          }

          closeModal();
          await loadTabData('cars');
          await loadTabData('dashboard');
        } catch (error) {
          errorEl.textContent = error?.message || 'Failed to save car.';
          showEl(errorEl);
        }
      });
    }
  }

  function initDashboardTabs() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location.href = './login.html';
      return;
    }

    const header = document.querySelector(".header");
    if (!header) return;

    // Update Topbar based on role
    const titleSpan = header.querySelector("h2");
    if (titleSpan) {
      titleSpan.innerHTML = user.role === 'ADMIN' ? '<span>Rent</span>ify Admin' : '<span>Rent</span>ify Portal';
    }

    const nav = header.querySelector("nav");
    if (!nav) return;

    // Update welcome text
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText) {
        welcomeText.textContent = user.role === 'ADMIN' ? 'Admin Dashboard' : 'User Portal';
    }

    const userRoleName = document.getElementById('userRoleName');
    if (userRoleName) {
        userRoleName.textContent = user.role === 'ADMIN' ? 'Admin' : user.firstName || 'User';
    }

    // Hide admin-only tabs for customers
    if (user.role !== 'ADMIN') {
      const adminTabs = nav.querySelectorAll('a[data-tab="cars"], a[data-tab="customers"]');
      adminTabs.forEach(tab => tab.style.display = 'none');
      
      // Update stats headers for customers
      const statTitles = document.querySelectorAll('.stat-card h3');
      const statCards = document.querySelectorAll('.stat-card');
      if (statTitles[0]) statTitles[0].textContent = 'Available Cars';
      if (statTitles[1]) statTitles[1].textContent = 'My Bookings';
      if (statTitles[2]) statTitles[2].textContent = 'Total Spent';
      if (statCards[3]) statCards[3].style.display = 'none'; // Hide "Total Customers" card
    }

    const links = Array.from(nav.querySelectorAll("a[data-tab]"));
    if (!links.length) return;

    // Get all tab content divs
    const tabContents = document.querySelectorAll(".tab-content");

    function showTab(tabName) {
      // Hide all tabs
      tabContents.forEach(tab => {
        tab.classList.add("hidden");
      });

      // Show the selected tab
      const selectedTab = document.getElementById(tabName + "-tab");
      if (selectedTab) {
        selectedTab.classList.remove("hidden");
        
        // Load data for this tab from backend
        loadTabData(tabName);
      }

      // Update active link
      links.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-tab") === tabName) {
          link.classList.add("active");
        }
      });
    }

    function handleHashChange() {
      const hash = (window.location.hash || "").replace("#", "").toLowerCase();
      const tabName = hash || "dashboard";
      showTab(tabName);
    }

    // Tab click handlers
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = link.getAttribute("data-tab");
        if (tab) {
          window.location.hash = tab;
          showTab(tab);
        }
      });
    });

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Initial load
    handleHashChange();

    // Add logout functionality
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
          AuthAPI.logout();
          window.location.href = "./login.html";
        }
      });
    }

    // Add action button handlers
    const actionBtns = document.querySelectorAll(".action-btn");
    actionBtns.forEach(btn => {
      btn.addEventListener("click", function() {
        const action = this.textContent.trim();
        const row = this.closest("tr");
        if (row) {
          const data = Array.from(row.querySelectorAll("td")).map(td => td.textContent);
          console.log(`${action} action for:`, data);
        }
      });
    });

    // Add filter functionality
    const filterBtn = document.querySelector(".filter-btn");
    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        const searchInput = document.querySelector(".search-input");
        const filterSelect = document.querySelector(".filter-select");
        
        if (searchInput && filterSelect) {
          console.log("Search:", searchInput.value);
          console.log("Filter:", filterSelect.value);
        }
      });
    }

    // Add new car button handler
    const addBtn = document.querySelector(".add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (user.role !== 'ADMIN') return;
        if (window.__openCarModal) window.__openCarModal('create');
      });
    }

    // Modal init
    initCarModal();
  }

  async function loadTabData(tabName) {
    try {
      switch(tabName) {
        case 'dashboard':
          await loadDashboardStats();
          break;
        case 'cars':
          await loadCarsData();
          break;
        case 'bookings':
          await loadBookingsData();
          break;
        case 'customers':
          await loadCustomersData();
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tabName} data:`, error);
    }
  }

  async function loadDashboardStats() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const cars = await CarAPI.getAll();
      const rentals = await RentalAPI.getAll();
      
      const availableCars = cars.filter(c => normalizeStatus(c.Status) === 'AVAILABLE').length;
      
      // Update stat card values
      const statCards = document.querySelectorAll('.stat-card');
      const statNumbers = document.querySelectorAll('.stat-number');

      if (user.role === 'ADMIN') {
        const totalBookings = rentals.length;
        const accepted = rentals.filter(r => (r.rental_status || 'PENDING') === 'ACCEPTED').length;
        const pending = rentals.filter(r => (r.rental_status || 'PENDING') === 'PENDING').length;
        const rejected = rentals.filter(r => (r.rental_status || 'PENDING') === 'REJECTED').length;

        let totalCustomers = '—';
        try {
          const users = await UserAPI.getAll();
          totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;
        } catch (e) {
          // If token/role doesn't allow, just show dash instead of wrong hardcoded value
          totalCustomers = '—';
        }

        if (statNumbers[0]) statNumbers[0].textContent = availableCars;
        if (statNumbers[1]) statNumbers[1].textContent = totalBookings;
        if (statNumbers[2]) statNumbers[2].textContent = accepted;
        if (statNumbers[3]) statNumbers[3].textContent = totalCustomers; 

        // Update status counts in right panel
        const acceptedEl = document.querySelector('.status-list .count[data-status="ACCEPTED"]');
        const pendingEl = document.querySelector('.status-list .count[data-status="PENDING"]');
        const rejectedEl = document.querySelector('.status-list .count[data-status="REJECTED"]');
        if (acceptedEl) acceptedEl.textContent = accepted;
        if (pendingEl) pendingEl.textContent = pending;
        if (rejectedEl) rejectedEl.textContent = rejected;
      } else {
        // Customer specific stats
        const myBookings = rentals.length; // backend already filters rentals by user for non-admin
        const totalSpent = rentals.reduce((acc, r) => acc + (r.total_price || 0), 0);

        if (statNumbers[0]) statNumbers[0].textContent = availableCars;
        if (statNumbers[1]) statNumbers[1].textContent = myBookings;
        if (statNumbers[2]) statNumbers[2].textContent = `$${totalSpent}`;

        // Status counts for customer
        const accepted = rentals.filter(r => (r.rental_status || 'PENDING') === 'ACCEPTED').length;
        const pending = rentals.filter(r => (r.rental_status || 'PENDING') === 'PENDING').length;
        const rejected = rentals.filter(r => (r.rental_status || 'PENDING') === 'REJECTED').length;
        const acceptedEl = document.querySelector('.status-list .count[data-status="ACCEPTED"]');
        const pendingEl = document.querySelector('.status-list .count[data-status="PENDING"]');
        const rejectedEl = document.querySelector('.status-list .count[data-status="REJECTED"]');
        if (acceptedEl) acceptedEl.textContent = accepted;
        if (pendingEl) pendingEl.textContent = pending;
        if (rejectedEl) rejectedEl.textContent = rejected;
      }

      // Load latest bookings into the dashboard table
      loadLatestBookings(rentals, user.role);
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  function loadLatestBookings(rentals, role) {
    const tbody = document.querySelector('.dashboard .panel.full-width table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Show last 5 bookings
    const latest = rentals.slice(-5).reverse();

    latest.forEach(rental => {
      const row = document.createElement('tr');
      const statusClass = badgeClassForRentalStatus(rental.rental_status);
      const startMs = parseDateToMs(rental.start_date);
      const endMs = parseDateToMs(rental.end_date);
      
      row.innerHTML = `
        <td>${role === 'ADMIN' ? escapeHtml(rental.user_id?.name || 'User') : 'Me'}</td>
        <td>${rental.car_id && rental.car_id.brand ? escapeHtml(`${rental.car_id.brand} ${rental.car_id.model}`) : escapeHtml(String(rental.car_id || 'Unknown Car'))}</td>
        <td>${startMs ? new Date(startMs).toLocaleDateString() : '—'} - ${endMs ? new Date(endMs).toLocaleDateString() : '—'}</td>
        <td>$${rental.total_price || 0}</td>
        <td><span class="badge ${statusClass}">${escapeHtml(rental.rental_status || 'PENDING')}</span></td>
        <td>
          ${role === 'ADMIN' && rental.rental_status === 'PENDING' ? 
            `<button class="action-btn accept" onclick="handleRentalStatus('${rental._id}', 'accept')">Accept</button>
             <button class="action-btn reject" onclick="handleRentalStatus('${rental._id}', 'reject')">Reject</button>` : 
            `<button class="action-btn view">View</button>`
          }
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Global handler for rental status (for admin)
  window.handleRentalStatus = async (id, action) => {
    try {
      if (action === 'accept') {
        await RentalAPI.accept(id);
      } else {
        await RentalAPI.reject(id);
      }
      loadTabData('dashboard');
      loadTabData('bookings');
    } catch (error) {
      alert('Error updating rental: ' + error.message);
    }
  }

  async function loadCarsData() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const cars = await CarAPI.getAll();
      cachedCars = Array.isArray(cars) ? cars : [];
      const tbody = document.querySelector('#cars-tab table tbody');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      cars.forEach(car => {
        const row = document.createElement('tr');
        const statusClass = badgeClassForCarStatus(car.Status);
        
        row.innerHTML = `
          <td>${escapeHtml(`${car.brand || ''} ${car.model || ''}`.trim() || '—')}</td>
          <td>${escapeHtml(car.fuel_type || 'N/A')}</td>
          <td>${escapeHtml(String(car.seating_capacity || 'N/A'))}</td>
          <td>$${car.price_per_day || 0}</td>
          <td><span class="badge ${statusClass}">${escapeHtml(normalizeStatus(car.Status))}</span></td>
          <td>
            ${user?.role === 'ADMIN' ? `
              <button class="action-btn edit" data-car-id="${car._id}">Edit</button>
              <button class="action-btn delete" data-car-id="${car._id}">Delete</button>
            ` : `<button class="action-btn view" data-car-id="${car._id}">View</button>`}
          </td>
        `;
        tbody.appendChild(row);
      });

      // Attach handlers (event delegation)
      tbody.onclick = async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const carId = btn.getAttribute('data-car-id');
        if (!carId) return;

        if (btn.classList.contains('edit')) {
          const car = cachedCars.find(c => c._id === carId);
          if (window.__openCarModal) window.__openCarModal('edit', car);
          return;
        }

        if (btn.classList.contains('delete')) {
          if (!confirm('Delete this car?')) return;
          try {
            await CarAPI.delete(carId);
            await loadTabData('cars');
            await loadTabData('dashboard');
          } catch (error) {
            alert('Failed to delete car: ' + (error?.message || 'Unknown error'));
          }
          return;
        }
      };
      
    } catch (error) {
      console.error('Error loading cars data:', error);
    }
  }

  async function loadBookingsData() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const rentals = await RentalAPI.getAll();
      const tbody = document.querySelector('#bookings-tab table tbody');
      const countEl = document.querySelector('.booking-count');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      if (countEl) countEl.textContent = `Total: ${rentals.length}`;
      
      rentals.forEach((rental, index) => {
        const row = document.createElement('tr');
        const statusClass = badgeClassForRentalStatus(rental.rental_status);
        const startMs = parseDateToMs(rental.start_date);
        const endMs = parseDateToMs(rental.end_date);
        const totalDays = (startMs != null && endMs != null) ? daysBetweenInclusive(startMs, endMs) : '—';
        
        row.innerHTML = `
          <td>#BK${String(index + 1).padStart(3, '0')}</td>
          <td>${user.role === 'ADMIN' ? escapeHtml(rental.user_id?.name || 'Unknown User') : 'Me'}</td>
          <td>${rental.car_id && rental.car_id.brand ? escapeHtml(`${rental.car_id.brand} ${rental.car_id.model}`) : escapeHtml(String(rental.car_id || 'Unknown Car'))}</td>
          <td>${startMs ? new Date(startMs).toLocaleDateString() : '—'}</td>
          <td>${endMs ? new Date(endMs).toLocaleDateString() : '—'}</td>
          <td>${totalDays}</td>
          <td>$${rental.total_price || 0}</td>
          <td><span class="badge ${statusClass}">${escapeHtml(rental.rental_status || 'PENDING')}</span></td>
          <td>
            ${user.role === 'ADMIN' && rental.rental_status === 'PENDING' ? 
              `<button class="action-btn accept" onclick="handleRentalStatus('${rental._id}', 'accept')">Accept</button>
               <button class="action-btn reject" onclick="handleRentalStatus('${rental._id}', 'reject')">Reject</button>` : 
              `<button class="action-btn view">View Details</button>`
            }
          </td>
        `;
        tbody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error loading bookings data:', error);
    }
  }

  async function loadCustomersData() {
    try {
      const users = await UserAPI.getAll();
      const tbody = document.querySelector('#customers-tab table tbody');
      const countEl = document.querySelector('.customer-count');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      if (countEl) countEl.textContent = `Total: ${users.length}`;
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>#C${user._id.substring(0, 4)}</td>
          <td>${escapeHtml(user.name || '—')}</td>
          <td>${escapeHtml(user.email || '—')}</td>
          <td>${escapeHtml(user.phone || 'N/A')}</td>
          <td>${escapeHtml(user.role || '—')}</td>
          <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
          <td><span class="badge active">Active</span></td>
          <td><button class="action-btn view">View Profile</button></td>
        `;
        tbody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error loading customers data:', error);
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardTabs);
  } else {
    initDashboardTabs();
  }
})();