import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';

export const runTests = (_req: Request, res: Response): void => {
  const rootDir = path.resolve(__dirname, '../../');

  console.log('Running tests...');

  exec('npm test', { cwd: rootDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running tests: ${error.message}`);
      return res.status(500).json({ error: 'Failed to run tests' });
    }

    if (stderr) {
      console.error(`Test stderr: ${stderr}`);
    }

    console.log(`Tests completed: ${stdout}`);
    res.status(200).json({ message: 'Tests completed successfully' });
  });
};
