import { t, daysLabel } from './i18n.js';

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
export const OFFER_TYPE_KEYS = ['AUCTION', 'BUY_NOW', 'COMBINED'];
// popisky v aktuálním jazyce
export const offerTypes = () => ({ AUCTION: t('typeAuction'), BUY_NOW: t('typeBuyNow'), COMBINED: t('typeCombined') });
export const durations = () => Object.fromEntries(DURATIONS.map((d) => [String(d), daysLabel(d)]));
export const reexposeTypes = () => ({ 0: t('reexpose0'), 1: t('reexpose1'), 2: t('reexpose2') });
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
export const GLOBAL_IDS = [602, 601, 48, 130547, 8820];
// Atribut „Kód zboží“ – vyplňuje se ze sloupce Kód zboží (extId) na listu Nabídky.
export const PRODUCT_CODE_ATTR_ID = 18152;
// Atributy vyplňované na listu Nabídky (na listu Atributy se nezobrazují).
export const MAIN_TABLE_ATTR_IDS = [...GLOBAL_IDS, PRODUCT_CODE_ATTR_ID];

// Hodnoty atributů včetně Kódu zboží převzatého ze sloupce extId (pokud ho kategorie má).
export function effectiveAttrs(row, attributes = []) {
  const attrs = { ...(row.attrs || {}) };
  const code = String(row.extId || '').trim();
  if (code && attributes.some((a) => a.id === PRODUCT_CODE_ATTR_ID) && !attrs[PRODUCT_CODE_ATTR_ID]) attrs[PRODUCT_CODE_ATTR_ID] = code;
  return attrs;
}
export const globalAttributes = () => [
  { id: 602, name: 'EAN', mandatory: false, companyOnly: false, type: 'string', global: true },
  { id: 601, name: 'P/N', mandatory: false, companyOnly: false, type: 'string', global: true },
  { id: 48, name: t('gStav'), mandatory: false, companyOnly: false, type: 'combobox', global: true, options: [
    { id: 714, name: t('sNew') }, { id: 9820, name: t('sUnpacked') }, { id: 12177, name: t('sLikeNew') }, { id: 715, name: t('sUsed') },
    { id: 9827, name: t('sRepaired') }, { id: 15348, name: t('sRefurbished') }, { id: 9826, name: t('sBroken') } ] },
  { id: 130547, name: t('gWarranty'), mandatory: false, companyOnly: false, type: 'integer', min: 0, global: true },
  { id: 8820, name: t('gDelivery'), mandatory: false, companyOnly: false, type: 'combobox', global: true, options: [
    { id: 3086, name: t('d12') }, { id: 3087, name: t('d23') }, { id: 3088, name: t('d46') },
    { id: 3089, name: t('d710') }, { id: 3090, name: t('d10plus') } ] },
];

