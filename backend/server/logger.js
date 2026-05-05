const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const opsLogPath = path.join(logsDir, 'operations.log');

function logLine(line) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${line}`;
  console.log(entry);
  fs.appendFile(opsLogPath, `${entry}\n`, (err) => {
    if (err) {
      console.error('Failed to write log:', err.message);
    }
  });
}

function logOperation(action, details = {}) {
  logLine(`${action} ${JSON.stringify(details)}`);
}

module.exports = { logLine, logOperation };
