// Theme configuration - change this value to set the default theme
const DEFAULT_THEME = "light"; // options: 'light' or 'dark'

document.addEventListener("DOMContentLoaded", () => {
  const backendUrl = "http://localhost:3000";
  const healthResult = document.getElementById("healthResult");
  const testResults = document.getElementById("testResults");
  const themeToggle = document.getElementById("themeToggle");
  const testSearch = document.getElementById("testSearch");
  const testStatusFilter = document.getElementById("testStatusFilter");
  const testSummary = document.getElementById("testSummary");
  const viewDbInfoButton = document.getElementById("viewDbInfo");
  const viewAllDbButton = document.getElementById("viewAllDb");
  const viewProdDbButton = document.getElementById("viewProdDb");
  const viewTestDbButton = document.getElementById("viewTestDb");
  const showProdDbButton = document.getElementById("showProdDb");
  const showTestDbButton = document.getElementById("showTestDb");
  const hideDbViewButton = document.getElementById("hideDbView");
  const dbViewerContent = document.getElementById("dbViewerContent");

  let currentTestData = null;
  let lastViewedDb = null;

  // Add event listener for the DB Info button
  viewDbInfoButton.addEventListener("click", () => {
    // Open the database info endpoint in a new tab
    window.open(`${backendUrl}/debug/db-info`, "_blank");
  });

  // View all databases
  viewAllDbButton.addEventListener("click", () => {
    window.open(`${backendUrl}/debug/db-info`, "_blank");
  });

  // View production database
  viewProdDbButton.addEventListener("click", () => {
    window.open(`${backendUrl}/debug/db-info?env=prod`, "_blank");
  });

  // View test database
  viewTestDbButton.addEventListener("click", () => {
    window.open(`${backendUrl}/debug/db-info?env=test`, "_blank");
  });

  // Add event listeners for the db view buttons
  showProdDbButton.addEventListener("click", () => {
    lastViewedDb = "prod";
    hideDbViewButton.textContent = "Hide Database View";
    fetchAndDisplayDatabase("prod");
  });

  showTestDbButton.addEventListener("click", () => {
    lastViewedDb = "test";
    hideDbViewButton.textContent = "Hide Database View";
    fetchAndDisplayDatabase("test");
  });

  hideDbViewButton.addEventListener("click", () => {
    // Check if the database view is hidden (contains only a paragraph)
    const isHidden = dbViewerContent.innerHTML.trim().startsWith("<p>");

    if (isHidden) {
      // If currently hidden, update button text
      hideDbViewButton.textContent = "Hide Database View";
      // Show the last viewed database (prod by default)
      fetchAndDisplayDatabase(lastViewedDb || "prod");
    } else {
      // If currently shown, update button text
      hideDbViewButton.textContent = "Show Database View";
      // Hide the view
      dbViewerContent.innerHTML = "<p>Database view hidden</p>";
    }
  });

  // Theme handling
  function initializeTheme() {
    // Check for saved theme preference or use default
    const savedTheme = localStorage.getItem("theme") || DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Update the toggle to match current theme
    themeToggle.checked = savedTheme === "dark";
  }

  // Initialize theme on page load
  initializeTheme();

  // Handle theme toggle changes
  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Setup filter event listeners
  testSearch.addEventListener("input", filterTests);
  testStatusFilter.addEventListener("change", filterTests);

  // Filter tests based on search text and status filter
  function filterTests() {
    if (!currentTestData) return;

    const searchText = testSearch.value.toLowerCase();
    const statusFilter = testStatusFilter.value;

    console.log(
      `Filtering tests with search text: "${searchText}" and status filter: "${statusFilter}"`
    );

    const testSuites = document.querySelectorAll(".test-suite");

    testSuites.forEach((suite) => {
      const suiteName = suite.querySelector("h3").textContent.toLowerCase();
      const testCases = suite.querySelectorAll(".test-case");

      let suiteMatches = false;

      console.log(`Checking suite: "${suiteName}"`);

      testCases.forEach((testCase) => {
        const testCaseText = testCase.textContent.toLowerCase();
        const testCaseStatus = testCase.classList.contains("passed")
          ? "passed"
          : "failed";

        const matchesSearch =
          searchText === "" || testCaseText.includes(searchText);
        const matchesStatus =
          statusFilter === "all" || testCaseStatus === statusFilter;

        console.log(
          `Test case: "${testCaseText}", Status: "${testCaseStatus}", Matches Search: ${matchesSearch}, Matches Status: ${matchesStatus}`
        );

        if (matchesSearch && matchesStatus) {
          testCase.style.display = "";
          suiteMatches = true;
        } else {
          testCase.style.display = "none";
        }
      });

      // Ensure the suite is displayed if it has a failed status or any of its test cases match
      const suiteStatus = suite.classList.contains("failed")
        ? "failed"
        : "passed";
      if (statusFilter === "all" || suiteStatus === statusFilter) {
        suiteMatches = true;
      }

      suite.style.display = suiteMatches ? "" : "none";
      console.log(
        `Suite "${suiteName}" display status: ${suite.style.display}`
      );
    });
  }

  // Run tests
  document.getElementById("runTests").addEventListener("click", async () => {
    try {
      // Replace simple text with a progress bar
      testResults.innerHTML = `
        <p>Running tests...</p>
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
      `;

      const response = await fetch(`${backendUrl}/run-tests`, {
        method: "POST",
      });

      if (response.ok) {
        // After running tests, fetch the results file
        const testResultsResponse = await fetch("/test-results.json");
        const testData = await testResultsResponse.json();

        currentTestData = testData; // Store the test data for filtering
        displayTestResults(testData);
      } else {
        testResults.innerHTML = `
          <p class="error">Error running tests: ${response.statusText}</p>
        `;
      }
    } catch (error) {
      testResults.innerHTML = `
        <p class="error">Error: Could not run tests</p>
        <p>Make sure the backend server is running and supports test execution</p>
        <pre>${error.message}</pre>
      `;
    }
  });

  // Helper to display test results
  function displayTestResults(testData) {
    let html = "<div>";

    if (testData.numFailedTestSuites === 0) {
      html += `<p class="success">All tests passed! (${testData.numPassedTestSuites} tests</p>`;
    } else {
      html += `
        <p class="error">
          ${testData.numFailedTestSuites} test(s) failed of ${testData.numTotalTestSuites}
        </p>
      `;
    }

    html += '<div class="test-suites">';

    testData.testResults.forEach((suite) => {
      html += `
        <div class="test-suite ${
          suite.status === "passed" ? "passed" : "failed"
        }">
          <h3>${suite.name}</h3>
      `;

      suite.assertionResults.forEach((test) => {
        html += `
          <div class="test-case ${
            test.status === "passed" ? "passed" : "failed"
          }">
            ${test.status === "passed" ? "✓" : "✗"} ${test.title}
          </div>
        `;
      });

      // Display error message if the suite failed
      if (suite.status === "failed" && suite.message) {
        html += `
          <div class="test-error">
            <pre>${suite.message}</pre>
          </div>
        `;
      }

      html += "</div>";
    });

    html += "</div></div>";
    testResults.innerHTML = html;
  }

  // Try to load test results if they exist
  fetch("/test-results.json")
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("No test results available yet");
    })
    .then((data) => {
      currentTestData = data; // Store the test data for filtering
      displayTestResults(data);
    })
    .catch(() => {
      // No test results yet, that's fine
    });

  // Function to fetch and display database data as tables
  async function fetchAndDisplayDatabase(env) {
    try {
      dbViewerContent.innerHTML = "<p>Loading database data...</p>";

      const response = await fetch(`${backendUrl}/debug/db-info?env=${env}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch database info: ${response.statusText}`
        );
      }

      const data = await response.json();

      let html = `<h3>${env} Database</h3>`;
      html += `<p>Database file: ${data.filename}</p>`;

      const tables = data.tables;
      if (Object.keys(tables).length === 0) {
        html += "<p>No tables found in this database</p>";
      } else {
        for (const tableName in tables) {
          const tableData = tables[tableName];
          html += `<div class="db-table-container">
            <h4>Table: ${tableName} (${tableData.recordCount} records)</h4>
            
            <h5>Schema</h5>
            <table class="db-schema-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Nullable</th>
                  <th>Default</th>
                  <th>Primary Key</th>
                </tr>
              </thead>
              <tbody>`;

          tableData.schema.forEach((column) => {
            html += `<tr>
                <td>${column.name}</td>
                <td>${column.type}</td>
                <td>${column.notnull ? "No" : "Yes"}</td>
                <td>${column.dflt_value || ""}</td>
                <td>${column.pk ? "Yes" : "No"}</td>
              </tr>`;
          });

          html += `</tbody>
              </table>
              
              <h5>Data</h5>`;

          if (tableData.records.length === 0) {
            html += "<p>No records in this table</p>";
          } else {
            html += `<table class="db-data-table">
                <thead>
                  <tr>`;

            // Get column names from the first record
            const columns = Object.keys(tableData.records[0]);
            columns.forEach((column) => {
              html += `<th>${column}</th>`;
            });

            html += `</tr>
                </thead>
                <tbody>`;

            // Add the data rows
            tableData.records.forEach((record) => {
              html += "<tr>";
              columns.forEach((column) => {
                const value = record[column];
                html += `<td>${value !== null ? value : "<null>"}</td>`;
              });
              html += "</tr>";
            });

            html += `</tbody>
              </table>`;
          }

          html += "</div>";
        }
      }

      dbViewerContent.innerHTML = html;
    } catch (error) {
      dbViewerContent.innerHTML = `
        <p class="error">Error: ${error.message}</p>
      `;
    }
  }
});
