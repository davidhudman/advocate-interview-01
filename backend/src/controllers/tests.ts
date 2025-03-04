import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runTests = (_req: Request, res: Response): void => {
  const rootDir = path.resolve(__dirname, '../../');

  console.log('Running tests...');

  exec('npm test', { cwd: rootDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running tests: ${error.message}`);
    }

    if (stderr) {
      console.error(`Test stderr: ${stderr}`);
    }

    console.log(`Tests completed: ${stdout}`);

    // Read the test results from the JSON file
    const resultsPath = path.join(rootDir, '../frontend/public/test-results.json');
    fs.readFile(resultsPath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading test results: ${err.message}`);
        return res.status(500).json({ error: 'Failed to read test results' });
      }

      const testResults = JSON.parse(data);
      res.status(200).json({ message: 'Tests completed', testResults });
    });
  });
};
