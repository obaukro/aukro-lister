// Editor popisu v okně. Popis se ukládá jako HTML (prodejci jsou zvyklí HTML vkládat rovnou).
// Záložka „Náhled a úpravy“ = formátovaný text jako na Aukru, záložka „HTML“ = zdrojový kód.
import { buildDescriptionHtml, descriptionToHtml, disallowedTags, MAX_DESCRIPTION } from './core.js';
import { t, getLanguage } from './i18n.js';

const BLOCK_TAGS = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'BLOCKQUOTE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'TABLE', 'TBODY', 'THEAD', 'TR', 'TD', 'TH', 'PRE', 'FIGURE', 'CENTER', 'DL', 'DD', 'DT']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'META', 'TITLE', 'HEAD', 'LINK', 'IMG', 'SVG', 'IFRAME', 'OBJECT', 'NOSCRIPT', 'TEMPLATE', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

const isBold = (el) => {
  const fw = el.style?.fontWeight;
  if (fw === 'normal' || fw === '400') return false; // Google Docs obaluje vše do <b style="font-weight:normal">
  return el.tagName === 'B' || el.tagName === 'STRONG' || fw === 'bold' || Number(fw) >= 600;
};
const isWordListPara = (el) => /MsoList/i.test(el.className || '') || /mso-list:\s*l\d/i.test(el.getAttribute?.('style') || '');
const clean = (s) => s.replace(/[ \t ]+/g, ' ').replace(/\*\*\s*\*\*/g, '').trim();

// Text řádku včetně **tučně**; <br> = nový řádek.
function inlineText(el) {
  let s = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { s += n.textContent.replace(/\s+/g, ' '); continue; }
    if (n.nodeType !== 1 || SKIP_TAGS.has(n.tagName)) continue;
    if (/mso-list:\s*ignore/i.test(n.getAttribute('style') || '')) continue; // odrážka vložená Wordem
    if (n.tagName === 'BR') { s += '\n'; continue; }
    if (n.tagName === 'UL' || n.tagName === 'OL' || BLOCK_TAGS.has(n.tagName) || /^H[1-6]$/.test(n.tagName)) { s += `\n${inlineText(n)}\n`; continue; }
    const inner = inlineText(n);
    if (isBold(n) && inner.trim()) {
      // tučnost jen kolem textu, mezery ponechat venku; víceřádkový text tučně po řádcích
      s += inner.split('\n').map((part) => {
        const m = part.match(/^(\s*)(.*?)(\s*)$/);
        return m[2] ? `${m[1]}**${m[2].replace(/\*\*/g, '')}**${m[3]}` : part;
      }).join('\n');
    } else s += inner;
  }
  return s;
}

// Projde DOM a vrátí bloky {k: 'p' | 'h2' | 'ul' | 'ol', v}.
function collectBlocks(root, out) {
  let buf = '';
  const flush = () => {
    for (const line of buf.split('\n')) { const v = clean(line); if (v) out.push({ k: 'p', v }); }
    buf = '';
  };
  const pushList = (list, kind) => {
    for (const li of list.children) {
      if (li.tagName !== 'LI') { if (li.tagName === 'UL' || li.tagName === 'OL') pushList(li, li.tagName === 'OL' ? 'ol' : 'ul'); continue; }
      const copy = li.cloneNode(true);
      const nested = [...copy.querySelectorAll('ul, ol')];
      nested.forEach((x) => x.remove());
      for (const line of inlineText(copy).split('\n')) { const v = clean(line); if (v) out.push({ k: kind, v }); }
      for (const sub of li.querySelectorAll(':scope > ul, :scope > ol')) pushList(sub, sub.tagName === 'OL' ? 'ol' : 'ul');
    }
  };
  for (const n of root.childNodes) {
    if (n.nodeType === 3) { buf += n.textContent.replace(/[ \t\r]+/g, ' '); continue; }
    if (n.nodeType !== 1 || SKIP_TAGS.has(n.tagName)) continue;
    const tag = n.tagName;
    if (/^H[1-6]$/.test(tag)) { flush(); const v = clean(inlineText(n).replace(/\n/g, ' ').replace(/\*\*/g, '')); if (v) out.push({ k: 'h2', v }); continue; }
    if (tag === 'UL' || tag === 'OL') { flush(); pushList(n, tag === 'OL' ? 'ol' : 'ul'); continue; }
    if (tag === 'BR') { buf += '\n'; continue; }
    if (tag === 'P' && isWordListPara(n)) {
      flush();
      const raw = clean(inlineText(n).replace(/\n/g, ' '));
      const ordered = /^\d+[.)]\s/.test(raw);
      const v = raw.replace(/^([·•▪◦o§\-–]|\d+[.)])\s*/, '');
      if (v) out.push({ k: ordered ? 'ol' : 'ul', v });
      continue;
    }
    if (BLOCK_TAGS.has(tag)) {
      flush();
      const hasBlocks = [...n.children].some((c) => BLOCK_TAGS.has(c.tagName) || /^H[1-6]$|^UL$|^OL$/.test(c.tagName));
      if (hasBlocks) collectBlocks(n, out);
      else { buf = inlineText(n); flush(); }
      continue;
    }
    buf += isBold(n) ? inlineText({ childNodes: [n] }) : inlineText(n);
  }
  flush();
  return out;
}

