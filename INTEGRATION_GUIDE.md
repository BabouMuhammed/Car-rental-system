# Car Rental System - Frontend Backend Integration Guide

## Overview
This guide explains how the frontend is integrated with the backend API and how to use the integration.

---

## Backend API Base URL
```
https://car-rental-system-backend-qj67.onrender.com
```

---

## Files Created for Integration

### 1. **js/api.js** - Main API Module
Contains all API endpoint handlers organized by functionality:
- `AuthAPI` - Authentication endpoints (register, login, logout)
- `CarAPI` - Car management endpoints
- `RentalAPI` - Booking management endpoints
- `UserAPI` - User profile endpoints
- `ReviewAPI` - Review management endpoints
- `PaymentAPI` - Payment processing endpoints
- `HealthAPI` - Health check endpoint

**Usage:**
```javascript
// Example: Login
const response = await AuthAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Example: Get all cars
const cars = await CarAPI.getAll();

// Example: Create rental
const rental = await RentalAPI.create({
  user_id: userId,
  car_id: carId,
  start_date: '2024-01-20',
  end_date: '2024-01-25',
  total_price: 250
});
```

### 2. **js/auth.js** - Authentication Handler
Handles login and signup form submissions with:
- Form validation
- API integration
- Error/success messaging
- Auto-redirect on success/failure
- Auth status checking

### 3. **js/listings.js** - Car Listings Integration
Fetches and displays available cars from backend:
- Fetches all cars via `CarAPI.getAll()`
- Renders car cards dynamically
- Handles booking button clicks
- Stores selected car in session storage

### 4. **js/rental.js** - Rental Booking Handler
Manages car rental booking:
- Calculates rental duration and total price
- Validates booking dates
- Creates rental via API
- Handles payment redirect

---

## Updated Pages

### 1. **pages/login.html**
- Added form ID: `loginForm`
- Added error message display div
- Added API integration scripts

**Form submission:**
```javascript
// User fills in email and password
// Form calls AuthAPI.login()
// Token saved to localStorage
// Redirects to dashboard
```

### 2. **pages/signup.html**
- Added form ID: `signupForm`
- Added error message display div
- Added form validation
- API integration scripts

**Form submission:**
```javascript
// User fills in registration details
// Form calls AuthAPI.register()
// Redirects to login page on success
```

---

## Authentication Flow

### Login Flow
```
1. User enters email and password
2. Form validates inputs
3. AuthAPI.login() sends POST to /auth/login
4. Backend returns JWT token
5. Token stored in localStorage
6. User redirected to dashboard
```

### Signup Flow
```
1. User fills in all registration fields
2. Form validates:
   - All fields filled
   - Passwords match
   - Password >= 6 characters
   - Terms accepted
3. AuthAPI.register() sends POST to /auth/register
4. Backend creates new user
5. User redirected to login page
```

### Authentication Persistence
- JWT token stored in `localStorage` as `authToken`
- User data stored in `localStorage` as `user`
- Automatically added to all API requests via `Authorization: Bearer` header
- Auto-redirect prevents logged-in users from accessing login/signup pages

---

## API Integration Examples

### Example 1: Fetch and Display Cars
```javascript
async function displayCars() {
  try {
    const cars = await CarAPI.getAll();
    // Render cars to page
    cars.forEach(car => {
      // Create and append car element
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
  }
}
```

### Example 2: Create Car Rental
```javascript
async function bookCar() {
  const user = AuthAPI.getCurrentUser();
  
  const rentalData = {
    user_id: user._id,
    car_id: carId,
    start_date: '2024-01-20',
    end_date: '2024-01-25',
    total_price: 250
  };
  
  try {
    const rental = await RentalAPI.create(rentalData);
    console.log('Rental created:', rental);
  } catch (error) {
    console.error('Booking failed:', error);
  }
}
```

### Example 3: Process Payment
```javascript
async function processPayment() {
  const paymentData = {
    rental_id: rentalId,
    amount: totalPrice,
    payment_method: 'credit_card',
    // ... other payment details
  };
  
  try {
    const payment = await PaymentAPI.processPayment(paymentData);
    console.log('Payment successful:', payment);
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
```

---

## Error Handling

All API errors follow this format:
```javascript
{
  status: 400,
  message: "Error description",
  error: "Detailed error information"
}
```

