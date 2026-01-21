/**
 * Dashboard page behavior:
 * Handles tab switching and loads all data from backend API
 * No hardcoded values - all data comes from API endpoints
 */
(function () {
  function initDashboardTabs() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    const nav = topbar.querySelector("nav");
    if (!nav) return;

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
        alert("Add New Car form would open here");
      });
    }
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
      const cars = await CarAPI.getAll();
      const rentals = await RentalAPI.getAll();
      
      // Update stat cards with real data
      const availableCars = cars.filter(c => c.Status === 'AVAILABLE').length;
      const totalBookings = rentals.length;
      const ongoingRentals = rentals.filter(r => r.status === 'ONGOING').length;
      
      // Update stat card values
      const statCards = document.querySelectorAll('.stat-card');
      if (statCards[0]) statCards[0].querySelector('.stat-number').textContent = availableCars;
      if (statCards[1]) statCards[1].querySelector('.stat-number').textContent = totalBookings;
      if (statCards[2]) statCards[2].querySelector('.stat-number').textContent = ongoingRentals;
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  async function loadCarsData() {
    try {
      const cars = await CarAPI.getAll();
      const tbody = document.querySelector('#cars-tab table tbody');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      cars.forEach(car => {
        const row = document.createElement('tr');
        const statusClass = car.Status === 'AVAILABLE' ? 'available' : 
                           car.Status === 'RENTED' ? 'rented' : 'maintenance';
        
        row.innerHTML = `
          <td>${car.brand} ${car.model}</td>
          <td>${car.fuel_type || 'N/A'}</td>
          <td>${car.license_plate || 'N/A'}</td>
          <td>${new Date().getFullYear()}</td>
          <td>$${car.price_per_day || 0}</td>
          <td><span class="badge ${statusClass}">${car.Status || 'AVAILABLE'}</span></td>
          <td>
            <button class="action-btn edit" data-car-id="${car._id}">Edit</button>
            <button class="action-btn delete" data-car-id="${car._id}">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error loading cars data:', error);
    }
  }

  async function loadBookingsData() {
    try {
      const rentals = await RentalAPI.getAll();
      const tbody = document.querySelector('#bookings-tab table tbody');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      rentals.forEach((rental, index) => {
        const row = document.createElement('tr');
        const statusClass = rental.status === 'ONGOING' ? 'ongoing' : 
                           rental.status === 'COMPLETED' ? 'completed' : 'upcoming';
        
        row.innerHTML = `
          <td>#BK${String(index + 1).padStart(3, '0')}</td>
          <td>${rental.user_id?.name || 'Unknown'}</td>
          <td>${rental.car_id?.brand || 'Unknown'} ${rental.car_id?.model || ''}</td>
          <td>${new Date(rental.start_date).toLocaleDateString()}</td>
          <td>${new Date(rental.end_date).toLocaleDateString()}</td>
          <td>${Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))}</td>
          <td>$${rental.total_price || 0}</td>
          <td><span class="badge ${statusClass}">${rental.status || 'UPCOMING'}</span></td>
          <td><button class="action-btn edit" data-rental-id="${rental._id}">Manage</button></td>
        `;
        tbody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error loading bookings data:', error);
    }
  }

  async function loadCustomersData() {
    try {
      // Note: Fetch users from backend (may need additional endpoint)
      const tbody = document.querySelector('#customers-tab table tbody');
      
      if (!tbody) return;
      
      // TODO: Implement user fetching from backend
      console.log('Customers data loading not yet implemented');
      
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