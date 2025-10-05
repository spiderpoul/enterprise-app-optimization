const fs = require('fs');
const path = require('path');

const distEntry = path.resolve(__dirname, '..', 'dist', 'server.js');

if (!fs.existsSync(distEntry)) {
  console.error(
    'Users and roles server build output not found. Please run "npm run build" first.',
  );
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

require(distEntry);
