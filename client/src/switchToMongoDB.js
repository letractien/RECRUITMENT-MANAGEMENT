/**
 * Script to update client configuration to use MongoDB backend
 * 
 * This script updates the necessary environment variables and creates 
 * required service files to connect to the FastAPI + MongoDB backend.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const envFile = path.join(rootDir, '.env');

// Create .env file with MongoDB configuration
const envContent = `
VITE_APP_API_URL=http://localhost:8000/api
VITE_APP_API_VERSION=v1
VITE_APP_AUTH_TOKEN_KEY=auth_token
VITE_APP_AUTH_ENABLED=true
`;

fs.writeFileSync(envFile, envContent.trim(), 'utf8');
console.log('✅ Created .env file with MongoDB configuration');

// Create directory structure if it doesn't exist
const directories = [
  'src/core/api',
  'src/features/candidates',
  'src/features/jobs',
  'src/features/interviews'
];

directories.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('\n📌 Configuration complete! Make sure to:');
console.log('1. Start MongoDB server');
console.log('2. Start the FastAPI server: python server/server.py');
console.log('3. Build and run the client: npm run dev');
console.log('\nThe client is now configured to use the MongoDB backend through FastAPI.'); 