// Aukro Lister – tabulka nabídek postavená na knihovně Tabulator (site/vendor, licence MIT).
// Logika validace a exportu je v core.js, tady je jen práce s tabulkou.
import {
  DOMAINS, COUNTRIES, DURATIONS, offerTypes, durations, reexposeTypes, globalAttributes, MAIN_TABLE_ATTR_IDS, PRODUCT_CODE_ATTR_ID, mergeAttributes,
  defaultSettings, newRow, validateRow, validateSettings, blocksToText,
  rowToRecord, toCsv, chunkRecords, parseCsv, recordToRow, settingsFromRecord,
} from './core.js';
import { t, setLanguage, getLanguage, LANGUAGES, codeFromTag, allVariants, translateDom } from './i18n.js';

const STORAGE_KEY = 'aukro-lister-v3';
const OLD_KEYS = ['aukro-lister-v2', 'aukro-lister-v1'];
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
// atributy vyplňované na listu Nabídky (Kód zboží, EAN, P/N, Stav, Doba záruky, Doba dodání)
const GLOBAL_IDS = new Set(MAIN_TABLE_ATTR_IDS);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Stav ----------
let state = { settings: defaultSettings(), rows: [], view: 'offers' };
const data = { manifest: null, base: 'data/', tag: null, categories: [], byId: new Map(), attributes: new Map(), categoryValues: {} };

function normalizeRow(r) {
  const row = { ...newRow(state.settings), ...r, attrs: { ...(r.attrs || {}) } };
  if (Array.isArray(row.description)) row.description = blocksToText(row.description);
  if (!Array.isArray(row.images)) row.images = String(row.images || '').split(/[\s,;]+/).filter(Boolean);
  return row;
}

function normalizeState(s) {
  const rows = Array.isArray(s.rows)
    ? s.rows
    : (s.sheets || []).flatMap((sh) => sh.rows.map((r) => ({ ...r, categoryId: r.categoryId ?? sh.categoryId })));
  state.settings = { ...defaultSettings(), ...s.settings };
  return { settings: state.settings, rows: rows.map(normalizeRow), view: s.view === 'attrs' ? 'attrs' : 'offers' };
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
let saveTimer;
const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); };

function load() {
  try {
    const raw = [STORAGE_KEY, ...OLD_KEYS].map((k) => localStorage.getItem(k)).find(Boolean);
    if (raw) state = normalizeState(JSON.parse(raw));
  } catch {}
  ensureRows();
}
function ensureRows(n = 20) {
  while (state.rows.length < n) state.rows.push(newRow(state.settings));
}

// ---------- Číselníky ----------
// Jazyk číselníků = jazyk domény účtu (nabídky na aukro.sk musí být slovensky atd.).
const dataTag = () => (DOMAINS[state.settings.domain] || DOMAINS['aukro.cz']).language;

