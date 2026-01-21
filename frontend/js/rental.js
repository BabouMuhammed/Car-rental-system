/**
 * Rental Booking Handler
 * Manages car rental booking logic and payment
 * All data comes from backend API and user session
 */

(function () {
  let selectedCarData = null;

  function initRentalForm() {
    const rentalForm = document.getElementById('rentalForm');
    if (!rentalForm) return;

    // Check authentication
    if (!AuthAPI.isAuthenticated()) {
      window.location.href = './login.html';
      return;
    }

    // Load current user data
    const currentUser = AuthAPI.getCurrentUser();
    if (!currentUser) {
      window.location.href = './login.html';
      return;
    }

    // Pre-fill user information
    document.getElementById('fullName').value = currentUser.name || '';
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('email').value = currentUser.email || '';

    // Load selected car from session storage
    const carData = sessionStorage.getItem('selectedCar');
    if (carData) {
      selectedCarData = JSON.parse(carData);
      
      // Update form with car info from backend data
      document.getElementById('car_id').value = selectedCarData.carId;
      document.getElementById('price_per_day').value = selectedCarData.price;
      
      // Display car image
      if (selectedCarData.imageUrl) {
        document.getElementById('carImage').src = selectedCarData.imageUrl;
      }
      
      // Update price display
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(selectedCarData.price);
      document.getElementById('carPrice').innerHTML = `${formattedPrice} <span>PER DAY</span>`;
    } else {
      // No car selected, redirect to listings
      window.location.href = './listings.html';
      return;
    }

    // Handle date change to calculate total price
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');

    const calculatePrice = () => {
      if (startDateInput.value && endDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (startDate < endDate) {
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const totalPrice = diffDays * selectedCarData.price;

          document.getElementById('total_price').value = totalPrice;
          
          const formattedTotal = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(totalPrice);
          document.getElementById('totalCost').textContent = formattedTotal;
        }
      }
    };

    startDateInput.addEventListener('change', calculatePrice);
    endDateInput.addEventListener('change', calculatePrice);

    // Handle form submission
    rentalForm.addEventListener('submit', handleBookingSubmit);
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();

    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    const totalPrice = document.getElementById('total_price').value;
    const carId = document.getElementById('car_id').value;
    const submitBtn = document.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');

    // Reset messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validation
    if (!startDate || !endDate || !totalPrice || !carId) {
      showError(errorDiv, 'Please fill in all required fields');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showError(errorDiv, 'End date must be after start date');
      return;
    }

    if (new Date(startDate) < new Date()) {
      showError(errorDiv, 'Start date cannot be in the past');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      const currentUser = AuthAPI.getCurrentUser();
      
      // Create rental booking with backend data only
      const rentalData = {
        // backend uses req.user._id (from auth middleware), no need to pass user_id
        car_id: carId,
        // store dates as milliseconds (backend expects Number)
        start_date: new Date(startDate).getTime(),
        end_date: new Date(endDate).getTime(),
        total_price: parseFloat(totalPrice),
      };

      const rentalResponse = await RentalAPI.create(rentalData);

      // Store rental info in session for payment page
      sessionStorage.setItem('currentRental', JSON.stringify(rentalResponse));
      
      showSuccess(successDiv, 'Rental booked successfully! Redirecting to payment...');
      
      setTimeout(() => {
        window.location.href = './payment.html';
      }, 2000);

    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';

      console.error('Booking error:', error);
      
      if (error.status === 400) {
        showError(errorDiv, error.message || 'Invalid booking details');
      } else if (error.status === 401) {
        showError(errorDiv, 'Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = './login.html';
        }, 1500);
      } else {
        showError(errorDiv, error.message || 'Failed to book car. Please try again.');
      }
    }
  }

  function showError(element, message) {
    element.textContent = message;
    element.className = 'error-message';
    element.style.display = 'block';
  }

  function showSuccess(element, message) {
    element.textContent = message;
    element.className = 'success-message';
    element.style.display = 'block';
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRentalForm);
  } else {
    initRentalForm();
  }
})();