const blocksToTextFormat = (blocks) => blocks.map((b) => (b.k === 'h2' ? `## ${b.v}` : b.k === 'ul' ? `- ${b.v}` : b.k === 'ol' ? `1. ${b.v}` : b.v)).join('\n');

// HTML (z editoru, Wordu, webu) -> text popisu
export function htmlToDescText(html) {
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  const root = doc.querySelector('.aukro-offer-default') || doc.body;
  return blocksToTextFormat(collectBlocks(root, []));
}
const domToDescText = (el) => blocksToTextFormat(collectBlocks(el, []));

// libovolné HTML (Word, web, editor) -> čisté HTML povolené Aukrem (bez obalu)
export const cleanHtml = (html) => descriptionToHtml(htmlToDescText(html));
const hasLayoutOrImages = (html) => /<img\b|data-layout=["'](?!text)/i.test(html || '');
// HTML pro zobrazení v editoru: bez obalu Aukra; prostý text se převede
function toEditorHtml(value) {
  const v = String(value || '').trim();
  if (!v) return '<p><br></p>';
  if (!/<[a-z]/i.test(v)) return descriptionToHtml(v) || '<p><br></p>';
  const doc = new DOMParser().parseFromString(v, 'text/html');
  const root = doc.querySelector('.aukro-offer-default');
  if (!root) return v;
  // textové bloky rozbalit, obrázkové ponechat
  return [...root.children].map((layout) => (layout.getAttribute('data-layout') === 'text' ? (layout.firstElementChild || layout).innerHTML : layout.outerHTML)).join('');
}

// text popisu -> HTML pro editor (bez obalu Aukra)
function textToEditorHtml(text) {
  const html = buildDescriptionHtml(text || '');
  if (!html) return '<p><br></p>';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const parts = [];
  for (const layout of doc.querySelectorAll('.aukro-offer-default > div')) {
    const inner = layout.firstElementChild || layout;
    for (const el of inner.children) if (el.tagName !== 'IMG') parts.push(el.outerHTML);
  }
  return parts.join('') || '<p><br></p>';
}

// ---------- Okno editoru ----------
let onSaveCb = null;
let dlg;
let mode = 'visual';      // 'visual' | 'html'
let visualDirty = false;  // úpravy v náhledu -> při uložení vyčistit
let original = '';

// aktuální HTML podle záložky
function currentHtml() {
  const ed = dlg.querySelector('#descEditor');
  const ta = dlg.querySelector('#descHtml');
  if (mode === 'html') return ta.value.trim();
  return visualDirty ? descriptionToHtml(domToDescText(ed)) : original;
}

function setMode(next) {
  const ed = dlg.querySelector('#descEditor');
  const ta = dlg.querySelector('#descHtml');
  if (next === mode) return;
  if (next === 'html') { ta.value = currentHtml(); }
  else { original = ta.value.trim(); visualDirty = false; ed.innerHTML = toEditorHtml(original); }
  mode = next;
  ed.hidden = mode !== 'visual';
  ta.hidden = mode !== 'html';
  dlg.querySelector('.desc-toolbar').hidden = mode !== 'visual';
  dlg.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === mode));
  updateCount();
}

