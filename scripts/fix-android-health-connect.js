import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const settingsGradle = join(root, 'android', 'capacitor.settings.gradle');

try {
  // Fix capacitor.settings.gradle — point to local module instead of node_modules
  if (existsSync(settingsGradle)) {
    let content = readFileSync(settingsGradle, 'utf8');
    const original = content;

    content = content.replace(
      /project\(':'?capgo-capacitor-health'?\)\.projectDir = new File\('.*?'\)/,
      "project(':capgo-capacitor-health').projectDir = new File('./health-connect/')"
    );

    if (content !== original) {
      writeFileSync(settingsGradle, content, 'utf8');
      console.log('Fixed capacitor.settings.gradle to point to local health-connect module');
    }
  }
} catch (err) {
  console.error('Failed to fix Android health-connect settings:', err.message);
}
