import {
  DOMAINS, COUNTRIES, DURATIONS, OFFER_TYPES, REEXPOSE, mergeAttributes,
  defaultSettings, newRow, uid, validateRow, validateSettings, buildDescriptionHtml,
  rowToRecord, toCsv, chunkRecords, parseCsv, recordToRow, settingsFromRecord, MAX_DESCRIPTION,
} from './core.js';

const STORAGE_KEY = 'aukro-lister-v1';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- Stav ----------
let state = { settings: defaultSettings(), sheets: [], active: null };
const data = { manifest: null, categories: [], byId: new Map(), attributes: new Map() };

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
let saveTimer;
const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && Array.isArray(s.sheets)) state = { ...state, ...s, settings: { ...defaultSettings(), ...s.settings } };
  } catch {}
}

const activeSheet = () => state.sheets.find((s) => s.id === state.active) || null;

// ---------- Číselníky ----------
async function loadData() {
  const res = await fetch('data/manifest.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Nepodařilo se načíst data/manifest.json');
  data.manifest = await res.json();
  const v = encodeURIComponent(data.manifest.updatedAt || '');
  data.categories = await (await fetch(`data/categories.json?v=${v}`)).json();
  data.byId = new Map(data.categories.map((c) => [c.id, c]));
  const d = data.manifest.updatedAt ? new Date(data.manifest.updatedAt).toLocaleDateString('cs-CZ') : '?';
  $('#dataInfo').textContent = `Číselníky Aukra k ${d} · ${data.categories.filter((c) => c.leaf && c.active).length} kategorií`;
  $('#demoBanner').hidden = !data.manifest.demo;
}

async function getAttributes(categoryId) {
  if (data.attributes.has(categoryId)) return data.attributes.get(categoryId);
  const v = encodeURIComponent(data.manifest?.updatedAt || '');
  const res = await fetch(`data/attributes/${categoryId}.json?v=${v}`);
  const list = mergeAttributes(res.ok ? (await res.json()).attributes : []);
  data.attributes.set(categoryId, list);
  return list;
}

function categoryPath(id) {
  const names = [];
  let c = data.byId.get(id);
  let guard = 0;
  while (c && guard++ < 20) {
    names.unshift(c.name);
    c = c.parentId ? data.byId.get(c.parentId) : null;
  }
  return names.join(' › ');
}

// ---------- Nastavení ----------
function fillSettingsForm() {
  const f = $('#settingsForm');
  f.domain.innerHTML = Object.entries(DOMAINS).map(([k, d]) => `<option value="${k}">${k} (${d.currency})</option>`).join('');
  f.countryCode.innerHTML = COUNTRIES.map((c) => `<option>${c}</option>`).join('');
  f.defaultDuration.innerHTML = DURATIONS.map((d) => `<option value="${d}">${d} dní</option>`).join('');
  f.defaultReexposeType.innerHTML = Object.entries(REEXPOSE).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  for (const el of f.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') el.checked = !!state.settings[el.name];
    else el.value = state.settings[el.name] ?? '';
  }
  showSettingsState();
}

function showSettingsState() {
  const errs = validateSettings(state.settings);
  const f = $('#settingsForm');
  for (const el of f.elements) {
    if (!el.name) continue;
    el.classList.toggle('err', !!errs[el.name]);
    el.title = errs[el.name] || '';
  }
  const n = Object.keys(errs).length;
  const pill = $('#settingsState');
  pill.textContent = n ? `${n} k doplnění` : 'v pořádku';
  pill.className = 'pill ' + (n ? 'bad' : 'ok');
  return errs;
}

$('#settingsForm').addEventListener('input', (ev) => {
  const el = ev.target;
  if (!el.name) return;
  state.settings[el.name] = el.type === 'checkbox' ? el.checked : el.value;
  showSettingsState();
  revalidateAll();
  saveSoon();
});

