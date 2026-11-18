import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:5173';
assert.ok(/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base), 'Route tests must run against a local preview.');
const results = [];
async function check(name, fn) { try { await fn(); results.push({ name, passed: true }); } catch (e) { results.push({ name, passed: false, error: e.message }); throw e; } }
const request = (path, init = {}) => fetch(base + path, { ...init, redirect: 'manual', signal: AbortSignal.timeout(20000) });
let cookie;
try {
  await check('Entry page returns the real session-check loading screen', async () => { const r = await request('/'); assert.equal(r.status, 200); assert.match(await r.text(), /Проверяем подключение/); });
  await check('Anonymous session has no identity', async () => { const r = await request('/api/session'), s = await r.json(); assert.equal(s.authenticated, false); assert.equal(s.email, null); });
  await check('Anonymous API access is denied', async () => { for (const path of ['/api/data', '/api/files']) assert.equal((await request(path)).status, 401); });
  await check('Protected workspace routes require sign-in', async () => { const r = await request('/calendar'); assert.ok([302, 303, 307, 308].includes(r.status)); assert.match(r.headers.get('location') || '', /signin-with-chatgpt/); });
  await check('Development login returns to the home page', async () => { const r = await request('/signin-with-chatgpt?return_to=%2Foverview'); assert.ok([302, 303, 307, 308].includes(r.status)); assert.match(r.headers.get('location') || '', /overview/); cookie = (r.headers.get('set-cookie') || '').split(';')[0]; assert.ok(cookie); });
  await check('Authenticated session is recognized', async () => { const r = await request('/api/session', { headers: { Cookie: cookie } }); assert.equal((await r.json()).authenticated, true); });
  for (const section of ['overview', 'calendar', 'students', 'homework', 'progress', 'finance', 'settings']) {
    await check(`Direct /${section} route survives refresh`, async () => { const r = await request('/' + section, { headers: { Cookie: cookie } }); assert.equal(r.status, 200); assert.match(await r.text(), /TutorSpace/); });
  }
  await check('Unknown routes return 404', async () => { assert.equal((await request('/unknown-tutorspace-page', { headers: { Cookie: cookie } })).status, 404); });
  await check('Authenticated data is served without browser caching', async () => { const r = await request('/api/data', { headers: { Cookie: cookie } }); assert.equal(r.status, 200); assert.match(r.headers.get('cache-control'), /no-store/); const d = await r.json(); assert.ok(Array.isArray(d.students)); assert.ok(d.preferences); });
  await check('Cross-origin preference writes remain blocked', async () => { const r = await request('/api/data', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://unrelated.invalid', 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(r.status, 403); });
} finally {
  const report = { created: new Date().toISOString(), passed: results.filter(x => x.passed).length, failed: results.filter(x => !x.passed).length, tests: results };
  writeFileSync(new URL('../work/route-test-results.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
