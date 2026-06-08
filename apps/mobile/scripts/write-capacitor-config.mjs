import fs from 'node:fs';
import path from 'node:path';

const appRoot = path.resolve(import.meta.dirname, '..');
const envPath = path.join(appRoot, '.env');
const exampleEnvPath = path.join(appRoot, '.env.example');
const configPath = path.join(appRoot, 'capacitor.config.json');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((result, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) {
        return result;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      result[key] = value;
      return result;
    }, {});
}

const env = {
  ...parseEnvFile(exampleEnvPath),
  ...parseEnvFile(envPath),
  ...process.env
};

const serverUrl = env.CAPACITOR_SERVER_URL || 'http://192.168.1.10:41736';
const appId = env.CAPACITOR_APP_ID || 'com.opengold.mobile';
const appName = env.CAPACITOR_APP_NAME || 'Open Gold';

let allowNavigation = [];

try {
  const parsedUrl = new URL(serverUrl);
  if (parsedUrl.hostname) {
    allowNavigation = [parsedUrl.hostname];
  }
} catch (error) {
  console.warn(`Invalid CAPACITOR_SERVER_URL: ${serverUrl}`);
}

const config = {
  appId,
  appName,
  webDir: 'web',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
    allowNavigation,
    errorPath: 'unavailable.html'
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true
  }
};

fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(appRoot, configPath)} with ${serverUrl}`);