// ---------- Listy ----------
function renderTabs() {
  const tabs = $('#tabs');
  tabs.innerHTML = '';
  for (const s of state.sheets) {
    const t = document.createElement('div');
    t.className = 'tab' + (s.id === state.active ? ' active' : '');
    const name = data.byId.get(s.categoryId)?.name || `Kategorie ${s.categoryId}`;
    t.innerHTML = `<button type="button" class="tab-name"></button><button type="button" class="tab-close" title="Smazat list">×</button>`;
    t.querySelector('.tab-name').textContent = `${name} (${s.rows.length})`;
    t.querySelector('.tab-name').title = categoryPath(s.categoryId);
    t.querySelector('.tab-name').onclick = () => { state.active = s.id; save(); renderAll(); };
    t.querySelector('.tab-close').onclick = () => {
      if (s.rows.some((r) => r.name) && !confirm(`Smazat list „${name}“ i s ${s.rows.length} řádky?`)) return;
      state.sheets = state.sheets.filter((x) => x.id !== s.id);
      if (state.active === s.id) state.active = state.sheets[0]?.id || null;
      save();
      renderAll();
    };
    tabs.appendChild(t);
  }
}

async function addSheet(categoryId) {
  const existing = state.sheets.find((s) => s.categoryId === categoryId);
  if (existing) { state.active = existing.id; renderAll(); return; }
  const sheet = { id: uid(), categoryId, rows: [newRow(state.settings)] };
  state.sheets.push(sheet);
  state.active = sheet.id;
  save();
  await renderAll();
}

// ---------- Výběr kategorie ----------
function openCategoryPicker() {
  const leaves = data.categories.filter((c) => c.leaf && c.active).map((c) => ({ id: c.id, path: categoryPath(c.id) }));
  leaves.sort((a, b) => a.path.localeCompare(b.path, 'cs'));
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
      b.innerHTML = `<span></span><span class="muted small">#${h.id}</span>`;
      b.firstChild.textContent = h.path;
      b.onclick = () => { $('#dlgCategory').close(); addSheet(h.id); };
      li.appendChild(b);
      list.appendChild(li);
    }
    if (!hits.length) list.innerHTML = '<li class="muted">Nic nenalezeno.</li>';
  };
  input.value = '';
  input.oninput = render;
  render();
  $('#dlgCategory').showModal();
  input.focus();
}

// ---------- Tabulka ----------
function columnsFor(attrs) {
  const fixed = [
    { key: 'sel', label: '', kind: 'sel' },
    { key: 'status', label: '', kind: 'status' },
    { key: 'exportRow', label: 'Export', kind: 'bool', w: 56 },
    { key: 'extId', label: 'Ext. ID', kind: 'text', w: 130 },
    { key: 'name', label: 'Název *', kind: 'text', w: 260, counter: 70 },
    { key: 'type', label: 'Typ *', kind: 'select', options: OFFER_TYPES, w: 160 },
    { key: 'auctionPrice', label: 'Vyvolávací cena', kind: 'num', w: 120 },
    { key: 'buyNowPrice', label: 'Cena Kup teď', kind: 'num', w: 120 },
    { key: 'retailPrice', label: 'Běžná cena', kind: 'num', w: 120 },
    { key: 'quantity', label: 'Množství', kind: 'num', w: 80 },
    { key: 'duration', label: 'Délka', kind: 'select', options: Object.fromEntries(DURATIONS.map((d) => [d, `${d} dní`])), w: 100 },
    { key: 'startingAt', label: 'Začátek', kind: 'datetime', w: 170 },
    { key: 'reexposeType', label: 'Opakování', kind: 'select', options: REEXPOSE, w: 150 },
    { key: 'images', label: 'Fotky *', kind: 'images', w: 90 },
    { key: 'description', label: 'Popis *', kind: 'desc', w: 110 },
    { key: 'bestOffer', label: 'Nabídnout cenu', kind: 'bool', w: 80 },
    { key: 'priorityListing', label: 'Přednostní výpis', kind: 'bool', w: 80, paid: true },
    { key: 'boldTitle', label: 'Tučný titulek', kind: 'bool', w: 80, paid: true },
    { key: 'highlight', label: 'Zvýraznění', kind: 'bool', w: 80, paid: true },
  ];
  const dyn = attrs.map((a) => ({
    key: `attr:${a.id}`, attr: a, kind: `attr-${a.type}`,
    label: `${a.name}${a.mandatory ? ' *' : ''}${a.companyOnly ? ' (firmy)' : ''}`,
    global: !!a.global,
    w: a.type === 'string' || a.type === 'tag' ? 160 : 130,
  }));
  return [...fixed, ...dyn];
}

let currentCols = [];
let currentAttrs = [];

