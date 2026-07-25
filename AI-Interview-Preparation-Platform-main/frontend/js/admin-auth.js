
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
  throw new Error("No token found");
}

// Decode JWT to check role (simple base64 decode)
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
}

const userData = decodeToken(token);

if (!userData) {
  alert("Invalid token. Please login again.");
  localStorage.removeItem("token");
  window.location.href = "login.html";
  throw new Error("Invalid token");
}

if (userData.role !== 'admin') {
  alert("⛔ Admin access only! You don't have permission to view this page.");
  window.location.href = "dashboard.html";
  throw new Error("Not an admin");
}

console.log("✅ Admin authenticated:", userData);

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}