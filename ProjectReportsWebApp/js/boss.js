// boss.js
const SHEET_URL = "https://script.google.com/macros/s/AKfycbybfj615KXvcYyb3I1FgyPN1DM9glVLLSefaoSDEVmgWoebtNmBosOKukzmrqOiVtGDbQ/exec";

(function init() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  if (!username || role !== "Boss") {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("user").innerText = username;
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("viewReportsBtn").addEventListener("click", fetchReports);
  document.getElementById("exportCSVBtn").addEventListener("click", exportCSV);

  populateBossDropdowns(username);
})();

function logout(){
  localStorage.clear();
  window.location.href = "index.html";
}

async function populateBossDropdowns(username){
  try {
    const res = await fetch(`${SHEET_URL}?action=getBossProjects&username=${encodeURIComponent(username)}`);
    const data = await res.json(); // { regions: [...], projects: [...] }
    const regionSelect = document.getElementById("regionSelect");
    const projectSelect = document.getElementById("projectSelect");

    regionSelect.innerHTML = "";
    projectSelect.innerHTML = "";

    // If empty, put a placeholder
    if (!data || (!data.regions || data.regions.length === 0)) {
      regionSelect.innerHTML = `<option value="">--no regions--</option>`;
    } else {
      const regionsUnique = Array.from(new Set(data.regions));
      regionsUnique.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r;
        opt.innerText = r;
        regionSelect.appendChild(opt);
      });
    }

    if (!data || (!data.projects || data.projects.length === 0)) {
      projectSelect.innerHTML = `<option value="">--no projects--</option>`;
    } else {
      const projsUnique = Array.from(new Set(data.projects));
      projsUnique.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.innerText = p;
        projectSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("populateBossDropdowns error:", err);
    alert("Failed to load boss regions/projects.");
  }
}

async function fetchReports(){
  const type = document.getElementById("typeSelect").value;
  const region = document.getElementById("regionSelect").value;
  const project = document.getElementById("projectSelect").value;

  try {
    const res = await fetch(`${SHEET_URL}?action=getReports`);
    const reports = await res.json(); // each row: [date, region, project, coordinator, type, task, status, notes]
    const filtered = reports.filter(r => {
      const matchRegion = region ? r[1] === region : true;
      const matchProject = project ? r[2] === project : true;
      const matchType = type ? r[4] === type : true;
      return matchRegion && matchProject && matchType;
    });

    populateReportsTable(filtered);
    // update chart
    if (typeof updateChart === "function") {
      updateChart(filtered);
    }
  } catch (err) {
    console.error("fetchReports error:", err);
    alert("Failed to fetch reports.");
  }
}

function populateReportsTable(filtered){
  const tbody = document.querySelector("#reportsTable tbody");
  tbody.innerHTML = "";
  if (!filtered || filtered.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="text-align:center;">No reports found</td>`;
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach(r => {
    const date = r[0] || "";
    const coordinator = r[3] || "";
    const task = r[5] || "";
    const status = r[6] || "";
    const notes = r[7] || "";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(date)}</td><td>${escapeHtml(coordinator)}</td><td>${escapeHtml(task)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(notes)}</td>`;
    tbody.appendChild(tr);
  });
}

function exportCSV(){
  const rows = document.querySelectorAll("#reportsTable tr");
  if (!rows || rows.length === 0) {
    alert("No table data to export.");
    return;
  }
  const csv = [];
  rows.forEach(row => {
    const cols = row.querySelectorAll("th, td");
    const rowData = [];
    cols.forEach(col => rowData.push(`"${(col.innerText||"").replace(/"/g,'""')}"`));
    csv.push(rowData.join(","));
  });

  const csvFile = new Blob([csv.join("\n")], {type: "text/csv"});
  const downloadLink = document.createElement("a");
  downloadLink.download = "reports.csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// basic HTML escape
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
s