async function renderSheet() {
  const sheet = activeSheet();
  $('#emptyState').hidden = !!sheet;
  $('#sheet').hidden = !sheet;
  if (!sheet) return;
  currentAttrs = await getAttributes(sheet.categoryId);
  currentCols = columnsFor(currentAttrs);
  const table = $('#grid');
  table.innerHTML = '';
  const thead = table.createTHead();
  const hr = thead.insertRow();
  for (const c of currentCols) {
    const th = document.createElement('th');
    th.className = `col-${c.kind}`;
    if (c.w) { th.style.minWidth = `${c.w}px`; th.style.width = `${c.w}px`; }
    if (c.kind === 'sel') {
      th.innerHTML = '<input type="checkbox" title="Vybrat vše">';
      th.firstChild.onchange = (e) => $$('#grid tbody .rowsel').forEach((x) => (x.checked = e.target.checked));
    } else th.textContent = c.label;
    if (c.attr) th.title = `Parametr #${c.attr.id} (${c.attr.type})${c.global ? ' – nabízí se u všech kategorií' : ''}`;
    if (c.paid) th.title = 'Placená služba Aukra';
    hr.appendChild(th);
  }
  const tbody = table.createTBody();
  sheet.rows.forEach((row, i) => tbody.appendChild(renderRow(row, i)));
  revalidateAll();
}

function renderRow(row, index) {
  const tr = document.createElement('tr');
  tr.dataset.id = row.id;
  currentCols.forEach((c, ci) => {
    const td = document.createElement('td');
    td.className = `col-${c.kind}`;
    td.dataset.key = c.key;
    td.dataset.ci = ci;
    td.appendChild(renderCell(c, row, index));
    tr.appendChild(td);
  });
  return tr;
}

function setVal(row, key, value) {
  if (key.startsWith('attr:')) row.attrs[key.slice(5)] = value;
  else row[key] = value;
}
function getVal(row, key) {
  return key.startsWith('attr:') ? row.attrs[key.slice(5)] : row[key];
}

function renderCell(c, row, index) {
  const onChange = (v) => { setVal(row, c.key, v); afterRowChange(row); };
  switch (c.kind) {
    case 'sel': {
      const w = document.createElement('label');
      w.className = 'sel';
      w.innerHTML = `<input type="checkbox" class="rowsel"><span class="muted small">${index + 1}</span>`;
      return w;
    }
    case 'status': {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'status';
      s.onclick = () => showRowErrors(row);
      return s;
    }
    case 'text':
    case 'num':
    case 'attr-string':
    case 'attr-tag':
    case 'attr-integer':
    case 'attr-float': {
      const wrap = document.createElement('div');
      wrap.className = 'cellwrap';
      const inp = document.createElement('input');
      inp.size = 1;
      inp.value = getVal(row, c.key) ?? '';
      if (c.kind === 'num' || c.kind === 'attr-integer' || c.kind === 'attr-float') inp.inputMode = 'decimal';
      if (c.attr?.length) inp.maxLength = c.attr.length;
      inp.oninput = () => { onChange(inp.value); if (counter) counter.textContent = `${inp.value.length}/${c.counter}`; };
      wrap.appendChild(inp);
      let counter = null;
      if (c.counter) {
        counter = document.createElement('span');
        counter.className = 'counter';
        counter.textContent = `${inp.value.length}/${c.counter}`;
        wrap.appendChild(counter);
      }
      return wrap;
    }
    case 'select':
    case 'attr-combobox': {
      const sel = document.createElement('select');
      const opts = c.kind === 'select'
        ? Object.entries(c.options).map(([v, l]) => [v, l])
        : [['', '—'], ...c.attr.options.map((o) => [String(o.id), o.name])];
      for (const [v, l] of opts) sel.add(new Option(l, v));
      sel.value = String(getVal(row, c.key) ?? '');
      sel.onchange = () => { onChange(sel.value); if (c.key === 'type') refreshRowVisibility(row); };
      return sel;
    }
    case 'bool': {
      const w = document.createElement('label');
      w.className = 'boolcell';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = c.key === 'exportRow' ? row.exportRow !== false : !!row[c.key];
      cb.onchange = () => onChange(cb.checked);
      w.appendChild(cb);
      return w;
    }
    case 'datetime': {
      const inp = document.createElement('input');
      inp.type = 'datetime-local';
      inp.value = row.startingAt || '';
      inp.oninput = () => onChange(inp.value);
      return inp;
    }
    case 'images': {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cellbtn';
      b.textContent = imagesLabel(row);
      b.onclick = () => openImages(row);
      return b;
    }
    case 'desc': {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cellbtn';
      b.textContent = descLabel(row);
      b.onclick = () => openDescription(row);
      return b;
    }
    case 'attr-checkbox': {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cellbtn';
      b.textContent = checksLabel(c.attr, getVal(row, c.key));
      b.onclick = () => openChecks(row, c.attr);
      return b;
    }
    default:
      return document.createTextNode('');
  }
}

