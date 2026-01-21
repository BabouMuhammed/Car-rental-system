/**
 * Home Page Integration
 * Loads featured cars and integrates with backend
 */

(function () {
  async function initHomePage() {
    try {
      // Load featured cars from backend
      await loadFeaturedCars();
    } catch (error) {
      console.error('Error loading home page data:', error);
    }
  }

  async function loadFeaturedCars() {
    try {
      const cars = await CarAPI.getAll();
      const carsContainer = document.querySelector('.cars-container');
      
      if (!carsContainer) return;
      
      // Get first 4 available cars for featured section
      const featuredCars = cars.filter(c => c.Status === 'AVAILABLE').slice(0, 4);
      
      // Clear existing hardcoded cars
      carsContainer.innerHTML = '';
      
      if (featuredCars.length === 0) {
        carsContainer.innerHTML = '<p>No cars available at the moment</p>';
        return;
      }
      
      // Create car cards from backend data
      featuredCars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
          <div class="model-car-image">
            <img src="${car.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${car.brand} ${car.model}">
          </div>
          <h3>${car.brand} ${car.model}</h3>
          <p class="car-meta">⛽ ${car.fuel_type || 'N/A'}</p>
          <p class="car-price">$${car.price_per_day || 0}/day</p>
        `;
        carsContainer.appendChild(carCard);
      });
      
    } catch (error) {
      console.error('Error loading featured cars:', error);
    }
  }

  // Add event listeners for buttons
  function initEventListeners() {
    // Book now button
    const bookBtn = document.querySelector('a.btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', (e) => {
        if (!AuthAPI.isAuthenticated()) {
          e.preventDefault();
          window.location.href = './pages/login.html';
        }
      });
    }

    // Search button
    const searchBtn = document.querySelector('.search-button');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        window.location.href = './pages/listings.html';
      });
    }

    // Explore button
    const exploreBtn = document.querySelector('.explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './pages/listings.html';
      });
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHomePage();
      initEventListeners();
    });
  } else {
    initHomePage();
    initEventListeners();
  }
})();
