import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildGradle = join(__dirname, '..', 'node_modules', '@capgo', 'capacitor-health', 'android', 'build.gradle');

try {
  let content = readFileSync(buildGradle, 'utf8');
  const original = content;

  if (content.includes("apply plugin: 'org.jetbrains.kotlin.android'") && !content.includes('// AGP')) {
    content = content.replace(
      /apply plugin: 'org\.jetbrains\.kotlin\.android'/,
      "// AGP 9.x handles Kotlin natively — plugin omitted\n// apply plugin: 'org.jetbrains.kotlin.android'"
    );
  }

  content = content
    .replace(/def kotlinVersion = '[\d.]+'/, "def kotlinVersion = '2.1.20'")
    .replace(/classpath 'com\.android\.tools\.build:gradle:[\d.]+'/, "classpath 'com.android.tools.build:gradle:9.2.1'")
    .replace(/classpath 'org\.jetbrains\.kotlin:kotlin-gradle-plugin:[\d.]+'/, "classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.20'")
    .replace(/implementation\s+\("org\.jetbrains\.kotlin:kotlin-stdlib:" \+ project\.ext\.kotlinVersion\)/, 'implementation "org.jetbrains.kotlin:kotlin-stdlib:2.1.20"')
    .replace(/compileSdk = \d+/, "compileSdk = rootProject.ext.has('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 36");

  if (content !== original) {
    writeFileSync(buildGradle, content, 'utf8');
    console.log('Patched @capgo/capacitor-health android build.gradle');
  }
} catch (err) {
  console.error('Failed to patch @capgo/capacitor-health:', err.message);
}