function ensureDialog() {
  if (dlg) return dlg;
  dlg = document.createElement('dialog');
  dlg.id = 'dlgDesc';
  dlg.className = 'wide';
  dlg.innerHTML = `
    <form method="dialog" class="dlg">
      <div class="desc-top"><h2 id="descTitle"></h2><span id="descRowName" class="muted small"></span></div>
      <div class="desc-tabs">
        <button type="button" data-tab="visual" class="tab"></button>
        <button type="button" data-tab="html" class="tab"></button>
        <span class="spacer"></span>
        <button type="button" id="descClean"></button>
      </div>
      <div id="descNote" class="desc-note" hidden></div>
      <div class="desc-toolbar" role="toolbar">
        <button type="button" data-cmd="h2"></button>
        <button type="button" data-cmd="p"></button>
        <button type="button" data-cmd="bold"><b>B</b></button>
        <button type="button" data-cmd="ul"></button>
        <button type="button" data-cmd="ol"></button>
        <button type="button" data-cmd="clear"></button>
      </div>
      <div id="descEditor" class="desc-editor aukro-preview" contenteditable="true" spellcheck="true"></div>
      <textarea id="descHtml" class="desc-html" spellcheck="false" hidden></textarea>
      <div class="desc-foot">
        <span id="descHint" class="muted small"></span>
        <span id="descCount" class="small"></span>
      </div>
      <div class="dlg-actions">
        <button value="cancel" id="descCancel"></button>
        <button value="ok" id="descSave" class="primary"></button>
      </div>
    </form>`;
  document.body.appendChild(dlg);
  const ed = dlg.querySelector('#descEditor');
  const ta = dlg.querySelector('#descHtml');
  dlg.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.tab)));
  dlg.querySelector('#descClean').addEventListener('click', () => {
    const clean = cleanHtml(currentHtml());
    if (mode === 'html') ta.value = clean;
    else { original = clean; visualDirty = false; ed.innerHTML = toEditorHtml(clean); }
    updateCount();
  });
  ta.addEventListener('input', updateCount);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); dlg.close('ok'); }
  });

  dlg.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('mousedown', (e) => {
    e.preventDefault(); // nezrušit výběr v editoru
    ed.focus();
    const cmd = b.dataset.cmd;
    if (cmd === 'h2' || cmd === 'p') document.execCommand('formatBlock', false, cmd === 'h2' ? '<h2>' : '<p>');
    else if (cmd === 'bold') document.execCommand('bold');
    else if (cmd === 'ul') document.execCommand('insertUnorderedList');
    else if (cmd === 'ol') document.execCommand('insertOrderedList');
    else if (cmd === 'clear') { document.execCommand('removeFormat'); document.execCommand('formatBlock', false, '<p>'); }
    visualDirty = true;
    updateCount();
  }));

  // vkládání: formátovaný text z Wordu / webu se vyčistí na povolené formátování
  ed.addEventListener('paste', (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    const text = html ? htmlToDescText(html) : plain.replace(/\r/g, '');
    if (!text.trim()) return;
    // víceřádkový obsah do rozepsaného odstavce: začít novým odstavcem, ať se texty neslijí
    const sel = window.getSelection();
    const block = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement)?.closest('p, h2, li, div:not(#descEditor)');
    if (text.includes('\n') && block && block.textContent.trim()) document.execCommand('insertParagraph');
    document.execCommand('insertHTML', false, textToEditorHtml(text));
    visualDirty = true;
    updateCount();
  });
  ed.addEventListener('input', () => { visualDirty = true; updateCount(); });
  ed.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); dlg.close('ok'); }
  });
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'ok' && onSaveCb) onSaveCb(currentHtml());
    onSaveCb = null;
  });
  return dlg;
}

function updateCount() {
  const html = currentHtml();
  const len = buildDescriptionHtml(html).length;
  const bad = disallowedTags(html);
  const note = dlg.querySelector('#descNote');
  const notes = [];
  if (hasLayoutOrImages(html) && mode === 'visual') notes.push(t('descImagesNote'));
  if (bad.length) notes.push(t('descTagsWarn', { tags: bad.map((x) => `<${x}>`).join(', ') }));
  note.hidden = !notes.length;
  note.textContent = notes.join(' ');
  const el = dlg.querySelector('#descCount');
  el.textContent = t('descCount', { n: len.toLocaleString(getLanguage()), max: MAX_DESCRIPTION.toLocaleString(getLanguage()) });
  el.className = 'small ' + (len > MAX_DESCRIPTION ? 'bad' : 'muted');
}

export function openDescriptionEditor(value, rowName, onSave) {
  ensureDialog();
  dlg.querySelector('#descTitle').textContent = t('descTitle');
  dlg.querySelector('#descRowName').textContent = rowName || '';
  const labels = { h2: t('tbHeading'), p: t('tbParagraph'), ul: t('tbBullets'), ol: t('tbNumbers'), clear: t('tbClear') };
  dlg.querySelectorAll('[data-cmd]').forEach((b) => {
    if (labels[b.dataset.cmd]) b.textContent = labels[b.dataset.cmd];
    b.title = b.dataset.cmd === 'bold' ? t('tbBold') : labels[b.dataset.cmd];
  });
  dlg.querySelector('[data-tab=visual]').textContent = t('tabVisual');
  dlg.querySelector('[data-tab=html]').textContent = t('tabHtml');
  dlg.querySelector('#descClean').textContent = t('cleanHtml');
  dlg.querySelector('#descClean').title = t('cleanHtmlTip');
  dlg.querySelector('#descHint').textContent = t('descHint');
  dlg.querySelector('#descCancel').textContent = t('cancel');
  dlg.querySelector('#descSave').textContent = t('save');
  const ed = dlg.querySelector('#descEditor');
  const ta = dlg.querySelector('#descHtml');
  original = String(value || '').trim();
  // prostý text (starší popisy) převést na HTML
  if (original && !/<[a-z]/i.test(original)) original = descriptionToHtml(original);
  visualDirty = false;
  ed.innerHTML = toEditorHtml(original);
  ta.value = original;
  // popis s obrázky / rozvržením otevřít rovnou v HTML, ať se nic neztratí
  mode = hasLayoutOrImages(original) ? 'visual' : 'html';
  setMode(mode === 'visual' ? 'html' : 'visual');
  onSaveCb = onSave;
  dlg.returnValue = '';
  dlg.showModal();
  updateCount();
  const target = mode === 'visual' ? ed : ta;
  target.focus();
  if (mode === 'visual') { const sel = window.getSelection(); sel.selectAllChildren(ed); sel.collapseToEnd(); }
}
