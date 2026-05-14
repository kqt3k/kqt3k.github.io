import crypto from 'crypto';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'kqt3k/kqt3k.github.io';
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

  try {
    if (action === 'ping') return res.json({ status: 'ok' });

    if (action === 'register') {
      const { username, password } = req.body;
      if (db.accounts[username]) return res.json({ error: 'Username taken' });
      const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      db.accounts[username] = {
        password,
        data: {},
        referral_code: referralCode,
        referred_by: null,
        used_referral_code: null
      };
      await writeDatabase(db);
      return res.json({ message: 'Registered', referral_code: referralCode });
    }

    if (action === 'login') {
      const { username, password } = req.body;
      const acc = db.accounts[username];
      if (!acc || acc.password !== password) return res.json({ error: 'Invalid credentials' });
      return res.json({
        message: 'Logged in',
        game_data: acc.data,
        referral_code: acc.referral_code || ''
      });
    }

    if (action === 'sync') {
      const { username, password, game_data } = req.body;
      const acc = db.accounts[username];
      if (!acc || acc.password !== password) return res.json({ error: 'Auth failed' });
      acc.data = game_data;
      await writeDatabase(db);
      return res.json({ message: 'Synced' });
    }

    if (action === 'load') {
      const { username, password } = req.body;
      const acc = db.accounts[username];
      if (!acc || acc.password !== password) return res.json({ error: 'Auth failed' });
      return res.json({ game_data: acc.data });
    }

    if (action === 'apply_referral') {
      const { username, referral_code } = req.body;
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
      if (!user.data) user.data = {};
      if (!user.data.ownedPets) user.data.ownedPets = [];
      let refPetUser = user.data.ownedPets.find(p => p.type === 'refpet');
      if (refPetUser) refPetUser.count += 1;
      else user.data.ownedPets.push({ type: 'refpet', count: 1, equipped: false, x: Math.random()*800, y: Math.random()*600 });

      const refAcc = db.accounts[referrer];
      if (!refAcc.data) refAcc.data = {};
      if (!refAcc.data.ownedPets) refAcc.data.ownedPets = [];
      let refPetRef = refAcc.data.ownedPets.find(p => p.type === 'refpet');
      if (refPetRef) refPetRef.count += 1;
      else refAcc.data.ownedPets.push({ type: 'refpet', count: 1, equipped: false, x: Math.random()*800, y: Math.random()*600 });

      await writeDatabase(db);
      return res.json({ message: 'Referral applied' });
    }

    res.json({ error: 'Unknown action' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}