const imagesLabel = (row) => {
  const n = (row.images || []).filter(Boolean).length;
  return n ? `${n} ${n === 1 ? 'fotka' : n < 5 ? 'fotky' : 'fotek'}` : 'Přidat';
};
const descLabel = (row) => {
  const html = buildDescriptionHtml(row.description);
  return html ? `${(row.description || []).length} bl. · ${html.length} zn.` : 'Napsat';
};
const checksLabel = (attr, v) => {
  const ids = (Array.isArray(v) ? v : v ? [v] : []).map(String);
  if (!ids.length) return 'Vybrat';
  const names = attr.options.filter((o) => ids.includes(String(o.id))).map((o) => o.name);
  return names.join(', ') || `${ids.length} vybráno`;
};

function rowEl(row) {
  return $(`#grid tbody tr[data-id="${row.id}"]`);
}

// Skryje ceny, které pro daný typ nedávají smysl.
function refreshRowVisibility(row) {
  const tr = rowEl(row);
  if (!tr) return;
  const a = tr.querySelector('td[data-key="auctionPrice"] input');
  const b = tr.querySelector('td[data-key="buyNowPrice"] input');
  if (a) { a.disabled = row.type === 'BUY_NOW'; a.placeholder = a.disabled ? '—' : ''; }
  if (b) { b.disabled = row.type === 'AUCTION'; b.placeholder = b.disabled ? '—' : ''; }
}

function afterRowChange(row) {
  validateRowUi(row);
  updateSummary();
  saveSoon();
}

const rowErrors = new Map();

function validateRowUi(row) {
  const sheet = activeSheet();
  const errs = validateRow(row, {
    settings: state.settings, attributes: currentAttrs, category: data.byId.get(sheet.categoryId),
  });
  rowErrors.set(row.id, errs);
  const tr = rowEl(row);
  if (!tr) return errs;
  const empty = isEmptyRow(row) || row.exportRow === false;
  tr.classList.toggle('skipped', row.exportRow === false);
  for (const td of tr.children) {
    const key = td.dataset.key;
    const msg = empty ? '' : errs[key] || '';
    td.classList.toggle('err', !!msg);
    td.title = msg;
  }
  const n = Object.keys(errs).length;
  const st = tr.querySelector('.status');
  st.textContent = empty ? '' : n ? `${n} ✗` : '✓';
  st.className = 'status ' + (empty ? '' : n ? 'bad' : 'ok');
  st.title = empty ? 'Prázdný nebo vyřazený řádek – při exportu se přeskočí.' : n ? 'Zobrazit chyby' : 'Řádek je v pořádku';
  const btn = (k) => tr.querySelector(`td[data-key="${k}"] .cellbtn`);
  if (btn('images')) btn('images').textContent = imagesLabel(row);
  if (btn('description')) btn('description').textContent = descLabel(row);
  for (const a of currentAttrs.filter((x) => x.type === 'checkbox')) {
    const b = btn(`attr:${a.id}`);
    if (b) b.textContent = checksLabel(a, row.attrs[a.id]);
  }
  refreshRowVisibility(row);
  return errs;
}

function isEmptyRow(row) {
  return !row.name && !row.auctionPrice && !row.buyNowPrice && !(row.images || []).length
    && !(row.description || []).length && !Object.values(row.attrs || {}).some((v) => v && (!Array.isArray(v) || v.length));
}

function revalidateAll() {
  const sheet = activeSheet();
  if (!sheet) return;
  sheet.rows.forEach(validateRowUi);
  updateSummary();
}

function updateSummary() {
  const sheet = activeSheet();
  if (!sheet) return;
  const rows = sheet.rows.filter((r) => !isEmptyRow(r) && r.exportRow !== false);
  const bad = rows.filter((r) => Object.keys(rowErrors.get(r.id) || {}).length).length;
  const settingsBad = Object.keys(validateSettings(state.settings)).length;
  $('#summary').innerHTML = `${rows.length} nabídek · <span class="${bad ? 'bad' : 'ok'}">${bad} s chybou</span>`
    + (settingsBad ? ' · <span class="bad">doplňte nastavení prodejce</span>' : '');
  renderTabsCountsOnly();
}