**Global error handler in api.js:**
```javascript
try {
  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message,
      error: data.error
    };
  }
  return data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

---

## LocalStorage Usage

### Stored Items
1. **authToken** - JWT token for authenticated requests
2. **user** - Current user object

### Usage
```javascript
// Get token
const token = localStorage.getItem('authToken');

// Get current user
const user = JSON.parse(localStorage.getItem('user'));

// Check if authenticated
if (AuthAPI.isAuthenticated()) {
  // User is logged in
}

// Logout
AuthAPI.logout(); // Clears both token and user
```

---

## Required HTML Changes

### For Login Page
```html
<form id="loginForm">
  <div id="errorMessage" class="error-message" style="display: none;"></div>
  <input type="email" id="email" name="email" required>
  <input type="password" id="password" name="password" required>
  <button type="submit" id="loginBtn">Sign In</button>
</form>
```

### For Signup Page
```html
<form id="signupForm">
  <div id="errorMessage" class="error-message" style="display: none;"></div>
  <!-- form fields -->
  <button type="submit" id="signupBtn">Create Account</button>
</form>
```

### For Car Listings
```html
<div class="rental-cars">
  <!-- Cars will be rendered here dynamically -->
</div>

<!-- Add this script reference -->
<script src="../js/listings.js" defer></script>
```

### For Rental/Booking
```html
<form id="rentalForm">
  <input type="date" name="start_date" required>
  <input type="date" name="end_date" required>
  <input type="hidden" name="car_id">
  <input type="hidden" name="price_per_day">
  <input type="hidden" name="total_price">
  <button type="submit">Book Now</button>
</form>

<!-- Add this script reference -->
<script src="../js/rental.js" defer></script>
```

---

## Dashboard Integration

The dashboard shows:
- **Tab Navigation**: Dashboard, Manage Cars, Bookings, Customers
- **Statistics**: Available cars, total bookings, ongoing rentals, customers
- **Latest Bookings**: Displays recent bookings with status
- **Car Management**: Add/Edit/Delete cars (admin only)
- **Booking Management**: View, filter, and manage all bookings

**To integrate with API:**
```javascript
// Fetch stats
async function loadDashboardStats() {
  const cars = await CarAPI.getAll();
  const rentals = await RentalAPI.getAll();
  
  updateStatCards(cars.length, rentals.length);
}

// Load on dashboard initialization
window.addEventListener('load', loadDashboardStats);
```

---

## Testing the Integration

### 1. Test Health Check
```javascript
await HealthAPI.check();
// Should return: { status: "Server is running" }
```

### 2. Test Registration
```javascript
const result = await AuthAPI.register({
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  passsword: 'test123'
});
```

### 3. Test Login
```javascript
const result = await AuthAPI.login({
  email: 'test@example.com',
  password: 'test123'
});
// Token will be automatically saved
```

### 4. Test Car Fetching
```javascript
const cars = await CarAPI.getAll();
console.log(cars); // Should show array of cars
```

---

## Common Issues and Solutions

### Issue 1: CORS Error
**Problem**: API requests blocked by CORS
**Solution**: Backend should have CORS enabled. Check Render deployment settings.

### Issue 2: Token Not Persisting
**Problem**: User logged out after page refresh
**Solution**: Check if localStorage is enabled in browser. Make sure `AuthAPI.isAuthenticated()` is called.

### Issue 3: 404 Car Not Found
**Problem**: Individual car endpoints return 404
**Solution**: Make sure backend implements `GET /cars/:id` endpoint.

### Issue 4: Authentication Failing
**Problem**: Login/signup returns error
**Solution**: 
- Check email doesn't already exist for signup
- Verify password matches for login
- Check backend environment variables are set

---

## Next Steps

### To Complete Integration:

1. **Update HTML Files**
   - Add script tags for api.js, auth.js in login/signup pages
   - Add rental.js to rent.html
   - Add listings.js to listings.html

2. **Create Remaining Pages**
   - payment.html - Payment processing
   - user-profile.html - User account management
   - review.html - Car reviews

3. **Implement Dashboard Features**
   - Connect all CRUD operations to API
   - Add real-time data updates
   - Implement admin controls

4. **Add Error Boundaries**
   - Global error handler
   - Network retry logic
   - Graceful degradation

5. **Testing**
   - Test all auth flows
   - Test booking process
   - Test payment flow
   - Test dashboard operations

---

## Environment Setup

Make sure your backend has these environment variables:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3d
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
PORT=5000
```

---

**Last Updated**: January 20, 2026
