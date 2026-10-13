#!/usr/bin/env node
// Synchronizace číselníků z Aukro Public API v2 do statických JSON souborů.
//
// Proměnné prostředí:
//   AUKRO_CLIENT_ID, AUKRO_CLIENT_SECRET, AUKRO_API_KEY   (povinné)
//   AUKRO_BASE_URL     výchozí https://aukro.cz
//   AUKRO_LANGUAGES    jazyky číselníků oddělené čárkou, výchozí cs-CZ,sk-SK,hu-HU,hr-HR,sl-SI
//                      (výstup: OUT_DIR/<jazyk>/categories.json, attributes/, manifest.json)
//   OUT_DIR            výchozí site/data
//   CONCURRENCY        počet souběžných požadavků na parametry, výchozí 2
//   DELAY_MS           pauza mezi požadavky jednoho vlákna, výchozí 150
//   MAX_AGE_DAYS       po kolika dnech znovu stáhnout všechny parametry, i když se kategorie nezměnily (výchozí 7)
//   FORCE=1            stáhnout vše bez ohledu na ETag a stáří
//
// Spuštění: node sync/sync.mjs

import { mkdir, readFile, writeFile, readdir, unlink, rm } from 'node:fs/promises';
import { join } from 'node:path';

const env = process.env;
const BASE = (env.AUKRO_BASE_URL || 'https://aukro.cz').replace(/\/$/, '');
const API = `${BASE}/api/v2`;
const LANGUAGES = (env.AUKRO_LANGUAGES || env.AUKRO_LANGUAGE || 'cs-CZ,sk-SK,hu-HU,hr-HR,sl-SI').split(',').map((x) => x.trim()).filter(Boolean);
const OUT = env.OUT_DIR || 'site/data';
const CONCURRENCY = Number(env.CONCURRENCY || 2);
const DELAY_MS = Number(env.DELAY_MS || 150);
const MAX_AGE_DAYS = Number(env.MAX_AGE_DAYS || 7);
const FORCE = env.FORCE === '1' || env.FORCE === 'true';

for (const name of ['AUKRO_CLIENT_ID', 'AUKRO_CLIENT_SECRET', 'AUKRO_API_KEY']) {
  if (!env[name]) {
    console.error(`Chybí proměnná prostředí ${name}.`);
    process.exit(2);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- OAuth2 client_credentials ----------
let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiresAt - 60_000) return token;
  const basic = Buffer.from(`${env.AUKRO_CLIENT_ID}:${env.AUKRO_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${BASE}/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'read openid public_api' }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Získání tokenu selhalo (HTTP ${res.status}): ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  token = data.access_token;
  tokenExpiresAt = Date.now() + (Number(data.expires_in) || 7200) * 1000;
  return token;
}

// ---------- HTTP s opakováním ----------
async function api(path, { etag, language } = {}) {
  for (let attempt = 1; ; attempt++) {
    const headers = {
      Authorization: `Bearer ${await getToken()}`,
      'X-Aukro-Api-Key': env.AUKRO_API_KEY,
      'X-Accept-Language': language,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (etag) headers['If-None-Match'] = etag;
    let res;
    try {
      res = await fetch(`${API}${path}`, { headers });
    } catch (err) {
      if (attempt >= 5) throw err;
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (res.status === 304) return { notModified: true, etag: res.headers.get('etag') || etag };
    if (res.status === 401 && attempt < 3) {
      token = null; // token mohl vypršet
      continue;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt;
      log(`HTTP ${res.status} na ${path}, čekám ${retryAfter}s (pokus ${attempt})`);
      await sleep(retryAfter * 1000);
      continue;
    }
    const text = await res.text();
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} na ${path}: ${text.slice(0, 300)}`);
      err.status = res.status;
      throw err;
    }
    return { data: JSON.parse(text), etag: res.headers.get('etag') };
  }
}

// ---------- Pomocné funkce pro soubory ----------
async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

// Zapíše soubor jen pokud se obsah změnil -> žádné zbytečné commity.
async function writeIfChanged(path, obj) {
  const next = JSON.stringify(obj) + '\n';
  let prev = null;
  try {
    prev = await readFile(path, 'utf8');
  } catch {}
  if (prev === next) return false;
  await writeFile(path, next);
  return true;
}

// ---------- Normalizace dat do kompaktní podoby pro HTML nástroj ----------
function normalizeCategories(list) {
  return list
    .map((c) => ({
      id: c.id,
      name: c.name,
      parentId: c.parentCategoryId ?? null,
      leaf: !!c.leaf,
      active: !!c.active,
      maxImages: c.maxItemImages ?? null,
    }))
    .sort((a, b) => a.id - b.id);
}

function normalizeAttribute(a) {
  const vc = a.valueConstraints || {};
  const out = {
    id: a.id,
    name: a.name,
    mandatory: !!a.mandatory,
    companyOnly: !!a.companyOnly,
    type: vc.type || 'string',
  };
  if (Array.isArray(vc.options)) out.options = vc.options.map((o) => ({ id: o.optionId, name: o.name }));
  if (vc.length != null) out.length = vc.length;
  if (vc.rangeMin != null) out.min = vc.rangeMin;
  if (vc.rangeMax != null) out.max = vc.rangeMax;
  return out;
}