function renderTabsCountsOnly() {
  $$('#tabs .tab').forEach((t, i) => {
    const s = state.sheets[i];
    if (!s) return;
    const name = data.byId.get(s.categoryId)?.name || `Kategorie ${s.categoryId}`;
    t.querySelector('.tab-name').textContent = `${name} (${s.rows.filter((r) => !isEmptyRow(r)).length})`;
  });
}

function showRowErrors(row) {
  const errs = rowErrors.get(row.id) || {};
  const list = Object.values(errs);
  message(list.length ? 'Chyby v řádku' : 'Řádek je v pořádku',
    list.length ? `<ul>${list.map((m) => `<li>${escape(m)}</li>`).join('')}</ul>` : '<p>Nabídku lze exportovat.</p>');
}

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function message(title, html) {
  $('#msgTitle').textContent = title;
  $('#msgBody').innerHTML = html;
  $('#dlgMessage').showModal();
}

// ---------- Řádky: přidání, duplikace, mazání ----------
function selectedRows() {
  const sheet = activeSheet();
  const ids = $$('#grid tbody .rowsel').filter((x) => x.checked).map((x) => x.closest('tr').dataset.id);
  return sheet.rows.filter((r) => ids.includes(r.id));
}

function addRows(n) {
  const sheet = activeSheet();
  if (!sheet) return;
  for (let i = 0; i < n; i++) sheet.rows.push(newRow(state.settings));
  save();
  renderSheet();
}

$('#btnAddRow').onclick = () => addRows(1);
$('#btnAddRows').onclick = () => addRows(10);
$('#btnDuplicate').onclick = () => {
  const sheet = activeSheet();
  const sel = selectedRows();
  if (!sel.length) return message('Nic není vybráno', '<p>Zaškrtněte řádky v prvním sloupci.</p>');
  const out = [];
  for (const r of sheet.rows) {
    out.push(r);
    if (sel.includes(r)) out.push({ ...structuredClone(r), id: uid() });
  }
  sheet.rows = out;
  save();
  renderSheet();
};
$('#btnDelete').onclick = () => {
  const sheet = activeSheet();
  const sel = selectedRows();
  if (!sel.length) return message('Nic není vybráno', '<p>Zaškrtněte řádky v prvním sloupci.</p>');
  if (!confirm(`Smazat ${sel.length} řádků?`)) return;
  sheet.rows = sheet.rows.filter((r) => !sel.includes(r));
  if (!sheet.rows.length) sheet.rows.push(newRow(state.settings));
  save();
  renderSheet();
};

// ---------- Vkládání z tabulkového procesoru ----------
$('#grid').addEventListener('paste', (ev) => {
  const td = ev.target.closest('td');
  if (!td) return;
  const text = ev.clipboardData.getData('text/plain');
  if (!text.includes('\t') && !text.includes('\n')) {
    // jedna hodnota do tlačítkové buňky
    if (ev.target.tagName === 'BUTTON' || ev.target.tagName === 'SELECT') {
      ev.preventDefault();
      pasteGrid(td, [[text]]);
    }
    return;
  }
  ev.preventDefault();
  const lines = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
  pasteGrid(td, lines);
});

function pasteGrid(td, matrix) {
  const sheet = activeSheet();
  const startRow = sheet.rows.findIndex((r) => r.id === td.parentElement.dataset.id);
  const startCol = Number(td.dataset.ci);
  while (sheet.rows.length < startRow + matrix.length) sheet.rows.push(newRow(state.settings));
  matrix.forEach((cells, ri) => {
    const row = sheet.rows[startRow + ri];
    cells.forEach((raw, k) => {
      const col = currentCols[startCol + k];
      if (col) applyPasted(row, col, raw.trim());
    });
  });
  save();
  renderSheet();
}

