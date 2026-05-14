import crypto from 'crypto';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'твой_логин/твой_репо'; // например kqt3k/kqt3k.github.io
const FILE_PATH = 'data.json';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '4444'; // ключ шифрования базы (лучше хранить в переменной окружения)

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0,32)), Buffer.alloc(16,0));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(text) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0,32)), Buffer.alloc(16,0));
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function readDatabase() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  const fileData = await res.json();
  if (!fileData.content) return {};
  const encContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  try {
    const decrypted = decrypt(encContent);
    return JSON.parse(decrypted);
  } catch(e) {
    return {};
  }
}

async function writeDatabase(db) {
  const encrypted = encrypt(JSON.stringify(db));
  const newContent = Buffer.from(encrypted).toString('base64');
  // Получаем SHA последнего коммита файла
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  const fileData = await getRes.json();
  const sha = fileData.sha || '';
  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update database',
      content: newContent,
      sha: sha
    })
  });
  return putRes.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;
  const db = await readDatabase();
  if (!db.accounts) db.accounts = {};
  if (!db.tournaments) db.tournaments = [];

  try {
    if (action === 'register') {
      const { username, password } = req.body;
      if (db.accounts[username]) return res.json({ error: 'Username taken' });
      db.accounts[username] = {
        password: password, // в реальности надо хешировать
        data: {},
        team: null,
        title: 'Новичок',
        avatar: 'default'
      };
      await writeDatabase(db);
      return res.json({ message: 'Registered' });
    } else if (action === 'save') {
      const { username, password, game_data } = req.body;
      if (!db.accounts[username] || db.accounts[username].password !== password) return res.json({ error: 'Auth failed' });
      db.accounts[username].data = game_data;
      await writeDatabase(db);
      return res.json({ message: 'Saved' });
    } else if (action === 'load') {
      const { username, password } = req.body;
      if (!db.accounts[username] || db.accounts[username].password !== password) return res.json({ error: 'Auth failed' });
      return res.json({ game_data: db.accounts[username].data });
    } else if (action === 'create_team') {
      const { username, password, teamName } = req.body;
      if (!db.accounts[username] || db.accounts[username].password !== password) return res.json({ error: 'Auth failed' });
      if (db.accounts[username].team) return res.json({ error: 'Already in a team' });
      if (!db.teams) db.teams = {};
      if (db.teams[teamName]) return res.json({ error: 'Team exists' });
      db.teams[teamName] = { members: [username], points: 0, clicks: 0 };
      db.accounts[username].team = teamName;
      await writeDatabase(db);
      return res.json({ message: 'Team created' });
    } else if (action === 'join_team') {
      const { username, password, teamName } = req.body;
      if (!db.accounts[username] || db.accounts[username].password !== password) return res.json({ error: 'Auth failed' });
      if (db.accounts[username].team) return res.json({ error: 'Already in a team' });
      if (!db.teams || !db.teams[teamName]) return res.json({ error: 'Team not found' });
      db.teams[teamName].members.push(username);
      db.accounts[username].team = teamName;
      await writeDatabase(db);
      return res.json({ message: 'Joined team' });
    } else if (action === 'submit_tournament') {
      const { username, password, tournamentId, clicks } = req.body;
      if (!db.accounts[username] || db.accounts[username].password !== password) return res.json({ error: 'Auth failed' });
      const team = db.accounts[username].team;
      if (!team || !db.teams[team]) return res.json({ error: 'Not in a team' });
      const tournament = db.tournaments.find(t => t.id === tournamentId && t.active);
      if (!tournament) return res.json({ error: 'Tournament not found or ended' });
      if (tournament.type === 'clicks') {
        db.teams[team].clicks += clicks;
      } else if (tournament.type === 'points') {
        db.teams[team].points += clicks; // здесь clicks можно заменить на очки
      } else if (tournament.type === 'speed') {
        // скорость кликов: сохраняем клики за последнюю минуту
        const now = Date.now();
        if (!db.teams[team].speedLog) db.teams[team].speedLog = [];
        db.teams[team].speedLog.push({ time: now, clicks });
        // удаляем старые записи (> 1 мин)
        db.teams[team].speedLog = db.teams[team].speedLog.filter(e => now - e.time < 60000);
      }
      await writeDatabase(db);
      return res.json({ message: 'Submitted' });
    } else if (action === 'tournaments') {
      return res.json({ tournaments: db.tournaments.filter(t => t.active), teams: db.teams || {} });
    } else if (action === 'create_tournament') {
      // создаёт администратор (в заглушке просто так)
      const { type, name } = req.body;
      const id = Date.now().toString(36);
      db.tournaments.push({ id, name, type, active: true, startTime: Date.now(), endTime: Date.now() + 3600000 });
      await writeDatabase(db);
      return res.json({ message: 'Tournament created', id });
    }
    res.json({ error: 'Unknown action' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}