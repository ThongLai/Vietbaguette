// Helper script for running Prisma migrations
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a migration command: dev, reset, deploy, or status');
  process.exit(1);
}

const command = args[0];
const validCommands = ['dev', 'reset', 'deploy', 'status'];

if (!validCommands.includes(command)) {
  console.error(`Invalid command: ${command}. Must be one of: ${validCommands.join(', ')}`);
  process.exit(1);
}

console.log(`Running prisma migrate ${command}...`);

// Run Prisma CLI command
const prisma = spawn('npx', ['prisma', 'migrate', command], {
  stdio: 'inherit',
  cwd: projectRoot,
});

prisma.on('close', (code) => {
  if (code !== 0) {
    console.error(`prisma migrate ${command} exited with code ${code}`);
    process.exit(code);
  }
  console.log(`Migration ${command} completed successfully!`);
}); 