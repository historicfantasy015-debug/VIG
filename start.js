import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, 'env', '.env') });

const startPythonBackend = () => {
  console.log('Starting Python backend...');
  const pythonProcess = spawn('python3', [path.join(__dirname, 'backend', 'main.py')], {
    stdio: 'inherit',
    env: { ...process.env } // Pass all loaded environment variables
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python backend:', err);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
  });
};

const startViteFrontend = () => {
  console.log('Starting Vite frontend...');
  const viteProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

  viteProcess.on('error', (err) => {
    console.error('Failed to start Vite frontend:', err);
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite frontend exited with code ${code}`);
  });
};

startPythonBackend();
startViteFrontend();