function applyPasted(row, col, v) {
  const byLabel = (opts) => {
    const hit = opts.find(([val, label]) => String(val).toLowerCase() === v.toLowerCase() || String(label).toLowerCase() === v.toLowerCase());
    return hit ? String(hit[0]) : null;
  };
  switch (col.kind) {
    case 'sel': case 'status': return;
    case 'select': {
      const val = byLabel(Object.entries(col.options));
      if (val !== null) setVal(row, col.key, val);
      return;
    }
    case 'attr-combobox': {
      const val = byLabel(col.attr.options.map((o) => [o.id, o.name]));
      setVal(row, col.key, val ?? '');
      return;
    }
    case 'attr-checkbox': {
      const ids = v.split(/[;,]/).map((x) => x.trim()).filter(Boolean)
        .map((x) => col.attr.options.find((o) => o.name.toLowerCase() === x.toLowerCase() || String(o.id) === x)?.id)
        .filter((x) => x !== undefined).map(String);
      setVal(row, col.key, ids);
      return;
    }
    case 'images': row.images = v.split(/[\s,;]+/).filter(Boolean); return;
    case 'bool': row[col.key] = /^(true|1|ano|x|✓|pravda)$/i.test(v); return;
    case 'desc': row.description = v ? [{ t: 'p', v: v.replace(/\\n/g, '\n') }] : []; return;
    case 'datetime': {
      const d = new Date(v.replace(' ', 'T'));
      if (!isNaN(d)) {
        const p = (n) => String(n).padStart(2, '0');
        row.startingAt = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
      }
      return;
    }
    default: setVal(row, col.key, v);
  }
}

// ---------- Fotky ----------
function openImages(row) {
  const dlg = $('#dlgImages');
  const ta = $('#imgText');
  const cat = data.byId.get(activeSheet().categoryId);
  $('#imgLimit').textContent = `Tato kategorie povoluje nejvýš ${cat?.maxImages || 24} fotek.`;
  ta.value = (row.images || []).join('\n');
  const preview = () => {
    const urls = ta.value.split(/\s+/).filter(Boolean).slice(0, 24);
    $('#imgPreview').innerHTML = '';
    for (const u of urls) {
      const img = document.createElement('img');
      img.src = u;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => img.classList.add('broken');
      $('#imgPreview').appendChild(img);
    }
  };
  ta.oninput = preview;
  preview();
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    row.images = ta.value.split(/\s+/).filter(Boolean);
    afterRowChange(row);
  };
  dlg.showModal();
}

// ---------- Popis ----------
const BLOCK_LABELS = { h2: 'Nadpis', p: 'Odstavec', ul: 'Odrážky', ol: 'Číslovaný seznam', img: 'Obrázek (URL)', html: 'Převzaté HTML' };
let descDraft = [];
let descRow = null;

function openDescription(row) {
  descRow = row;
  descDraft = structuredClone(row.description || []);
  if (!descDraft.length) descDraft.push({ t: 'p', v: '' });
  renderDescBlocks();
  const dlg = $('#dlgDesc');
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    row.description = descDraft.filter((b) => String(b.v).trim());
    afterRowChange(row);
  };
  dlg.showModal();
}

function renderDescBlocks() {
  const box = $('#descBlocks');
  box.innerHTML = '';
  descDraft.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = 'desc-block';
    el.innerHTML = `<div class="desc-head"><span class="small muted"></span>
      <span><button type="button" data-a="up" title="Nahoru">↑</button><button type="button" data-a="down" title="Dolů">↓</button><button type="button" data-a="del" title="Odebrat">×</button></span></div>`;
    el.querySelector('.desc-head span').textContent = BLOCK_LABELS[b.t] || b.t;
    const field = b.t === 'h2' || b.t === 'img' ? document.createElement('input') : document.createElement('textarea');
    if (field.tagName === 'TEXTAREA') field.rows = b.t === 'p' || b.t === 'html' ? 4 : 3;
    field.value = b.v || '';
    field.oninput = () => { b.v = field.value; renderDescPreview(); };
    el.appendChild(field);
    el.querySelector('[data-a=up]').onclick = () => { if (i > 0) { [descDraft[i - 1], descDraft[i]] = [descDraft[i], descDraft[i - 1]]; renderDescBlocks(); } };
    el.querySelector('[data-a=down]').onclick = () => { if (i < descDraft.length - 1) { [descDraft[i + 1], descDraft[i]] = [descDraft[i], descDraft[i + 1]]; renderDescBlocks(); } };
    el.querySelector('[data-a=del]').onclick = () => { descDraft.splice(i, 1); renderDescBlocks(); };
    box.appendChild(el);
  });
  renderDescPreview();
}

