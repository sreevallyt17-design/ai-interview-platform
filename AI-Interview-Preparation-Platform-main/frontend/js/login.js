// Show/Hide Forms Functions
function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "none";
  document.getElementById("resetPasswordForm").style.display = "none";
}

function showSignup() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("forgotPasswordForm").style.display = "none";
  document.getElementById("resetPasswordForm").style.display = "none";
}

function showForgotPassword() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "block";
  document.getElementById("resetPasswordForm").style.display = "none";
}

function showResetPasswordForm() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "none";
  document.getElementById("resetPasswordForm").style.display = "block";
}

// Login Function
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save token and user info
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    // Redirect
    alert("✅ Login successful!");
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Login error:", error);
    alert("Server not responding. Please try again later.");
  }
}

// Signup Function
async function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (name.length < 2) {
    alert("Name must be at least 2 characters");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("✅ Account created successfully! Please login.");
    
    // Clear form
    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupConfirmPassword").value = "";
    
    // Show login form
    showLogin();

  } catch (error) {
    console.error("Signup error:", error);
    alert("Server not responding. Please try again later.");
  }
}

// Forgot Password Function
async function sendResetEmail() {
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to send reset link");
      return;
    }

    alert("✅ Password reset instructions sent!");
    
    // For demo purposes (no real email service)
    if (data.resetToken) {
      localStorage.setItem('resetToken', data.resetToken);
      localStorage.setItem('resetEmail', email);
      showResetPasswordForm();
    } else {
      showLogin();
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Server not responding. Please try again later.");
  }
}

// Reset Password Function
async function updatePassword() {
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmNewPassword").value.trim();
  const resetToken = localStorage.getItem('resetToken');
  const email = localStorage.getItem('resetEmail');

  if (!newPassword || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        email,
        resetToken,
        newPassword 
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to reset password");
      return;
    }

    alert("✅ Password updated successfully! Please login.");
    
    // Clear reset data
    localStorage.removeItem('resetToken');
    localStorage.removeItem('resetEmail');
    
    // Clear form
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";
    
    showLogin();

  } catch (error) {
    console.error("Error:", error);
    alert("Server not responding. Please try again later.");
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const resetBtn = document.getElementById("resetBtn");
  const updatePasswordBtn = document.getElementById("updatePasswordBtn");

  if (loginBtn) loginBtn.addEventListener("click", login);
  if (signupBtn) signupBtn.addEventListener("click", signup);
  if (resetBtn) resetBtn.addEventListener("click", sendResetEmail);
  if (updatePasswordBtn) updatePasswordBtn.addEventListener("click", updatePassword);

  // Enter key support for all inputs
  const allInputs = document.querySelectorAll('input');
  allInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const form = input.closest('.login-container');
        if (form.id === 'loginForm') login();
        else if (form.id === 'signupForm') signup();
        else if (form.id === 'forgotPasswordForm') sendResetEmail();
        else if (form.id === 'resetPasswordForm') updatePassword();
      }
    });
  });
});