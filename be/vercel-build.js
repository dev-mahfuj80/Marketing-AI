// This script runs during the Vercel build process
const { execSync } = require('child_process');

console.log('Running Vercel build script...');

try {
  // Generate Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run database migrations
  console.log('Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Run TypeScript compiler
  console.log('Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