function renderDescPreview() {
  const html = buildDescriptionHtml(descDraft);
  $('#descPreview').innerHTML = html || '<p class="muted">Popis je prázdný.</p>';
  $('#descCount').textContent = `${html.length.toLocaleString('cs-CZ')} / ${MAX_DESCRIPTION.toLocaleString('cs-CZ')} znaků včetně HTML`;
}

$$('#dlgDesc [data-add]').forEach((b) => (b.onclick = () => { descDraft.push({ t: b.dataset.add, v: '' }); renderDescBlocks(); }));
$('#descApplyAll').onclick = () => {
  const sheet = activeSheet();
  if (!confirm(`Přepsat popis ve všech ${sheet.rows.length} řádcích listu tímto popisem?`)) return;
  const blocks = descDraft.filter((b) => String(b.v).trim());
  for (const r of sheet.rows) r.description = structuredClone(blocks);
  $('#dlgDesc').close('cancel');
  save();
  revalidateAll();
};

// Rozloží převzaté HTML zpět na bloky; co nepozná, nechá jako HTML.
function parseDescription(html) {
  if (!html) return [];
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.querySelector('.aukro-offer-default');
    if (!root) return [{ t: 'html', v: html }];
    const blocks = [];
    const textOf = (el) => {
      let s = '';
      for (const n of el.childNodes) {
        if (n.nodeType === 3) s += n.textContent;
        else if (n.nodeName === 'STRONG' || n.nodeName === 'B') s += `**${n.textContent}**`;
        else if (n.nodeName === 'BR') s += '\n';
        else s += n.textContent;
      }
      return s.trim();
    };
    for (const layout of root.children) {
      const kind = layout.getAttribute('data-layout');
      if (kind === 'image') {
        const img = layout.querySelector('img');
        if (img) blocks.push({ t: 'img', v: img.getAttribute('src') });
      } else if (kind === 'text') {
        const inner = layout.firstElementChild || layout;
        for (const el of inner.children) {
          const tag = el.tagName.toLowerCase();
          if (tag === 'h2') blocks.push({ t: 'h2', v: textOf(el) });
          else if (tag === 'p') blocks.push({ t: 'p', v: textOf(el) });
          else if (tag === 'ul' || tag === 'ol') blocks.push({ t: tag, v: [...el.querySelectorAll('li')].map(textOf).join('\n') });
          else return [{ t: 'html', v: html }];
        }
      } else return [{ t: 'html', v: html }];
    }
    return blocks;
  } catch {
    return [{ t: 'html', v: html }];
  }
}

// ---------- Vícenásobný výběr ----------
function openChecks(row, attr) {
  const dlg = $('#dlgChecks');
  $('#checksTitle').textContent = attr.name;
  const cur = (Array.isArray(row.attrs[attr.id]) ? row.attrs[attr.id] : row.attrs[attr.id] ? [row.attrs[attr.id]] : []).map(String);
  const list = $('#checksList');
  list.innerHTML = '';
  for (const o of attr.options) {
    const l = document.createElement('label');
    l.innerHTML = `<input type="checkbox" value="${o.id}"> <span></span>`;
    l.querySelector('span').textContent = o.name;
    l.querySelector('input').checked = cur.includes(String(o.id));
    list.appendChild(l);
  }
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    row.attrs[attr.id] = $$('input:checked', list).map((x) => x.value);
    afterRowChange(row);
  };
  dlg.showModal();
}

