#!/bin/bash

echo "Creating project structure with frontend and backend..."

# Create main directories
mkdir -p backend/src/routes backend/src/controllers backend/tests
mkdir -p frontend/public frontend/src

# === BACKEND SETUP ===

# Create backend app.ts
cat > backend/src/app.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/health', healthRoutes);

export default app;
EOF

# Create backend server.ts
cat > backend/src/server.ts << 'EOF'
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
EOF

# Create backend routes/health.ts
cat > backend/src/routes/health.ts << 'EOF'
import { Router } from 'express';
import { getHealth } from '../controllers/health';

const router = Router();

router.get('/', getHealth);

export default router;
EOF

# Create backend controllers/health.ts
cat > backend/src/controllers/health.ts << 'EOF'
import { Request, Response } from 'express';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'OK' });
};
EOF

# Create backend tests/health.test.ts
cat > backend/tests/health.test.ts << 'EOF'
import request from 'supertest';
import app from '../src/app';

describe('Health Endpoint', () => {
  it('should return status OK with 200 status code', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });
});
EOF

# Create backend tsconfig.json
cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOF

# Create backend package.json
cat > backend/package.json << 'EOF'
{
  "name": "express-typescript-api-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "ts-node src/server.ts",
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "test": "jest --json --outputFile=../frontend/public/test-results.json",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"**/*.{ts,js,json}\""
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.1",
    "@types/node": "^18.16.3",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^5.59.2",
    "@typescript-eslint/parser": "^5.59.2",
    "eslint": "^8.39.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1",
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "prettier": "^2.8.8",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.4"
  }
}
EOF

# Create backend jest.config.js
cat > backend/jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
EOF

# Create backend .eslintrc.js
cat > backend/.eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Custom rules can be added here
  },
};
EOF

# Create backend .prettierrc
cat > backend/.prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF

# === FRONTEND SETUP ===

# Create frontend HTML
cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Express TypeScript API - Test Results</title>
  <link rel="stylesheet" href="../src/styles.css">
</head>
<body>
  <header>
    <h1>Express TypeScript API</h1>
    <div class="actions">
      <button id="runTests">Run Tests</button>
      <button id="checkHealth">Check Health</button>
    </div>
  </header>
  
  <main>
    <section id="healthSection">
      <h2>Health Status</h2>
      <div id="healthResult" class="result-panel">
        <p>Click "Check Health" to see the API health status</p>
      </div>
    </section>

    <section id="testSection">
      <h2>Test Results</h2>
      <div id="testResults" class="result-panel">
        <p>Click "Run Tests" to execute the test suite</p>
      </div>
    </section>
  </main>

  <script src="../src/app.js"></script>
</body>
</html>
EOF

# Create frontend CSS
cat > frontend/src/styles.css << 'EOF'
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f7fa;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  color: #2d3748;
}

h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #4a5568;
}

section {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

button {
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
}

button:hover {
  background-color: #3182ce;
}

.result-panel {
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
  overflow-x: auto;
}

.success {
  color: #38a169;
}

.error {
  color: #e53e3e;
}

pre {
  white-space: pre-wrap;
  font-family: monospace;
}

.test-suite {
  margin-bottom: 15px;
}

.test-case {
  margin-left: 20px;
  margin-bottom: 5px;
}

.passed {
  color: #38a169;
}

.failed {
  color: #e53e3e;
}
EOF

# Create frontend JavaScript
cat > frontend/src/app.js << 'EOF'
document.addEventListener('DOMContentLoaded', () => {
  const backendUrl = 'http://localhost:3000';
  const healthResult = document.getElementById('healthResult');
  const testResults = document.getElementById('testResults');
  
  // Check health endpoint
  document.getElementById('checkHealth').addEventListener('click', async () => {
    try {
      healthResult.innerHTML = '<p>Checking health...</p>';
      
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
  document.getElementById('runTests').addEventListener('click', async () => {
    try {
      testResults.innerHTML = '<p>Running tests...</p>';
      
      // Execute the tests via the test-runner server
      // For simplicity, we're using a fetch to a test-runner endpoint
      // In a real app, you might use WebSockets for real-time updates
      
      const response = await fetch(`${backendUrl}/run-tests`, { method: 'POST' });
      
      if (response.ok) {
        // After running tests, fetch the results file
        const testResultsResponse = await fetch('/test-results.json');
        const testData = await testResultsResponse.json();
        
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
    let html = '<div>';
    
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
    
    testData.testResults.forEach(suite => {
      html += `
        <div class="test-suite ${suite.status === 'passed' ? 'passed' : 'failed'}">
          <h3>${suite.name}</h3>
      `;
      
      suite.assertionResults.forEach(test => {
        html += `
          <div class="test-case ${test.status === 'passed' ? 'passed' : 'failed'}">
            ${test.status === 'passed' ? '✓' : '✗'} ${test.title}
          </div>
        `;
      });
      
      html += '</div>';
    });
    
    html += '</div></div>';
    testResults.innerHTML = html;
  }
  
  // Try to load test results if they exist
  fetch('/test-results.json')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('No test results available yet');
    })
    .then(data => {
      displayTestResults(data);
    })
    .catch(() => {
      // No test results yet, that's fine
    });
});
EOF

# Create frontend server to serve the static frontend
cat > frontend/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});
EOF

# Create frontend package.json
cat > frontend/package.json << 'EOF'
{
  "name": "express-typescript-api-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Create root package.json for convenience scripts
cat > package.json << 'EOF'
{
  "name": "express-typescript-api",
  "version": "1.0.0",
  "scripts": {
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "start:backend": "cd backend && npm run dev",
    "start:frontend": "cd frontend && npm start",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "test": "cd backend && npm test"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
EOF

# Create .gitignore in root
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Test results
frontend/public/test-results.json

# IDEs and editors
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
EOF

# Create README.md
cat > README.md << 'EOF'
# Express TypeScript API with Frontend

A simple Express.js server built with TypeScript and a frontend to display test results.

## Project Structure

- `backend/` - Express.js API with TypeScript
- `frontend/` - Simple UI to display health status and test results

## Getting Started

1. Install all dependencies:
   ```
   npm run install:all
   ```

2. Start both backend and frontend:
   ```
   npm start
   ```

   - Backend will run on: http://localhost:3000
   - Frontend will run on: http://localhost:8080

3. Run tests:
   ```
   npm test
   ```

## Endpoints

- `GET /health` - Returns server health status

## Testing the Application

1. Open the frontend in your browser: http://localhost:8080
2. Click "Check Health" to verify the backend is working
3. Click "Run Tests" to execute the test suite and see results
EOF

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Message to user
echo "✅ Project structure created!"
echo "🚀 To get started:"
echo "  1. Install all dependencies: npm run install:all"
echo "  2. Start both servers: npm start"
echo "  3. Open http://localhost:8080 in your browser"