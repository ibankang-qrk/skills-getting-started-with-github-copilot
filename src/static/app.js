document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Add loading spinner
  function showLoading() {
    activitiesList.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;padding:30px;">
        <div class="spinner"></div>
      </div>
    `;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    showLoading();
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear dropdown before repopulating
      activitySelect.innerHTML = '<option value="" disabled selected>Select an activity</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <ul class="participants-list">
              ${details.participants.map(email => `<li>${email}</li>`).join("")}
            </ul>
          `;
        } else {
          participantsHTML = `<div class="participants-list none">No participants yet.</div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success message";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error message";
      }

      messageDiv.classList.remove("hidden");
      messageDiv.style.opacity = 0;
      setTimeout(() => {
        messageDiv.style.transition = "opacity 0.4s";
        messageDiv.style.opacity = 1;
      }, 10);

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.style.opacity = 0;
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 400);
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error message";
      messageDiv.classList.remove("hidden");
      messageDiv.style.opacity = 1;
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

// Add spinner CSS
const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `
.spinner {
  border: 4px solid #e3eafc;
  border-top: 4px solid #3949ab;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(spinnerStyle);
