// Čistá logika bez DOM: validace, generování popisu, CSV export/import.
// Používá ji index.html i testy v Node.

export const DOMAINS = {
  'aukro.cz': { currency: 'CZK', language: 'cs-CZ', decimals: 0 },
  'aukro.sk': { currency: 'EUR', language: 'sk-SK', decimals: 2 },
  'aukro.hu': { currency: 'HUF', language: 'hu-HU', decimals: -1 },
  'aukcije.hr': { currency: 'EUR', language: 'hr-HR', decimals: 2 },
  'aukro.si': { currency: 'EUR', language: 'sl-SI', decimals: 2 },
};

export const COUNTRIES = ['CZ', 'SK', 'HU', 'HR', 'SI'];
export const DURATIONS = [3, 5, 7, 10, 30];
export const OFFER_TYPES = { AUCTION: 'Aukce', BUY_NOW: 'Kup teď', COMBINED: 'Aukce + Kup teď' };
export const UNITS = { PIECES: 'kusy', SETS: 'sety', PAIRS: 'páry' };
export const REEXPOSE = { 0: 'Neopakovat', 1: 'Opakovat (nová nabídka)', 2: 'Prodlužovat do prodeje' };
export const MAX_ROWS_PER_FILE = 350;
export const MAX_DESCRIPTION = 65000;

// Sloupce a pořadí přesně podle osvědčené Google Sheets šablony (list „export“),
// jejíž CSV prodejci úspěšně nahrávají do hromadného importu na Aukru.
export const CSV_COLUMNS = [
  'entityId', 'name', 'extId', 'categoryId', 'language', 'description',
  'auctionPriceAmount', 'auctionPriceCurrency', 'buyNowPriceAmount', 'buyNowPriceCurrency',
  'retailPriceAmount', 'retailPriceCurrency', 'quantity', 'location', 'shippingTemplateId',
  'images', 'startingAt', 'duration', 'reexposeType', 'attributes',
  'bestOffer', 'priorityListing', 'boldTitle', 'highlight',
];

// Parametry, které šablona nabízí u všech kategorií (ID a volby převzaté ze Sheets šablony).
// Pokud je kategorie vrací i z API, použije se verze z API.
export const GLOBAL_ATTRIBUTES = [
  { id: 602, name: 'EAN', mandatory: false, companyOnly: false, type: 'string', global: true },
  { id: 601, name: 'P/N', mandatory: false, companyOnly: false, type: 'string', global: true },
  { id: 48, name: 'Stav', mandatory: false, companyOnly: false, type: 'combobox', global: true, options: [
    { id: 714, name: 'Nové' }, { id: 9820, name: 'Rozbaleno' }, { id: 12177, name: 'Zánovní' }, { id: 715, name: 'Použité' },
    { id: 9827, name: 'Opravené' }, { id: 15348, name: 'Repasované' }, { id: 9826, name: 'Nefunkční / na díly' } ] },
  { id: 130547, name: 'Doba záruky (měsíce)', mandatory: false, companyOnly: false, type: 'integer', min: 0, global: true },
  { id: 8820, name: 'Doba dodání', mandatory: false, companyOnly: false, type: 'combobox', global: true, options: [
    { id: 3086, name: '1-2 dny' }, { id: 3087, name: '2-3 dny' }, { id: 3088, name: '4-6 dní' },
    { id: 3089, name: '7-10 dní' }, { id: 3090, name: 'více než 10 dní' } ] },
];

export function mergeAttributes(categoryAttrs = []) {
  const ids = new Set(categoryAttrs.map((a) => a.id));
  return [...GLOBAL_ATTRIBUTES.filter((g) => !ids.has(g.id)), ...categoryAttrs];
}

// ---------- Výchozí hodnoty ----------
export function defaultSettings() {
  return {
    domain: 'aukro.cz',
    city: '',
    postCode: '',
    countryCode: 'CZ',
    shippingTemplateId: '',
    defaultDuration: 7,
    defaultReexposeType: 0,
  };
}

let seq = 0;
export const uid = () => Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);

export function newRow(settings = defaultSettings()) {
  return {
    id: uid(),
    extId: '',
    name: '',
    type: 'BUY_NOW',
    auctionPrice: '',
    buyNowPrice: '',
    retailPrice: '',
    quantity: '1',
    duration: String(settings.defaultDuration || 7),
    startingAt: '',
    reexposeType: String(settings.defaultReexposeType ?? 0),
    images: [],
    description: [],
    attrs: {},
    exportRow: true,
    bestOffer: false,
    priorityListing: false,
    boldTitle: false,
    highlight: false,
  };
}

