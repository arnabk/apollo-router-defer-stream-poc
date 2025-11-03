#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync, chmodSync } from 'fs';
import { platform, arch } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routerDir = join(__dirname, '..', 'router');

// Ensure router directory exists
if (!existsSync(routerDir)) {
  mkdirSync(routerDir, { recursive: true });
}

// Determine platform and download appropriate binary
const plat = platform();
const architecture = arch();

let downloadUrl;
let binaryName = 'router';

// Apollo Router download URLs
const version = 'v2.8.0'; // Latest stable version

if (plat === 'darwin') {
  // macOS
  if (architecture === 'arm64') {
    downloadUrl = `https://github.com/apollographql/router/releases/download/${version}/router-${version}-aarch64-apple-darwin.tar.gz`;
  } else {
    downloadUrl = `https://github.com/apollographql/router/releases/download/${version}/router-${version}-x86_64-apple-darwin.tar.gz`;
  }
} else if (plat === 'linux') {
  downloadUrl = `https://github.com/apollographql/router/releases/download/${version}/router-${version}-x86_64-unknown-linux-gnu.tar.gz`;
} else if (plat === 'win32') {
  downloadUrl = `https://github.com/apollographql/router/releases/download/${version}/router-${version}-x86_64-pc-windows-msvc.tar.gz`;
  binaryName = 'router.exe';
} else {
  console.error(`Unsupported platform: ${plat}`);
  process.exit(1);
}

console.log(`📥 Downloading Apollo Router ${version} for ${plat}-${architecture}...`);
console.log(`URL: ${downloadUrl}`);

try {
  // Download and extract
  const commands = [
    `cd ${routerDir}`,
    `curl -sSL ${downloadUrl} -o router.tar.gz`,
    `tar -xzf router.tar.gz`,
    `rm router.tar.gz`,
  ];

  execSync(commands.join(' && '), { stdio: 'inherit' });

  // Make executable
  const binaryPath = join(routerDir, binaryName);
  if (existsSync(binaryPath)) {
    chmodSync(binaryPath, 0o755);
    console.log('✅ Apollo Router downloaded successfully!');
    console.log(`📍 Location: ${binaryPath}`);
  } else {
    // Sometimes the binary is in a subdirectory
    const altPath = join(routerDir, 'dist', binaryName);
    if (existsSync(altPath)) {
      execSync(`mv ${altPath} ${binaryPath}`);
      chmodSync(binaryPath, 0o755);
      console.log('✅ Apollo Router downloaded successfully!');
      console.log(`📍 Location: ${binaryPath}`);
    } else {
      console.error('❌ Router binary not found after extraction');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Failed to download Apollo Router:', error.message);
  console.log('\n💡 You can manually download from:');
  console.log('   https://github.com/apollographql/router/releases');
  process.exit(1);
}

