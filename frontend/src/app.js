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

  let currentTestData = null;

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

    const testSuites = document.querySelectorAll(".test-suite");

    testSuites.forEach((suite) => {
      const suiteName = suite.querySelector("h3").textContent.toLowerCase();
      const testCases = suite.querySelectorAll(".test-case");

      // Check if any test in the suite matches the filters
      let hasVisibleTests = false;

      testCases.forEach((testCase) => {
        const testTitle = testCase.textContent.toLowerCase();
        const testStatus = testCase.classList.contains("passed")
          ? "passed"
          : "failed";

        // Check if test matches both filters
        const matchesSearch =
          testTitle.includes(searchText) || suiteName.includes(searchText);
        const matchesStatus =
          statusFilter === "all" || testStatus === statusFilter;

        if (matchesSearch && matchesStatus) {
          testCase.style.display = "";
          hasVisibleTests = true;
        } else {
          testCase.style.display = "none";
        }
      });

      // Show/hide the entire suite based on whether it has any visible tests
      suite.style.display = hasVisibleTests ? "" : "none";
    });

    // Update visible test counts
    updateVisibleTestCount();
  }

  // Update the count of visible tests after filtering
  function updateVisibleTestCount() {
    const visibleTests = document.querySelectorAll(
      ".test-case:not([style*='display: none'])"
    );
    const visiblePassed = document.querySelectorAll(
      ".test-case.passed:not([style*='display: none'])"
    );
    const visibleFailed = document.querySelectorAll(
      ".test-case.failed:not([style*='display: none'])"
    );

    testSummary.innerHTML = `
      Showing ${visibleTests.length} tests
      <span class="test-badge badge-passed">${visiblePassed.length} passed</span>
      <span class="test-badge badge-failed">${visibleFailed.length} failed</span>
    `;
  }

  // Handle clicks on test suite headers (for collapsing/expanding)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".test-suite-header")) {
      const suite = e.target.closest(".test-suite");
      suite.classList.toggle("collapsed");
    }
  });

  // Check health endpoint
  document.getElementById("checkHealth").addEventListener("click", async () => {
    try {
      healthResult.innerHTML = "<p>Checking health...</p>";

      const response = await fetch(`${backendUrl}/health`);
      const data = await response.json();

      if (response.ok) {
        healthResult.innerHTML = `
          <p class="success">Health Status: ${data.status}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
      } else {
        healthResult.innerHTML = `
          <p class="error">Error: ${response.statusText}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
      }
    } catch (error) {
      healthResult.innerHTML = `
        <p class="error">Error: Could not connect to backend</p>
        <p>Make sure the backend server is running on ${backendUrl}</p>
        <pre>${error.message}</pre>
      `;
    }
  });

  // Run tests
  document.getElementById("runTests").addEventListener("click", async () => {
    try {
      testResults.innerHTML = "<p>Running tests...</p>";

      // Reset filters when running new tests
      testSearch.value = "";
      testStatusFilter.value = "all";

      const response = await fetch(`${backendUrl}/run-tests`, {
        method: "POST",
      });

      if (response.ok) {
        // After running tests, fetch the results file
        const testResultsResponse = await fetch("/test-results.json");
        const testData = await testResultsResponse.json();

        currentTestData = testData;
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

  // Helper to display test results with enhanced UI
  function displayTestResults(testData) {
    // Store the test data for later filtering
    currentTestData = testData;

    // Update test summary
    testSummary.innerHTML = `
      ${testData.numTotalTests} total tests
      <span class="test-badge badge-passed">${testData.numPassedTests} passed</span>
      <span class="test-badge badge-failed">${testData.numFailedTests} failed</span>
    `;

    let html = "<div class='test-results-container'>";

    // Main result message
    if (testData.numFailedTests === 0) {
      html += `<p class="success">All tests passed! (${testData.numPassedTests} tests)</p>`;
    } else {
      html += `
        <p class="error">
          ${testData.numFailedTests} tests failed out of ${testData.numTotalTests} total tests
        </p>
      `;
    }

    html += '<div class="test-suites">';

    // Create collapsible test suites
    testData.testResults.forEach((suite) => {
      const suiteStatus = suite.status === "passed" ? "passed" : "failed";
      const passedCount = suite.assertionResults.filter(
        (t) => t.status === "passed"
      ).length;
      const failedCount = suite.assertionResults.filter(
        (t) => t.status === "failed"
      ).length;

      // Auto-collapse passed suites if there are any failures
      const isCollapsed =
        suiteStatus === "passed" && testData.numFailedTests > 0;

      html += `
        <div class="test-suite ${suiteStatus} ${
        isCollapsed ? "collapsed" : ""
      }">
          <div class="test-suite-header">
            <h3>${suite.name}</h3>
            <div>
              <span class="test-badge badge-total">${
                suite.assertionResults.length
              }</span>
              <span class="test-badge badge-passed">${passedCount}</span>
              <span class="test-badge badge-failed">${failedCount}</span>
            </div>
          </div>
          <div class="test-suite-body">
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

      html += "</div></div>";
    });

    html += "</div></div>";
    testResults.innerHTML = html;

    // Initial filtering (in case filters were set)
    filterTests();
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
      displayTestResults(data);
    })
    .catch(() => {
      // No test results yet, that's fine
    });
});
