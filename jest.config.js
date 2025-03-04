module.exports = {
  verbose: true,
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  testResultsProcessor: "jest-sonar-reporter",
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "./test-results", outputName: "junit.xml" },
    ],
  ],
};