async function loadData() {
  const res = await fetch('data/manifest.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(t('dataError'));
  const top = await res.json();
  const tag = dataTag();
  let notice = '';
  if (Array.isArray(top.languages) && top.languages.length) {
    // číselníky po jazycích: data/<jazyk>/…
    const use = top.languages.includes(tag) ? tag : top.languages[0];
    if (use !== tag) notice = t('noLangData');
    data.base = `data/${use}/`;
    const r = await fetch(`${data.base}manifest.json`, { cache: 'no-cache' });
    data.manifest = r.ok ? await r.json() : top;
    data.manifest.demo = top.demo || data.manifest.demo;
  } else {
    // starší uspořádání: jen čeština přímo v data/
    data.base = 'data/';
    data.manifest = top;
    if (tag !== 'cs-CZ') notice = t('noLangData');
  }
  data.tag = tag;
  data.attributes = new Map();
  const v = encodeURIComponent(data.manifest.updatedAt || '');
  data.categories = await (await fetch(`${data.base}categories.json?v=${v}`)).json();
  data.byId = new Map(data.categories.map((c) => [c.id, c]));
  const leaves = data.categories.filter((c) => c.leaf && c.active);
  // hodnoty pro rozbalovací seznam kategorií: „Název (nadřazená) #ID“
  data.categoryValues = Object.fromEntries(leaves
    .map((c) => [String(c.id), `${c.name}${c.parentId && data.byId.get(c.parentId) ? ` (${data.byId.get(c.parentId).name})` : ''} #${c.id}`])
    .sort((a, b) => a[1].localeCompare(b[1], tag)));
  const d = data.manifest.updatedAt ? new Date(data.manifest.updatedAt).toLocaleDateString(langTagUi()) : '?';
  $('#dataInfo').textContent = t('dataInfo', { date: d, n: leaves.length });
  $('#demoBanner').hidden = !data.manifest.demo;
  $('#langNotice').hidden = !notice;
  $('#langNotice').textContent = notice;
}
const langTagUi = () => LANGUAGES.find((l) => l.code === getLanguage())?.tag || 'cs-CZ';

async function loadAttributes(categoryId) {
  if (!categoryId) return mergeAttributes([]);
  if (data.attributes.has(categoryId)) return data.attributes.get(categoryId);
  let list = [];
  try {
    const v = encodeURIComponent(data.manifest?.updatedAt || '');
    const res = await fetch(`${data.base}attributes/${categoryId}.json?v=${v}`);
    if (res.ok) list = (await res.json()).attributes;
  } catch {}
  const merged = mergeAttributes(list);
  data.attributes.set(categoryId, merged);
  return merged;
}
const attrsOf = (row) => data.attributes.get(row.categoryId) || mergeAttributes([]);
const categoryAttrsOf = (row) => attrsOf(row).filter((a) => !GLOBAL_IDS.has(a.id));
const preloadAttributes = () => Promise.all([...new Set(state.rows.map((r) => r.categoryId).filter(Boolean))].map(loadAttributes));

function categoryPath(id) {
  const names = [];
  let c = data.byId.get(id);
  for (let i = 0; c && i < 20; i++) {
    names.unshift(c.name);
    c = c.parentId ? data.byId.get(c.parentId) : null;
  }
  return names.join(' › ');
}

// Kategorie z textu: ID, „Název 12345“ (zápis ze Sheets šablony), „… #12345“ nebo přesný název.
function categoryFromText(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const id = Number((s.match(/#?(\d+)\s*$/) || [])[1]);
  if (id) return id;
  const t = s.toLowerCase();
  const hit = data.categories.find((c) => c.leaf && c.active && (c.name.toLowerCase() === t || categoryPath(c.id).toLowerCase() === t));
  return hit ? hit.id : null;
}

// ---------- Převody hodnot ----------
const pad = (n) => String(n).padStart(2, '0');

// „20.10.2026 18:00“, „2026-10-20 18:00“ i „2026-10-20T18:00“ -> „2026-10-20T18:00“ (místní čas)
function parseDateTime(v) {
  const s = String(v ?? '').trim();
  if (!s) return '';
  let m = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}T${pad(m[4] ?? 0)}:${m[5] ?? '00'}`;
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}T${pad(m[4] ?? 0)}:${m[5] ?? '00'}`;
  return s; // neplatné – validace ho označí
}
function formatDateTime(v) {
  const m = String(v ?? '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${Number(m[3])}.${Number(m[2])}.${m[1]} ${m[4]}:${m[5]}` : String(v ?? '');
}

// Hodnota z výčtu podle klíče, popisku, nebo zápisu „Popisek 714“.
function matchEnum(map, v) {
  const s = String(v ?? '').trim();
  if (!s) return '';
  if (s in map) return s;
  const low = s.toLowerCase();
  for (const [k, label] of Object.entries(map)) {
    const l = String(label).toLowerCase();
    if (l === low || l === low.replace(/\s+#?\d+$/, '')) return k;
  }
  const id = (s.match(/(\d+)\s*$/) || [])[1];
  if (id && id in map) return id;
  return s; // neznámá hodnota – validace ji označí
}
const truthy = (v) => /^(true|1|ano|áno|igen|da|x|✓|✔|pravda|yes)$/i.test(String(v ?? '').trim());

// výčet podle popisku v libovolném jazyce (vložení ze šablony v jiném jazyce)
function matchAnyLang(v, keyMap, currentMap) {
  const direct = matchEnum(currentMap, v);
  if (direct in currentMap) return direct;
  const low = String(v ?? '').trim().toLowerCase();
  for (const [k, key] of Object.entries(keyMap)) if (allVariants(key).some((x) => x.toLowerCase() === low)) return k;
  return direct;
}

const optionMap = (attr) => Object.fromEntries((attr?.options || []).map((o) => [String(o.id), o.name]));

function attrValueToText(attr, v) {
  if (v === undefined || v === null || v === '') return '';
  if (!attr) return String(v);
  if (attr.type === 'combobox') return optionMap(attr)[String(v)] ?? String(v);
  if (attr.type === 'checkbox') {
    const m = optionMap(attr);
    return (Array.isArray(v) ? v : [v]).map((x) => m[String(x)] ?? x).join('; ');
  }
  return String(v);
}
function textToAttrValue(attr, v) {
  if (Array.isArray(v)) return v.map(String);
  const s = String(v ?? '').trim();
  if (!attr || !s) return attr?.type === 'checkbox' ? [] : s;
  if (attr.type === 'combobox') return matchEnum(optionMap(attr), s);
  if (attr.type === 'checkbox') return s.split(/[;,]/).map((x) => matchEnum(optionMap(attr), x)).filter(Boolean);
  return s;
}

// ---------- Řádek modelu <-> řádek tabulky ----------
function offerView(row) {
  const v = {
    id: row.id, exportRow: row.exportRow !== false, name: row.name, categoryId: row.categoryId ? String(row.categoryId) : '',
    extId: row.extId, description: row.description, type: row.type, auctionPrice: row.auctionPrice,
    buyNowPrice: row.buyNowPrice, retailPrice: row.retailPrice, quantity: row.quantity,
    images: (row.images || []).join(' '), startingAt: formatDateTime(row.startingAt), duration: String(row.duration),
    reexposeType: String(row.reexposeType), bestOffer: !!row.bestOffer, priorityListing: !!row.priorityListing,
    boldTitle: !!row.boldTitle, highlight: !!row.highlight,
  };
  for (const g of globalAttributes()) v[`g_${g.id}`] = row.attrs[g.id] ?? '';
  return v;
}

function attrsView(row) {
  const v = { id: row.id, name: row.name, categoryId: row.categoryId ? String(row.categoryId) : '' };
  categoryAttrsOf(row).forEach((a, i) => {
    v[`n${i}`] = a.name;
    v[`s${i}`] = row.attrs[a.id] ?? (a.type === 'checkbox' ? [] : '');
  });
  return v;
}
const viewOf = (row) => (state.view === 'offers' ? offerView(row) : attrsView(row));

function changeCategory(row, newId) {
  const id = newId ? Number(newId) : null;
  if (id === row.categoryId) return false;
  for (const k of Object.keys(row.attrs)) if (!GLOBAL_IDS.has(Number(k))) delete row.attrs[k];
  row.categoryId = id;
  return true;
}

function attrForField(row, field) {
  let m = String(field).match(/^g_(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    return attrsOf(row).find((a) => a.id === id) || globalAttributes().find((a) => a.id === id);
  }
  m = String(field).match(/^s(\d+)$/);
  if (m) return categoryAttrsOf(row)[Number(m[1])] || null;
  return null;
}
const errorKey = (row, field) => {
  const a = attrForField(row, field);
  return a ? `attr:${a.id}` : field;
};
const errorFor = (row, field) => {
  const errs = rowErrors.get(row.id) || {};
  return errs[errorKey(row, field)] || (field === 'extId' ? errs[`attr:${PRODUCT_CODE_ATTR_ID}`] : '') || '';
};

// Zapíše jednu hodnotu tabulky do modelu. Vrací true, pokud se změnila kategorie.
function applyField(row, field, value) {
  switch (field) {
    case 'categoryId': return changeCategory(row, value === '' || value == null ? null : (categoryFromText(value) ?? value));
    case 'images': row.images = String(value ?? '').split(/[\s,;]+/).filter(Boolean); return false;
    case 'startingAt': row.startingAt = parseDateTime(value); return false;
    case 'type': row.type = matchAnyLang(value, { AUCTION: 'typeAuction', BUY_NOW: 'typeBuyNow', COMBINED: 'typeCombined' }, offerTypes()); return false;
    case 'duration': row.duration = String(parseInt(value, 10) || value || ''); return false;
    case 'reexposeType': row.reexposeType = /^\s*[012]\b/.test(String(value)) ? String(value).trim()[0] : matchAnyLang(value, { 0: 'reexpose0', 1: 'reexpose1', 2: 'reexpose2' }, reexposeTypes()); return false;
    case 'exportRow': case 'bestOffer': case 'priorityListing': case 'boldTitle': case 'highlight':
      row[field] = typeof value === 'boolean' ? value : truthy(value); return false;
    case 'name': case 'extId': case 'description': case 'auctionPrice': case 'buyNowPrice': case 'retailPrice': case 'quantity':
      row[field] = value ?? ''; return false;
    default: {
      const attr = attrForField(row, field);
      if (attr) row.attrs[attr.id] = textToAttrValue(attr, value);
      return false;
    }
  }
}

// ---------- Validace ----------
const rowErrors = new Map();
const rowById = (id) => state.rows.find((r) => r.id === id);

function isEmptyRow(row) {
  return !row.name && !row.categoryId && !row.auctionPrice && !row.buyNowPrice && !(row.images || []).length
    && !String(row.description || '').trim() && !Object.values(row.attrs || {}).some((v) => v && (!Array.isArray(v) || v.length));
}
const isActive = (row) => !isEmptyRow(row) && row.exportRow !== false;
const isCategoryAttrError = (k) => k.startsWith('attr:') && !GLOBAL_IDS.has(Number(k.slice(5)));

function validate(row) {
  const errs = isActive(row)
    ? validateRow(row, { settings: state.settings, attributes: attrsOf(row), category: data.byId.get(row.categoryId) })
    : {};
  rowErrors.set(row.id, errs);
  return errs;
}

// Formátovač buňky: vrátí obsah a obarví chybu.
function deco(cell, html) {
  const row = rowById(cell.getRow().getData().id);
  const el = cell.getElement();
  // prázdný řádek: nezobrazovat výchozí hodnoty (Kup teď, 7 dní…), ať tabulka nepůsobí vyplněně
  if (row && isEmptyRow(row) && !['name', 'categoryId'].includes(cell.getField())) { el.classList.remove('cell-err'); el.title = ''; return ''; }
  const msg = row ? errorFor(row, cell.getField()) : '';
  el.classList.toggle('cell-err', !!msg);
  el.title = msg || '';
  return html;
}

// ---------- Sloupce ----------
const listEditor = (values, extra = {}) => ({ values, autocomplete: true, listOnEmpty: true, allowEmpty: true, ...extra });

function enumCol(field, title, map, width) {
  return {
    title, field, width, editor: 'list', editorParams: listEditor(map),
    formatter: (cell) => deco(cell, escapeHtml(map[cell.getValue()] ?? cell.getValue() ?? '')),
  };
}
const textCol = (field, title, width, extra = {}) => ({
  title, field, width, editor: 'input', formatter: (cell) => deco(cell, escapeHtml(cell.getValue() ?? '')), ...extra,
});
const boolCol = (field, title, width = 80, extra = {}) => ({
  title, field, width, hozAlign: 'center', editor: 'tickCross',
  formatter: (cell) => deco(cell, cell.getValue() ? '<span class="tick">✓</span>' : ''), ...extra,
});

const statusCol = {
  title: '', field: '_status', width: 52, editable: false, hozAlign: 'center', cssClass: 'col-status',
  formatter: (cell) => {
    const row = rowById(cell.getRow().getData().id);
    if (!row || !isActive(row)) return '';
    const n = Object.keys(rowErrors.get(row.id) || {}).length;
    cell.getElement().title = n ? t('statusTip') : t('statusOk');
    return n ? `<span class="bad">${n} ✗</span>` : '<span class="ok">✓</span>';
  },
  cellClick: (e, cell) => showRowErrors(rowById(cell.getRow().getData().id)),
};

const categoryCol = (width = 230) => ({
  title: t('colCategory'), field: 'categoryId', width,
  editor: 'list',
  editorParams: () => listEditor(data.categoryValues, { maxWidth: 520, filterDelay: 200 }),
  formatter: (cell) => {
    const id = Number(cell.getValue());
    const c = data.byId.get(id);
    const html = !cell.getValue() ? `<span class="muted">${t('choose')}</span>`
      : c ? `${escapeHtml(c.name)} <span class="muted small">#${id}</span>` : `<span class="bad">#${escapeHtml(cell.getValue())}</span>`;
    return deco(cell, html);
  },
  tooltip: (e, cell) => (cell.getValue() ? `${categoryPath(Number(cell.getValue()))} (#${cell.getValue()})` : ''),
});

// buňka parametru: editor a zobrazení podle parametru v daném řádku
function attrCell(field, title, width) {
  const attrOfCell = (cell) => {
    const row = rowById(cell.getRow().getData().id);
    return row ? attrForField(row, field) : null;
  };
  return {
    title, field, width,
    editable: (cell) => !!attrOfCell(cell),
    editor: 'list',
    editorParams: (cell) => {
      const a = attrOfCell(cell);
      if (!a) return {};
      if (a.type === 'combobox') return listEditor(optionMap(a));
      if (a.type === 'checkbox') return listEditor(optionMap(a), { multiselect: true, autocomplete: false });
      return { values: {}, autocomplete: true, freetext: true, listOnEmpty: false, allowEmpty: true };
    },
    formatter: (cell) => {
      const a = attrOfCell(cell);
      cell.getElement().classList.toggle('cell-na', !a);
      if (!a) return '';
      return deco(cell, escapeHtml(attrValueToText(a, cell.getValue())));
    },
  };
}

function offerColumns() {
  return [
    statusCol,
    boolCol('exportRow', t('colExport'), 64, { headerTooltip: t('colExportTip') }),
    textCol('name', t('colName'), 280, { headerTooltip: t('colNameTip') }),
    categoryCol(),
    textCol('extId', t('colExtId'), 120),
    {
      title: t('colDescription'), field: 'description', width: 260, editor: 'textarea',
      editorParams: { verticalNavigation: 'editor', shiftEnterSubmit: true },
      headerTooltip: t('colDescriptionTip'),
      formatter: (cell) => {
        const lines = String(cell.getValue() ?? '').split('\n').filter((x) => x.trim());
        return deco(cell, lines.length ? `${escapeHtml(lines[0])}${lines.length > 1 ? ` <span class="muted small">+${lines.length - 1} ${t('lines')}</span>` : ''}` : '');
      },
    },
    enumCol('type', t('colType'), offerTypes(), 150),
    textCol('auctionPrice', t('colAuctionPrice'), 110, { hozAlign: 'right' }),
    textCol('buyNowPrice', t('colBuyNowPrice'), 110, { hozAlign: 'right' }),
    textCol('retailPrice', t('colRetailPrice'), 100, { hozAlign: 'right' }),
    textCol('quantity', t('colQuantity'), 80, { hozAlign: 'right' }),
    textCol('images', t('colImages'), 220, { headerTooltip: t('colImagesTip') }),
    textCol('startingAt', t('colStart'), 140, { headerTooltip: t('colStartTip') }),
    enumCol('duration', t('colDuration'), durations(), 90),
    enumCol('reexposeType', t('colReexpose'), reexposeTypes(), 190),
    ...globalAttributes().map((g) => attrCell(`g_${g.id}`, g.name, g.type === 'combobox' ? 150 : 130)),
    boolCol('bestOffer', t('colBestOffer'), 90),
    boolCol('priorityListing', t('colPriority'), 90, { headerTooltip: t('paidTip') }),
    boolCol('boldTitle', t('colBold'), 90, { headerTooltip: t('paidTip') }),
    boolCol('highlight', t('colHighlight'), 90, { headerTooltip: t('paidTip') }),
  ];
}

function attrColumns() {
  const max = Math.max(1, ...state.rows.map((r) => categoryAttrsOf(r).length));
  const cols = [
    statusCol,
    { title: t('colTitle'), field: 'name', width: 260, editable: false, formatter: (c) => escapeHtml(c.getValue() ?? '') },
    categoryCol(220),
  ];
  for (let i = 0; i < max; i++) {
    cols.push({
      title: t('colParam', { n: i + 1 }), field: `n${i}`, width: 170, editable: false, cssClass: 'col-attrname',
      formatter: (cell) => {
        const row = rowById(cell.getRow().getData().id);
        const a = row && categoryAttrsOf(row)[i];
        cell.getElement().classList.toggle('cell-na', !a);
        if (!a) return '';
        return `${escapeHtml(a.name)}${a.mandatory ? ' <span class="bad">*</span>' : ''}${a.companyOnly ? ` <span class="muted small">${t('companyOnly')}</span>` : ''}`;
      },
    });
    cols.push(attrCell(`s${i}`, t('colValue', { n: i + 1 }), 170));
  }
  return cols;
}

// ---------- Tabulka ----------
let table = null;

async function renderGrid() {
  await preloadAttributes();
  state.rows.forEach(validate);
  if (table) { table.destroy(); table = null; }
  const el = $('#grid');
  el.innerHTML = '';
  table = new Tabulator(el, {
    // list Parametry ukazuje jen rozpracované nabídky
    data: (state.view === 'offers' ? state.rows : state.rows.filter((r) => !isEmptyRow(r))).map(viewOf),
    index: 'id',
    columns: state.view === 'offers' ? offerColumns() : attrColumns(),
    height: 'calc(100vh - 250px)',
    layout: 'fitData',
    // tabulkový režim: označení oblasti myší / Shift+šipkami, Delete maže, psaní nebo dvojklik edituje
    selectableRange: 1,
    selectableRangeColumns: true,
    selectableRangeRows: true,
    selectableRangeClearCells: true,
    editTriggerEvent: 'dblclick',
    clipboard: false, // kopírování a vkládání řešíme sami (správně i víceřádkové buňky z Excelu / Sheets)
    rowHeader: { resizable: false, frozen: true, width: 44, hozAlign: 'center', formatter: 'rownum', cssClass: 'range-header-col', editor: false },
    columnDefaults: { headerSort: false, resizable: 'header', headerWordWrap: true },
    placeholder: t('noOffers'),
  });
  table.on('cellEdited', (cell) => onCellsChanged([[cell.getRow().getData().id, cell.getField(), cell.getValue()]]));
  table.on('tableBuilt', () => { renderViewTabs(); updateSummary(); });
}

function onCellsChanged(changes) {
  const touched = new Set();
  let categoryChanged = false;
  for (const [id, field, value] of changes) {
    const row = rowById(id);
    if (!row) continue;
    if (applyField(row, field, value)) categoryChanged = true;
    touched.add(row);
  }
  saveSoon();
  if (categoryChanged) {
    // nové parametry kategorie -> načíst a překreslit
    preloadAttributes().then(() => {
      if (state.view === 'attrs') renderGrid();
      else { for (const row of touched) refreshRow(row, true); updateSummary(); }
    });
    return;
  }
  for (const row of touched) refreshRow(row, false);
  updateSummary();
}

function refreshRow(row, updateData) {
  validate(row);
  const r = table?.getRow(row.id);
  if (!r) return;
  if (updateData) r.update(viewOf(row));
  r.reformat();
}

function revalidateAll() {
  state.rows.forEach(validate);
  table?.getRows().forEach((r) => r.reformat());
  updateSummary();
}

// Po Delete Tabulator vymaže buňky v tabulce -> přenést do modelu.
function syncFromTable() {
  if (!table) return;
  const changes = [];
  for (const r of table.getRows()) {
    const v = r.getData();
    const row = rowById(v.id);
    if (!row) continue;
    const cur = viewOf(row);
    for (const [k, val] of Object.entries(v)) {
      if (k === 'id' || /^n\d+$/.test(k)) continue;
      if (JSON.stringify(cur[k] ?? '') !== JSON.stringify(val ?? '')) changes.push([v.id, k, val]);
    }
  }
  if (changes.length) onCellsChanged(changes);
}

// Psaní do označené buňky rovnou začne úpravu (jako v Excelu), Enter / F2 také.
$('#grid').addEventListener('keydown', (e) => {
  if (!table || e.target.closest('input, textarea, select')) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { setTimeout(syncFromTable, 0); return; }
  const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
  if (!(printable || e.key === 'Enter' || e.key === 'F2')) return;
  const cell = table.getRanges()[0]?.getCells().flat()[0];
  if (!cell) return;
  const def = cell.getColumn().getDefinition();
  if (!def.editor || def.editable === false || (typeof def.editable === 'function' && !def.editable(cell))) return;
  e.preventDefault();
  e.stopPropagation();
  cell.edit(true);
  if (printable) {
    const inp = cell.getElement().querySelector('input, textarea');
    if (inp && inp.type !== 'checkbox') {
      inp.value = e.key;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new KeyboardEvent('keyup', { key: e.key, bubbles: true }));
    }
  }
}, true);

// ---------- Kopírování a vkládání ----------
function cellText(cell) {
  const row = rowById(cell.getRow().getData().id);
  const field = cell.getColumn().getField();
  const v = cell.getValue();
  if (!row || !field || field === '_status') return '';
  if (field === 'categoryId') {
    const c = data.byId.get(Number(v));
    return v ? (c ? `${c.name} ${v}` : String(v)) : '';
  }
  if (field === 'type') return offerTypes()[v] ?? v ?? '';
  if (field === 'duration') return durations()[v] ?? v ?? '';
  if (field === 'reexposeType') return reexposeTypes()[v] ?? v ?? '';
  if (typeof v === 'boolean') return v ? t('yes') : t('no');
  const a = attrForField(row, field);
  if (a) return attrValueToText(a, v);
  return v ?? '';
}

// TSV s uvozovkami jako Excel / Google Sheets (víceřádkové buňky přežijí kopírování tam i zpět)
const tsvCell = (s) => (/[\t\n"]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

function parseTsv(text) {
  const rows = [];
  let row = [];
  let f = '';
  let q = false;
  text = String(text).replace(/\r\n?/g, '\n').replace(/\n$/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
    } else if (c === '"' && f === '') q = true;
    else if (c === '\t') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  row.push(f);
  rows.push(row);
  return rows;
}

$('#grid').addEventListener('copy', (e) => {
  if (!table || e.target.closest('input, textarea')) return;
  const cells = table.getRanges()[0]?.getCells();
  if (!cells?.length) return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', cells.map((r) => r.map((c) => tsvCell(cellText(c))).join('\t')).join('\n'));
});

$('#grid').addEventListener('paste', async (e) => {
  if (!table || e.target.closest('input, textarea')) return; // vkládání do editované buňky nechat prohlížeči
  const cells = table.getRanges()[0]?.getCells();
  if (!cells?.length) return;
  e.preventDefault();
  await pasteMatrix(cells, parseTsv(e.clipboardData.getData('text/plain')));
});

async function pasteMatrix(cells, matrix) {
  if (!matrix.length) return;
  const first = cells[0][0];
  const cols = table.getColumns().filter((c) => c.isVisible() && c.getField());
  const colStart = cols.findIndex((c) => c.getField() === first.getColumn().getField());
  const ids = table.getRows('active').map((r) => r.getData().id);
  const rowStart = ids.indexOf(first.getRow().getData().id);
  // jedna hodnota do větší oblasti = vyplnit celou oblast
  if (matrix.length === 1 && matrix[0].length === 1 && (cells.length > 1 || cells[0].length > 1)) {
    matrix = cells.map((r) => r.map(() => matrix[0][0]));
  }
  if (state.view === 'offers') {
    while (state.rows.length < rowStart + matrix.length) state.rows.push(newRow(state.settings));
  }
  const allIds = state.view === 'offers' ? state.rows.map((r) => r.id) : ids;
  const changes = [];
  matrix.forEach((vals, ri) => {
    const id = allIds[rowStart + ri];
    if (!id) return;
    vals.forEach((val, ci) => {
      const field = cols[colStart + ci]?.getField();
      if (!field || field === '_status' || /^n\d+$/.test(field) || (state.view === 'attrs' && field === 'name')) return;
      changes.push([id, field, val]);
    });
  });
  // kategorie nejdřív, aby parametry ve stejném vložení našly svou definici
  for (const [id, field, val] of changes) if (field === 'categoryId') applyField(rowById(id), field, val);
  await preloadAttributes();
  for (const [id, field, val] of changes) if (field !== 'categoryId') applyField(rowById(id), field, val);
  save();
  await renderGrid();
}

// ---------- Nastavení ----------
function fillSettingsForm() {
  const f = $('#settingsForm');
  f.domain.innerHTML = Object.entries(DOMAINS).map(([k, d]) => `<option value="${k}">${k} (${d.currency})</option>`).join('');
  f.countryCode.innerHTML = COUNTRIES.map((c) => `<option>${c}</option>`).join('');
  f.defaultDuration.innerHTML = Object.entries(durations()).map(([d, l]) => `<option value="${d}">${l}</option>`).join('');
  f.defaultReexposeType.innerHTML = Object.entries(reexposeTypes()).map(([k, v]) => `<option value="${k}">${escapeHtml(v)}</option>`).join('');
  for (const el of f.elements) if (el.name) el.value = state.settings[el.name] ?? '';
  showSettingsState();
}

function showSettingsState() {
  const errs = validateSettings(state.settings);
  for (const el of $('#settingsForm').elements) {
    if (!el.name) continue;
    el.classList.toggle('err', !!errs[el.name]);
    el.title = errs[el.name] || '';
  }
  const n = Object.keys(errs).length;
  $('#settingsState').textContent = n ? t('settingsMissing', { n }) : t('settingsOk');
  $('#settingsState').className = 'pill ' + (n ? 'bad' : 'ok');
  return errs;
}

$('#settingsForm').addEventListener('input', async (ev) => {
  if (!ev.target.name) return;
  state.settings[ev.target.name] = ev.target.value;
  showSettingsState();
  saveSoon();
  if (ev.target.name === 'domain' && dataTag() !== data.tag) {
    // jiná doména = jiný jazyk nabídek i číselníků
    await loadData();
    await renderGrid();
    return;
  }
  revalidateAll();
});

// ---------- Jazyk rozhraní ----------
function fillLanguageSelect() {
  const sel = $('#uiLang');
  sel.innerHTML = LANGUAGES.map((l) => `<option value="${l.code}">${l.label}</option>`).join('');
  sel.value = getLanguage();
}
$('#uiLang').addEventListener('change', async (ev) => {
  setLanguage(ev.target.value);
  state.settings.uiLang = ev.target.value;
  save();
  translateDom();
  fillSettingsForm();
  if (data.manifest) {
    data.attributes = new Map(); // společné parametry mají přeložené názvy
    const d = data.manifest.updatedAt ? new Date(data.manifest.updatedAt).toLocaleDateString(langTagUi()) : '?';
    $('#dataInfo').textContent = t('dataInfo', { date: d, n: Object.keys(data.categoryValues).length });
    await renderGrid();
  }
});

function initLanguage() {
  const fromBrowser = (navigator.language || '').slice(0, 2).toLowerCase();
  const fromDomain = codeFromTag(dataTag());
  const code = state.settings.uiLang || (LANGUAGES.some((l) => l.code === fromBrowser) ? fromBrowser : fromDomain);
  setLanguage(code);
  fillLanguageSelect();
  translateDom();
}

// ---------- Listy, souhrn ----------
function renderViewTabs() {
  $$('#viewTabs [data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
  for (const id of ['btnAddRow', 'btnAddRows']) $('#' + id).hidden = state.view !== 'offers';
  $('#viewHint').innerHTML = state.view === 'offers' ? t('hintOffers') : t('hintAttrs');
}
$$('#viewTabs [data-view]').forEach((b) => (b.onclick = () => { state.view = b.dataset.view; save(); renderGrid(); }));

function updateSummary() {
  const rows = state.rows.filter(isActive);
  const bad = rows.filter((r) => Object.keys(rowErrors.get(r.id) || {}).length).length;
  const attrBad = rows.filter((r) => Object.keys(rowErrors.get(r.id) || {}).some(isCategoryAttrError)).length;
  const settingsBad = Object.keys(validateSettings(state.settings)).length;
  $('#summary').innerHTML = `${t('sumOffers', { n: rows.length })} · <span class="${bad ? 'bad' : 'ok'}">${t('sumErrors', { n: bad })}</span>`
    + (settingsBad ? ` · <span class="bad">${t('sumSettings')}</span>` : '');
  $('#tabOffersCount').textContent = `(${rows.length})`;
  $('#tabAttrsCount').textContent = attrBad ? `(${t('settingsMissing', { n: attrBad })})` : '';
  $('#tabAttrsCount').className = attrBad ? 'bad' : 'muted';
}

function showRowErrors(row) {
  if (!row || isEmptyRow(row)) return; // prázdný řádek nemá co hlásit
  if (row.exportRow === false) return message(t('excludedTitle'), `<p>${t('excludedBody')}</p>`);
  const list = Object.entries(rowErrors.get(row.id) || {});
  const html = list.length
    ? `<ul>${list.map(([k, m]) => `<li>${escapeHtml(m)}${isCategoryAttrError(k) ? ` <span class="muted">${t('onAttrsSheet')}</span>` : ''}</li>`).join('')}</ul>`
    : `<p>${t('canExport')}</p>`;
  message(list.length ? t('rowErrorsTitle', { name: row.name || t('unnamedRow') }) : t('statusOk'), html);
}

function message(title, html) {
  $('#msgTitle').textContent = title;
  $('#msgBody').innerHTML = html;
  $('#dlgMessage').showModal();
}

// ---------- Řádky ----------
function rangeRowIds() {
  const ids = new Set();
  for (const r of table?.getRanges() || []) for (const row of r.getRows()) ids.add(row.getData().id);
  return [...ids];
}
const needSelection = () => message(t('nothingSelectedTitle'), `<p>${t('nothingSelectedBody')}</p>`);

$('#btnAddRow').onclick = () => { state.rows.push(newRow(state.settings)); save(); renderGrid(); };
$('#btnAddRows').onclick = () => { for (let i = 0; i < 10; i++) state.rows.push(newRow(state.settings)); save(); renderGrid(); };
$('#btnDelete').onclick = () => {
  const ids = rangeRowIds();
  if (!ids.length) return needSelection();
  if (!confirm(t('confirmDelete', { n: ids.length }))) return;
  state.rows = state.rows.filter((r) => !ids.includes(r.id));
  ensureRows(1);
  save();
  renderGrid();
};
$('#btnSetCategory').onclick = () => {
  const ids = rangeRowIds();
  if (!ids.length) return needSelection();
  openCategoryPicker(async (catId) => {
    for (const id of ids) changeCategory(rowById(id), catId);
    save();
    await renderGrid();
  });
};

// ---------- Výběr kategorie (dialog s vyhledáváním) ----------
function openCategoryPicker(onPick) {
  const leaves = Object.keys(data.categoryValues).map((id) => ({ id: Number(id), path: categoryPath(Number(id)) }));
  const list = $('#catList');
  const input = $('#catSearch');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const render = () => {
    const q = norm(input.value.trim());
    const hits = (q ? leaves.filter((l) => norm(l.path).includes(q) || String(l.id) === q) : leaves).slice(0, 200);
    list.innerHTML = '';
    for (const h of hits) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span></span><span class="muted small"></span>';
      b.children[0].textContent = h.path;
      b.children[1].textContent = `#${h.id}`;
      b.onclick = () => { $('#dlgCategory').close(); onPick(h.id); };
      li.appendChild(b);
      list.appendChild(li);
    }
    if (!hits.length) list.innerHTML = `<li class="muted">${t('nothingFound')}</li>`;
  };
  input.value = '';
  input.oninput = render;
  render();
  $('#dlgCategory').showModal();
  input.focus();
}

// ---------- Uložení / otevření práce ----------
function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const nonEmpty = () => state.rows.filter((r) => !isEmptyRow(r));

$('#btnSave').onclick = () => download(`aukro-prace-${stamp()}.json`,
  JSON.stringify({ app: 'aukro-lister', version: 3, ...state, rows: nonEmpty() }, null, 1), 'application/json');
$('#btnOpen').onclick = () => $('#fileOpen').click();
$('#fileOpen').onchange = async (ev) => {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (!f) return;
  try {
    const s = JSON.parse(await f.text());
    if (!Array.isArray(s.rows) && !Array.isArray(s.sheets)) throw new Error(t('notWorkFile'));
    if (nonEmpty().length && !confirm(t('confirmReplace'))) return;
    state = normalizeState(s);
    ensureRows();
    save();
    fillSettingsForm();
    renderGrid();
  } catch (e) {
    message(t('cannotOpen'), `<p>${escapeHtml(e.message)}</p>`);
  }
};

// popis z HTML zpět na text (co nejde převést, zůstane jako HTML)
function htmlToText(html) {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.querySelector('.aukro-offer-default');
    if (!root) return html;
    const textOf = (el) => [...el.childNodes].map((n) => (n.nodeName === 'STRONG' || n.nodeName === 'B' ? `**${n.textContent}**` : n.nodeName === 'BR' ? '\n' : n.textContent)).join('').trim();
    const out = [];
    for (const layout of root.children) {
      if (layout.getAttribute('data-layout') !== 'text') return html;
      for (const el of (layout.firstElementChild || layout).children) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'p') out.push(textOf(el));
        else if (tag === 'h2') out.push(`## ${textOf(el)}`);
        else if (tag === 'ul') out.push(...[...el.children].map((li) => `- ${textOf(li)}`));
        else if (tag === 'ol') out.push(...[...el.children].map((li, i) => `${i + 1}. ${textOf(li)}`));
        else return html;
      }
    }
    return out.join('\n');
  } catch {
    return html;
  }
}

$('#btnImportCsv').onclick = () => $('#fileCsv').click();
$('#fileCsv').onchange = async (ev) => {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (!f) return;
  const recs = parseCsv(await f.text());
  if (!recs.length || !('categoryId' in recs[0])) return message(t('invalidCsvTitle'), `<p>${t('invalidCsvBody')}</p>`);
  state.settings = settingsFromRecord(recs[0], state.settings);
  state.rows = nonEmpty();
  const unknown = new Set();
  for (const rec of recs) {
    const row = normalizeRow(recordToRow(rec, htmlToText));
    if (row.categoryId && !data.byId.has(row.categoryId)) unknown.add(row.categoryId);
    state.rows.push(row);
  }
  ensureRows();
  save();
  fillSettingsForm();
  await renderGrid();
  message(t('importDoneTitle'), `<p>${t('importDoneBody', { n: recs.length })}</p>`
    + (unknown.size ? `<p class="bad">${t('unknownCategories', { list: [...unknown].join(', ') })}</p>` : ''));
};

// ---------- Export CSV ----------
$('#btnExport').onclick = async () => {
  const settingsErrs = showSettingsState();
  if (Object.keys(settingsErrs).length) {
    $('#settingsBox').open = true;
    return message(t('fixSettingsTitle'), `<ul>${Object.values(settingsErrs).map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`);
  }
  await preloadAttributes();
  const records = [];
  const problems = [];
  state.rows.forEach((row, i) => {
    if (!isActive(row)) return;
    const errs = validate(row);
    if (Object.keys(errs).length) {
      problems.push(`${t('rowN', { n: i + 1 })}${row.name ? ` (${row.name})` : ''}: ${Object.values(errs)[0]}`);
      return;
    }
    records.push(rowToRecord(row, 0, { settings: state.settings, attributes: attrsOf(row) }));
  });
  if (problems.length) {
    revalidateAll();
    return message(t('exportErrorsTitle', { n: problems.length }),
      `<p>${t('exportErrorsBody')}</p>`
      + `<ul>${problems.slice(0, 30).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
      + (problems.length > 30 ? `<p class="muted">${t('andMore', { n: problems.length - 30 })}</p>` : ''));
  }
  if (!records.length) return message(t('nothingToExportTitle'), `<p>${t('nothingToExportBody')}</p>`);
  const chunks = chunkRecords(records);
  chunks.forEach((chunk, i) => {
    const suffix = chunks.length > 1 ? `-${i + 1}z${chunks.length}` : '';
    download(`aukro-import-${stamp()}${suffix}.csv`, toCsv(chunk), 'text/csv;charset=utf-8');
  });
  message(t('csvReadyTitle'), `<p>${t('csvReadyBody', { n: records.length })}${chunks.length > 1 ? ` ${t('csvSplit', { n: chunks.length })}` : ''}</p>`);
};

// ---------- Start ----------
async function init() {
  load();
  initLanguage();
  fillSettingsForm();
  try {
    await loadData();
  } catch (e) {
    $('#dataInfo').textContent = t('dataError');
    message(t('loadErrorTitle'), `<p>${escapeHtml(e.message)}</p><p class="muted">${t('loadErrorHint')}</p>`);
    return;
  }
  await renderGrid();
  window.__aukroReady = true;
  window.__aukro = { get state() { return state; }, table: () => table };
}

init();
