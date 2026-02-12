const feedbackBtn = document.getElementById("feedbackBtn");
const modal = document.getElementById("feedbackModal");
const closeBtn = document.querySelector(".close");
const stars = document.querySelectorAll(".star");
const submitBtn = document.getElementById("submitFeedback");
const thankYou = document.getElementById("thankYouMessage");
const testimonials = document.getElementById("testimonials");
const avgRatingEl = document.getElementById("avgRating");

let selectedRating = 0;

// Prevent multiple submissions
if (localStorage.getItem("feedbackSubmitted")) feedbackBtn.style.display = "none";

// Show modal
feedbackBtn.addEventListener("click", () => modal.style.display = "flex");
closeBtn.addEventListener("click", () => modal.style.display = "none");

// Star rating logic
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = star.getAttribute("data-value");
    stars.forEach(s => s.classList.remove("active"));
    for (let i = 0; i < selectedRating; i++) stars[i].classList.add("active");
  });
});

// Fetch and display live average rating
function updateAvgRating() {
  fetch("https://script.google.com/macros/s/AKfycbzU1GyxPLm9t69fEtOIX0p2JuyLpPUHyBgbO296ocDKCRlFipU43vEPjzxHhZPKFYE1PQ/exec")
    .then(res => res.json())
    .then(data => avgRatingEl.innerText = data.average)
    .catch(err => console.error("Avg Rating fetch error:", err));
}
updateAvgRating();
setInterval(updateAvgRating, 30000); // update every 30s

// Submit feedback
submitBtn.addEventListener("click", () => {
  if (selectedRating == 0) { alert("Please select a star rating."); return; }

  const name = document.getElementById("name").value || "Anonymous";
  const comment = document.getElementById("comment").value || "";
  const recommendationElement = document.querySelector('input[name="recommend"]:checked');
  const recommendation = recommendationElement ? recommendationElement.value : "Not Selected";

  const data = {
    name,
    rating: selectedRating,
    comment,
    recommendation,
    page: window.location.href,
    timestamp: new Date().toISOString()
  };

  fetch("https://script.google.com/macros/s/AKfycbzU1GyxPLm9t69fEtOIX0p2JuyLpPUHyBgbO296ocDKCRlFipU43vEPjzxHhZPKFYE1PQ/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {"Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(response => {
    if(response.result === "success") {
      localStorage.setItem("feedbackSubmitted", "true");
      thankYou.classList.remove("hidden");

      // Add testimonial if 4-5 stars
      if(Number(selectedRating) >= 4 && comment.trim()) {
        const div = document.createElement("div");
        div.className = "testimonial";
        div.innerHTML = `<strong>${name}</strong>: ${comment}`;
        testimonials.appendChild(div);
      }

      setTimeout(() => {
        modal.style.display = "none";
        feedbackBtn.style.display = "none";
      }, 2000);

      updateAvgRating();
    } else {
      alert("Error from server: " + (response.message || "Unknown"));
      console.error(response);
    }
  })
  .catch(error => {
    console.error("Fetch error:", error);
    alert("Network or server error. Please try again.");
  });
});
