const { execSync } = require('child_process');

console.log('Installing dependencies...');
execSync('npm ci --production=false', { stdio: 'inherit' });

console.log('Building Next.js app...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Starting Next.js server...');
execSync('npm start', { stdio: 'inherit' });
