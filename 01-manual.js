// 교육용: HS256의 구조와 MAC 비교 실습. 서비스에서는 검증된 라이브러리 사용.
const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');
const secret = randomBytes(32);
const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
const decode = part => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
const sign = data => createHmac('sha256', secret).update(data).digest('base64url');
const now = Math.floor(Date.now() / 1000);
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { sub: '1001', role: 'user', iat: now, exp: now + 60 };
const data = `${encode(header)}.${encode(payload)}`;
const token = `${data}.${sign(data)}`;
function checkSignature(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  const expected = Buffer.from(sign(`${h}.${p}`));
  const actual = Buffer.from(s);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
const [h, p, s] = token.split('.');
console.log('JWT:', token);
console.log('Header:', decode(h));
console.log('Payload:', decode(p));
console.log('원본 서명:', checkSignature(token));
const forged = `${h}.${encode({ ...decode(p), role: 'admin' })}.${s}`;
console.log('변조 Payload:', decode(forged.split('.')[1]));
console.log('변조 서명:', checkSignature(forged));
// checkSignature는 MAC 비교만 수행한다. exp, iss, aud 등은 검증하지 않는다.
