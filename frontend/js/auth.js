/**
 * Authentication Handler
 * Manages login and signup form submissions
 */

(function () {
  // Login Form Handler
  function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorDiv = document.getElementById('errorMessage');
      const loginBtn = document.getElementById('loginBtn');

      // Reset error message
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      // Validate inputs
      if (!email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
      }

      // Disable button during submission
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<div class="btn-content"><div class="loader"></div> <span>Signing in...</span></div>';

      try {
        const response = await AuthAPI.login({
          email,
          password,
        });

        // Show success and redirect
        loginBtn.innerHTML = 'Success!';
        
        // Success - redirect to dashboard or home
        setTimeout(() => {
          window.location.href = './dashboard.html';
        }, 1000);
      } catch (error) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';

        if (error.status === 400) {
          showError(errorDiv, 'Invalid email or password');
        } else if (error.status === 500) {
          showError(errorDiv, error.message || 'User not found');
        } else {
          showError(errorDiv, error.message || 'An error occurred. Please try again.');
        }
      }
    });
  }

  // Signup Form Handler
  function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const address = document.getElementById('address').value.trim();
      const password = document.getElementById('signup-password').value.trim();
      const confirmPassword = document.getElementById('confirm-password').value.trim();
      const errorDiv = document.getElementById('errorMessage');
      const signupBtn = document.getElementById('signupBtn');

      // Reset error message
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      // Validate inputs
      if (!firstName || !lastName || !email || !phone || !address || !password || !confirmPassword) {
        showError(errorDiv, 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        showError(errorDiv, 'Password must be at least 6 characters long');
        return;
      }

      // Disable button during submission
      signupBtn.disabled = true;
      signupBtn.innerHTML = '<div class="btn-content"><div class="loader"></div> <span>Creating Account...</span></div>';

      try {
        const response = await AuthAPI.register({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          address,
          password: password,
        });

        // Success - show message and redirect to login
        signupBtn.innerHTML = 'Account Created!';
        showSuccess(errorDiv, 'Account created successfully! Redirecting to login...');
        
        setTimeout(() => {
          window.location.href = './login.html';
        }, 2000);
      } catch (error) {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Create Account';

        if (error.status === 400) {
          showError(errorDiv, error.message || 'Validation error. Please check your input.');
        } else if (error.status === 500) {
          showError(errorDiv, error.message || 'Email already exists or password is empty');
        } else {
          showError(errorDiv, error.message || 'An error occurred. Please try again.');
        }
      }
    });
  }

  // Helper function to show error message
  function showError(element, message) {
    element.textContent = message;
    element.className = 'error-message';
    element.style.display = 'block';
  }

  // Helper function to show success message
  function showSuccess(element, message) {
    element.textContent = message;
    element.className = 'success-message';
    element.style.display = 'block';
  }

  // Update UI based on auth status
  function updateAuthUI() {
    const isAuthenticated = AuthAPI.isAuthenticated();
    const bookNowBtn = document.getElementById('bookNowBtn');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const dashboardNav = document.getElementById('dashboardNav');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isAuthenticated) {
      // User is logged in - show dashboard and logout
      if (bookNowBtn) bookNowBtn.style.display = 'inline-block';
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';
      if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
      if (dashboardNav) dashboardNav.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
      // User is NOT logged in - show login and signup
      if (bookNowBtn) bookNowBtn.style.display = 'inline-block';
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (signupBtn) signupBtn.style.display = 'inline-block';
      if (dashboardBtn) dashboardBtn.style.display = 'none';
      if (dashboardNav) dashboardNav.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  // Handle logout
  function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthAPI.logout();
      updateAuthUI();
      window.location.href = './login.html';
    });
  }

  // Check if user is already logged in
  function checkAuthStatus() {
    // If on login/signup page and already logged in, redirect to dashboard
    const currentPage = window.location.pathname;
    
    if ((currentPage.includes('login.html') || currentPage.includes('signup.html')) && AuthAPI.isAuthenticated()) {
      window.location.href = './dashboard.html';
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkAuthStatus();
      updateAuthUI();
      initLoginForm();
      initSignupForm();
      initLogout();
    });
  } else {
    checkAuthStatus();
    updateAuthUI();
    initLoginForm();
    initSignupForm();
    initLogout();
  }
})();