export function mergeAttributes(categoryAttrs = []) {
  const ids = new Set(categoryAttrs.map((a) => a.id));
  return [...globalAttributes().filter((g) => !ids.has(g.id)), ...categoryAttrs];
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
    categoryId: null,
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
    description: '',
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
// Popis jako prostý text (jako ve Sheets šabloně), s jednoduchým formátováním:
//   každý řádek = odstavec · "## Nadpis" · "- položka" = odrážky · "1. položka" = číslovaný seznam · **tučně**
// Text začínající <div class="aukro-offer-default"> se převezme jako hotové HTML.
export function textToBlocks(text) {
  const t = String(text ?? '').replace(/\r/g, '');
  if (!t.trim()) return [];
  if (/^\s*<div class=["']aukro-offer-default["']/.test(t)) return [{ t: 'html', v: t.trim() }];
  const blocks = [];
  for (const raw of t.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    let m;
    if ((m = line.match(/^#{1,3}\s+(.+)/))) blocks.push({ t: 'h2', v: m[1] });
    else if ((m = line.match(/^[-*•]\s+(.+)/)) || (m = line.match(/^\d+[.)]\s+(.+)/))) {
      const kind = /^\d/.test(line) ? 'ol' : 'ul';
      const last = blocks.at(-1);
      if (last && last.t === kind) last.v += '\n' + m[1];
      else blocks.push({ t: kind, v: m[1] });
    } else {
      const last = blocks.at(-1);
      if (last && last.t === 'p') last.v += '\n' + line;
      else blocks.push({ t: 'p', v: line });
    }
  }
  return blocks;
}

export function blocksToText(blocks) {
  return (blocks || []).map((b) => {
    if (b.t === 'h2') return `## ${b.v}`;
    if (b.t === 'ul') return String(b.v).split('\n').map((x) => `- ${x}`).join('\n');
    if (b.t === 'ol') return String(b.v).split('\n').map((x, i) => `${i + 1}. ${x}`).join('\n');
    if (b.t === 'img') return '';
    return String(b.v);
  }).filter(Boolean).join('\n');
}

export function buildDescriptionHtml(blocks) {
  if (typeof blocks === 'string') blocks = textToBlocks(blocks);
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

  if (!row.categoryId) e.categoryId = t('vCategoryMissing');
  else if (!category) e.categoryId = t('vCategoryUnknown', { id: row.categoryId });
  else if (!category.leaf || !category.active) e.categoryId = t('vCategoryNotLeaf');

  const name = String(row.name || '').trim();
  if (name.length < 3) e.name = t('vNameShort');
  else if (name.length > 70) e.name = t('vNameLong', { len: name.length });

  if (String(row.extId || '').length > 50) e.extId = t('vExtId');

  const a = parseNumber(row.auctionPrice);
  const b = parseNumber(row.buyNowPrice);
  const q = parseNumber(row.quantity);
  const checkPrice = (key, n) => {
    if (!Number.isFinite(n) || n <= 0) return (e[key] = t('vPrice'));
    if (dom.decimals === 0 && decimalsOf(n) > 0) return (e[key] = t('vPriceNoDecimals', { cur: dom.currency }));
    if (dom.decimals === 2 && decimalsOf(n) > 2) return (e[key] = t('vPrice2Decimals', { cur: dom.currency }));
    if (dom.decimals === -1 && n % 10 !== 0) return (e[key] = t('vPriceTens', { cur: dom.currency }));
  };
  if (!OFFER_TYPE_KEYS.includes(row.type)) e.type = t('vType');
  if (row.type === 'AUCTION' || row.type === 'COMBINED') checkPrice('auctionPrice', a);
  if (row.type === 'BUY_NOW' || row.type === 'COMBINED') checkPrice('buyNowPrice', b);
  if (row.type === 'COMBINED' && !e.auctionPrice && !e.buyNowPrice && b <= a)
    e.buyNowPrice = t('vBuyNowHigher');
  if (String(row.retailPrice ?? '').trim() !== '') checkPrice('retailPrice', parseNumber(row.retailPrice));

  if (!Number.isInteger(q) || q < 1) e.quantity = t('vQuantity');
  else if ((row.type === 'AUCTION' || row.type === 'COMBINED') && q !== 1) e.quantity = t('vQuantityAuction');

  const d = Number(row.duration);
  if (!DURATIONS.includes(d)) e.duration = t('vDuration');
  else if (d === 30 && row.type !== 'BUY_NOW') e.duration = t('vDuration30');

  if (row.startingAt) {
    const t = Date.parse(row.startingAt);
    if (!Number.isFinite(t)) e.startingAt = t('vDateInvalid');
    else if (t < Date.now()) e.startingAt = t('vDatePast');
  }

  const imgs = (row.images || []).filter((x) => String(x).trim());
  const maxImg = category?.maxImages || 24;
  if (!imgs.length) e.images = t('vImagesMissing');
  else if (imgs.length > maxImg) e.images = t('vImagesTooMany', { max: maxImg });
  else if (imgs.some((u) => !isUrl(u))) e.images = t('vImagesUrl');


  const html = buildDescriptionHtml(row.description);
  if (!html) e.description = t('vDescMissing');
  else if (html.length > MAX_DESCRIPTION) e.description = t('vDescLong', { len: html.length });

  const eff = effectiveAttrs(row, attributes);
  for (const at of attributes) {
    const key = `attr:${at.id}`;
    const v = eff[at.id];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);
    if (empty) {
      if (at.mandatory) e[key] = t('vAttrRequired', { name: at.name });
      continue;
    }
    if (at.type === 'combobox') {
      if (!at.options?.some((o) => String(o.id) === String(v))) e[key] = t('vAttrChoose', { name: at.name });
    } else if (at.type === 'checkbox') {
      const ids = Array.isArray(v) ? v : [v];
      if (ids.some((id) => !at.options?.some((o) => String(o.id) === String(id)))) e[key] = t('vAttrInvalid', { name: at.name });
    } else if (at.type === 'integer' || at.type === 'float') {
      const n = parseNumber(v);
      if (!Number.isFinite(n)) e[key] = t('vAttrNumber', { name: at.name });
      else if (at.type === 'integer' && !Number.isInteger(n)) e[key] = t('vAttrInteger', { name: at.name });
      else if (at.min != null && n < at.min) e[key] = t('vAttrMin', { name: at.name, v: at.min });
      else if (at.max != null && n > at.max) e[key] = t('vAttrMax', { name: at.name, v: at.max });
    } else if (at.length != null && String(v).length > at.length) {
      e[key] = t('vAttrLength', { name: at.name, v: at.length });
    }
  }
  return e;
}

export function validateSettings(s) {
  const e = {};
  if (!DOMAINS[s.domain]) e.domain = t('vSetDomain');
  if (String(s.city || '').trim().length < 2) e.city = t('vSetCity');
  if (!String(s.postCode || '').trim()) e.postCode = t('vSetPostCode');
  if (!COUNTRIES.includes(s.countryCode)) e.countryCode = t('vSetCountry');
  if (!/^\d+$/.test(String(s.shippingTemplateId || '').trim())) e.shippingTemplateId = t('vSetShipping');
  return e;
}

// ---------- Export ----------
export function rowToRecord(row, entityId, ctx) {
  const { settings, attributes = [] } = ctx;
  const categoryId = ctx.categoryId ?? row.categoryId;
  const dom = DOMAINS[settings.domain] || DOMAINS['aukro.cz'];
  const auction = row.type === 'BUY_NOW' ? 0 : parseNumber(row.auctionPrice);
  const buyNow = row.type === 'AUCTION' ? 0 : parseNumber(row.buyNowPrice);
  const retail = parseNumber(row.retailPrice);
  const attrs = [];
  const eff = effectiveAttrs(row, attributes);
  for (const at of attributes) {
    const v = eff[at.id];
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
// parseDescription: HTML -> text popisu; výchozí ponechá HTML beze změny (textToBlocks ho převezme jako hotové).
export function recordToRow(rec, parseDescription = (h) => h || '') {
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
    categoryId: Number(rec.categoryId) || null,
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