// ---------- Hlavní běh ----------
async function syncLanguage(LANGUAGE, OUT) {
  const attrDir = join(OUT, 'attributes');
  await mkdir(attrDir, { recursive: true });

  const manifestPath = join(OUT, 'manifest.json');
  await mkdir(OUT, { recursive: true });
  const manifest = await readJson(manifestPath, {});
  if (manifest.demo) delete manifest.categoriesEtag; // ukázková data vždy přepsat

  log(`[${LANGUAGE}] Stahuji kategorie z ${API}`);
  const cat = await api('/categories', { etag: FORCE ? undefined : manifest.categoriesEtag, language: LANGUAGE });

  const lastFull = manifest.attributesCheckedAt ? Date.parse(manifest.attributesCheckedAt) : 0;
  const stale = Date.now() - lastFull > MAX_AGE_DAYS * 86400_000;

  let categories;
  if (cat.notModified) {
    if (!stale && !FORCE) {
      log(`[${LANGUAGE}] Kategorie se nezměnily a parametry jsou čerstvé.`);
      return { ok: true };
    }
    log('Kategorie se nezměnily, ale parametry jsou starší než limit – obnovuji parametry.');
    categories = await readJson(join(OUT, 'categories.json'), null);
    if (!categories) {
      // cache chybí -> stáhnout znovu bez ETagu
      const fresh = await api('/categories', { language: LANGUAGE });
      categories = normalizeCategories(fresh.data.categories || []);
      cat.etag = fresh.etag;
    }
  } else {
    categories = normalizeCategories(cat.data.categories || []);
  }

  const catChanged = await writeIfChanged(join(OUT, 'categories.json'), categories);
  log(`Kategorií: ${categories.length}${catChanged ? ' (změněno)' : ''}`);

  const leaves = categories.filter((c) => c.leaf && c.active);
  log(`Listových aktivních kategorií: ${leaves.length}, stahuji parametry…`);

  let done = 0;
  let changed = 0;
  const failures = [];
  const queue = [...leaves];

  async function worker() {
    while (queue.length) {
      const c = queue.shift();
      try {
        const res = await api(`/categories/${c.id}/attributes`, { language: LANGUAGE });
        const attrs = (res.data.attributes || []).map(normalizeAttribute);
        if (await writeIfChanged(join(attrDir, `${c.id}.json`), { categoryId: c.id, attributes: attrs })) changed++;
      } catch (err) {
        failures.push({ id: c.id, error: err.message });
      }
      done++;
      if (done % 100 === 0) log(`  ${done}/${leaves.length}`);
      await sleep(DELAY_MS);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));

  // smazat parametry kategorií, které už nejsou listové/aktivní
  const keep = new Set(leaves.map((c) => `${c.id}.json`));
  let removed = 0;
  for (const f of await readdir(attrDir)) {
    if (f.endsWith('.json') && !keep.has(f)) {
      await unlink(join(attrDir, f));
      removed++;
    }
  }

  log(`Parametry: změněno ${changed}, odstraněno ${removed}, chyb ${failures.length}`);
  for (const f of failures.slice(0, 20)) log(`  chyba u kategorie ${f.id}: ${f.error}`);

  const dataChanged = catChanged || changed > 0 || removed > 0 || manifest.demo;
  const now = new Date().toISOString();
  const next = {
    language: LANGUAGE,
    updatedAt: dataChanged ? now : manifest.updatedAt || now,
    attributesCheckedAt: now,
    categoriesEtag: cat.etag || null,
    categoryCount: categories.length,
    leafCount: leaves.length,
  };
  await writeIfChanged(manifestPath, next);

  // Víc než 5 % chyb = něco je špatně, ať workflow selže a přijde e-mail.
  if (failures.length > Math.max(5, leaves.length * 0.05)) {
    console.error(`[${LANGUAGE}] Příliš mnoho chyb (${failures.length}).`);
    return { ok: false };
  }
  log(`[${LANGUAGE}] Hotovo.`);
  return { ok: true };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const topPath = join(OUT, 'manifest.json');
  const top = await readJson(topPath, {});
  // přechod ze staršího uspořádání (jen čeština přímo v OUT/) – staré soubory odstranit
  if (!Array.isArray(top.languages)) {
    await rm(join(OUT, 'categories.json'), { force: true });
    await rm(join(OUT, 'attributes'), { recursive: true, force: true });
  }
  let allOk = true;
  for (const lang of LANGUAGES) {
    const res = await syncLanguage(lang, join(OUT, lang));
    if (!res.ok) allOk = false;
  }
  // souhrnný manifest: seznam jazyků a nejnovější změna
  let updatedAt = null;
  for (const lang of LANGUAGES) {
    const m = await readJson(join(OUT, lang, 'manifest.json'), {});
    if (m.updatedAt && (!updatedAt || m.updatedAt > updatedAt)) updatedAt = m.updatedAt;
  }
  await writeIfChanged(topPath, { languages: LANGUAGES, updatedAt });
  if (!allOk) process.exit(1);
  log('Hotovo.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
