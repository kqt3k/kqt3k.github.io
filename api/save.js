// api/save.js
import crypto from 'crypto';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'kqt3k/kqt3k.github.io'; // твой репозиторий
const FILE_PATH = 'data.json';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fsociety4';

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
  if (!fileData.content) return { accounts: {}, tournaments: [], teams: {} };
  const encContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  try {
    const decrypted = decrypt(encContent);
    return JSON.parse(decrypted);
  } catch(e) {
    return { accounts: {}, tournaments: [], teams: {} };
  }
}

async function writeDatabase(db) {
  const encrypted = encrypt(JSON.stringify(db));
  const newContent = Buffer.from(encrypted).toString('base64');
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
      message: 'Update data',
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
  if (!db.teams) db.teams = {};

  try {
    // Проверка связи
    if (action === 'ping') return res.json({ status: 'ok', time: Date.now() });

    // Регистрация
    if (action === 'register') {
      const { username, password } = req.body;
      if (!username || !password || password.length < 4) return res.json({ error: 'Invalid data' });
      if (db.accounts[username]) return res.json({ error: 'Username taken' });
      db.accounts[username] = {
        password: password,
        data: {},
        referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        referred_by: null,
        used_referral_code: null,
        team: null
      };
      await writeDatabase(db);
      return res.json({ message: 'Registered', referral_code: db.accounts[username].referral_code });
    }

    // Вход
    if (action === 'login') {
      const { username, password } = req.body;
      const acc = db.accounts[username];
      if (!acc || acc.password !== password) return res.json({ error: 'Invalid credentials' });
      return res.json({
        message: 'Logged in',
        game_data: acc.data,
        referral_code: acc.referral_code,
        team: acc.team
      });
    }

    // Сохранение / синхронизация
    if (action === 'sync' || action === 'save') {
      const { username, password, game_data } = req.body;
      const acc = db.accounts[username];
      if (!acc || acc.password !== password) return res.json({ error: 'Auth failed' });
      acc.data = game_data;
      await writeDatabase(db);
      return res.json({ message: 'Saved' });
    }

    // Загрузка
    if (action === 'load') {
      const { username, password } = req.body;
      const acc = db.accounts[username];
      if (!acc || acc.password !== password) return res.json({ error: 'Auth failed' });
      return res.json({ game_data: acc.data });
    }

    // Применение реферального кода
    if (action === 'apply_referral') {
      const { username, referral_code } = req.body;
      if (!username || !referral_code) return res.json({ error: 'Missing parameters' });

      const user = db.accounts[username];
      if (!user) return res.json({ error: 'User not found' });
      if (user.used_referral_code) return res.json({ error: 'Already used a referral code' });
      if (referral_code === user.referral_code) return res.json({ error: 'Cannot refer yourself' });

      let referrer = null;
      for (const [uname, acc] of Object.entries(db.accounts)) {
        if (acc.referral_code === referral_code) {
          referrer = uname;
          break;
        }
      }
      if (!referrer) return res.json({ error: 'Invalid referral code' });

      user.used_referral_code = referral_code;
      user.referred_by = referrer;

      // Выдаём обоим по питомцу refpet
      if (!user.data) user.data = {};
      if (!user.data.ownedPets) user.data.ownedPets = [];
      let refPetUser = user.data.ownedPets.find(p => p.type === 'refpet');
      if (refPetUser) refPetUser.count += 1;
      else user.data.ownedPets.push({ type:'refpet', count:1, equipped:false, x:Math.random()*800, y:Math.random()*600 });

      const refAcc = db.accounts[referrer];
      if (!refAcc.data) refAcc.data = {};
      if (!refAcc.data.ownedPets) refAcc.data.ownedPets = [];
      let refPetRef = refAcc.data.ownedPets.find(p => p.type === 'refpet');
      if (refPetRef) refPetRef.count += 1;
      else refAcc.data.ownedPets.push({ type:'refpet', count:1, equipped:false, x:Math.random()*800, y:Math.random()*600 });

      await writeDatabase(db);
      return res.json({ message: 'Referral applied' });
    }

    // Турниры: список активных
    if (action === 'tournaments') {
      return res.json({ tournaments: db.tournaments.filter(t => t.active), teams: db.teams });
    }

    // Создание команды
    if (action === 'create_team') {
      const { username, password, teamName } = req.body;
      const user = db.accounts[username];
      if (!user || user.password !== password) return res.json({ error: 'Auth failed' });
      if (user.team) return res.json({ error: 'Already in a team' });
      if (db.teams[teamName]) return res.json({ error: 'Team name taken' });
      db.teams[teamName] = { members: [username], points: 0, clicks: 0 };
      user.team = teamName;
      await writeDatabase(db);
      return res.json({ message: 'Team created' });
    }

    // Вступление в команду
    if (action === 'join_team') {
      const { username, password, teamName } = req.body;
      const user = db.accounts[username];
      if (!user || user.password !== password) return res.json({ error: 'Auth failed' });
      if (user.team) return res.json({ error: 'Already in a team' });
      if (!db.teams[teamName]) return res.json({ error: 'Team not found' });
      db.teams[teamName].members.push(username);
      user.team = teamName;
      await writeDatabase(db);
      return res.json({ message: 'Joined team' });
    }

    // Отправка результата в турнир
    if (action === 'submit_tournament') {
      const { username, password, tournamentId, clicks } = req.body;
      const user = db.accounts[username];
      if (!user || user.password !== password) return res.json({ error: 'Auth failed' });
      if (!user.team) return res.json({ error: 'Not in a team' });
      const tournament = db.tournaments.find(t => t.id === tournamentId && t.active);
      if (!tournament) return res.json({ error: 'Tournament not found or ended' });
      const team = db.teams[user.team];
      if (!team) return res.json({ error: 'Team not found' });
      if (tournament.type === 'clicks') team.clicks += clicks;
      else if (tournament.type === 'points') team.points += clicks;
      else if (tournament.type === 'speed') team.clicks = (team.clicks || 0) + clicks;
      await writeDatabase(db);
      return res.json({ message: 'Submitted' });
    }

    // Создание турнира (для админа, можно вызывать вручную)
    if (action === 'create_tournament') {
      const { name, type } = req.body;
      const id = Date.now().toString(36);
      db.tournaments.push({
        id,
        name: name || 'Без названия',
        type: type || 'clicks',
        active: true,
        startTime: Date.now(),
        endTime: Date.now() + 3600000 // 1 час
      });
      await writeDatabase(db);
      return res.json({ message: 'Tournament created', id });
    }

    res.json({ error: 'Unknown action' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}