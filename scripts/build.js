#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('🔨 Building Claude-Flow...');

// Check if Deno is available
function checkDeno() {
  try {
    execSync('deno --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Make bin/claude-flow executable on Unix systems
function makeExecutable() {
  const binPath = path.join(__dirname, '..', 'bin', 'claude-flow');
  
  if (os.platform() !== 'win32') {
    try {
      fs.chmodSync(binPath, '755');
      console.log('✅ Made bin/claude-flow executable');
    } catch (err) {
      console.warn('⚠️  Could not make bin/claude-flow executable:', err.message);
    }
  }
}

// Main build process
async function build() {
  // Create bin directory if it doesn't exist
  const binDir = path.join(__dirname, '..', 'bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  // Check for Deno
  if (!checkDeno()) {
    console.warn('⚠️  Deno is not installed. Claude-Flow will check for Deno at runtime.');
    console.log('   To install Deno now, run: npm run postinstall');
  }

  // Make the wrapper executable
  makeExecutable();

  console.log('✅ Build completed successfully!');
  console.log('');
  console.log('You can now use Claude-Flow with:');
  console.log('  npx claude-flow');
  console.log('  npm install -g claude-flow && claude-flow');
  if (checkDeno()) {
    console.log('  deno task start');
  }
}

build().catch(err => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});