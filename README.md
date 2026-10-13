# Aukro Lister

Webový nástroj pro prodejce na Aukru: nabídky se připraví v tabulce a nástroj z nich vytvoří CSV soubor pro hromadný import. Nic se neinstaluje a nepotřebuje se přihlášení. Data prodejce zůstávají v jeho prohlížeči.

Kategorie a parametry se každý den automaticky stahují z Aukro Public API. Vaše přístupy k API jsou uložené jen v GitHub Secrets a do nástroje se nikdy nedostanou.

## Co je v repozitáři

| Složka / soubor | K čemu slouží |
| --- | --- |
| `site/` | Samotný nástroj (HTML, CSS, JS). Publikuje se na GitHub Pages. |
| `site/data/` | Číselníky Aukra ve formátu JSON. Generuje je skript, ručně je neupravujte. |
| `sync/sync.mjs` | Skript, který stáhne kategorie a parametry z Aukro API. |
| `.github/workflows/deploy.yml` | Každý den spustí synchronizaci a publikuje web. |
| `test/` | Automatické testy a ukázkový CSV soubor od Aukra. |

Po založení repozitáře obsahuje `site/data/` jen **ukázková data**. Skutečné kategorie se objeví po první synchronizaci (krok 5).

## Zprovoznění (jednou, cca 15 minut)