// ---------- Uložení / otevření práce ----------
function download(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

$('#btnSave').onclick = () => download(`aukro-prace-${stamp()}.json`, JSON.stringify({ app: 'aukro-lister', version: 1, ...state }, null, 1), 'application/json');
$('#btnOpen').onclick = () => $('#fileOpen').click();
$('#fileOpen').onchange = async (ev) => {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (!f) return;
  try {
    const s = JSON.parse(await f.text());
    if (!Array.isArray(s.sheets)) throw new Error('Soubor neobsahuje práci z Aukro Listeru.');
    if (state.sheets.some((x) => x.rows.some((r) => !isEmptyRow(r))) && !confirm('Nahradit aktuální práci obsahem souboru?')) return;
    state = { settings: { ...defaultSettings(), ...s.settings }, sheets: s.sheets, active: s.active || s.sheets[0]?.id || null };
    save();
    fillSettingsForm();
    renderAll();
  } catch (e) {
    message('Soubor nelze otevřít', `<p>${escape(e.message)}</p>`);
  }
};

// ---------- Import CSV ----------
$('#btnImportCsv').onclick = () => $('#fileCsv').click();
$('#fileCsv').onchange = async (ev) => {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (!f) return;
  const recs = parseCsv(await f.text());
  if (!recs.length || !('categoryId' in recs[0])) return message('Neplatné CSV', '<p>Soubor nemá očekávanou hlavičku (chybí sloupec categoryId).</p>');
  state.settings = settingsFromRecord(recs[0], state.settings);
  const unknown = new Set();
  let count = 0;
  for (const rec of recs) {
    const catId = Number(rec.categoryId);
    if (!data.byId.has(catId)) unknown.add(catId);
    let sheet = state.sheets.find((s) => s.categoryId === catId);
    if (!sheet) { sheet = { id: uid(), categoryId: catId, rows: [] }; state.sheets.push(sheet); }
    sheet.rows = sheet.rows.filter((r) => !isEmptyRow(r));
    sheet.rows.push(recordToRow(rec, parseDescription));
    count++;
  }
  state.active = state.sheets[state.sheets.length - 1]?.id;
  save();
  fillSettingsForm();
  await renderAll();
  message('Import dokončen', `<p>Načteno ${count} nabídek.</p>`
    + (unknown.size ? `<p class="bad">Kategorie, které v číselníku nejsou: ${[...unknown].join(', ')}. Zkontrolujte je.</p>` : ''));
};

// ---------- Export CSV ----------
$('#btnExport').onclick = async () => {
  const settingsErrs = showSettingsState();
  if (Object.keys(settingsErrs).length) {
    $('#settingsBox').open = true;
    return message('Doplňte nastavení prodejce', `<ul>${Object.values(settingsErrs).map((m) => `<li>${escape(m)}</li>`).join('')}</ul>`);
  }
  const records = [];
  const problems = [];
  for (const sheet of state.sheets) {
    const attrs = await getAttributes(sheet.categoryId);
    const category = data.byId.get(sheet.categoryId);
    sheet.rows.forEach((row, i) => {
      if (isEmptyRow(row) || row.exportRow === false) return;
      const errs = validateRow(row, { settings: state.settings, attributes: attrs, category });
      if (Object.keys(errs).length) {
        problems.push(`${category?.name || sheet.categoryId}, řádek ${i + 1}: ${Object.values(errs)[0]}`);
        return;
      }
      records.push(rowToRecord(row, 0, { settings: state.settings, categoryId: sheet.categoryId, attributes: attrs }));
    });
  }
  if (problems.length) {
    return message(`${problems.length} nabídek má chyby`,
      `<p>Export proběhne, až budou všechny nabídky v pořádku.</p><ul>${problems.slice(0, 30).map((p) => `<li>${escape(p)}</li>`).join('')}</ul>`
      + (problems.length > 30 ? `<p class="muted">…a dalších ${problems.length - 30}.</p>` : ''));
  }
  if (!records.length) return message('Není co exportovat', '<p>Vyplňte aspoň jednu nabídku.</p>');
  const chunks = chunkRecords(records);
  chunks.forEach((chunk, i) => {
    const suffix = chunks.length > 1 ? `-${i + 1}z${chunks.length}` : '';
    download(`aukro-import-${stamp()}${suffix}.csv`, toCsv(chunk), 'text/csv;charset=utf-8');
  });
  message('CSV připraveno', `<p>Exportováno ${records.length} nabídek${chunks.length > 1 ? ` do ${chunks.length} souborů (max. 350 nabídek na soubor)` : ''}.</p>`);
};

// ---------- Start ----------
$('#btnAddSheet').onclick = openCategoryPicker;
$('#btnAddSheet2').onclick = openCategoryPicker;

async function renderAll() {
  renderTabs();
  await renderSheet();
}

async function init() {
  load();
  fillSettingsForm();
  try {
    await loadData();
  } catch (e) {
    $('#dataInfo').textContent = 'Číselníky se nepodařilo načíst.';
    message('Chyba načítání', `<p>${escape(e.message)}</p><p class="muted">Otevírejte nástroj přes webovou adresu (GitHub Pages), ne jako soubor z disku.</p>`);
    return;
  }
  if (!state.active && state.sheets[0]) state.active = state.sheets[0].id;
  await renderAll();
  window.__aukroReady = true;
}

init();
