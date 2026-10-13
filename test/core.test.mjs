// Testy čisté logiky. Spuštění: node test/core.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  rowToRecord, toCsv, parseCsv, recordToRow, validateRow, buildDescriptionHtml, chunkRecords,
  CSV_COLUMNS, defaultSettings, newRow, mergeAttributes, globalAttributes,
} from '../site/core.js';

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

// 1) Export musí odpovídat CSV z osvědčené Google Sheets šablony
const tplRec = parseCsv(fixture('sablona-sheets-export.csv'))[0];
assert.deepEqual(Object.keys(tplRec), CSV_COLUMNS, 'hlavička odpovídá Sheets šabloně');

const settings = { ...defaultSettings(), city: 'Brno', postCode: '602 00', countryCode: 'CZ', shippingTemplateId: '2431220' };
const categoryAttrs = [
  { id: 608, name: 'Počet objektivů', type: 'combobox', options: [{ id: 7062, name: '3' }] },
  { id: 666, name: 'Úroveň repasu', type: 'combobox', options: [{ id: 15358, name: 'A' }] },
];
const attrs = mergeAttributes(categoryAttrs);
const row = {
  ...newRow(settings),
  categoryId: 107152,
  name: 'Apple iPhone 14 Pro, 128GB, Space Black (vzorová nabídka)', extId: 'MPXV3YC/A', type: 'COMBINED',
  auctionPrice: '23000', buyNowPrice: '26500', retailPrice: '28590', quantity: '1', duration: '30', reexposeType: '2',
  images: ['https://iczc.cz/dfhfuh353ejog9mpi4mar5cccf-3_1/obrazek'],
  description: [{ t: 'p', v: 'Poškozený vnější obal.\nVýrobek je nový a nepoužívaný ve 100% technickém a funkčním stavu s plnou zárukou 24 měsíců.' }],
  attrs: { 602: '194253401162', 601: 'MPXV3YC/A', 48: '15348', 130547: '12', 8820: '3086', 608: '7062', 666: '15358' },
};
const rec = rowToRecord(row, 2, { settings, categoryId: 107152, attributes: attrs });
const ours = parseCsv(toCsv([rec]))[0];
for (const k of CSV_COLUMNS) {
  if (k === 'startingAt') continue; // šablona má pevné datum
  if (k === 'attributes') {
    const norm = (s) => JSON.parse(s).sort((a, b) => a.id - b.id);
    assert.deepEqual(norm(ours[k]), norm(tplRec[k]), 'parametry');
    continue;
  }
  assert.equal(ours[k], tplRec[k], `sloupec ${k}`);
}
console.log('✓ export odpovídá Sheets šabloně');

// 2) Import CSV ze šablony i z API ukázky
const back = recordToRow(tplRec);
assert.equal(back.type, 'COMBINED'); assert.equal(back.categoryId, 107152); assert.equal(back.retailPrice, '28590'); assert.equal(back.attrs[48], '15348');
const apiRec = parseCsv(fixture('offers-import_example_v2.csv'))[0];
assert.equal(recordToRow(apiRec).attrs[86], '1900');
console.log('✓ import CSV');

// 3) Globální parametry: verze z kategorie má přednost
const merged = mergeAttributes([{ id: 48, name: 'Stav (z API)', type: 'combobox', options: [] }]);
assert.equal(merged.filter((a) => a.id === 48).length, 1);
assert.equal(merged.find((a) => a.id === 48).name, 'Stav (z API)');
assert.equal(mergeAttributes([]).length, globalAttributes().length);
console.log('✓ globální parametry');

// 4) Validace
const ctx = { settings, attributes: attrs, category: { id: 107152, leaf: true, active: true, maxImages: 24 } };
assert.deepEqual(validateRow({ ...row, duration: '7' }, ctx), {});
assert.ok(validateRow(row, ctx).duration, '30 dní jen pro Kup teď');
assert.ok(validateRow({ ...row, duration: '7', categoryId: null }, ctx).categoryId, 'chybí kategorie');
assert.ok(validateRow({ ...row, duration: '7' }, { ...ctx, category: undefined }).categoryId, 'neznámá kategorie');
const bad = validateRow({ ...row, name: 'ab', type: 'AUCTION', quantity: '3', images: [], description: [], attrs: { 8820: '999' } }, ctx);
for (const k of ['name', 'quantity', 'images', 'description', 'attr:8820']) assert.ok(bad[k], `chyba ${k}`);
assert.ok(validateRow({ ...row, auctionPrice: '10.5' }, ctx).auctionPrice, 'CZK bez desetin');
assert.ok(validateRow({ ...row, buyNowPrice: '1' }, ctx).buyNowPrice, 'Kup teď > aukce');
assert.ok(validateRow({ ...row, retailPrice: '-5' }, ctx).retailPrice, 'běžná cena > 0');
console.log('✓ validace');

// 5) Popis
const html = buildDescriptionHtml([{ t: 'h2', v: 'Stav' }, { t: 'p', v: 'Je **nové** <b>\ndruhý řádek' }, { t: 'ul', v: '- a\n- b' }, { t: 'img', v: 'https://x/y.jpg' }, { t: 'p', v: 'konec' }]);
assert.equal(html, '<div class="aukro-offer-default"><div data-layout="text"><div><h2>Stav</h2><p>Je <strong>nové</strong> &lt;b&gt;</p><p>druhý řádek</p><ul><li>a</li><li>b</li></ul></div></div><div data-layout="image"><div><img src="https://x/y.jpg"></div></div><div data-layout="text"><div><p>konec</p></div></div></div>');
console.log('✓ popis');

// 6) Dělení po 350
const chunks = chunkRecords(Array.from({ length: 701 }, () => rec));
assert.deepEqual(chunks.map((c) => c.length), [350, 350, 1]); assert.equal(chunks[1][0].entityId, 1);
console.log('✓ dělení po 350');

// 7) Překlady: validační hlášky v jiném jazyce
import { setLanguage, t } from '../site/i18n.js';
setLanguage('hu');
assert.equal(validateRow({ ...row, duration: '7', categoryId: null }, ctx).categoryId, 'Válasszon kategóriát.');
setLanguage('cs');
assert.equal(t('neexistujici-klic'), 'neexistujici-klic');
console.log('✓ překlady');

// 8) Kód zboží se posílá i jako atribut 18152, pokud ho kategorie má
import { PRODUCT_CODE_ATTR_ID } from '../site/core.js';
{
  const withCode = [...attrs, { id: PRODUCT_CODE_ATTR_ID, name: 'Kód zboží', type: 'string', mandatory: true }];
  const r = rowToRecord({ ...row, duration: '7' }, 1, { settings, categoryId: 107152, attributes: withCode });
  assert.ok(JSON.parse(r.attributes).some((a) => a.id === PRODUCT_CODE_ATTR_ID && a.value === 'MPXV3YC/A'));
  assert.ok(validateRow({ ...row, duration: '7', extId: '' }, { ...ctx, attributes: withCode })[`attr:${PRODUCT_CODE_ATTR_ID}`], 'povinný kód zboží');
  console.log('✓ kód zboží jako atribut');
}
