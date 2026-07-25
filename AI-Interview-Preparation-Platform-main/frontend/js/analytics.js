const API_BASE = `${API_BASE_URL}/api/analytics`;


if (token) {
  async function fetchAnalytics() {
    const res = await fetch(`${API_BASE}/dashboard`, {  
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch analytics");
    }

    return res.json();
  }

  fetchAnalytics()
    .then(response => {
      const data = response.data;

      // Overview
      document.getElementById("totalAttempts").innerText = data.overallPerformance.totalAttempts;
      document.getElementById("averageScore").innerText = data.overallPerformance.averageScore;
      document.getElementById("bestScore").innerText = data.overallPerformance.bestScore;
      document.getElementById("worstScore").innerText = data.overallPerformance.worstScore;

      // Strengths
      const strengthsEl = document.getElementById("strengths");
      data.strengthsAndWeaknesses.strengths.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.metric}: ${item.score}`;
        strengthsEl.appendChild(li);
      });

      // Weaknesses
      const weaknessesEl = document.getElementById("weaknesses");
      if (data.strengthsAndWeaknesses.weaknesses && data.strengthsAndWeaknesses.weaknesses.length > 0) {
        data.strengthsAndWeaknesses.weaknesses.forEach(item => {
          const li = document.createElement("li");
          li.innerText = `${item.metric}: ${item.score}`;
          weaknessesEl.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.innerText = "No weaknesses - Great job!";
        weaknessesEl.appendChild(li);
      }

      // Scores by role
      const roleEl = document.getElementById("scoresByRole");
      Object.values(data.scoresByRoleAndLevel).forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.role} (${item.level}) → Avg: ${item.averageScore}`;
        roleEl.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Error loading analytics");
    });
}