async function loadAnalytics() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${API_BASE}/api/analytics/dashboard`, // Changed from 'overview' to 'dashboard'
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    // Check if you have an 'output' element, otherwise use console
    const outputEl = document.getElementById("output");
    if (outputEl) {
      outputEl.innerText = JSON.stringify(data, null, 2);
    } else {
      console.log("Analytics data:", data);
    }
  } catch (error) {
    console.error("Error loading analytics:", error);
    const outputEl = document.getElementById("output");
    if (outputEl) {
      outputEl.innerText = `Error: ${error.message}`;
    }
  }
}

loadAnalytics();