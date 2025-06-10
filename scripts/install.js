#!/usr/bin/env node

const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

console.log('🚀 Installing Claude-Flow...');

// Check if Deno is available
function checkDeno() {
  try {
    execSync('deno --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Install Deno based on platform
async function installDeno() {
  console.log('📦 Deno not found. Installing Deno...');
  
  const platform = os.platform();
  
  return new Promise((resolve, reject) => {
    let command, args;
    
    if (platform === 'win32') {
      // Windows installation using PowerShell
      console.log('🪟 Installing Deno for Windows...');
      command = 'powershell';
      args = [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-Command',
        'irm https://deno.land/install.ps1 | iex'
      ];
    } else {
      // macOS and Linux installation
      console.log(`🐧 Installing Deno for ${platform === 'darwin' ? 'macOS' : 'Linux'}...`);
      command = 'sh';
      args = ['-c', 'curl -fsSL https://deno.land/install.sh | sh'];
    }
    
    const installProcess = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Deno installed successfully!');
        
        // Add Deno to PATH instructions
        console.log('');
        console.log('⚠️  Important: Add Deno to your PATH:');
        
        if (platform === 'win32') {
          console.log('   Add %USERPROFILE%\\.deno\\bin to your PATH environment variable');
        } else {
          const shellConfig = process.env.SHELL?.includes('zsh') ? '~/.zshrc' : '~/.bashrc';
          console.log(`   Add the following to your ${shellConfig}:`);
          console.log('   export DENO_INSTALL="$HOME/.deno"');
          console.log('   export PATH="$DENO_INSTALL/bin:$PATH"');
          console.log('');
          console.log('   Then run: source ' + shellConfig);
        }
        
        resolve();
      } else {
        reject(new Error('Failed to install Deno'));
      }
    });
    
    installProcess.on('error', (err) => {
      reject(new Error(`Failed to start installation: ${err.message}`));
    });
  });
}

// Create necessary directories
function setupDirectories() {
  const dirs = [
    path.join(__dirname, '..', 'bin'),
    path.join(__dirname, '..', 'memory'),
    path.join(__dirname, '..', 'memory', 'sessions'),
    path.join(__dirname, '..', 'memory', 'agents')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Main installation process
async function main() {
  try {
    // Setup directories
    setupDirectories();
    
    // Check for Deno
    const denoAvailable = checkDeno();
    
    if (!denoAvailable) {
      console.log('');
      console.log('Claude-Flow requires Deno to run.');
      console.log('');
      
      // Provide manual installation instructions
      console.log('Please install Deno manually:');
      console.log('');
      
      if (os.platform() === 'win32') {
        console.log('For Windows:');
        console.log('  1. Open PowerShell as Administrator');
        console.log('  2. Run: irm https://deno.land/install.ps1 | iex');
        console.log('  3. Add %USERPROFILE%\\.deno\\bin to your PATH');
        console.log('  4. Restart your terminal and run: npm install -g claude-flow');
      } else if (os.platform() === 'darwin') {
        console.log('For macOS:');
        console.log('  Using Homebrew: brew install deno');
        console.log('  Or: curl -fsSL https://deno.land/install.sh | sh');
      } else {
        console.log('For Linux:');
        console.log('  curl -fsSL https://deno.land/install.sh | sh');
      }
      
      console.log('');
      console.log('For more information, visit: https://deno.land/');
      console.log('');
      
      // Try automatic installation
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Would you like to install Deno automatically? (y/n): ', async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          try {
            await installDeno();
          } catch (err) {
            console.error('❌ Automatic installation failed:', err.message);
            console.log('Please install Deno manually using the instructions above.');
            process.exit(1);
          }
        } else {
          console.log('Please install Deno manually and then run: npm install -g claude-flow');
          process.exit(0);
        }
      });
      
      return;
    }
    
    // Run build script
    console.log('🔨 Building Claude-Flow...');
    try {
      execSync('node scripts/build.js', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    } catch (err) {
      console.error('❌ Build failed:', err.message);
      process.exit(1);
    }
    
    console.log('');
    console.log('✅ Claude-Flow installation completed!');
    console.log('');
    console.log('Usage:');
    console.log('  npx claude-flow          # Run with npx');
    console.log('  claude-flow              # Run globally (if installed with -g)');
    console.log('  deno task start          # Run with Deno directly');
    console.log('');
    console.log('Get started:');
    console.log('  claude-flow help         # Show help');
    console.log('  claude-flow config init  # Initialize configuration');
    console.log('  claude-flow start        # Start the orchestrator');
    console.log('');
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    console.log('');
    console.log('Please report issues at: https://github.com/ruvnet/claude-code-flow/issues');
    process.exit(1);
  }
}

// Run installation
if (require.main === module) {
  main();
}