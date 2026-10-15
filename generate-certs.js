// generate-certs.js — SSL Certificate Generator
// Creates a self-signed certificate and private key for local HTTPS development.
// In production you'd use a real CA like Let's Encrypt (https://letsencrypt.org/).
//
// Based on the OpenSSL req command docs:
// https://www.openssl.org/docs/man1.1.1/man1/req.html
// and Node's child_process.execSync:
// https://nodejs.org/api/child_process.html#child_processexecsynccommand-options

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'server-key.pem');
const certPath = path.join(certsDir, 'server.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('SSL certificates already exist in /certs directory.');
  process.exit(0);
}

console.log('Generating self-signed SSL certificates...');

try {
  // -x509 makes it self-signed, -newkey rsa:2048 creates a 2048-bit RSA key,
  // -nodes skips encrypting the private key (fine for dev), -days 365 sets validity.
  // Ref: https://www.openssl.org/docs/man1.1.1/man1/req.html
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost/O=HustleHub+/C=ZA"`,
    { stdio: 'inherit' }
  );
  console.log('SSL certificates generated successfully!');
  console.log(`  Key:  ${keyPath}`);
  console.log(`  Cert: ${certPath}`);
} catch (err) {
  console.error('Failed to generate certificates. Make sure OpenSSL is installed.');
  console.error('You can install it from: https://slproweb.com/products/Win32OpenSSL.html');
  process.exit(1);
}