// ---------- Pomocné ----------
export function parseNumber(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
  if (s === '') return NaN;
  return Number(s);
}

function decimalsOf(n) {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

export function formatAmount(n, domain) {
  const d = (DOMAINS[domain] || DOMAINS['aukro.cz']).decimals;
  if (!Number.isFinite(n) || n === 0) return '0';
  if (d <= 0) return String(Math.round(n));
  return String(Math.round(n * 100) / 100);
}

const isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s).trim());

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// **tučně** -> <strong>tučně</strong>
function inline(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// ---------- Popis ----------
// Bloky: {t:'h2'|'p'|'ul'|'ol'|'img', v:string}. Seznamy: jedna položka na řádek.
export function buildDescriptionHtml(blocks) {
  const parts = [];
  let text = [];
  const flush = () => {
    if (text.length) parts.push(`<div data-layout="text"><div>${text.join('')}</div></div>`);
    text = [];
  };
  for (const b of blocks || []) {
    const v = String(b.v ?? '').trim();
    if (!v) continue;
    if (b.t === 'html') {
      // převzaté HTML z importu CSV, které se nepodařilo rozložit na bloky
      flush();
      parts.push(v.replace(/^<div class=["']aukro-offer-default["']>([\s\S]*)<\/div>$/, '$1'));
    } else if (b.t === 'img') {
      flush();
      parts.push(`<div data-layout="image"><div><img src="${escapeHtml(v)}"></div></div>`);
    } else if (b.t === 'h2') {
      text.push(`<h2>${inline(v)}</h2>`);
    } else if (b.t === 'ul' || b.t === 'ol') {
      const items = v.split('\n').map((x) => x.replace(/^\s*([-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
      if (items.length) text.push(`<${b.t}>${items.map((i) => `<li>${inline(i)}</li>`).join('')}</${b.t}>`);
    } else {
      // jako ve Sheets šabloně: každý řádek = samostatný odstavec
      for (const line of v.split(/\n/)) {
        const p = line.trim();
        if (p) text.push(`<p>${inline(p)}</p>`);
      }
    }
  }
  flush();
  if (!parts.length) return '';
  return `<div class="aukro-offer-default">${parts.join('')}</div>`;
}

// ---------- Validace ----------
// Vrací { field: 'zpráva' }. Klíče: name, type, auctionPrice, buyNowPrice, quantity, duration,
// startingAt, images, video, description, extId, attr:<id>
export function validateRow(row, ctx) {
  const { settings, attributes = [], category } = ctx;
  const e = {};
  const dom = DOMAINS[settings.domain] || DOMAINS['aukro.cz'];

  const name = String(row.name || '').trim();
  if (name.length < 3) e.name = 'Název musí mít aspoň 3 znaky.';
  else if (name.length > 70) e.name = `Název má ${name.length} znaků, povoleno je 70.`;

  if (String(row.extId || '').length > 50) e.extId = 'Externí ID může mít nejvýš 50 znaků.';

  const a = parseNumber(row.auctionPrice);
  const b = parseNumber(row.buyNowPrice);
  const q = parseNumber(row.quantity);
  const checkPrice = (key, n) => {
    if (!Number.isFinite(n) || n <= 0) return (e[key] = 'Zadejte cenu větší než 0.');
    if (dom.decimals === 0 && decimalsOf(n) > 0) return (e[key] = `${dom.currency}: cena bez desetinných míst.`);
    if (dom.decimals === 2 && decimalsOf(n) > 2) return (e[key] = `${dom.currency}: nejvýš 2 desetinná místa.`);
    if (dom.decimals === -1 && n % 10 !== 0) return (e[key] = `${dom.currency}: cena zaokrouhlená na desítky.`);
  };
  if (!OFFER_TYPES[row.type]) e.type = 'Vyberte typ nabídky.';
  if (row.type === 'AUCTION' || row.type === 'COMBINED') checkPrice('auctionPrice', a);
  if (row.type === 'BUY_NOW' || row.type === 'COMBINED') checkPrice('buyNowPrice', b);
  if (row.type === 'COMBINED' && !e.auctionPrice && !e.buyNowPrice && b <= a)
    e.buyNowPrice = 'Cena Kup teď musí být vyšší než vyvolávací cena.';
  if (String(row.retailPrice ?? '').trim() !== '') checkPrice('retailPrice', parseNumber(row.retailPrice));

  if (!Number.isInteger(q) || q < 1) e.quantity = 'Množství musí být celé číslo ≥ 1.';
  else if ((row.type === 'AUCTION' || row.type === 'COMBINED') && q !== 1) e.quantity = 'Aukce může mít jen 1 kus.';

  const d = Number(row.duration);
  if (!DURATIONS.includes(d)) e.duration = 'Délka musí být 3, 5, 7, 10 nebo 30 dní.';
  else if (d === 30 && row.type !== 'BUY_NOW') e.duration = '30 dní jen pro nabídku Kup teď.';

  if (row.startingAt) {
    const t = Date.parse(row.startingAt);
    if (!Number.isFinite(t)) e.startingAt = 'Neplatné datum.';
    else if (t < Date.now()) e.startingAt = 'Začátek musí být v budoucnu (nebo nechte prázdné = hned).';
  }

  const imgs = (row.images || []).filter((x) => String(x).trim());
  const maxImg = category?.maxImages || 24;
  if (!imgs.length) e.images = 'Přidejte aspoň 1 fotku (URL).';
  else if (imgs.length > maxImg) e.images = `Kategorie povoluje nejvýš ${maxImg} fotek.`;
  else if (imgs.some((u) => !isUrl(u))) e.images = 'Každá fotka musí být veřejná adresa začínající http(s)://';


  const html = buildDescriptionHtml(row.description);
  if (!html) e.description = 'Popis je povinný.';
  else if (html.length > MAX_DESCRIPTION) e.description = `Popis má ${html.length} znaků včetně HTML, povoleno je 65 000.`;

  for (const at of attributes) {
    const key = `attr:${at.id}`;
    const v = row.attrs?.[at.id];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);
    if (empty) {
      if (at.mandatory) e[key] = `${at.name}: povinný parametr.`;
      continue;
    }
    if (at.type === 'combobox') {
      if (!at.options?.some((o) => String(o.id) === String(v))) e[key] = `${at.name}: vyberte hodnotu ze seznamu.`;
    } else if (at.type === 'checkbox') {
      const ids = Array.isArray(v) ? v : [v];
      if (ids.some((id) => !at.options?.some((o) => String(o.id) === String(id)))) e[key] = `${at.name}: neplatná volba.`;
    } else if (at.type === 'integer' || at.type === 'float') {
      const n = parseNumber(v);
      if (!Number.isFinite(n)) e[key] = `${at.name}: zadejte číslo.`;
      else if (at.type === 'integer' && !Number.isInteger(n)) e[key] = `${at.name}: zadejte celé číslo.`;
      else if (at.min != null && n < at.min) e[key] = `${at.name}: minimum je ${at.min}.`;
      else if (at.max != null && n > at.max) e[key] = `${at.name}: maximum je ${at.max}.`;
    } else if (at.length != null && String(v).length > at.length) {
      e[key] = `${at.name}: nejvýš ${at.length} znaků.`;
    }
  }
  return e;
}

export function validateSettings(s) {
  const e = {};
  if (!DOMAINS[s.domain]) e.domain = 'Vyberte doménu účtu.';
  if (String(s.city || '').trim().length < 2) e.city = 'Vyplňte město.';
  if (!String(s.postCode || '').trim()) e.postCode = 'Vyplňte PSČ.';
  if (!COUNTRIES.includes(s.countryCode)) e.countryCode = 'Vyberte zemi.';
  if (!/^\d+$/.test(String(s.shippingTemplateId || '').trim())) e.shippingTemplateId = 'Zadejte číselné ID šablony dopravy z Moje Aukro.';
  return e;
}

// ---------- Export ----------
export function rowToRecord(row, entityId, ctx) {
  const { settings, categoryId, attributes = [] } = ctx;
  const dom = DOMAINS[settings.domain] || DOMAINS['aukro.cz'];
  const auction = row.type === 'BUY_NOW' ? 0 : parseNumber(row.auctionPrice);
  const buyNow = row.type === 'AUCTION' ? 0 : parseNumber(row.buyNowPrice);
  const retail = parseNumber(row.retailPrice);
  const attrs = [];
  for (const at of attributes) {
    const v = row.attrs?.[at.id];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    if (at.type === 'combobox' || at.type === 'checkbox') {
      attrs.push({ id: at.id, selectedId: (Array.isArray(v) ? v : [v]).map(Number) });
    } else {
      attrs.push({ id: at.id, value: String(at.type === 'float' || at.type === 'integer' ? parseNumber(v) : v).trim() });
    }
  }
  const hasRetail = Number.isFinite(retail) && retail > 0;
  return {
    entityId,
    name: String(row.name).trim(),
    extId: String(row.extId || '').trim(),
    categoryId,
    language: dom.language,
    description: buildDescriptionHtml(row.description),
    auctionPriceAmount: formatAmount(auction, settings.domain),
    auctionPriceCurrency: dom.currency,
    buyNowPriceAmount: formatAmount(buyNow, settings.domain),
    buyNowPriceCurrency: dom.currency,
    retailPriceAmount: hasRetail ? formatAmount(retail, settings.domain) : '',
    retailPriceCurrency: hasRetail ? dom.currency : '',
    quantity: String(parseNumber(row.quantity)),
    location: JSON.stringify({ countryCode: settings.countryCode, postCode: String(settings.postCode).trim(), city: String(settings.city).trim() }),
    shippingTemplateId: String(settings.shippingTemplateId).trim(),
    images: (row.images || []).map((u) => String(u).trim()).filter(Boolean).join(' '),
    startingAt: row.startingAt ? new Date(row.startingAt).toISOString().replace(/\.\d{3}Z$/, 'Z') : '',
    duration: String(row.duration),
    reexposeType: String(row.reexposeType ?? 0),
    attributes: JSON.stringify(attrs),
    bestOffer: String(!!row.bestOffer),
    priorityListing: String(!!row.priorityListing),
    boldTitle: String(!!row.boldTitle),
    highlight: String(!!row.highlight),
  };
}

export function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(records) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of records) lines.push(CSV_COLUMNS.map((c) => csvEscape(r[c])).join(','));
  return lines.join('\n') + '\n';
}

// Rozdělí záznamy do souborů po max. 350 nabídkách; entityId se čísluje v rámci souboru od 1.
export function chunkRecords(records, size = MAX_ROWS_PER_FILE) {
  const out = [];
  for (let i = 0; i < records.length; i += size) {
    out.push(records.slice(i, i + size).map((r, j) => ({ ...r, entityId: j + 1 })));
  }
  return out;
}

// ---------- Import CSV ----------
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

function safeJson(s, fallback) {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

// Převede záznam z CSV zpět na řádek. parseDescription dodá volající (v prohlížeči přes DOMParser).
export function recordToRow(rec, parseDescription = (h) => (h ? [{ t: 'html', v: h }] : [])) {
  const a = parseNumber(rec.auctionPriceAmount);
  const b = parseNumber(rec.buyNowPriceAmount);
  const type = a > 0 && b > 0 ? 'COMBINED' : a > 0 ? 'AUCTION' : 'BUY_NOW';
  const attrs = {};
  for (const x of safeJson(rec.attributes, [])) {
    if (Array.isArray(x.selectedId)) attrs[x.id] = x.selectedId.length === 1 ? String(x.selectedId[0]) : x.selectedId.map(String);
    else if (x.value !== undefined) attrs[x.id] = String(x.value);
  }
  let startingAt = '';
  if (rec.startingAt) {
    const d = new Date(rec.startingAt);
    if (!isNaN(d)) {
      const p = (n) => String(n).padStart(2, '0');
      startingAt = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    }
  }
  const r = parseNumber(rec.retailPriceAmount);
  const bool = (v) => String(v).toLowerCase() === 'true';
  return {
    id: uid(),
    extId: rec.extId || '',
    name: rec.name || '',
    type,
    auctionPrice: a > 0 ? String(a) : '',
    buyNowPrice: b > 0 ? String(b) : '',
    retailPrice: r > 0 ? String(r) : '',
    quantity: rec.quantity || '1',
    duration: rec.duration || '7',
    startingAt,
    reexposeType: rec.reexposeType || '0',
    images: String(rec.images || '').split(/\s+/).filter(Boolean),
    description: parseDescription(rec.description || ''),
    attrs,
    exportRow: true,
    bestOffer: bool(rec.bestOffer),
    priorityListing: bool(rec.priorityListing),
    boldTitle: bool(rec.boldTitle),
    highlight: bool(rec.highlight),
  };
}

// Nastavení odvozená z prvního záznamu CSV (lokace, doprava).
export function settingsFromRecord(rec, base) {
  const loc = safeJson(rec.location, {});
  const s = { ...base };
  if (loc.city) s.city = loc.city;
  if (loc.postCode) s.postCode = loc.postCode;
  if (loc.countryCode) s.countryCode = loc.countryCode;
  if (rec.shippingTemplateId) s.shippingTemplateId = rec.shippingTemplateId;
  const dom = Object.entries(DOMAINS).find(([, d]) => d.language === rec.language);
  if (dom) s.domain = dom[0];
  return s;
}
