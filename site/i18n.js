// Překlady rozhraní do jazyků zemí, kde Aukro působí: čeština, slovenština, maďarština, chorvatština, slovinština.
// Každý klíč: [cs, sk, hu, hr, sl]. Parametry ve složených závorkách: {n}, {name}…
// Pozn.: překlady do HU/HR/SL je vhodné nechat zkontrolovat rodilým mluvčím.

export const LANGUAGES = [
  { code: 'cs', tag: 'cs-CZ', label: 'Čeština' },
  { code: 'sk', tag: 'sk-SK', label: 'Slovenčina' },
  { code: 'hu', tag: 'hu-HU', label: 'Magyar' },
  { code: 'hr', tag: 'hr-HR', label: 'Hrvatski' },
  { code: 'sl', tag: 'sl-SI', label: 'Slovenščina' },
];
const IDX = Object.fromEntries(LANGUAGES.map((l, i) => [l.code, i]));

const T = {
  // ---- hlavička a akce
  loadingData: ['Načítám číselníky…', 'Načítavam číselníky…', 'Kódlisták betöltése…', 'Učitavanje šifrarnika…', 'Nalagam šifrante…'],
  dataInfo: ['Číselníky Aukra k {date} · kategorie: {n}', 'Číselníky Aukra k {date} · kategórie: {n}', 'Aukro kódlisták: {date} · kategóriák: {n}', 'Šifrarnici Aukra na dan {date} · kategorije: {n}', 'Šifranti Aukra na dan {date} · kategorije: {n}'],
  dataError: ['Číselníky se nepodařilo načíst.', 'Číselníky sa nepodarilo načítať.', 'A kódlisták betöltése sikertelen.', 'Šifrarnike nije moguće učitati.', 'Šifrantov ni bilo mogoče naložiti.'],
  language: ['Jazyk', 'Jazyk', 'Nyelv', 'Jezik', 'Jezik'],
  btnOpen: ['Otevřít práci', 'Otvoriť prácu', 'Munka megnyitása', 'Otvori rad', 'Odpri delo'],
  btnSave: ['Uložit práci', 'Uložiť prácu', 'Munka mentése', 'Spremi rad', 'Shrani delo'],
  btnImportCsv: ['Importovat CSV', 'Importovať CSV', 'CSV importálása', 'Uvezi CSV', 'Uvozi CSV'],
  btnExport: ['Exportovat CSV', 'Exportovať CSV', 'CSV exportálása', 'Izvezi CSV', 'Izvozi CSV'],
  demoBanner: ['Zobrazují se <strong>ukázková data</strong>. Skutečné kategorie a atributy se objeví po první synchronizaci s Aukrem.', 'Zobrazujú sa <strong>ukážkové údaje</strong>. Skutočné kategórie a atribúty sa zobrazia po prvej synchronizácii s Aukrom.', '<strong>Mintaadatok</strong> láthatók. A valódi kategóriák és attribútumok az Aukróval való első szinkronizálás után jelennek meg.', 'Prikazuju se <strong>ogledni podaci</strong>. Stvarne kategorije i atributi pojavit će se nakon prve sinkronizacije s Aukrom.', 'Prikazani so <strong>vzorčni podatki</strong>. Prave kategorije in atributi se prikažejo po prvi sinhronizaciji z Aukrom.'],
  noLangData: [
    'Číselníky v tomto jazyce zatím nejsou stažené, zobrazuje se čeština.',
    'Číselníky v tomto jazyku zatiaľ nie sú stiahnuté, zobrazuje sa čeština.',
    'A kódlisták ezen a nyelven még nincsenek letöltve, cseh nyelvű adatok láthatók.',
    'Šifrarnici na ovom jeziku još nisu preuzeti, prikazuje se češki.',
    'Šifranti v tem jeziku še niso preneseni, prikazana je češčina.',
  ],

  // ---- nastavení
  settingsTitle: ['Nastavení prodejce', 'Nastavenia predajcu', 'Eladói beállítások', 'Postavke prodavatelja', 'Nastavitve prodajalca'],
  settingsOk: ['v pořádku', 'v poriadku', 'rendben', 'u redu', 'v redu'],
  settingsMissing: ['k doplnění: {n}', 'na doplnenie: {n}', 'kitöltendő: {n}', 'za dopuniti: {n}', 'za dopolniti: {n}'],
  domain: ['Účet na doméně', 'Účet na doméne', 'Fiók domainje', 'Račun na domeni', 'Račun na domeni'],
  city: ['Město', 'Mesto', 'Város', 'Grad', 'Kraj'],
  postCode: ['PSČ', 'PSČ', 'Irányítószám', 'Poštanski broj', 'Poštna številka'],
  country: ['Země', 'Krajina', 'Ország', 'Država', 'Država'],
  shippingTemplate: ['ID šablony dopravy', 'ID šablóny dopravy', 'Szállítási sablon azonosítója', 'ID predloška dostave', 'ID predloge dostave'],
  shippingHint: ['Moje Aukro → Můj prodej → Šablony dopravy.', 'Moje Aukro → Môj predaj → Šablóny dopravy.', 'Saját Aukro → Eladásaim → Szállítási sablonok.', 'Moj Aukro → Moja prodaja → Predlošci dostave.', 'Moj Aukro → Moja prodaja → Predloge dostave.'],
  shippingPlaceholder: ['např. 2419062', 'napr. 2419062', 'pl. 2419062', 'npr. 2419062', 'npr. 2419062'],
  defaultDuration: ['Výchozí délka', 'Predvolená dĺžka', 'Alapértelmezett időtartam', 'Zadano trajanje', 'Privzeto trajanje'],
  defaultReexpose: ['Výchozí opakování', 'Predvolené opakovanie', 'Alapértelmezett ismétlés', 'Zadano ponavljanje', 'Privzeto ponavljanje'],

  // ---- listy a nástrojová lišta
  tabOffers: ['Nabídky', 'Ponuky', 'Ajánlatok', 'Ponude', 'Ponudbe'],
  tabAttrs: ['Atributy', 'Atribúty', 'Attribútumok', 'Atributi', 'Atributi'],
  addRow: ['+ Řádek', '+ Riadok', '+ Sor', '+ Redak', '+ Vrstica'],
  addRows: ['+ 10 řádků', '+ 10 riadkov', '+ 10 sor', '+ 10 redaka', '+ 10 vrstic'],
  setCategory: ['Kategorie pro označené', 'Kategória pre označené', 'Kategória a kijelöltekhez', 'Kategorija za označene', 'Kategorija za označene'],
  deleteRows: ['Smazat označené řádky', 'Zmazať označené riadky', 'Kijelölt sorok törlése', 'Izbriši označene retke', 'Izbriši označene vrstice'],
  sumOffers: ['Nabídky: {n}', 'Ponuky: {n}', 'Ajánlatok: {n}', 'Ponude: {n}', 'Ponudbe: {n}'],
  sumErrors: ['s chybou: {n}', 's chybou: {n}', 'hibás: {n}', 's greškom: {n}', 'z napako: {n}'],
  sumSettings: ['doplňte nastavení prodejce', 'doplňte nastavenia predajcu', 'töltse ki az eladói beállításokat', 'dopunite postavke prodavatelja', 'dopolnite nastavitve prodajalca'],
  hintOffers: [
    'Všechny nabídky na jednom listu, kategorie se vybírá u každé nabídky. Označte buňky myší (nebo Shift + šipkami); <b>Ctrl/Cmd+C</b> a <b>Ctrl/Cmd+V</b> kopírují a vkládají i z Excelu a Google Sheets. Psaním, Enterem nebo dvojklikem buňku upravíte, Delete obsah smaže.',
    'Všetky ponuky na jednom hárku, kategória sa vyberá pri každej ponuke. Označte bunky myšou (alebo Shift + šípkami); <b>Ctrl/Cmd+C</b> a <b>Ctrl/Cmd+V</b> kopírujú a vkladajú aj z Excelu a Google Sheets. Písaním, Enterom alebo dvojklikom bunku upravíte, Delete obsah zmaže.',
    'Minden ajánlat egy lapon, a kategóriát ajánlatonként kell kiválasztani. Jelölje ki a cellákat egérrel (vagy Shift + nyilakkal); a <b>Ctrl/Cmd+C</b> és <b>Ctrl/Cmd+V</b> Excelből és Google Sheetsből is másol és beilleszt. Gépeléssel, Enterrel vagy dupla kattintással szerkeszthet, a Delete törli a tartalmat.',
    'Sve ponude na jednom listu, kategorija se bira za svaku ponudu. Označite ćelije mišem (ili Shift + strelicama); <b>Ctrl/Cmd+C</b> i <b>Ctrl/Cmd+V</b> kopiraju i lijepe i iz Excela i Google Sheetsa. Tipkanjem, Enterom ili dvostrukim klikom uređujete ćeliju, Delete briše sadržaj.',
    'Vse ponudbe na enem listu, kategorija se izbere pri vsaki ponudbi. Označite celice z miško (ali Shift + puščicami); <b>Ctrl/Cmd+C</b> in <b>Ctrl/Cmd+V</b> kopirata in lepita tudi iz Excela in Google Sheets. S tipkanjem, Enterjem ali dvoklikom celico uredite, Delete izbriše vsebino.',
  ],
  hintAttrs: ['Atributy kategorie u každé nabídky – dvojice Atribut / Hodnota jako ve Sheets šabloně. Kód zboží, EAN, P/N, Stav, Doba záruky a Doba dodání se vyplňují na listu Nabídky. Šrafované buňky kategorie nemá. Hodnoty lze vkládat i jako text („Nové“, „Apple 7062“).', 'Atribúty kategórie pri každej ponuke – dvojice Atribút / Hodnota ako v šablóne Sheets. Kód tovaru, EAN, P/N, Stav, Doba záruky a Doba dodania sa vypĺňajú na hárku Ponuky. Šrafované bunky kategória nemá. Hodnoty možno vkladať aj ako text („Nové“, „Apple 7062“).', 'A kategória attribútumai ajánlatonként – Attribútum / Érték párok, mint a Sheets sablonban. A termékkódot, EAN-t, P/N-t, állapotot, garanciát és szállítási időt az Ajánlatok lapon kell kitölteni. A csíkozott cellák a kategóriában nem léteznek. Az értékek szövegként is beilleszthetők („Új“, „Apple 7062“).', 'Atributi kategorije za svaku ponudu – parovi Atribut / Vrijednost kao u Sheets predlošku. Šifra proizvoda, EAN, P/N, stanje, jamstvo i rok isporuke unose se na listu Ponude. Šrafirane ćelije kategorija nema. Vrijednosti se mogu lijepiti i kao tekst („Novo“, „Apple 7062“).', 'Atributi kategorije pri vsaki ponudbi – pari Atribut / Vrednost kot v predlogi Sheets. Šifra izdelka, EAN, P/N, stanje, garancija in rok dobave se vnesejo na listu Ponudbe. Šrafiranih celic kategorija nima. Vrednosti lahko prilepite tudi kot besedilo („Novo“, „Apple 7062“).'],

  // ---- sloupce
  colExport: ['Export', 'Export', 'Export', 'Izvoz', 'Izvoz'],
  colExportTip: ['Zrušením zaškrtnutí nabídku z exportu vyřadíte', 'Zrušením začiarknutia ponuku z exportu vyradíte', 'A jelölés törlésével az ajánlat kimarad az exportból', 'Uklanjanjem oznake ponuda se isključuje iz izvoza', 'Z odstranitvijo kljukice ponudbo izključite iz izvoza'],
  colName: ['Název *', 'Názov *', 'Megnevezés *', 'Naziv *', 'Naziv *'],
  colNameTip: ['3–70 znaků', '3–70 znakov', '3–70 karakter', '3–70 znakova', '3–70 znakov'],
  colCategory: ['Kategorie *', 'Kategória *', 'Kategória *', 'Kategorija *', 'Kategorija *'],
  choose: ['vyberte…', 'vyberte…', 'válasszon…', 'odaberite…', 'izberite…'],
  colExtId: ['Kód zboží', 'Kód tovaru', 'Termékkód', 'Šifra proizvoda', 'Šifra izdelka'],
  colDescription: ['Popis *', 'Popis *', 'Leírás *', 'Opis *', 'Opis *'],
  colDescriptionTip: [
    'Každý řádek = odstavec · „## Nadpis“ · „- odrážka“ · „1. bod“ · **tučně** · Shift+Enter uloží',
    'Každý riadok = odsek · „## Nadpis“ · „- odrážka“ · „1. bod“ · **tučne** · Shift+Enter uloží',
    'Minden sor = bekezdés · „## Cím“ · „- felsorolás“ · „1. pont“ · **félkövér** · Shift+Enter ment',
    'Svaki redak = odlomak · „## Naslov“ · „- grafička oznaka“ · „1. točka“ · **podebljano** · Shift+Enter sprema',
    'Vsaka vrstica = odstavek · „## Naslov“ · „- alineja“ · „1. točka“ · **krepko** · Shift+Enter shrani',
  ],
  lines: ['ř.', 'r.', 'sor', 'r.', 'vr.'],
  colType: ['Typ *', 'Typ *', 'Típus *', 'Vrsta *', 'Vrsta *'],
  colAuctionPrice: ['Vyvolávací cena', 'Vyvolávacia cena', 'Kikiáltási ár', 'Početna cijena', 'Izklicna cena'],
  colBuyNowPrice: ['Cena Kup teď', 'Cena Kúp teraz', 'Azonnali ár', 'Cijena Kupi odmah', 'Cena Kupi zdaj'],
  colRetailPrice: ['Běžná cena', 'Bežná cena', 'Normál ár', 'Redovna cijena', 'Redna cena'],
  colQuantity: ['Množství', 'Množstvo', 'Mennyiség', 'Količina', 'Količina'],
  colImages: ['URL obrázků *', 'URL obrázkov *', 'Képek URL-je *', 'URL slika *', 'URL slik *'],
  colImagesTip: ['Veřejné adresy fotek oddělené mezerou; první je hlavní', 'Verejné adresy fotiek oddelené medzerou; prvá je hlavná', 'Nyilvános fotócímek szóközzel elválasztva; az első a fő kép', 'Javne adrese fotografija odvojene razmakom; prva je glavna', 'Javni naslovi fotografij, ločeni s presledkom; prva je glavna'],
  colStart: ['Začátek', 'Začiatok', 'Kezdés', 'Početak', 'Začetek'],
  colStartTip: ['např. 20.10.2026 18:00 · prázdné = hned', 'napr. 20.10.2026 18:00 · prázdne = hneď', 'pl. 20.10.2026 18:00 · üres = azonnal', 'npr. 20.10.2026 18:00 · prazno = odmah', 'npr. 20.10.2026 18:00 · prazno = takoj'],
  colDuration: ['Délka', 'Dĺžka', 'Időtartam', 'Trajanje', 'Trajanje'],
  colReexpose: ['Opakování', 'Opakovanie', 'Ismétlés', 'Ponavljanje', 'Ponavljanje'],
  colBestOffer: ['Nabídnout cenu', 'Ponúknuť cenu', 'Árajánlat', 'Ponudi cijenu', 'Ponudi ceno'],
  colPriority: ['Přednostní výpis', 'Prednostný výpis', 'Kiemelt listázás', 'Prioritni prikaz', 'Prednostni prikaz'],
  colBold: ['Tučný titulek', 'Tučný titulok', 'Félkövér cím', 'Podebljani naslov', 'Krepki naslov'],
  colHighlight: ['Zvýraznění', 'Zvýraznenie', 'Kiemelés', 'Isticanje', 'Poudarek'],
  paidTip: ['Placená služba Aukra', 'Platená služba Aukra', 'Fizetős Aukro-szolgáltatás', 'Plaćena usluga Aukra', 'Plačljiva storitev Aukra'],
  colTitle: ['Název', 'Názov', 'Megnevezés', 'Naziv', 'Naziv'],
  colParam: ['Atribut {n}', 'Atribút {n}', '{n}. attribútum', 'Atribut {n}', 'Atribut {n}'],
  colValue: ['Hodnota {n}', 'Hodnota {n}', '{n}. érték', 'Vrijednost {n}', 'Vrednost {n}'],
  companyOnly: ['(firmy)', '(firmy)', '(cégek)', '(tvrtke)', '(podjetja)'],
  colStatus: ['Kontrola', 'Kontrola', 'Ellenőrzés', 'Provjera', 'Preverjanje'],
  colStatusTip: ['Výsledek kontroly nabídky – klikněte pro seznam chyb', 'Výsledok kontroly ponuky – kliknite pre zoznam chýb', 'Az ajánlat ellenőrzése – kattintson a hibák listájáért', 'Rezultat provjere ponude – kliknite za popis grešaka', 'Rezultat preverjanja ponudbe – kliknite za seznam napak'],
  statusExcluded: ['vyřazeno', 'vyradené', 'kizárva', 'isključeno', 'izključeno'],
  spaceTip: ['Mezerník přepne označené buňky, dvojklik jednu buňku', 'Medzerník prepne označené bunky, dvojklik jednu bunku', 'A szóköz átváltja a kijelölt cellákat, dupla kattintás egy cellát', 'Razmaknica prebacuje označene ćelije, dvostruki klik jednu ćeliju', 'Preslednica preklopi označene celice, dvoklik eno celico'],
  statusTip: ['Klikněte pro seznam chyb', 'Kliknite pre zoznam chýb', 'Kattintson a hibák listájáért', 'Kliknite za popis grešaka', 'Kliknite za seznam napak'],
  statusOk: ['Nabídka je v pořádku', 'Ponuka je v poriadku', 'Az ajánlat rendben van', 'Ponuda je u redu', 'Ponudba je v redu'],
  yes: ['ano', 'áno', 'igen', 'da', 'da'],
  no: ['ne', 'nie', 'nem', 'ne', 'ne'],
  noOffers: ['Žádné nabídky', 'Žiadne ponuky', 'Nincs ajánlat', 'Nema ponuda', 'Ni ponudb'],

  // ---- výčty
  typeAuction: ['Aukce', 'Aukcia', 'Aukció', 'Aukcija', 'Dražba'],
  typeBuyNow: ['Kup teď', 'Kúp teraz', 'Azonnali vétel', 'Kupi odmah', 'Kupi zdaj'],
  typeCombined: ['Aukce + Kup teď', 'Aukcia + Kúp teraz', 'Aukció + Azonnali vétel', 'Aukcija + Kupi odmah', 'Dražba + Kupi zdaj'],
  reexpose0: ['Neopakovat', 'Neopakovať', 'Nincs ismétlés', 'Ne ponavljaj', 'Ne ponavljaj'],
  reexpose1: ['Opakovat (nová nabídka)', 'Opakovať (nová ponuka)', 'Ismétlés (új ajánlat)', 'Ponovi (nova ponuda)', 'Ponovi (nova ponudba)'],
  reexpose2: ['Prodlužovat do prodeje', 'Predlžovať do predaja', 'Hosszabbítás eladásig', 'Produljuj do prodaje', 'Podaljšuj do prodaje'],

  // ---- dialogy a zprávy
  chooseCategory: ['Vyberte kategorii', 'Vyberte kategóriu', 'Válasszon kategóriát', 'Odaberite kategoriju', 'Izberite kategorijo'],
  searchCategory: ['Hledat kategorii nebo ID…', 'Hľadať kategóriu alebo ID…', 'Kategória vagy azonosító keresése…', 'Traži kategoriju ili ID…', 'Išči kategorijo ali ID…'],
  close: ['Zavřít', 'Zavrieť', 'Bezárás', 'Zatvori', 'Zapri'],
  nothingFound: ['Nic nenalezeno.', 'Nič sa nenašlo.', 'Nincs találat.', 'Ništa nije pronađeno.', 'Ni zadetkov.'],
  rowErrorsTitle: ['Chyby: {name}', 'Chyby: {name}', 'Hibák: {name}', 'Greške: {name}', 'Napake: {name}'],
  unnamedRow: ['řádek bez názvu', 'riadok bez názvu', 'névtelen sor', 'redak bez naziva', 'vrstica brez naziva'],
  canExport: ['Nabídku lze exportovat.', 'Ponuku možno exportovať.', 'Az ajánlat exportálható.', 'Ponuda se može izvesti.', 'Ponudbo je mogoče izvoziti.'],
  onAttrsSheet: ['(list Atributy)', '(hárok Atribúty)', '(Attribútumok lap)', '(list Atributi)', '(list Atributi)'],
  excludedTitle: ['Nabídka je vyřazená', 'Ponuka je vyradená', 'Az ajánlat ki van zárva', 'Ponuda je isključena', 'Ponudba je izključena'],
  excludedBody: [
    'Nabídka se nebude exportovat a nekontroluje se. Zaškrtněte sloupec Export, pokud ji chcete exportovat.',
    'Ponuka sa nebude exportovať a nekontroluje sa. Začiarknite stĺpec Export, ak ju chcete exportovať.',
    'Az ajánlat nem kerül exportálásra és nem ellenőrizzük. Jelölje be az Export oszlopot, ha exportálni szeretné.',
    'Ponuda se neće izvesti i ne provjerava se. Označite stupac Izvoz ako je želite izvesti.',
    'Ponudba se ne bo izvozila in se ne preverja. Označite stolpec Izvoz, če jo želite izvoziti.',
  ],
  nothingSelectedTitle: ['Nic není označeno', 'Nič nie je označené', 'Nincs kijelölés', 'Ništa nije označeno', 'Nič ni označeno'],
  nothingSelectedBody: [
    'Označte myší buňky v řádcích, se kterými chcete pracovat (stačí jeden sloupec).',
    'Označte myšou bunky v riadkoch, s ktorými chcete pracovať (stačí jeden stĺpec).',
    'Jelölje ki egérrel a kívánt sorok celláit (elég egy oszlop).',
    'Mišem označite ćelije u redcima s kojima želite raditi (dovoljan je jedan stupac).',
    'Z miško označite celice v vrsticah, s katerimi želite delati (zadošča en stolpec).',
  ],
  confirmDelete: ['Smazat označené řádky ({n})?', 'Zmazať označené riadky ({n})?', 'Törli a kijelölt sorokat ({n})?', 'Izbrisati označene retke ({n})?', 'Izbrišem označene vrstice ({n})?'],
  confirmReplace: ['Nahradit aktuální práci obsahem souboru?', 'Nahradiť aktuálnu prácu obsahom súboru?', 'Lecseréli a jelenlegi munkát a fájl tartalmára?', 'Zamijeniti trenutačni rad sadržajem datoteke?', 'Zamenjam trenutno delo z vsebino datoteke?'],
  cannotOpen: ['Soubor nelze otevřít', 'Súbor nemožno otvoriť', 'A fájl nem nyitható meg', 'Datoteku nije moguće otvoriti', 'Datoteke ni mogoče odpreti'],
  notWorkFile: ['Soubor neobsahuje práci z Aukro Listeru.', 'Súbor neobsahuje prácu z Aukro Listeru.', 'A fájl nem Aukro Lister munkát tartalmaz.', 'Datoteka ne sadrži rad iz Aukro Listera.', 'Datoteka ne vsebuje dela iz Aukro Listerja.'],
  invalidCsvTitle: ['Neplatné CSV', 'Neplatné CSV', 'Érvénytelen CSV', 'Neispravan CSV', 'Neveljaven CSV'],
  invalidCsvBody: ['Soubor nemá očekávanou hlavičku (chybí sloupec categoryId).', 'Súbor nemá očakávanú hlavičku (chýba stĺpec categoryId).', 'A fájl fejléce nem megfelelő (hiányzik a categoryId oszlop).', 'Datoteka nema očekivano zaglavlje (nedostaje stupac categoryId).', 'Datoteka nima pričakovane glave (manjka stolpec categoryId).'],
  importDoneTitle: ['Import dokončen', 'Import dokončený', 'Az importálás kész', 'Uvoz je dovršen', 'Uvoz je končan'],
  importDoneBody: ['Načtené nabídky: {n}.', 'Načítané ponuky: {n}.', 'Betöltött ajánlatok: {n}.', 'Učitane ponude: {n}.', 'Naložene ponudbe: {n}.'],
  unknownCategories: [
    'Kategorie, které v číselníku nejsou: {list}. Vyberte u těchto nabídek platnou kategorii.',
    'Kategórie, ktoré v číselníku nie sú: {list}. Vyberte pri týchto ponukách platnú kategóriu.',
    'A kódlistában nem szereplő kategóriák: {list}. Válasszon érvényes kategóriát ezekhez az ajánlatokhoz.',
    'Kategorije koje nisu u šifrarniku: {list}. Za te ponude odaberite valjanu kategoriju.',
    'Kategorije, ki jih ni v šifrantu: {list}. Za te ponudbe izberite veljavno kategorijo.',
  ],
  fixSettingsTitle: ['Doplňte nastavení prodejce', 'Doplňte nastavenia predajcu', 'Töltse ki az eladói beállításokat', 'Dopunite postavke prodavatelja', 'Dopolnite nastavitve prodajalca'],
  exportErrorsTitle: ['Nabídky s chybou: {n}', 'Ponuky s chybou: {n}', 'Hibás ajánlatok: {n}', 'Ponude s greškom: {n}', 'Ponudbe z napako: {n}'],
  exportErrorsBody: [
    'Opravte je (červené buňky), nebo je vyřaďte zrušením zaškrtnutí ve sloupci Export.',
    'Opravte ich (červené bunky), alebo ich vyraďte zrušením začiarknutia v stĺpci Export.',
    'Javítsa ki őket (piros cellák), vagy zárja ki őket az Export oszlop jelölésének törlésével.',
    'Ispravite ih (crvene ćelije) ili ih isključite uklanjanjem oznake u stupcu Izvoz.',
    'Popravite jih (rdeče celice) ali jih izključite z odstranitvijo kljukice v stolpcu Izvoz.',
  ],
  rowN: ['Řádek {n}', 'Riadok {n}', '{n}. sor', 'Redak {n}', 'Vrstica {n}'],
  andMore: ['…a další: {n}', '…a ďalšie: {n}', '…és további: {n}', '…i još: {n}', '…in še: {n}'],
  nothingToExportTitle: ['Není co exportovat', 'Nie je čo exportovať', 'Nincs mit exportálni', 'Nema ništa za izvoz', 'Ni česa izvoziti'],
  nothingToExportBody: ['Vyplňte aspoň jednu nabídku.', 'Vyplňte aspoň jednu ponuku.', 'Töltsön ki legalább egy ajánlatot.', 'Ispunite barem jednu ponudu.', 'Izpolnite vsaj eno ponudbo.'],
  csvReadyTitle: ['CSV připraveno', 'CSV pripravené', 'A CSV elkészült', 'CSV je spreman', 'CSV je pripravljen'],
  csvReadyBody: ['Exportované nabídky: {n}.', 'Exportované ponuky: {n}.', 'Exportált ajánlatok: {n}.', 'Izvezene ponude: {n}.', 'Izvožene ponudbe: {n}.'],
  csvSplit: ['Soubory: {n} (max. 350 nabídek na soubor).', 'Súbory: {n} (max. 350 ponúk na súbor).', 'Fájlok: {n} (fájlonként legfeljebb 350 ajánlat).', 'Datoteke: {n} (najviše 350 ponuda po datoteci).', 'Datoteke: {n} (največ 350 ponudb na datoteko).'],
  loadErrorTitle: ['Chyba načítání', 'Chyba načítania', 'Betöltési hiba', 'Pogreška učitavanja', 'Napaka pri nalaganju'],
  loadErrorHint: [
    'Otevírejte nástroj přes webovou adresu (GitHub Pages), ne jako soubor z disku.',
    'Otvárajte nástroj cez webovú adresu (GitHub Pages), nie ako súbor z disku.',
    'Az eszközt webcímen (GitHub Pages) nyissa meg, ne fájlként a lemezről.',
    'Alat otvarajte putem web-adrese (GitHub Pages), a ne kao datoteku s diska.',
    'Orodje odpirajte prek spletnega naslova (GitHub Pages), ne kot datoteko z diska.',
  ],

  // ---- validace (core.js)
  vCategoryMissing: ['Vyberte kategorii.', 'Vyberte kategóriu.', 'Válasszon kategóriát.', 'Odaberite kategoriju.', 'Izberite kategorijo.'],
  vCategoryUnknown: ['Kategorie {id} není v aktuálním číselníku Aukra.', 'Kategória {id} nie je v aktuálnom číselníku Aukra.', 'A(z) {id} kategória nem szerepel az Aukro aktuális kódlistájában.', 'Kategorija {id} nije u aktualnom šifrarniku Aukra.', 'Kategorije {id} ni v trenutnem šifrantu Aukra.'],
  vCategoryNotLeaf: ['Nabídku lze vystavit jen do aktivní koncové kategorie.', 'Ponuku možno vystaviť len do aktívnej koncovej kategórie.', 'Ajánlat csak aktív, legalsó szintű kategóriában tehető közzé.', 'Ponuda se može objaviti samo u aktivnoj krajnjoj kategoriji.', 'Ponudbo je mogoče objaviti le v aktivni končni kategoriji.'],
  vNameShort: ['Název musí mít aspoň 3 znaky.', 'Názov musí mať aspoň 3 znaky.', 'A megnevezésnek legalább 3 karakteresnek kell lennie.', 'Naziv mora imati najmanje 3 znaka.', 'Naziv mora imeti vsaj 3 znake.'],
  vNameLong: ['Název má {len} znaků, povoleno je 70.', 'Názov má {len} znakov, povolených je 70.', 'A megnevezés {len} karakter, legfeljebb 70 engedélyezett.', 'Naziv ima {len} znakova, dopušteno je 70.', 'Naziv ima {len} znakov, dovoljenih je 70.'],
  vExtId: ['Kód zboží může mít nejvýš 50 znaků.', 'Kód tovaru môže mať najviac 50 znakov.', 'A termékkód legfeljebb 50 karakter lehet.', 'Šifra proizvoda može imati najviše 50 znakova.', 'Šifra izdelka ima lahko največ 50 znakov.'],
  vPrice: ['Zadejte cenu větší než 0.', 'Zadajte cenu väčšiu ako 0.', 'Adjon meg 0-nál nagyobb árat.', 'Unesite cijenu veću od 0.', 'Vnesite ceno, večjo od 0.'],
  vPriceNoDecimals: ['{cur}: cena bez desetinných míst.', '{cur}: cena bez desatinných miest.', '{cur}: tizedesjegy nélküli ár.', '{cur}: cijena bez decimala.', '{cur}: cena brez decimalnih mest.'],
  vPrice2Decimals: ['{cur}: nejvýš 2 desetinná místa.', '{cur}: najviac 2 desatinné miesta.', '{cur}: legfeljebb 2 tizedesjegy.', '{cur}: najviše 2 decimale.', '{cur}: največ 2 decimalni mesti.'],
  vPriceTens: ['{cur}: cena zaokrouhlená na desítky.', '{cur}: cena zaokrúhlená na desiatky.', '{cur}: tízesre kerekített ár.', '{cur}: cijena zaokružena na desetice.', '{cur}: cena, zaokrožena na desetice.'],
  vType: ['Vyberte typ nabídky.', 'Vyberte typ ponuky.', 'Válassza ki az ajánlat típusát.', 'Odaberite vrstu ponude.', 'Izberite vrsto ponudbe.'],
  vBuyNowHigher: ['Cena Kup teď musí být vyšší než vyvolávací cena.', 'Cena Kúp teraz musí byť vyššia ako vyvolávacia cena.', 'Az azonnali árnak magasabbnak kell lennie a kikiáltási árnál.', 'Cijena Kupi odmah mora biti viša od početne cijene.', 'Cena Kupi zdaj mora biti višja od izklicne cene.'],
  vQuantity: ['Množství musí být celé číslo ≥ 1.', 'Množstvo musí byť celé číslo ≥ 1.', 'A mennyiségnek ≥ 1 egész számnak kell lennie.', 'Količina mora biti cijeli broj ≥ 1.', 'Količina mora biti celo število ≥ 1.'],
  vQuantityAuction: ['Aukce může mít jen 1 kus.', 'Aukcia môže mať len 1 kus.', 'Az aukció csak 1 darabos lehet.', 'Aukcija može imati samo 1 komad.', 'Dražba ima lahko le 1 kos.'],
  vDuration: ['Délka musí být 3, 5, 7, 10 nebo 30 dní.', 'Dĺžka musí byť 3, 5, 7, 10 alebo 30 dní.', 'Az időtartam 3, 5, 7, 10 vagy 30 nap lehet.', 'Trajanje mora biti 3, 5, 7, 10 ili 30 dana.', 'Trajanje mora biti 3, 5, 7, 10 ali 30 dni.'],
  vDuration30: ['30 dní jen pro nabídku Kup teď.', '30 dní len pre ponuku Kúp teraz.', '30 nap csak azonnali vételnél.', '30 dana samo za ponudu Kupi odmah.', '30 dni samo za ponudbo Kupi zdaj.'],
  vDateInvalid: ['Neplatné datum.', 'Neplatný dátum.', 'Érvénytelen dátum.', 'Neispravan datum.', 'Neveljaven datum.'],
  vDatePast: ['Začátek musí být v budoucnu (nebo nechte prázdné = hned).', 'Začiatok musí byť v budúcnosti (alebo nechajte prázdne = hneď).', 'A kezdésnek a jövőben kell lennie (vagy hagyja üresen = azonnal).', 'Početak mora biti u budućnosti (ili ostavite prazno = odmah).', 'Začetek mora biti v prihodnosti (ali pustite prazno = takoj).'],
  vImagesMissing: ['Přidejte aspoň 1 fotku (URL).', 'Pridajte aspoň 1 fotku (URL).', 'Adjon meg legalább 1 fotót (URL).', 'Dodajte barem 1 fotografiju (URL).', 'Dodajte vsaj 1 fotografijo (URL).'],
  vImagesTooMany: ['Kategorie povoluje nejvýš {max} fotek.', 'Kategória povoľuje najviac {max} fotiek.', 'A kategória legfeljebb {max} fotót enged.', 'Kategorija dopušta najviše {max} fotografija.', 'Kategorija dovoljuje največ {max} fotografij.'],
  vImagesUrl: ['Každá fotka musí být veřejná adresa začínající http(s)://', 'Každá fotka musí byť verejná adresa začínajúca http(s)://', 'Minden fotónak http(s)://-sel kezdődő nyilvános címnek kell lennie', 'Svaka fotografija mora biti javna adresa koja počinje s http(s)://', 'Vsaka fotografija mora biti javni naslov, ki se začne s http(s)://'],
  vDescMissing: ['Popis je povinný.', 'Popis je povinný.', 'A leírás kötelező.', 'Opis je obavezan.', 'Opis je obvezen.'],
  vDescLong: ['Popis má {len} znaků včetně HTML, povoleno je 65 000.', 'Popis má {len} znakov vrátane HTML, povolených je 65 000.', 'A leírás HTML-lel együtt {len} karakter, legfeljebb 65 000 engedélyezett.', 'Opis ima {len} znakova uključujući HTML, dopušteno je 65 000.', 'Opis ima {len} znakov vključno s HTML, dovoljenih je 65 000.'],
  vAttrRequired: ['{name}: povinný atribut.', '{name}: povinný atribút.', '{name}: kötelező attribútum.', '{name}: obavezan atribut.', '{name}: obvezen atribut.'],
  vAttrChoose: ['{name}: vyberte hodnotu ze seznamu.', '{name}: vyberte hodnotu zo zoznamu.', '{name}: válasszon értéket a listából.', '{name}: odaberite vrijednost s popisa.', '{name}: izberite vrednost s seznama.'],
  vAttrInvalid: ['{name}: neplatná volba.', '{name}: neplatná voľba.', '{name}: érvénytelen választás.', '{name}: neispravan odabir.', '{name}: neveljavna izbira.'],
  vAttrNumber: ['{name}: zadejte číslo.', '{name}: zadajte číslo.', '{name}: adjon meg számot.', '{name}: unesite broj.', '{name}: vnesite število.'],
  vAttrInteger: ['{name}: zadejte celé číslo.', '{name}: zadajte celé číslo.', '{name}: adjon meg egész számot.', '{name}: unesite cijeli broj.', '{name}: vnesite celo število.'],
  vAttrMin: ['{name}: minimum je {v}.', '{name}: minimum je {v}.', '{name}: a minimum {v}.', '{name}: najmanje {v}.', '{name}: najmanj {v}.'],
  vAttrMax: ['{name}: maximum je {v}.', '{name}: maximum je {v}.', '{name}: a maximum {v}.', '{name}: najviše {v}.', '{name}: največ {v}.'],
  vAttrLength: ['{name}: nejvýš {v} znaků.', '{name}: najviac {v} znakov.', '{name}: legfeljebb {v} karakter.', '{name}: najviše {v} znakova.', '{name}: največ {v} znakov.'],
  vSetDomain: ['Vyberte doménu účtu.', 'Vyberte doménu účtu.', 'Válassza ki a fiók domainjét.', 'Odaberite domenu računa.', 'Izberite domeno računa.'],
  vSetCity: ['Vyplňte město.', 'Vyplňte mesto.', 'Adja meg a várost.', 'Unesite grad.', 'Vnesite kraj.'],
  vSetPostCode: ['Vyplňte PSČ.', 'Vyplňte PSČ.', 'Adja meg az irányítószámot.', 'Unesite poštanski broj.', 'Vnesite poštno številko.'],
  vSetCountry: ['Vyberte zemi.', 'Vyberte krajinu.', 'Válassza ki az országot.', 'Odaberite državu.', 'Izberite državo.'],
  vSetShipping: ['Zadejte číselné ID šablony dopravy z Moje Aukro.', 'Zadajte číselné ID šablóny dopravy z Moje Aukro.', 'Adja meg a szállítási sablon számazonosítóját a Saját Aukróból.', 'Unesite brojčani ID predloška dostave iz Moj Aukro.', 'Vnesite številski ID predloge dostave iz Moj Aukro.'],

  // ---- společné parametry (výchozí názvy, pokud je kategorie nevrací)
  gStav: ['Stav', 'Stav', 'Állapot', 'Stanje', 'Stanje'],
  gWarranty: ['Doba záruky (měsíce)', 'Doba záruky (mesiace)', 'Garancia (hónap)', 'Jamstvo (mjeseci)', 'Garancija (meseci)'],
  gDelivery: ['Doba dodání', 'Doba dodania', 'Szállítási idő', 'Rok isporuke', 'Rok dobave'],
  sNew: ['Nové', 'Nové', 'Új', 'Novo', 'Novo'],
  sUnpacked: ['Rozbaleno', 'Rozbalené', 'Kibontott', 'Otpakirano', 'Odpakirano'],
  sLikeNew: ['Zánovní', 'Zánovné', 'Újszerű', 'Kao novo', 'Kot novo'],
  sUsed: ['Použité', 'Použité', 'Használt', 'Rabljeno', 'Rabljeno'],
  sRepaired: ['Opravené', 'Opravené', 'Javított', 'Popravljeno', 'Popravljeno'],
  sRefurbished: ['Repasované', 'Repasované', 'Felújított', 'Obnovljeno', 'Obnovljeno'],
  sBroken: ['Nefunkční / na díly', 'Nefunkčné / na diely', 'Nem működő / alkatrésznek', 'Neispravno / za dijelove', 'Nedelujoče / za dele'],
  d12: ['1-2 dny', '1-2 dni', '1-2 nap', '1-2 dana', '1-2 dni'],
  d23: ['2-3 dny', '2-3 dni', '2-3 nap', '2-3 dana', '2-3 dni'],
  d46: ['4-6 dní', '4-6 dní', '4-6 nap', '4-6 dana', '4-6 dni'],
  d710: ['7-10 dní', '7-10 dní', '7-10 nap', '7-10 dana', '7-10 dni'],
  d10plus: ['více než 10 dní', 'viac ako 10 dní', 'több mint 10 nap', 'više od 10 dana', 'več kot 10 dni'],
};

let current = 'cs';

export function setLanguage(code) {
  if (code in IDX) current = code;
  if (typeof document !== 'undefined') document.documentElement.lang = current;
}
export const getLanguage = () => current;
export const langTag = (code = current) => LANGUAGES.find((l) => l.code === code)?.tag || 'cs-CZ';
export const codeFromTag = (tag) => LANGUAGES.find((l) => l.tag === tag)?.code || 'cs';

export function t(key, params = {}) {
  const row = T[key];
  let s = row ? (row[IDX[current]] ?? row[0]) : key;
  for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

// všechny jazykové varianty klíče – pro rozpoznání vložených hodnot v jakémkoli jazyce
export const allVariants = (key) => T[key] || [];

// „3 dny / 5 dní / 3 nap …“
export function daysLabel(d) {
  const n = Number(d);
  const w = {
    cs: n < 5 ? 'dny' : 'dní',
    sk: n < 5 ? 'dni' : 'dní',
    hu: 'nap',
    hr: 'dana',
    sl: 'dni',
  }[current];
  return `${n} ${w}`;
}

// Přeloží statické texty v HTML: data-i18n (text), data-i18n-html, data-i18n-placeholder, data-i18n-title
export function translateDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
}
