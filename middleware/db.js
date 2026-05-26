const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

function getDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], tasks: [], earnings: [] }));
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { getDb, saveDb };