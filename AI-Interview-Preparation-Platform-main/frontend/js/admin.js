const API = API_BASE_URL;

// Fetch admin statistics
async function fetchAdminStats() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found");
    window.location.href = "login.html";
    return;
  }

  try {
    console.log("Fetching admin data...");

    const usersRes = await fetch(`${API}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!usersRes.ok) {
      throw new Error(`Users fetch failed: ${usersRes.status}`);
    }

    const users = await usersRes.json();

    const interviewsRes = await fetch(`${API}/api/admin/interviews`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!interviewsRes.ok) {
      throw new Error(`Interviews fetch failed: ${interviewsRes.status}`);
    }

    const interviews = await interviewsRes.json();

    updateStats(users, interviews);
    populateUsersTable(users.slice(0, 10));
    populateInterviewsTable(interviews.slice(0, 10));

  } catch (error) {
    console.error("Error fetching admin data:", error);
    showError(error.message);
  }
}
function populateUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name || 'N/A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td><span class="role-badge">${user.role || 'candidate'}</span></td>
      <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button class="btn-view" onclick="viewUser('${user._id}')">View</button>
        <button class="btn-delete" onclick="deleteUser('${user._id}', '${user.name}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function populateInterviewsTable(interviews) {
  const tbody = document.getElementById('interviewsTableBody');

  if (interviews.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">No interviews found</td></tr>';
    return;
  }

  tbody.innerHTML = interviews.map(interview => {
    const candidateName = interview.user?.name || interview.user?.email || 'Unknown';
    const status = interview.status || 'pending';
    const statusClass = `status-${status.replace('-', '')}`;

    return `
      <tr>
        <td>${candidateName}</td>
        <td>${interview.jobRole || interview.role || 'N/A'}</td>
        <td>${interview.difficulty || interview.level || 'N/A'}</td>
        <td><strong>${interview.overallScore ?? 'N/A'}</strong></td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>${interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

function viewUser(userId) {
  alert(`View user details: ${userId}\n\nThis feature will show detailed user information.`);
}

async function deleteUser(userId, userName) {
  if (!confirm(`⚠️ Are you sure you want to delete "${userName}"?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      alert('✅ User deleted successfully');
      fetchAdminStats();
    } else {
      const error = await res.json();
      alert(`❌ Failed: ${error.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert(`❌ Error: ${error.message}`);
  }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("Admin dashboard loaded");
  fetchAdminStats();
});

function updateStats(users, interviews) {
  document.getElementById("totalUsers").textContent = users.length;
  document.getElementById("totalInterviews").textContent = interviews.length;

  const completed = interviews.filter(i => i.status === "completed").length;
  document.getElementById("completedInterviews").textContent = completed;

  const scored = interviews.filter(i => i.overallScore != null);

  const avgScore = scored.length
    ? (scored.reduce((sum, i) => sum + i.overallScore, 0) / scored.length).toFixed(1)
    : 0;

  document.getElementById("avgScore").textContent = avgScore;
}

function showError(message) {
  document.getElementById("usersTableBody").innerHTML =
    `<tr><td colspan="5" style="color:red;text-align:center;">❌ ${message}</td></tr>`;

  document.getElementById("interviewsTableBody").innerHTML =
    `<tr><td colspan="6" style="color:red;text-align:center;">❌ ${message}</td></tr>`;
}
