const jwt = require('jsonwebtoken');
const { randomBytes } = require('node:crypto');
const secret = randomBytes(32);
const opts = { algorithms: ['HS256'], issuer: 'jwt-lab', audience: 'jwt-lab-api' };
const token = jwt.sign({ sub: '1001', role: 'user' }, secret, {
  algorithm: 'HS256', expiresIn: '5s', issuer: opts.issuer, audience: opts.audience
});
console.log('JWT:', token);
console.log('Decode:', jwt.decode(token, { complete: true }));
console.log('Verify:', jwt.verify(token, secret, opts));
setTimeout(() => {
  try { console.log(jwt.verify(token, secret, opts)); }
  catch (err) { console.log(err.name, err.message); }
}, 6000);
