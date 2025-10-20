// login.js
const SHEET_URL = "https://script.google.com/macros/s/AKfycbybfj615KXvcYyb3I1FgyPN1DM9glVLLSefaoSDEVmgWoebtNmBosOKukzmrqOiVtGDbQ/exec";

document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = (document.getElementById("username").value || "").trim();
  const password = (document.getElementById("password").value || "").trim();
  const msg = document.getElementById("message");
  msg.innerText = "";

  if (!username || !password) {
    msg.innerText = "Enter username and password.";
    return;
  }

  try {
    const res = await fetch(`${SHEET_URL}?action=getUsers&ts=${Date.now()}`);

    const users = await res.json();
    // users is an array of rows: [username, password, role, region, project]
    const user = users.find(u => u[0] === username && u[1] === password);
    if (user) {
      const role = user[2];
      const region = user[3];
      const project = user[4];
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      localStorage.setItem("region", region);
      localStorage.setItem("project", project);
      if (role === "Coordinator") {
        window.location.href = "coordinator.html";
      } else {
        window.location.href = "boss.html";
      }
    } else {
      msg.innerText = "Invalid username or password.";
    }
  } catch (err) {
    console.error("Login error:", err);
    msg.innerText = "Connection error. Try again.";
  }
});
