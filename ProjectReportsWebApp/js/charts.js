// charts.js
let reportChartInstance = null;

function updateChart(filtered) {
  // filtered: array of rows from sheet
  const statusCount = { "Completed": 0, "In Progress": 0, "Delayed": 0 };

  (filtered || []).forEach(r => {
    const status = r[6] || "";
    if (statusCount.hasOwnProperty(status)) {
      statusCount[status] += 1;
    }
  });

  const ctx = document.getElementById("reportChart").getContext("2d");
  if (reportChartInstance) reportChartInstance.destroy();

  reportChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(statusCount),
      datasets: [{
        label: 'Number of Tasks',
        data: Object.values(statusCount),
        backgroundColor: ['#4CAF50','#FFC107','#F44336']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Task Status Overview' }
      },
      scales: {
        y: { beginAtZero: true, precision: 0 }
      }
    }
  });
}
