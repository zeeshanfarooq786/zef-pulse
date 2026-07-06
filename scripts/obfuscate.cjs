const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC_DIR = path.join(__dirname, '..', 'electron');
const OUT_DIR = path.join(__dirname, '..', 'electron-prod');

const OBFUSCATOR_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  // These stay plain CommonJS (no ESM transform) so require()/module.exports
  // keep working exactly as in dev — this is what avoids the ERR_REQUIRE_ESM
  // crash that bytenode + electron-context-menu produced.
};

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.cjs'));

for (const file of files) {
  const srcPath = path.join(SRC_DIR, file);
  const code = fs.readFileSync(srcPath, 'utf-8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, OBFUSCATOR_OPTIONS).getObfuscatedCode();
  fs.writeFileSync(path.join(OUT_DIR, file), obfuscated);
  console.log(`Obfuscated ${file}`);
}

console.log(`Done: ${files.length} files written to electron-prod/`);
