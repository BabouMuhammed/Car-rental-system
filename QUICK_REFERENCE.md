# Quick Reference - Frontend Backend Integration

## 🚀 Quick Start

### 1. Start Backend
```bash
cd car-rental-backend
npm install
npm start
# Backend runs on http://localhost:5000
```

### 2. Update API URL (if needed)
Edit `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000'; // For local testing
// or
const API_BASE_URL = 'https://car-rental-system-backend-qj67.onrender.com'; // Production
```

### 3. Open Frontend
- Open `index.html` in browser
- Or use live server

---

## 📁 File Structure

```
frontend/
├── index.html                    # Home page
├── style.css                     # Main stylesheet
├── js/
│   ├── api.js                   # ✅ API endpoints (no hardcoding)
│   ├── main.js                  # Mobile menu toggle
│   ├── home.js                  # ✅ Home page integration
│   ├── auth.js                  # ✅ Login/signup handlers
│   ├── listings.js              # ✅ Car listings (dynamic)
│   ├── rental.js                # ✅ Booking handler (dynamic)
│   └── dashboard.js             # ✅ Dashboard (dynamic data)
├── pages/
│   ├── login.html               # ✅ Login page
│   ├── signup.html              # ✅ Signup page
│   ├── listings.html            # ✅ Car listings
│   ├── rent.html                # ✅ Booking page
│   ├── dashboard.html           # ✅ Admin dashboard
│   └── about-us.html
└── images/
```

---

## 🔧 API Endpoints Being Used

### Authentication
```javascript
AuthAPI.register(userData)        // POST /auth/register
AuthAPI.login(credentials)        // POST /auth/login
AuthAPI.logout()                  // Clear localStorage
AuthAPI.getCurrentUser()          // Get user from localStorage
AuthAPI.isAuthenticated()         // Check if token exists
```

### Cars
```javascript
CarAPI.getAll()                   // GET /cars - All cars (used in home, listings, dashboard)
CarAPI.getById(carId)             // GET /cars/:id
CarAPI.create(carData)            // POST /cars
CarAPI.update(carId, carData)     // PUT /cars/:id
CarAPI.delete(carId)              // DELETE /cars/:id
```

### Rentals
```javascript
RentalAPI.getAll()                // GET /rentals - All rentals (used in dashboard)
RentalAPI.create(rentalData)      // POST /rentals - Create booking
RentalAPI.getById(rentalId)       // GET /rentals/:id
RentalAPI.updateStatus(...)       // PUT /rentals/:id
RentalAPI.delete(rentalId)        // DELETE /rentals/:id
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
├─────────────────────────────────────────────────────┤
│  index.html → home.js → CarAPI.getAll()            │
│       ↓                       ↓                      │
│   listings.html → listings.js → CarAPI.getAll()    │
│       ↓                       ↓                      │
│   login.html → auth.js → AuthAPI.login()           │
│       ↓                       ↓                      │
│   rent.html → rental.js → RentalAPI.create()       │
│       ↓                       ↓                      │
│   dashboard.html → dashboard.js → CarAPI + RentalAPI
│                                                     │
├─────────────────────────────────────────────────────┤
│                   BACKEND API                       │
├─────────────────────────────────────────────────────┤
│  POST /auth/register          Create user          │
│  POST /auth/login             Authenticate         │
│  GET /cars                    Get all cars         │
│  POST /rentals                Create rental        │
│  GET /rentals                 Get all rentals      │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
1. User enters email & password on login.html
2. Form validation runs
3. AuthAPI.login() sends POST /auth/login
4. Backend returns { message, token, user }
5. Token saved to localStorage.authToken
6. User saved to localStorage.user
7. Auto-redirect to dashboard.html
```

### Protected Pages
```javascript
// Any page needing auth should check:
if (!AuthAPI.isAuthenticated()) {
    window.location.href = './login.html';
}

// Get user data anytime:
const user = AuthAPI.getCurrentUser();
console.log(user.name, user.email, user.phone);
```

---

## 📋 Checklist - No Hardcoded Values

### ✅ Completed
- [x] Remove hardcoded cars from listings.html
- [x] Remove hardcoded prices from rent.html
- [x] Remove hardcoded images from index.html
- [x] Remove hardcoded dashboard stats
- [x] All car data comes from CarAPI
- [x] All rental data comes from RentalAPI
- [x] User info auto-filled from AuthAPI
- [x] Prices calculated dynamically
- [x] Images loaded from backend URLs

### 🔄 In Progress / Optional
- [ ] Payment integration
- [ ] User reviews system
- [ ] User profile management
- [ ] Advanced admin features

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '../utils/cloudinaryUploader'"
**Solution**: This is a backend issue, not frontend. Ensure backend cloudinaryUploader.js exists or update backend code.

### Issue: "AuthAPI is not defined"
**Solution**: Make sure `<script src="js/api.js" defer></script>` is in HTML before other scripts.

### Issue: "CORS error"
**Solution**: Backend CORS settings issue. Check Render deployment settings.

### Issue: "Blank car listings"
**Solution**: 
1. Check backend is running: `console.log(await CarAPI.getAll())`
2. Verify API_BASE_URL is correct
3. Check network tab in DevTools for failed requests

### Issue: "Form not submitting"
**Solution**: Check browser console for JavaScript errors, verify all form IDs match.

---

## 🧪 Testing API Locally

### Test in Browser Console
```javascript
// Test API connection
await HealthAPI.check()

// Get all cars
const cars = await CarAPI.getAll()
console.log(cars)

// Login
const response = await AuthAPI.login({
    email: 'test@example.com',
    password: 'password123'
})
console.log(response)

// Create rental (requires auth)
const rental = await RentalAPI.create({
    user_id: 'userId',
    car_id: 'carId',
    start_date: '2024-01-20',
    end_date: '2024-01-25',
    total_price: 250
})
console.log(rental)
```

---

## 🎯 Key Features

### Home Page (index.html)
- ✅ Dynamic featured cars from CarAPI
- ✅ Book Now button redirects to login if not authenticated
- ✅ Search functionality redirects to listings

### Listings Page (pages/listings.html)
- ✅ All cars from CarAPI.getAll()
- ✅ Filter by brand, fuel type, price
- ✅ Book Now stores car in sessionStorage
- ✅ Disabled booking for unavailable cars

### Rental Page (pages/rent.html)
- ✅ Auto-fills user info from AuthAPI
- ✅ Displays selected car from sessionStorage
- ✅ Calculates total price based on dates
- ✅ Validates dates before submission
- ✅ Creates rental via RentalAPI

### Dashboard (pages/dashboard.html)
- ✅ Real statistics from CarAPI + RentalAPI
- ✅ Car management with all cars from backend
- ✅ Bookings table with real rental data
- ✅ Tab switching with dynamic data loading

---

## 📝 Notes

- All prices use currency formatting: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- All dates use ISO format: `YYYY-MM-DD`
- JWT tokens auto-added to all authenticated requests
- Session storage cleared on page close (for sensitive data)
- LocalStorage persists across sessions (for auth token)

---

**Last Updated**: January 20, 2026
