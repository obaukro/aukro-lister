// Jednoduchý mock Aukro API pro lokální test synchronizace.
// Spuštění: node test/mock-aukro.mjs   (poslouchá na http://127.0.0.1:8787)
// Data jsou smyšlená, slouží jen k ověření skriptu a jako ukázková data.

import http from 'node:http';

const categories = [
  { id: 1, name: 'Sběratelství', root: true, leaf: false, active: true },
  { id: 10, name: 'Mince', root: false, leaf: false, active: true, parentCategoryId: 1 },
  { id: 8127, name: 'Československo 1945–1992', root: false, leaf: true, active: true, parentCategoryId: 10, maxItemImages: 24 },
  { id: 11, name: 'Pohlednice', root: false, leaf: true, active: true, parentCategoryId: 1, maxItemImages: 12 },
  { id: 2, name: 'Móda', root: true, leaf: false, active: true },
  { id: 20, name: 'Pánské boty', root: false, leaf: true, active: true, parentCategoryId: 2, maxItemImages: 16 },
  { id: 3, name: 'Knihy', root: true, leaf: false, active: true },
  { id: 30, name: 'Beletrie', root: false, leaf: true, active: true, parentCategoryId: 3, maxItemImages: 8 },
  { id: 31, name: 'Archiv (neaktivní)', root: false, leaf: true, active: false, parentCategoryId: 3, maxItemImages: 8 },
];

const condition = {
  id: 48, name: 'Stav', mandatory: true, companyOnly: false,
  valueConstraints: { type: 'combobox', options: [
    { optionId: 714, name: 'Nové' }, { optionId: 715, name: 'Použité' }, { optionId: 9826, name: 'Nefunkční / na díly' } ] },
};

const attributes = {
  8127: [
    condition,
    { id: 86, name: 'Rok vydání', mandatory: true, companyOnly: false, valueConstraints: { type: 'integer', rangeMin: 1945, rangeMax: 1992 } },
    { id: 87, name: 'Materiál', mandatory: false, companyOnly: false, valueConstraints: { type: 'checkbox', options: [
      { optionId: 201, name: 'Stříbro' }, { optionId: 202, name: 'Bronz' }, { optionId: 203, name: 'Hliník' } ] } },
    { id: 88, name: 'Hmotnost (g)', mandatory: false, companyOnly: false, valueConstraints: { type: 'float', rangeMin: 0, rangeMax: 1000 } },
  ],
  11: [condition, { id: 90, name: 'Místo', mandatory: false, companyOnly: false, valueConstraints: { type: 'string', length: 80 } }],
  20: [
    condition,
    { id: 40, name: 'Velikost (EU)', mandatory: true, companyOnly: false, valueConstraints: { type: 'combobox', options:
      [39, 40, 41, 42, 43, 44, 45, 46].map((v) => ({ optionId: 400 + v, name: String(v) })) } },
    { id: 41, name: 'Značka', mandatory: false, companyOnly: false, valueConstraints: { type: 'string', length: 50 } },
    { id: 42, name: 'EAN', mandatory: false, companyOnly: true, valueConstraints: { type: 'string', length: 13 } },
  ],
  30: [
    condition,
    { id: 50, name: 'Autor', mandatory: true, companyOnly: false, valueConstraints: { type: 'string', length: 100 } },
    { id: 51, name: 'Rok vydání', mandatory: false, companyOnly: false, valueConstraints: { type: 'integer', rangeMin: 1800, rangeMax: 2026 } },
    { id: 52, name: 'Klíčová slova', mandatory: false, companyOnly: false, valueConstraints: { type: 'tag', length: 30 } },
  ],
};

const ETAG = '"demo-v1"';
let tokenCalls = 0;
let attrCalls = 0;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const send = (status, body, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
    res.end(body === undefined ? '' : JSON.stringify(body));
  };

  if (req.method === 'POST' && url.pathname === '/auth/oauth2/token') {
    tokenCalls++;
    const auth = req.headers.authorization || '';
    const [id, secret] = Buffer.from(auth.replace('Basic ', ''), 'base64').toString().split(':');
    if (id !== 'demo-client' || secret !== 'demo-secret') return send(401, { error: 'invalid_client' });
    return send(200, { access_token: 'demo-token', token_type: 'Bearer', expires_in: 7200 });
  }

  if (req.headers.authorization !== 'Bearer demo-token' || req.headers['x-aukro-api-key'] !== 'demo-key') {
    return send(403, { message: 'forbidden' });
  }

  if (url.pathname === '/api/v2/categories') {
    if (req.headers['if-none-match'] === ETAG) return send(304, undefined, { ETag: ETAG });
    return send(200, { categories }, { ETag: ETAG });
  }
  const m = url.pathname.match(/^\/api\/v2\/categories\/(\d+)\/attributes$/);
  if (m) {
    attrCalls++;
    const list = attributes[m[1]];
    if (!list) return send(404, { message: 'not a leaf' });
    return send(200, { attributes: list });
  }
  if (url.pathname === '/__stats') return send(200, { tokenCalls, attrCalls });
  send(404, { message: 'not found' });
});

server.listen(8787, '127.0.0.1', () => console.log('Mock Aukro API na http://127.0.0.1:8787'));
