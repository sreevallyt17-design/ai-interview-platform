//const token = localStorage.getItem("token");
const API = `${API_BASE_URL}/api/analytics`;

async function fetchAnalytics() {
  const res = await fetch(`${API}/dashboard`, {  // ← FIXED HERE
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return res.json();
}

// Fetch data and draw all charts
fetchAnalytics()
  .then(({ data }) => {
    console.log("Analytics data:", data);
    
    // Draw charts
    drawScoreTrend(data.scoresTrend || []);
    drawRoleChart(data.attemptStatistics.byRole || {});
    drawStrengthChart(data.strengthsAndWeaknesses.metrics || {});
  })
  .catch(err => {
    console.error("Error loading charts:", err);
    alert("Failed to load analytics charts");
  });

/* LINE CHART - Score Trend Over Time */
function drawScoreTrend(trend) {
  const ctx = document.getElementById("scoreTrendChart");
  
  if (!ctx) {
    console.error("scoreTrendChart canvas not found");
    return;
  }
  
  new Chart(ctx, {
    type: "line",
    data: {
      labels: trend.map((_, i) => `Attempt ${i + 1}`),
      datasets: [{
        label: "Score",
        data: trend,
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#667eea",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Score Trend Over Time',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: 'Score'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Attempts'
          }
        }
      }
    }
  });
}

/* BAR CHART - Attempts by Role */
function drawRoleChart(byRole) {
  const ctx = document.getElementById("roleChart");
  
  if (!ctx) {
    console.error("roleChart canvas not found");
    return;
  }
  
  const roles = Object.keys(byRole);
  const attempts = Object.values(byRole);
  
  // Generate different colors for each role
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b'
  ];
  
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: roles,
      datasets: [{
        label: "Attempts",
        data: attempts,
        backgroundColor: colors.slice(0, roles.length),
        borderColor: colors.slice(0, roles.length).map(c => c),
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Attempts by Job Role',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Number of Attempts'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Job Roles'
          }
        }
      }
    }
  });
}

/* DOUGHNUT CHART - Strengths vs Weaknesses Metrics */
function drawStrengthChart(metrics) {
  const ctx = document.getElementById("strengthChart");
  
  if (!ctx) {
    console.error("strengthChart canvas not found");
    return;
  }
  
  const labels = Object.keys(metrics);
  const values = Object.values(metrics);
  
  // Colorful palette
  const backgroundColors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#fa709a',
    '#fee140'
  ];
  
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
      datasets: [{
        data: values,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: 'Performance Metrics Breakdown',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value}/10`;
            }
          }
        }
      }
    }
  });
}