1. **Založte účet** na [github.com](https://github.com), pokud ho ještě nemáte.
2. **Vytvořte repozitář:** vpravo nahoře klikněte na **+ → New repository**. Jako název zadejte `aukro-lister`, nastavte **Public** a klikněte na **Create repository**.
3. **Nahrajte soubory:** na stránce nového repozitáře klikněte na odkaz **uploading an existing file**. Přetáhněte do okna celý obsah této složky, včetně skryté složky `.github`, a dole klikněte na **Commit changes**.
   - Skrytou složku na Macu zobrazíte ve Finderu klávesami `Cmd + Shift + .`
   - Pokud se `.github` nenahraje přetažením, vytvořte soubor ručně přes **Add file → Create new file**. Jako název zadejte `.github/workflows/deploy.yml` a vložte do něj obsah souboru.
4. **Vložte přístupy k Aukru:** otevřete **Settings → Secrets and variables → Actions → New repository secret** a postupně založte tři secrets:
   - `AUKRO_CLIENT_ID`
   - `AUKRO_CLIENT_SECRET`
   - `AUKRO_API_KEY`
5. **Zapněte GitHub Pages a spusťte první synchronizaci:**
   - V **Settings → Pages** nastavte jako **Source** volbu **GitHub Actions**.
   - V záložce **Actions** vyberte vlevo **Synchronizace a nasazení** a klikněte na **Run workflow**. Zaškrtněte „Stáhnout vše znovu“ a potvrďte.
   - První běh stahuje parametry všech kategorií, takže může trvat i desítky minut.
6. **Otevřete nástroj:** po dokončení běhu je dostupný na `https://<váš-github-účet>.github.io/aukro-lister/`. Tuto adresu posílejte prodejcům.

Pokud synchronizace selže, GitHub vám pošle e-mail. Podrobnosti najdete v záložce **Actions** po kliknutí na konkrétní běh.

## Jak nástroj používá prodejce

Nástroj vypadá a ovládá se jako tabulka (knihovna [Tabulator](https://tabulator.info), licence MIT, přibalená v `site/vendor`). Má dva listy jako Sheets šablona:

- **Nabídky**: všechny nabídky na jednom listu, kategorie se vybírá u každé nabídky (rozbalovací seznam s vyhledáváním, nebo vložením „Název 12345“ či ID).
- **Atributy**: k nabídkám se doplňují atributy jejich kategorie ve dvojicích Atribut / Hodnota. Kód zboží, EAN, P/N, Stav, Doba záruky a Doba dodání se vyplňují přímo na listu Nabídky (Kód zboží se posílá i jako atribut 18152, pokud ho kategorie má).

Ovládání:

1. Vyplňte **Nastavení prodejce**: město, PSČ a ID šablony dopravy.
2. Buňky označíte myší nebo Shift + šipkami. **Ctrl/Cmd + C** a **Ctrl/Cmd + V** kopírují a vkládají oblasti, i z Excelu a Google Sheets, včetně víceřádkových buněk. Jedna zkopírovaná hodnota vložená do označené oblasti ji celou vyplní.
3. Psaním, Enterem nebo dvojklikem buňku upravíte. Delete smaže obsah označených buněk.
4. Chybné buňky jsou červené a po najetí myší ukážou důvod. Klik na stav řádku (např. „2 ✗“) vypíše všechny chyby nabídky.
5. Popis je v buňce vždy jako HTML a lze ho vložit rovnou. Dvojklik nebo Enter otevře editor se záložkami **Náhled a úpravy** (formátování, vkládání z Wordu a webu) a **HTML** (zdrojový kód). Tlačítko **Vyčistit HTML** odstraní značky, které Aukro nepovoluje (povolené jsou h2, p, strong, ul, ol, li, br a bloky Aukra s obrázky). Prostý text se převede na odstavce.
6. **Exportovat CSV** stáhne soubor pro hromadný import na Aukru. Nad 350 nabídek se rozdělí do více souborů. Sloupcem **Export** lze nabídku dočasně vyřadit.

Rozpracovaná práce se průběžně ukládá v prohlížeči. Pro zálohu nebo přenos na jiný počítač slouží **Uložit práci** a **Otevřít práci**. Přes **Importovat CSV** lze načíst existující CSV, například ze starých Sheets šablon.

## Spuštění na vlastním počítači (nepovinné)

Potřebujete [Node.js 22](https://nodejs.org) a Python 3 (na Macu je předinstalovaný).

```bash
# nástroj
cd site
python3 -m http.server 8090
# pak otevřete http://localhost:8090

# testy
node test/core.test.mjs

# synchronizace proti skutečnému Aukru
AUKRO_CLIENT_ID=... AUKRO_CLIENT_SECRET=... AUKRO_API_KEY=... node sync/sync.mjs

# synchronizace proti testovacímu mocku (bez přístupů)
node test/mock-aukro.mjs &
AUKRO_BASE_URL=http://127.0.0.1:8787 AUKRO_CLIENT_ID=demo-client AUKRO_CLIENT_SECRET=demo-secret AUKRO_API_KEY=demo-key node sync/sync.mjs
```

Pozor: nástroj nefunguje po otevření `index.html` dvojklikem, protože prohlížeč pak nenačte číselníky. Vždy ho otevírejte přes webovou adresu.

## Jazyky

Rozhraní je přeložené do jazyků zemí, kde Aukro působí: čeština, slovenština, maďarština, chorvatština a slovinština. Jazyk se přepíná v hlavičce a výchozí se odvodí z prohlížeče. Překlady jsou v `site/i18n.js` a překlady do HU, HR a SL je vhodné nechat zkontrolovat rodilým mluvčím.

Číselníky se stahují ve všech pěti jazycích do `site/data/<jazyk>/`. Které jazyky se stahují, určuje proměnná `AUKRO_LANGUAGES`. Nástroj zobrazí kategorie a parametry v jazyce domény účtu nastavené u prodejce (aukro.cz → čeština, aukro.sk → slovenština, aukro.hu → maďarština, aukcije.hr → chorvatština, aukro.si → slovinština), protože v tomto jazyce musí být i nabídka. Každý jazyk se stahuje v samostatné úloze a všechny běží souběžně, takže synchronizace všech jazyků trvá zhruba stejně dlouho jako jednoho. Poslední krok (collect) jazyky spojí, zapíše souhrnný `site/data/manifest.json` a uloží změny.

## Formát CSV

Export používá stejné sloupce a pořadí (24 sloupců včetně běžné ceny a propagací) jako osvědčená Google Sheets šablona: list „export“, vzor je v `test/fixtures/sablona-sheets-export.csv`. Test `test/core.test.mjs` hlídá, že nástroj vygeneruje pro stejnou nabídku stejný řádek.

Globální parametry, které šablona nabízí u všech kategorií (EAN, P/N, Stav, Doba záruky, Doba dodání), jsou v `GLOBAL_ATTRIBUTES` v souboru `site/core.js`. Pokud je některou z nich vrací API přímo u kategorie, použije se verze z API.

Import zvládne obě varianty CSV: ze Sheets šablony i z ukázky Aukro API (`test/fixtures/offers-import_example_v2.csv`).
