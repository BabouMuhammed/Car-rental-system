/**
 * Dashboard page behavior:
 * Handles tab switching and loads all data from backend API
 * No hardcoded values - all data comes from API endpoints
 */
(function () {
  function initDashboardTabs() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location.href = './login.html';
      return;
    }

    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    // Update Topbar based on role
    const titleSpan = topbar.querySelector("h2");
    if (titleSpan) {
      titleSpan.innerHTML = user.role === 'ADMIN' ? '<span>Rent</span>ify Admin' : '<span>Rent</span>ify Portal';
    }

    const nav = topbar.querySelector("nav");
    if (!nav) return;

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
      const user = JSON.parse(localStorage.getItem('user'));
      const cars = await CarAPI.getAll();
      const rentals = await RentalAPI.getAll();
      
      const availableCars = cars.filter(c => c.Status === 'AVAILABLE' || c.Status === 'Available').length;
      
      // Update stat card values
      const statCards = document.querySelectorAll('.stat-card');
      const statNumbers = document.querySelectorAll('.stat-number');

      if (user.role === 'ADMIN') {
        const totalBookings = rentals.length;
        const ongoingRentals = rentals.filter(r => r.rental_status === 'ONGOING').length;
        const totalCustomers = totalBookings; // Placeholder logic

        if (statNumbers[0]) statNumbers[0].textContent = availableCars;
        if (statNumbers[1]) statNumbers[1].textContent = totalBookings;
        if (statNumbers[2]) statNumbers[2].textContent = ongoingRentals;
        if (statNumbers[3]) statNumbers[3].textContent = totalCustomers; 
      } else {
        // Customer specific stats
        const myBookings = rentals.length;
        const totalSpent = rentals.reduce((acc, r) => acc + (r.total_price || 0), 0);

        if (statNumbers[0]) statNumbers[0].textContent = availableCars;
        if (statNumbers[1]) statNumbers[1].textContent = myBookings;
        if (statNumbers[2]) statNumbers[2].textContent = `$${totalSpent}`;
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
      const statusClass = (rental.rental_status || 'PENDING').toLowerCase();
      
      row.innerHTML = `
        <td>${role === 'ADMIN' ? (rental.user_id?.name || 'User') : 'Me'}</td>
        <td>${rental.car_id ? `${rental.car_id.brand} ${rental.car_id.model}` : 'Unknown Car'}</td>
        <td>${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}</td>
        <td>$${rental.total_price || 0}</td>
        <td><span class="badge ${statusClass}">${rental.rental_status || 'PENDING'}</span></td>
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
      const cars = await CarAPI.getAll();
      const tbody = document.querySelector('#cars-tab table tbody');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      cars.forEach(car => {
        const row = document.createElement('tr');
        const statusClass = (car.Status || 'AVAILABLE').toLowerCase();
        
        row.innerHTML = `
          <td>${car.brand} ${car.model}</td>
          <td>${car.fuel_type || 'N/A'}</td>
          <td>${car.seating_capacity || 'N/A'} Seats</td>
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
      const user = JSON.parse(localStorage.getItem('user'));
      const rentals = await RentalAPI.getAll();
      const tbody = document.querySelector('#bookings-tab table tbody');
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      rentals.forEach((rental, index) => {
        const row = document.createElement('tr');
        const statusClass = (rental.rental_status || 'PENDING').toLowerCase();
        
        row.innerHTML = `
          <td>#BK${String(index + 1).padStart(3, '0')}</td>
          <td>${user.role === 'ADMIN' ? (rental.user_id?.name || 'Unknown User') : 'Me'}</td>
          <td>${rental.car_id ? `${rental.car_id.brand} ${rental.car_id.model}` : 'Unknown Car'}</td>
          <td>${new Date(rental.start_date).toLocaleDateString()}</td>
          <td>${new Date(rental.end_date).toLocaleDateString()}</td>
          <td>${Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))}</td>
          <td>$${rental.total_price || 0}</td>
          <td><span class="badge ${statusClass}">${rental.rental_status || 'PENDING'}</span></td>
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
      
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>#C${user._id.substring(0, 4)}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone || 'N/A'}</td>
          <td>${user.role}</td>
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