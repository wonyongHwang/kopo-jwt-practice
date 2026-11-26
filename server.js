const express = require('express');
const jwt = require('jsonwebtoken');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const path = require('node:path');
const app = express();
const secret = process.env.JWT_SECRET ? Buffer.from(process.env.JWT_SECRET, 'hex') : randomBytes(32);
if (secret.length < 32) throw new Error('JWT_SECRET must be at least 32 random bytes in hex.');
const issuer = 'jwt-lab';
const audience = 'jwt-lab-api';
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
// 공개된 실습용 계정. 운영 서비스에서는 DB + 비밀번호 해시 + 로그인 제한 사용.
function makeUser(id, username, password, role) {
  const salt = randomBytes(16);
  return { id, username, role, salt, hash: scryptSync(password, salt, 64) };
}
const users = [makeUser('1001', 'student', '1234', 'user'), makeUser('1002', 'admin', '5678', 'admin')];
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'ID와 비밀번호를 입력하세요.' });
  }
  const user = users.find(u => u.username === username);
  if (!user || !timingSafeEqual(user.hash, scryptSync(password, user.salt, 64))) {
    return res.status(401).json({ message: '로그인 실패' });
  }
  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, secret, {
    algorithm: 'HS256', expiresIn: '60s', issuer, audience
  });
  res.set('Cache-Control', 'no-store').json({ token });
});
function authenticate(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.get('Authorization') || '');
  if (!match) return res.status(401).json({ message: 'Bearer 토큰이 필요합니다.' });
  try {
    const claims = jwt.verify(match[1], secret, { algorithms: ['HS256'], issuer, audience });
    if (typeof claims !== 'object' || !claims || typeof claims.exp !== 'number' || typeof claims.sub !== 'string') {
      return res.status(401).json({ message: '필수 Claim 누락' });
    }
    req.user = claims;
    next();
  } catch (err) {
    res.status(401).json({ message: err.name === 'TokenExpiredError' ? '토큰 만료' : '유효하지 않은 토큰' });
  }
}
app.get('/api/profile', authenticate, (req, res) => {
  const { sub, username, role } = req.user;
  res.json({ id: sub, username, role });
});
app.get('/api/admin', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '관리자 권한 필요' });
  res.json({ message: '관리자 페이지 접근 성공' });
});
app.listen(3000, '127.0.0.1', () => console.log('http://localhost:3000'));
