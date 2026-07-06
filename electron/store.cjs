const path = require('path');
const fs = require('fs');
const { app, safeStorage } = require('electron');

const FILE_PATH = () => path.join(app.getPath('userData'), 'zefpulse.vault');

function save(data) {
  const json = JSON.stringify(data);
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(json);
    fs.writeFileSync(FILE_PATH(), encrypted);
  } else {
    // Fallback for environments without OS-level encryption available.
    fs.writeFileSync(FILE_PATH(), json, 'utf-8');
  }
}

function load() {
  const filePath = FILE_PATH();
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath);
    if (safeStorage.isEncryptionAvailable()) {
      return JSON.parse(safeStorage.decryptString(raw));
    }
    return JSON.parse(raw.toString('utf-8'));
  } catch (_e) {
    return null;
  }
}

function clear() {
  const filePath = FILE_PATH();
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function patch(partial) {
  const current = load() || {};
  save({ ...current, ...partial });
}

function remove(keys) {
  const current = load() || {};
  keys.forEach((k) => delete current[k]);
  save(current);
}

module.exports = { save, load, clear, patch, remove };
