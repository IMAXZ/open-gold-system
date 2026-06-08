import fs from 'node:fs';
import path from 'node:path';

const appRoot = path.resolve(import.meta.dirname, '..');
const infoPlistPath = path.join(appRoot, 'ios', 'App', 'App', 'Info.plist');

if (!fs.existsSync(infoPlistPath)) {
  console.log('Skipped ATS patch: ios/App/App/Info.plist not found.');
  process.exit(0);
}

const atsBlock = [
  '\t<key>NSAppTransportSecurity</key>',
  '\t<dict>',
  '\t\t<key>NSAllowsArbitraryLoadsInWebContent</key>',
  '\t\t<true/>',
  '\t</dict>'
].join('\n');

const existingContent = fs.readFileSync(infoPlistPath, 'utf8');

if (existingContent.includes('NSAllowsArbitraryLoadsInWebContent')) {
  console.log('ATS patch already present in Info.plist.');
  process.exit(0);
}

const patchedContent = existingContent.replace('</dict>\n</plist>', `${atsBlock}\n</dict>\n</plist>`);

if (patchedContent === existingContent) {
  console.warn('Unable to patch Info.plist automatically. Please add NSAppTransportSecurity manually.');
  process.exit(1);
}

fs.writeFileSync(infoPlistPath, patchedContent, 'utf8');
console.log('Injected NSAllowsArbitraryLoadsInWebContent into Info.plist.');
