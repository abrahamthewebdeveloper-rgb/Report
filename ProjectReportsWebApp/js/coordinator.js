// coordinator.js
const SHEET_URL = "https://script.google.com/macros/s/AKfycbybfj615KXvcYyb3I1FgyPN1DM9glVLLSefaoSDEVmgWoebtNmBosOKukzmrqOiVtGDbQ/exec";

(function init() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  if (!username || role !== "Coordinator") {
    // Not logged in as coordinator
    window.location.href = "index.html";
    return;
  }
  document.getElementById("user").innerText = username;
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("submitBtn").addEventListener("click", submitReport);
  // set date to today
  const d = new Date();
  document.getElementById("date").valueAsDate = d;
})();

function logout(){
  localStorage.clear();
  window.location.href = "index.html";
}

async function submitReport(){
  const username = localStorage.getItem("username");
  const region = localStorage.getItem("region");
  const project = localStorage.getItem("project");

  const report = {
    date: document.getElementById("date").value || "",
    region: region || "",
    project: project || "",
    coordinator: username || "",
    type: document.getElementById("type").value,
    task: document.getElementById("task").value.trim(),
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value.trim()
  };

  const msg = document.getElementById("message");
  msg.innerText = "";

  // Basic validation
  if (!report.date || !report.task) {
    msg.innerText = "Please fill date and task/activity.";
    return;
  }

  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({action: "addReport", report})
    });
    const text = await res.text();
    if (text === "Success") {
      msg.style.color = "green";
      msg.innerText = "Report submitted successfully!";
      // clear fields (keep date)
      document.getElementById("task").value = "";
      document.getElementById("notes").value = "";
    } else {
      msg.style.color = "#b00";
      msg.innerText = "Failed to submit. Server response: " + text;
    }
  } catch (err) {
    console.error("Submit error:", err);
    msg.style.color = "#b00";
    msg.innerText = "Error submitting report.";
  }
}
