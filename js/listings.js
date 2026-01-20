/**
 * Cars Listing Page Integration
 * Fetches and displays available cars from the backend
 * No hardcoded values - all data comes from API
 */

(function () {
  let allCars = [];

  async function initCarListing() {
    const carList = document.getElementById('carList');
    const filterForm = document.getElementById('filterForm');
    const findCarBtn = document.getElementById('findCarBtn');
    
    if (!carList) return;

    try {
      // Fetch all cars from the backend
      const response = await CarAPI.getAll();
      allCars = response.data || response || [];
      
      // Update subtitle
      const subtitle = document.getElementById('subtitle');
      if (subtitle) {
        subtitle.textContent = `Available for rent - ${allCars.length} cars found`;
      }
      
      renderCars(allCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      showErrorMessage('Failed to load cars. Please try again later.');
    }

    // Setup filter form
    if (filterForm) {
      filterForm.addEventListener('submit', handleFilterSubmit);
    }

    // Setup find car button
    if (findCarBtn) {
      findCarBtn.addEventListener('click', handleFindCar);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();

    const brandFilter = document.getElementById('brand').value.toLowerCase();
    const fuelFilter = document.getElementById('fuel').value;
    const priceFilter = parseFloat(document.getElementById('priceRange').value) || Infinity;

    const filteredCars = allCars.filter(car => {
      const matchBrand = !brandFilter || (car.brand && car.brand.toLowerCase().includes(brandFilter));
      const matchFuel = !fuelFilter || car.fuel_type === fuelFilter;
      const matchPrice = (car.price_per_day || 0) <= priceFilter;

      return matchBrand && matchFuel && matchPrice;
    });

    renderCars(filteredCars);
  }

  function handleFindCar() {
    const userPhone = document.getElementById('userPhone').value.trim();
    const dreamCar = document.getElementById('dreamCar').value.trim();

    if (!userPhone || !dreamCar) {
      alert('Please enter both phone number and car details');
      return;
    }

    // TODO: Send find car request to backend
    console.log('Find car request:', { userPhone, dreamCar });
    alert('We will contact you soon with available options matching your requirements!');
    
    // Clear inputs
    document.getElementById('userPhone').value = '';
    document.getElementById('dreamCar').value = '';
  }

  function renderCars(cars) {
    const container = document.getElementById('carList');
    
    if (!container) {
      console.warn('No car container found');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    if (!cars || cars.length === 0) {
      container.innerHTML = '<p class="no-cars">No cars available matching your criteria</p>';
      return;
    }

    // Create car cards from API data
    cars.forEach(car => {
      const carCard = createCarCard(car);
      container.appendChild(carCard);
    });
  }

  function createCarCard(car) {
    const card = document.createElement('article');
    card.className = 'car-item';
    
    const status = car.Status || 'AVAILABLE';
    const isAvailable = status === 'AVAILABLE';
    
    // Format price with fallback
    const price = car.price_per_day || 0;
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
    
    card.innerHTML = `
      <img src="${car.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${car.brand} ${car.model}">
      <h3>${car.brand || 'Unknown'} ${car.model || 'Model'}</h3>
      <p class="car-meta">
        <span class="fuel-type">⛽ ${car.fuel_type || 'N/A'}</span>
        <span class="seats">👥 ${car.seating_capacity || 5} seats</span>
      </p>
      <p class="price">${formattedPrice} per day</p>
      <p class="status ${status.toLowerCase()}">${status}</p>
      <button class="rent-now" onclick="selectAndBookCar('${car._id}', '${car.brand} ${car.model}', ${price}, '${car.image_url || ''}')" ${!isAvailable ? 'disabled' : ''}>
        ${isAvailable ? 'Book Now' : 'Not Available'}
      </button>
    `;
    
    return card;
  }

  function showErrorMessage(message) {
    const container = document.getElementById('carList');
    if (container) {
      container.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarListing);
  } else {
    initCarListing();
  }
})();

// Global function for booking cars
window.selectAndBookCar = function(carId, carName, price, imageUrl) {
  // Check if user is logged in
  if (!AuthAPI.isAuthenticated()) {
    alert('Please login to book a car');
    window.location.href = './login.html';
    return;
  }

  // Store car info in session for the rent page
  sessionStorage.setItem('selectedCar', JSON.stringify({
    carId,
    carName,
    price,
    imageUrl
  }));

  // Redirect to rent page
  window.location.href = './rent.html';
};
