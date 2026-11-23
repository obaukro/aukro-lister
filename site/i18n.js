// Překlady rozhraní do jazyků zemí, kde Aukro působí: čeština, slovenština, maďarština, chorvatština, slovinština.
// Každý klíč: [cs, sk, hu, hr, sl]. Parametry ve složených závorkách: {n}, {name}…
// Pozn.: překlady do HU/HR/SL je vhodné nechat zkontrolovat rodilým mluvčím.

export const LANGUAGES = [
  { code: 'cs', tag: 'cs-CZ', label: 'Čeština' },
  { code: 'sk', tag: 'sk-SK', label: 'Slovenčina' },
  { code: 'hu', tag: 'hu-HU', label: 'Magyar' },
  { code: 'hr', tag: 'hr-HR', label: 'Hrvatski' },
  { code: 'sl', tag: 'sl-SI', label: 'Slovenščina' },
  // jen rozhraní – číselníky se zobrazují v jazyce domény účtu
  { code: 'pl', tag: 'pl-PL', label: 'Polski', uiOnly: true },
  { code: 'en', tag: 'en-GB', label: 'English', uiOnly: true },
];
const IDX = Object.fromEntries(LANGUAGES.map((l, i) => [l.code, i]));

const T = {
  // ---- hlavička a akce
  loadingData: ['Načítám číselníky…', 'Načítavam číselníky…', 'Kódlisták betöltése…', 'Učitavanje šifrarnika…', 'Nalagam šifrante…', "Wczytuję słowniki…", "Loading catalogues…"],
  dataInfo: ['Číselníky Aukra k {date} · kategorie: {n}', 'Číselníky Aukra k {date} · kategórie: {n}', 'Aukro kódlisták: {date} · kategóriák: {n}', 'Šifrarnici Aukra na dan {date} · kategorije: {n}', 'Šifranti Aukra na dan {date} · kategorije: {n}', "Słowniki Aukro z dnia {date} · kategorie: {n}", "Aukro catalogues as of {date} · categories: {n}"],
  dataError: ['Číselníky se nepodařilo načíst.', 'Číselníky sa nepodarilo načítať.', 'A kódlisták betöltése sikertelen.', 'Šifrarnike nije moguće učitati.', 'Šifrantov ni bilo mogoče naložiti.', "Nie udało się wczytać słowników.", "The catalogues could not be loaded."],
  language: ['Jazyk', 'Jazyk', 'Nyelv', 'Jezik', 'Jezik', "Język", "Language"],
  btnOpen: ['Otevřít práci', 'Otvoriť prácu', 'Munka megnyitása', 'Otvori rad', 'Odpri delo', "Otwórz pracę", "Open work"],
  btnSave: ['Uložit práci', 'Uložiť prácu', 'Munka mentése', 'Spremi rad', 'Shrani delo', "Zapisz pracę", "Save work"],
  btnImportCsv: ['Importovat CSV', 'Importovať CSV', 'CSV importálása', 'Uvezi CSV', 'Uvozi CSV', "Importuj CSV", "Import CSV"],
  btnExport: ['Exportovat CSV', 'Exportovať CSV', 'CSV exportálása', 'Izvezi CSV', 'Izvozi CSV', "Eksportuj CSV", "Export CSV"],
  demoBanner: ['Zobrazují se <strong>ukázková data</strong>. Skutečné kategorie a atributy se objeví po první synchronizaci s Aukrem.', 'Zobrazujú sa <strong>ukážkové údaje</strong>. Skutočné kategórie a atribúty sa zobrazia po prvej synchronizácii s Aukrom.', '<strong>Mintaadatok</strong> láthatók. A valódi kategóriák és attribútumok az Aukróval való első szinkronizálás után jelennek meg.', 'Prikazuju se <strong>ogledni podaci</strong>. Stvarne kategorije i atributi pojavit će se nakon prve sinkronizacije s Aukrom.', 'Prikazani so <strong>vzorčni podatki</strong>. Prave kategorije in atributi se prikažejo po prvi sinhronizaciji z Aukrom.', "Wyświetlane są <strong>dane przykładowe</strong>. Prawdziwe kategorie i atrybuty pojawią się po pierwszej synchronizacji z Aukro.", "Showing <strong>sample data</strong>. Real categories and attributes will appear after the first sync with Aukro."],
  noLangData: [
    'Číselníky v tomto jazyce zatím nejsou stažené, zobrazuje se čeština.',
    'Číselníky v tomto jazyku zatiaľ nie sú stiahnuté, zobrazuje sa čeština.',
    'A kódlisták ezen a nyelven még nincsenek letöltve, cseh nyelvű adatok láthatók.',
    'Šifrarnici na ovom jeziku još nisu preuzeti, prikazuje se češki.',
    'Šifranti v tem jeziku še niso preneseni, prikazana je češčina.',
    "Słowniki w tym języku nie zostały jeszcze pobrane, wyświetlany jest język czeski.",
    "Catalogues in this language have not been downloaded yet, showing Czech.",
  ],

  catalogLang: [
    "Kategorie a atributy se zobrazují v jazyce domény účtu ({lang}), protože v tomto jazyce musí být nabídka.",
    "Kategórie a atribúty sa zobrazujú v jazyku domény účtu ({lang}), pretože v tomto jazyku musí byť ponuka.",
    "A kategóriák és attribútumok a fiók domainjének nyelvén ({lang}) jelennek meg, mert az ajánlatnak ezen a nyelven kell lennie.",
    "Kategorije i atributi prikazuju se na jeziku domene računa ({lang}), jer ponuda mora biti na tom jeziku.",
    "Kategorije in atributi so prikazani v jeziku domene računa ({lang}), ker mora biti ponudba v tem jeziku.",
    "Kategorie i atrybuty są wyświetlane w języku domeny konta ({lang}), ponieważ w tym języku musi być oferta.",
    "Categories and attributes are shown in the account domain's language ({lang}), because the offer must be in that language.",
  ],

  // ---- nastavení
  settingsTitle: ['Nastavení prodejce', 'Nastavenia predajcu', 'Eladói beállítások', 'Postavke prodavatelja', 'Nastavitve prodajalca', "Ustawienia sprzedawcy", "Seller settings"],
  settingsOk: ['v pořádku', 'v poriadku', 'rendben', 'u redu', 'v redu', "w porządku", "OK"],
  settingsMissing: ['k doplnění: {n}', 'na doplnenie: {n}', 'kitöltendő: {n}', 'za dopuniti: {n}', 'za dopolniti: {n}', "do uzupełnienia: {n}", "to fill in: {n}"],
  domain: ['Účet na doméně', 'Účet na doméne', 'Fiók domainje', 'Račun na domeni', 'Račun na domeni', "Konto w domenie", "Account domain"],
  city: ['Město', 'Mesto', 'Város', 'Grad', 'Kraj', "Miasto", "City"],
  postCode: ['PSČ', 'PSČ', 'Irányítószám', 'Poštanski broj', 'Poštna številka', "Kod pocztowy", "Postcode"],
  country: ['Země', 'Krajina', 'Ország', 'Država', 'Država', "Kraj", "Country"],
  shippingTemplate: ['ID šablony dopravy', 'ID šablóny dopravy', 'Szállítási sablon azonosítója', 'ID predloška dostave', 'ID predloge dostave', "ID szablonu dostawy", "Shipping template ID"],
  shippingHint: ['Moje Aukro → Můj prodej → Šablony dopravy.', 'Moje Aukro → Môj predaj → Šablóny dopravy.', 'Saját Aukro → Eladásaim → Szállítási sablonok.', 'Moj Aukro → Moja prodaja → Predlošci dostave.', 'Moj Aukro → Moja prodaja → Predloge dostave.', "Moje Aukro → Moja sprzedaż → Szablony dostawy.", "My Aukro → My sales → Shipping templates."],
  shippingPlaceholder: ['např. 2419062', 'napr. 2419062', 'pl. 2419062', 'npr. 2419062', 'npr. 2419062', "np. 2419062", "e.g. 2419062"],
  defaultDuration: ['Výchozí délka', 'Predvolená dĺžka', 'Alapértelmezett időtartam', 'Zadano trajanje', 'Privzeto trajanje', "Domyślny czas trwania", "Default duration"],
  defaultReexpose: ['Výchozí opakování', 'Predvolené opakovanie', 'Alapértelmezett ismétlés', 'Zadano ponavljanje', 'Privzeto ponavljanje', "Domyślne wznawianie", "Default relisting"],

  // ---- listy a nástrojová lišta
  tabOffers: ['Nabídky', 'Ponuky', 'Ajánlatok', 'Ponude', 'Ponudbe', "Oferty", "Offers"],
  tabAttrs: ['Atributy', 'Atribúty', 'Attribútumok', 'Atributi', 'Atributi', "Atrybuty", "Attributes"],
  addRow: ['+ Řádek', '+ Riadok', '+ Sor', '+ Redak', '+ Vrstica', "+ Wiersz", "+ Row"],
  addRows: ['+ 10 řádků', '+ 10 riadkov', '+ 10 sor', '+ 10 redaka', '+ 10 vrstic', "+ 10 wierszy", "+ 10 rows"],
  setCategory: ['Kategorie pro označené', 'Kategória pre označené', 'Kategória a kijelöltekhez', 'Kategorija za označene', 'Kategorija za označene', "Kategoria dla zaznaczonych", "Category for selected"],
  deleteRows: ['Smazat označené řádky', 'Zmazať označené riadky', 'Kijelölt sorok törlése', 'Izbriši označene retke', 'Izbriši označene vrstice', "Usuń zaznaczone wiersze", "Delete selected rows"],
  sumOffers: ['Nabídky: {n}', 'Ponuky: {n}', 'Ajánlatok: {n}', 'Ponude: {n}', 'Ponudbe: {n}', "Oferty: {n}", "Offers: {n}"],
  sumErrors: ['s chybou: {n}', 's chybou: {n}', 'hibás: {n}', 's greškom: {n}', 'z napako: {n}', "z błędem: {n}", "with errors: {n}"],
  sumSettings: ['doplňte nastavení prodejce', 'doplňte nastavenia predajcu', 'töltse ki az eladói beállításokat', 'dopunite postavke prodavatelja', 'dopolnite nastavitve prodajalca', "uzupełnij ustawienia sprzedawcy", "complete the seller settings"],
  hintOffers: [
    'Všechny nabídky na jednom listu, kategorie se vybírá u každé nabídky. Označte buňky myší (nebo Shift + šipkami); <b>Ctrl/Cmd+C</b> a <b>Ctrl/Cmd+V</b> kopírují a vkládají i z Excelu a Google Sheets. Psaním, Enterem nebo dvojklikem buňku upravíte, Delete obsah smaže.',
    'Všetky ponuky na jednom hárku, kategória sa vyberá pri každej ponuke. Označte bunky myšou (alebo Shift + šípkami); <b>Ctrl/Cmd+C</b> a <b>Ctrl/Cmd+V</b> kopírujú a vkladajú aj z Excelu a Google Sheets. Písaním, Enterom alebo dvojklikom bunku upravíte, Delete obsah zmaže.',
    'Minden ajánlat egy lapon, a kategóriát ajánlatonként kell kiválasztani. Jelölje ki a cellákat egérrel (vagy Shift + nyilakkal); a <b>Ctrl/Cmd+C</b> és <b>Ctrl/Cmd+V</b> Excelből és Google Sheetsből is másol és beilleszt. Gépeléssel, Enterrel vagy dupla kattintással szerkeszthet, a Delete törli a tartalmat.',
    'Sve ponude na jednom listu, kategorija se bira za svaku ponudu. Označite ćelije mišem (ili Shift + strelicama); <b>Ctrl/Cmd+C</b> i <b>Ctrl/Cmd+V</b> kopiraju i lijepe i iz Excela i Google Sheetsa. Tipkanjem, Enterom ili dvostrukim klikom uređujete ćeliju, Delete briše sadržaj.',
    'Vse ponudbe na enem listu, kategorija se izbere pri vsaki ponudbi. Označite celice z miško (ali Shift + puščicami); <b>Ctrl/Cmd+C</b> in <b>Ctrl/Cmd+V</b> kopirata in lepita tudi iz Excela in Google Sheets. S tipkanjem, Enterjem ali dvoklikom celico uredite, Delete izbriše vsebino.',
    "Wszystkie oferty na jednym arkuszu, kategorię wybiera się przy każdej ofercie. Zaznacz komórki myszą (lub Shift + strzałki); <b>Ctrl/Cmd+C</b> i <b>Ctrl/Cmd+V</b> kopiują i wklejają także z Excela i Google Sheets. Pisanie, Enter lub dwuklik edytuje komórkę, Delete usuwa zawartość.",
    "All offers on one sheet; the category is chosen for each offer. Select cells with the mouse (or Shift + arrow keys); <b>Ctrl/Cmd+C</b> and <b>Ctrl/Cmd+V</b> copy and paste, also from Excel and Google Sheets. Type, press Enter or double-click to edit a cell; Delete clears it.",
  ],
  hintAttrs: ['Atributy kategorie u každé nabídky – dvojice Atribut / Hodnota jako ve Sheets šabloně. Kód zboží, EAN, P/N, Stav, Doba záruky a Doba dodání se vyplňují na listu Nabídky. Šrafované buňky kategorie nemá. Hodnoty lze vkládat i jako text („Nové“, „Apple 7062“).', 'Atribúty kategórie pri každej ponuke – dvojice Atribút / Hodnota ako v šablóne Sheets. Kód tovaru, EAN, P/N, Stav, Doba záruky a Doba dodania sa vypĺňajú na hárku Ponuky. Šrafované bunky kategória nemá. Hodnoty možno vkladať aj ako text („Nové“, „Apple 7062“).', 'A kategória attribútumai ajánlatonként – Attribútum / Érték párok, mint a Sheets sablonban. A termékkódot, EAN-t, P/N-t, állapotot, garanciát és szállítási időt az Ajánlatok lapon kell kitölteni. A csíkozott cellák a kategóriában nem léteznek. Az értékek szövegként is beilleszthetők („Új“, „Apple 7062“).', 'Atributi kategorije za svaku ponudu – parovi Atribut / Vrijednost kao u Sheets predlošku. Šifra proizvoda, EAN, P/N, stanje, jamstvo i rok isporuke unose se na listu Ponude. Šrafirane ćelije kategorija nema. Vrijednosti se mogu lijepiti i kao tekst („Novo“, „Apple 7062“).', 'Atributi kategorije pri vsaki ponudbi – pari Atribut / Vrednost kot v predlogi Sheets. Šifra izdelka, EAN, P/N, stanje, garancija in rok dobave se vnesejo na listu Ponudbe. Šrafiranih celic kategorija nima. Vrednosti lahko prilepite tudi kot besedilo („Novo“, „Apple 7062“).', "Atrybuty kategorii przy każdej ofercie – pary Atrybut / Wartość jak w szablonie Sheets. Kod produktu, EAN, P/N, Stan, Okres gwarancji i Czas dostawy wypełnia się na arkuszu Oferty. Kreskowanych komórek kategoria nie ma. Wartości można wklejać także jako tekst („Nowe”, „Apple 7062”).", "Category attributes for each offer – Attribute / Value pairs as in the Sheets template. Product code, EAN, P/N, Condition, Warranty and Delivery time are filled in on the Offers sheet. Hatched cells do not apply to the category. Values can also be pasted as text (\"New\", \"Apple 7062\")."],

  // ---- sloupce
  colExport: ['Export', 'Export', 'Export', 'Izvoz', 'Izvoz', "Eksport", "Export"],
  colExportTip: ['Zrušením zaškrtnutí nabídku z exportu vyřadíte', 'Zrušením začiarknutia ponuku z exportu vyradíte', 'A jelölés törlésével az ajánlat kimarad az exportból', 'Uklanjanjem oznake ponuda se isključuje iz izvoza', 'Z odstranitvijo kljukice ponudbo izključite iz izvoza', "Odznacz, aby wykluczyć ofertę z eksportu", "Untick to exclude the offer from export"],
  colName: ['Název *', 'Názov *', 'Megnevezés *', 'Naziv *', 'Naziv *', "Tytuł *", "Title *"],
  colNameTip: ['3–70 znaků', '3–70 znakov', '3–70 karakter', '3–70 znakova', '3–70 znakov', "3–70 znaków", "3–70 characters"],
  colCategory: ['Kategorie *', 'Kategória *', 'Kategória *', 'Kategorija *', 'Kategorija *', "Kategoria *", "Category *"],
  choose: ['vyberte…', 'vyberte…', 'válasszon…', 'odaberite…', 'izberite…', "wybierz…", "choose…"],
  colExtId: ['Kód zboží', 'Kód tovaru', 'Termékkód', 'Šifra proizvoda', 'Šifra izdelka', "Kod produktu", "Product code"],
  colDescription: ['Popis *', 'Popis *', 'Leírás *', 'Opis *', 'Opis *', "Opis *", "Description *"],
  colDescriptionTip: [
    'HTML popisu. Můžete ho vložit rovnou do buňky; dvojklik nebo Enter otevře editor s náhledem a úpravou HTML.',
    'HTML popisu. Môžete ho vložiť priamo do bunky; dvojklik alebo Enter otvorí editor s náhľadom a úpravou HTML.',
    'A leírás HTML-je. Közvetlenül a cellába is beillesztheti; dupla kattintás vagy Enter megnyitja a szerkesztőt előnézettel és HTML-szerkesztéssel.',
    'HTML opisa. Možete ga zalijepiti izravno u ćeliju; dvostruki klik ili Enter otvara uređivač s pregledom i uređivanjem HTML-a.',
    'HTML opisa. Prilepite ga lahko neposredno v celico; dvoklik ali Enter odpre urejevalnik s predogledom in urejanjem HTML.',
    "HTML opisu. Można go wkleić bezpośrednio do komórki; dwuklik lub Enter otwiera edytor z podglądem i edycją HTML.",
    "Description HTML. You can paste it straight into the cell; double-click or Enter opens the editor with preview and HTML editing.",
  ],
  lines: ['ř.', 'r.', 'sor', 'r.', 'vr.', "wiersze", "lines"],
  colType: ['Typ *', 'Typ *', 'Típus *', 'Vrsta *', 'Vrsta *', "Typ *", "Type *"],
  colAuctionPrice: ['Vyvolávací cena', 'Vyvolávacia cena', 'Kikiáltási ár', 'Početna cijena', 'Izklicna cena', "Cena wywoławcza", "Starting price"],
  colBuyNowPrice: ['Cena Kup teď', 'Cena Kúp teraz', 'Azonnali ár', 'Cijena Kupi odmah', 'Cena Kupi zdaj', "Cena Kup teraz", "Buy Now price"],
  colRetailPrice: ['Běžná cena', 'Bežná cena', 'Normál ár', 'Redovna cijena', 'Redna cena', "Cena regularna", "Regular price"],
  colQuantity: ['Množství', 'Množstvo', 'Mennyiség', 'Količina', 'Količina', "Ilość", "Quantity"],
  colImages: ['URL obrázků *', 'URL obrázkov *', 'Képek URL-je *', 'URL slika *', 'URL slik *', "URL zdjęć *", "Image URLs *"],
  colImagesTip: ['Veřejné adresy fotek oddělené mezerou; první je hlavní', 'Verejné adresy fotiek oddelené medzerou; prvá je hlavná', 'Nyilvános fotócímek szóközzel elválasztva; az első a fő kép', 'Javne adrese fotografija odvojene razmakom; prva je glavna', 'Javni naslovi fotografij, ločeni s presledkom; prva je glavna', "Publiczne adresy zdjęć oddzielone spacją; pierwsze jest główne", "Public photo URLs separated by spaces; the first is the main one"],
  colStart: ['Začátek', 'Začiatok', 'Kezdés', 'Početak', 'Začetek', "Początek", "Start"],
  colStartTip: ['např. 20.10.2026 18:00 · prázdné = hned', 'napr. 20.10.2026 18:00 · prázdne = hneď', 'pl. 20.10.2026 18:00 · üres = azonnal', 'npr. 20.10.2026 18:00 · prazno = odmah', 'npr. 20.10.2026 18:00 · prazno = takoj', "np. 20.10.2026 18:00 · puste = od razu", "e.g. 20.10.2026 18:00 · empty = immediately"],
  colDuration: ['Délka', 'Dĺžka', 'Időtartam', 'Trajanje', 'Trajanje', "Czas trwania", "Duration"],
  colReexpose: ['Opakování', 'Opakovanie', 'Ismétlés', 'Ponavljanje', 'Ponavljanje', "Wznawianie", "Relisting"],
  colBestOffer: ['Nabídnout cenu', 'Ponúknuť cenu', 'Árajánlat', 'Ponudi cijenu', 'Ponudi ceno', "Zaproponuj cenę", "Best offer"],
  colPriority: ['Přednostní výpis', 'Prednostný výpis', 'Kiemelt listázás', 'Prioritni prikaz', 'Prednostni prikaz', "Wyróżnienie na liście", "Priority listing"],
  colBold: ['Tučný titulek', 'Tučný titulok', 'Félkövér cím', 'Podebljani naslov', 'Krepki naslov', "Pogrubiony tytuł", "Bold title"],
  colHighlight: ['Zvýraznění', 'Zvýraznenie', 'Kiemelés', 'Isticanje', 'Poudarek', "Podświetlenie", "Highlight"],
  paidTip: ['Placená služba Aukra', 'Platená služba Aukra', 'Fizetős Aukro-szolgáltatás', 'Plaćena usluga Aukra', 'Plačljiva storitev Aukra', "Płatna usługa Aukro", "Paid Aukro service"],
  colTitle: ['Název', 'Názov', 'Megnevezés', 'Naziv', 'Naziv', "Tytuł", "Title"],
  colParam: ['Atribut {n}', 'Atribút {n}', '{n}. attribútum', 'Atribut {n}', 'Atribut {n}', "Atrybut {n}", "Attribute {n}"],
  colValue: ['Hodnota {n}', 'Hodnota {n}', '{n}. érték', 'Vrijednost {n}', 'Vrednost {n}', "Wartość {n}", "Value {n}"],
  companyOnly: ['(firmy)', '(firmy)', '(cégek)', '(tvrtke)', '(podjetja)', "(firmy)", "(companies)"],
  tabVisual: ['Náhled a úpravy', 'Náhľad a úpravy', 'Előnézet és szerkesztés', 'Pregled i uređivanje', 'Predogled in urejanje', "Podgląd i edycja", "Preview and edit"],
  tabHtml: ['HTML', 'HTML', 'HTML', 'HTML', 'HTML', "HTML", "HTML"],
  cleanHtml: ['Vyčistit HTML', 'Vyčistiť HTML', 'HTML tisztítása', 'Očisti HTML', 'Počisti HTML', "Wyczyść HTML", "Clean HTML"],
  cleanHtmlTip: ['Odstraní značky, které Aukro nepovoluje (ponechá nadpisy, odstavce, tučné písmo a seznamy)', 'Odstráni značky, ktoré Aukro nepovoľuje (ponechá nadpisy, odseky, tučné písmo a zoznamy)', 'Eltávolítja az Aukro által nem engedélyezett címkéket (megtartja a címsorokat, bekezdéseket, félkövért és listákat)', 'Uklanja oznake koje Aukro ne dopušta (zadržava naslove, odlomke, podebljanje i popise)', 'Odstrani oznake, ki jih Aukro ne dovoljuje (ohrani naslove, odstavke, krepko in sezname)', "Usuwa znaczniki niedozwolone przez Aukro (zostawia nagłówki, akapity, pogrubienie i listy)", "Removes tags Aukro does not allow (keeps headings, paragraphs, bold and lists)"],
  descImagesNote: ['Popis obsahuje obrázky nebo rozvržení Aukra – upravujte ho v záložce HTML, náhled by je při uložení odstranil.', 'Popis obsahuje obrázky alebo rozloženie Aukra – upravujte ho v záložke HTML, náhľad by ich pri uložení odstránil.', 'A leírás képeket vagy Aukro-elrendezést tartalmaz – a HTML fülön szerkessze, az előnézet mentéskor eltávolítaná őket.', 'Opis sadrži slike ili raspored Aukra – uređujte ga na kartici HTML, pregled bi ih pri spremanju uklonio.', 'Opis vsebuje slike ali postavitev Aukra – urejajte ga v zavihku HTML, predogled bi jih ob shranjevanju odstranil.', "Opis zawiera zdjęcia lub układy Aukro – edytuj go w zakładce HTML, podgląd usunąłby je przy zapisie.", "The description contains images or Aukro layouts – edit it in the HTML tab; the preview would remove them on save."],
  descTagsWarn: ['Nepovolené značky: {tags}', 'Nepovolené značky: {tags}', 'Nem engedélyezett címkék: {tags}', 'Nedopuštene oznake: {tags}', 'Nedovoljene oznake: {tags}', "Niedozwolone znaczniki: {tags}", "Disallowed tags: {tags}"],
  descTitle: ['Popis nabídky', 'Popis ponuky', 'Az ajánlat leírása', 'Opis ponude', 'Opis ponudbe', "Opis oferty", "Offer description"],
  tbHeading: ['Nadpis', 'Nadpis', 'Címsor', 'Naslov', 'Naslov', "Nagłówek", "Heading"],
  tbParagraph: ['Odstavec', 'Odsek', 'Bekezdés', 'Odlomak', 'Odstavek', "Akapit", "Paragraph"],
  tbBold: ['Tučně (Ctrl/Cmd+B)', 'Tučné (Ctrl/Cmd+B)', 'Félkövér (Ctrl/Cmd+B)', 'Podebljano (Ctrl/Cmd+B)', 'Krepko (Ctrl/Cmd+B)', "Pogrubienie (Ctrl/Cmd+B)", "Bold (Ctrl/Cmd+B)"],
  tbBullets: ['• Odrážky', '• Odrážky', '• Felsorolás', '• Grafičke oznake', '• Alineje', "• Punktory", "• Bullets"],
  tbNumbers: ['1. Číslování', '1. Číslovanie', '1. Számozás', '1. Numeriranje', '1. Številčenje', "1. Numeracja", "1. Numbering"],
  tbClear: ['Zrušit formát', 'Zrušiť formát', 'Formázás törlése', 'Ukloni oblikovanje', 'Počisti oblikovanje', "Usuń formatowanie", "Clear formatting"],
  descCount: ['{n} / {max} znaků včetně HTML', '{n} / {max} znakov vrátane HTML', '{n} / {max} karakter HTML-lel együtt', '{n} / {max} znakova uključujući HTML', '{n} / {max} znakov vključno s HTML', "{n} / {max} znaków łącznie z HTML", "{n} / {max} characters including HTML"],
  descHint: [
    'Text můžete vložit i z Wordu nebo webu – zachová se tučné písmo, nadpisy a seznamy. Ctrl/Cmd+Enter uloží.',
    'Text môžete vložiť aj z Wordu alebo webu – zachová sa tučné písmo, nadpisy a zoznamy. Ctrl/Cmd+Enter uloží.',
    'Szöveget Wordből vagy webről is beilleszthet – a félkövér, a címsorok és a listák megmaradnak. A Ctrl/Cmd+Enter ment.',
    'Tekst možete zalijepiti i iz Worda ili s weba – zadržat će se podebljanje, naslovi i popisi. Ctrl/Cmd+Enter sprema.',
    'Besedilo lahko prilepite tudi iz Worda ali spleta – krepko, naslovi in seznami se ohranijo. Ctrl/Cmd+Enter shrani.',
    "Tekst można wkleić także z Worda lub strony internetowej – pogrubienie, nagłówki i listy zostaną zachowane. Ctrl/Cmd+Enter zapisuje.",
    "You can paste text from Word or a web page – bold, headings and lists are kept. Ctrl/Cmd+Enter saves.",
  ],
  save: ['Uložit', 'Uložiť', 'Mentés', 'Spremi', 'Shrani', "Zapisz", "Save"],
  cancel: ['Zrušit', 'Zrušiť', 'Mégse', 'Odustani', 'Prekliči', "Anuluj", "Cancel"],
  colStatus: ['Kontrola', 'Kontrola', 'Ellenőrzés', 'Provjera', 'Preverjanje', "Kontrola", "Check"],
  colStatusTip: ['Výsledek kontroly nabídky – klikněte pro seznam chyb', 'Výsledok kontroly ponuky – kliknite pre zoznam chýb', 'Az ajánlat ellenőrzése – kattintson a hibák listájáért', 'Rezultat provjere ponude – kliknite za popis grešaka', 'Rezultat preverjanja ponudbe – kliknite za seznam napak', "Wynik kontroli oferty – kliknij, aby zobaczyć listę błędów", "Offer check result – click for the list of errors"],
  statusExcluded: ['vyřazeno', 'vyradené', 'kizárva', 'isključeno', 'izključeno', "wykluczona", "excluded"],
  spaceTip: ['Mezerník přepne označené buňky, dvojklik jednu buňku', 'Medzerník prepne označené bunky, dvojklik jednu bunku', 'A szóköz átváltja a kijelölt cellákat, dupla kattintás egy cellát', 'Razmaknica prebacuje označene ćelije, dvostruki klik jednu ćeliju', 'Preslednica preklopi označene celice, dvoklik eno celico', "Spacja przełącza zaznaczone komórki, dwuklik jedną komórkę", "Space toggles the selected cells, double-click toggles one cell"],
  statusTip: ['Klikněte pro seznam chyb', 'Kliknite pre zoznam chýb', 'Kattintson a hibák listájáért', 'Kliknite za popis grešaka', 'Kliknite za seznam napak', "Kliknij, aby zobaczyć listę błędów", "Click for the list of errors"],
  statusOk: ['Nabídka je v pořádku', 'Ponuka je v poriadku', 'Az ajánlat rendben van', 'Ponuda je u redu', 'Ponudba je v redu', "Oferta jest w porządku", "The offer is OK"],
  yes: ['ano', 'áno', 'igen', 'da', 'da', "tak", "yes"],
  no: ['ne', 'nie', 'nem', 'ne', 'ne', "nie", "no"],
  noOffers: ['Žádné nabídky', 'Žiadne ponuky', 'Nincs ajánlat', 'Nema ponuda', 'Ni ponudb', "Brak ofert", "No offers"],

  // ---- výčty
  typeAuction: ['Aukce', 'Aukcia', 'Aukció', 'Aukcija', 'Dražba', "Licytacja", "Auction"],
  typeBuyNow: ['Kup teď', 'Kúp teraz', 'Azonnali vétel', 'Kupi odmah', 'Kupi zdaj', "Kup teraz", "Buy Now"],
  typeCombined: ['Aukce + Kup teď', 'Aukcia + Kúp teraz', 'Aukció + Azonnali vétel', 'Aukcija + Kupi odmah', 'Dražba + Kupi zdaj', "Licytacja + Kup teraz", "Auction + Buy Now"],
  reexpose0: ['Neopakovat', 'Neopakovať', 'Nincs ismétlés', 'Ne ponavljaj', 'Ne ponavljaj', "Nie wznawiaj", "Do not relist"],
  reexpose1: ['Opakovat (nová nabídka)', 'Opakovať (nová ponuka)', 'Ismétlés (új ajánlat)', 'Ponovi (nova ponuda)', 'Ponovi (nova ponudba)', "Wznów (nowa oferta)", "Relist (new offer)"],
  reexpose2: ['Prodlužovat do prodeje', 'Predlžovať do predaja', 'Hosszabbítás eladásig', 'Produljuj do prodaje', 'Podaljšuj do prodaje', "Przedłużaj do sprzedaży", "Extend until sold"],

  // ---- dialogy a zprávy
  chooseCategory: ['Vyberte kategorii', 'Vyberte kategóriu', 'Válasszon kategóriát', 'Odaberite kategoriju', 'Izberite kategorijo', "Wybierz kategorię", "Choose a category"],
  searchCategory: ['Hledat kategorii nebo ID…', 'Hľadať kategóriu alebo ID…', 'Kategória vagy azonosító keresése…', 'Traži kategoriju ili ID…', 'Išči kategorijo ali ID…', "Szukaj kategorii lub ID…", "Search category or ID…"],
  close: ['Zavřít', 'Zavrieť', 'Bezárás', 'Zatvori', 'Zapri', "Zamknij", "Close"],
  nothingFound: ['Nic nenalezeno.', 'Nič sa nenašlo.', 'Nincs találat.', 'Ništa nije pronađeno.', 'Ni zadetkov.', "Nic nie znaleziono.", "Nothing found."],
  rowErrorsTitle: ['Chyby: {name}', 'Chyby: {name}', 'Hibák: {name}', 'Greške: {name}', 'Napake: {name}', "Błędy: {name}", "Errors: {name}"],
  unnamedRow: ['řádek bez názvu', 'riadok bez názvu', 'névtelen sor', 'redak bez naziva', 'vrstica brez naziva', "wiersz bez tytułu", "untitled row"],
  canExport: ['Nabídku lze exportovat.', 'Ponuku možno exportovať.', 'Az ajánlat exportálható.', 'Ponuda se može izvesti.', 'Ponudbo je mogoče izvoziti.', "Ofertę można wyeksportować.", "The offer can be exported."],
  onAttrsSheet: ['(list Atributy)', '(hárok Atribúty)', '(Attribútumok lap)', '(list Atributi)', '(list Atributi)', "(arkusz Atrybuty)", "(Attributes sheet)"],
  excludedTitle: ['Nabídka je vyřazená', 'Ponuka je vyradená', 'Az ajánlat ki van zárva', 'Ponuda je isključena', 'Ponudba je izključena', "Oferta jest wykluczona", "The offer is excluded"],
  excludedBody: [
    'Nabídka se nebude exportovat a nekontroluje se. Zaškrtněte sloupec Export, pokud ji chcete exportovat.',
    'Ponuka sa nebude exportovať a nekontroluje sa. Začiarknite stĺpec Export, ak ju chcete exportovať.',
    'Az ajánlat nem kerül exportálásra és nem ellenőrizzük. Jelölje be az Export oszlopot, ha exportálni szeretné.',
    'Ponuda se neće izvesti i ne provjerava se. Označite stupac Izvoz ako je želite izvesti.',
    'Ponudba se ne bo izvozila in se ne preverja. Označite stolpec Izvoz, če jo želite izvoziti.',
    "Oferta nie zostanie wyeksportowana i nie jest sprawdzana. Zaznacz kolumnę Eksport, jeśli chcesz ją wyeksportować.",
    "The offer will not be exported and is not checked. Tick the Export column if you want to export it.",
  ],
  nothingSelectedTitle: ['Nic není označeno', 'Nič nie je označené', 'Nincs kijelölés', 'Ništa nije označeno', 'Nič ni označeno', "Nic nie zaznaczono", "Nothing selected"],
  nothingSelectedBody: [
    'Označte myší buňky v řádcích, se kterými chcete pracovat (stačí jeden sloupec).',
    'Označte myšou bunky v riadkoch, s ktorými chcete pracovať (stačí jeden stĺpec).',
    'Jelölje ki egérrel a kívánt sorok celláit (elég egy oszlop).',
    'Mišem označite ćelije u redcima s kojima želite raditi (dovoljan je jedan stupac).',
    'Z miško označite celice v vrsticah, s katerimi želite delati (zadošča en stolpec).',
    "Zaznacz myszą komórki w wierszach, z którymi chcesz pracować (wystarczy jedna kolumna).",
    "Select cells in the rows you want to work with (one column is enough).",
  ],
  confirmDelete: ['Smazat označené řádky ({n})?', 'Zmazať označené riadky ({n})?', 'Törli a kijelölt sorokat ({n})?', 'Izbrisati označene retke ({n})?', 'Izbrišem označene vrstice ({n})?', "Usunąć zaznaczone wiersze ({n})?", "Delete the selected rows ({n})?"],
  confirmReplace: ['Nahradit aktuální práci obsahem souboru?', 'Nahradiť aktuálnu prácu obsahom súboru?', 'Lecseréli a jelenlegi munkát a fájl tartalmára?', 'Zamijeniti trenutačni rad sadržajem datoteke?', 'Zamenjam trenutno delo z vsebino datoteke?', "Zastąpić bieżącą pracę zawartością pliku?", "Replace the current work with the file's content?"],
  cannotOpen: ['Soubor nelze otevřít', 'Súbor nemožno otvoriť', 'A fájl nem nyitható meg', 'Datoteku nije moguće otvoriti', 'Datoteke ni mogoče odpreti', "Nie można otworzyć pliku", "Cannot open the file"],
  notWorkFile: ['Soubor neobsahuje práci z Aukro Listeru.', 'Súbor neobsahuje prácu z Aukro Listeru.', 'A fájl nem Aukro Lister munkát tartalmaz.', 'Datoteka ne sadrži rad iz Aukro Listera.', 'Datoteka ne vsebuje dela iz Aukro Listerja.', "Plik nie zawiera pracy z Aukro Listera.", "The file does not contain Aukro Lister work."],
  invalidCsvTitle: ['Neplatné CSV', 'Neplatné CSV', 'Érvénytelen CSV', 'Neispravan CSV', 'Neveljaven CSV', "Nieprawidłowy CSV", "Invalid CSV"],
  invalidCsvBody: ['Soubor nemá očekávanou hlavičku (chybí sloupec categoryId).', 'Súbor nemá očakávanú hlavičku (chýba stĺpec categoryId).', 'A fájl fejléce nem megfelelő (hiányzik a categoryId oszlop).', 'Datoteka nema očekivano zaglavlje (nedostaje stupac categoryId).', 'Datoteka nima pričakovane glave (manjka stolpec categoryId).', "Plik nie ma oczekiwanego nagłówka (brak kolumny categoryId).", "The file does not have the expected header (the categoryId column is missing)."],
  importDoneTitle: ['Import dokončen', 'Import dokončený', 'Az importálás kész', 'Uvoz je dovršen', 'Uvoz je končan', "Import zakończony", "Import finished"],
  importDoneBody: ['Načtené nabídky: {n}.', 'Načítané ponuky: {n}.', 'Betöltött ajánlatok: {n}.', 'Učitane ponude: {n}.', 'Naložene ponudbe: {n}.', "Wczytane oferty: {n}.", "Offers loaded: {n}."],
  unknownCategories: [
    'Kategorie, které v číselníku nejsou: {list}. Vyberte u těchto nabídek platnou kategorii.',
    'Kategórie, ktoré v číselníku nie sú: {list}. Vyberte pri týchto ponukách platnú kategóriu.',
    'A kódlistában nem szereplő kategóriák: {list}. Válasszon érvényes kategóriát ezekhez az ajánlatokhoz.',
    'Kategorije koje nisu u šifrarniku: {list}. Za te ponude odaberite valjanu kategoriju.',
    'Kategorije, ki jih ni v šifrantu: {list}. Za te ponudbe izberite veljavno kategorijo.',
    "Kategorie, których nie ma w słowniku: {list}. Wybierz dla tych ofert prawidłową kategorię.",
    "Categories not in the catalogue: {list}. Choose a valid category for these offers.",
  ],
  fixSettingsTitle: ['Doplňte nastavení prodejce', 'Doplňte nastavenia predajcu', 'Töltse ki az eladói beállításokat', 'Dopunite postavke prodavatelja', 'Dopolnite nastavitve prodajalca', "Uzupełnij ustawienia sprzedawcy", "Complete the seller settings"],
  exportErrorsTitle: ['Nabídky s chybou: {n}', 'Ponuky s chybou: {n}', 'Hibás ajánlatok: {n}', 'Ponude s greškom: {n}', 'Ponudbe z napako: {n}', "Oferty z błędem: {n}", "Offers with errors: {n}"],
  exportErrorsBody: [
    'Opravte je (červené buňky), nebo je vyřaďte zrušením zaškrtnutí ve sloupci Export.',
    'Opravte ich (červené bunky), alebo ich vyraďte zrušením začiarknutia v stĺpci Export.',
    'Javítsa ki őket (piros cellák), vagy zárja ki őket az Export oszlop jelölésének törlésével.',
    'Ispravite ih (crvene ćelije) ili ih isključite uklanjanjem oznake u stupcu Izvoz.',
    'Popravite jih (rdeče celice) ali jih izključite z odstranitvijo kljukice v stolpcu Izvoz.',
    "Popraw je (czerwone komórki) lub wyklucz, odznaczając kolumnę Eksport.",
    "Fix them (red cells) or exclude them by unticking the Export column.",
  ],
  rowN: ['Řádek {n}', 'Riadok {n}', '{n}. sor', 'Redak {n}', 'Vrstica {n}', "Wiersz {n}", "Row {n}"],
  andMore: ['…a další: {n}', '…a ďalšie: {n}', '…és további: {n}', '…i još: {n}', '…in še: {n}', "…i więcej: {n}", "…and {n} more"],
  nothingToExportTitle: ['Není co exportovat', 'Nie je čo exportovať', 'Nincs mit exportálni', 'Nema ništa za izvoz', 'Ni česa izvoziti', "Nie ma czego eksportować", "Nothing to export"],
  nothingToExportBody: ['Vyplňte aspoň jednu nabídku.', 'Vyplňte aspoň jednu ponuku.', 'Töltsön ki legalább egy ajánlatot.', 'Ispunite barem jednu ponudu.', 'Izpolnite vsaj eno ponudbo.', "Wypełnij co najmniej jedną ofertę.", "Fill in at least one offer."],
  csvReadyTitle: ['CSV připraveno', 'CSV pripravené', 'A CSV elkészült', 'CSV je spreman', 'CSV je pripravljen', "CSV gotowy", "CSV ready"],
  csvReadyBody: ['Exportované nabídky: {n}.', 'Exportované ponuky: {n}.', 'Exportált ajánlatok: {n}.', 'Izvezene ponude: {n}.', 'Izvožene ponudbe: {n}.', "Wyeksportowane oferty: {n}.", "Offers exported: {n}."],
  csvSplit: ['Soubory: {n} (max. 350 nabídek na soubor).', 'Súbory: {n} (max. 350 ponúk na súbor).', 'Fájlok: {n} (fájlonként legfeljebb 350 ajánlat).', 'Datoteke: {n} (najviše 350 ponuda po datoteci).', 'Datoteke: {n} (največ 350 ponudb na datoteko).', "Pliki: {n} (maks. 350 ofert na plik).", "Files: {n} (max. 350 offers per file)."],
  loadErrorTitle: ['Chyba načítání', 'Chyba načítania', 'Betöltési hiba', 'Pogreška učitavanja', 'Napaka pri nalaganju', "Błąd wczytywania", "Loading error"],
  loadErrorHint: [
    'Otevírejte nástroj přes webovou adresu (GitHub Pages), ne jako soubor z disku.',
    'Otvárajte nástroj cez webovú adresu (GitHub Pages), nie ako súbor z disku.',
    'Az eszközt webcímen (GitHub Pages) nyissa meg, ne fájlként a lemezről.',
    'Alat otvarajte putem web-adrese (GitHub Pages), a ne kao datoteku s diska.',
    'Orodje odpirajte prek spletnega naslova (GitHub Pages), ne kot datoteko z diska.',
    "Otwieraj narzędzie przez adres internetowy, a nie jako plik z dysku.",
    "Open the tool via its web address, not as a file from disk.",
  ],

  // ---- validace (core.js)
  vCategoryMissing: ['Vyberte kategorii.', 'Vyberte kategóriu.', 'Válasszon kategóriát.', 'Odaberite kategoriju.', 'Izberite kategorijo.', "Wybierz kategorię.", "Choose a category."],
  vCategoryUnknown: ['Kategorie {id} není v aktuálním číselníku Aukra.', 'Kategória {id} nie je v aktuálnom číselníku Aukra.', 'A(z) {id} kategória nem szerepel az Aukro aktuális kódlistájában.', 'Kategorija {id} nije u aktualnom šifrarniku Aukra.', 'Kategorije {id} ni v trenutnem šifrantu Aukra.', "Kategorii {id} nie ma w aktualnym słowniku Aukro.", "Category {id} is not in the current Aukro catalogue."],
  vCategoryNotLeaf: ['Nabídku lze vystavit jen do aktivní koncové kategorie.', 'Ponuku možno vystaviť len do aktívnej koncovej kategórie.', 'Ajánlat csak aktív, legalsó szintű kategóriában tehető közzé.', 'Ponuda se može objaviti samo u aktivnoj krajnjoj kategoriji.', 'Ponudbo je mogoče objaviti le v aktivni končni kategoriji.', "Ofertę można wystawić tylko w aktywnej kategorii końcowej.", "Offers can only be listed in an active leaf category."],
  vNameShort: ['Název musí mít aspoň 3 znaky.', 'Názov musí mať aspoň 3 znaky.', 'A megnevezésnek legalább 3 karakteresnek kell lennie.', 'Naziv mora imati najmanje 3 znaka.', 'Naziv mora imeti vsaj 3 znake.', "Tytuł musi mieć co najmniej 3 znaki.", "The title must have at least 3 characters."],
  vNameLong: ['Název má {len} znaků, povoleno je 70.', 'Názov má {len} znakov, povolených je 70.', 'A megnevezés {len} karakter, legfeljebb 70 engedélyezett.', 'Naziv ima {len} znakova, dopušteno je 70.', 'Naziv ima {len} znakov, dovoljenih je 70.', "Tytuł ma {len} znaków, dozwolone jest 70.", "The title has {len} characters, 70 are allowed."],
  vExtId: ['Kód zboží může mít nejvýš 50 znaků.', 'Kód tovaru môže mať najviac 50 znakov.', 'A termékkód legfeljebb 50 karakter lehet.', 'Šifra proizvoda može imati najviše 50 znakova.', 'Šifra izdelka ima lahko največ 50 znakov.', "Kod produktu może mieć najwyżej 50 znaków.", "The product code can have at most 50 characters."],
  vPrice: ['Zadejte cenu větší než 0.', 'Zadajte cenu väčšiu ako 0.', 'Adjon meg 0-nál nagyobb árat.', 'Unesite cijenu veću od 0.', 'Vnesite ceno, večjo od 0.', "Podaj cenę większą od 0.", "Enter a price greater than 0."],
  vPriceNoDecimals: ['{cur}: cena bez desetinných míst.', '{cur}: cena bez desatinných miest.', '{cur}: tizedesjegy nélküli ár.', '{cur}: cijena bez decimala.', '{cur}: cena brez decimalnih mest.', "{cur}: cena bez miejsc po przecinku.", "{cur}: price without decimals."],
  vPrice2Decimals: ['{cur}: nejvýš 2 desetinná místa.', '{cur}: najviac 2 desatinné miesta.', '{cur}: legfeljebb 2 tizedesjegy.', '{cur}: najviše 2 decimale.', '{cur}: največ 2 decimalni mesti.', "{cur}: najwyżej 2 miejsca po przecinku.", "{cur}: at most 2 decimal places."],
  vPriceTens: ['{cur}: cena zaokrouhlená na desítky.', '{cur}: cena zaokrúhlená na desiatky.', '{cur}: tízesre kerekített ár.', '{cur}: cijena zaokružena na desetice.', '{cur}: cena, zaokrožena na desetice.', "{cur}: cena zaokrąglona do dziesiątek.", "{cur}: price rounded to tens."],
  vType: ['Vyberte typ nabídky.', 'Vyberte typ ponuky.', 'Válassza ki az ajánlat típusát.', 'Odaberite vrstu ponude.', 'Izberite vrsto ponudbe.', "Wybierz typ oferty.", "Choose the offer type."],
  vBuyNowHigher: ['Cena Kup teď musí být vyšší než vyvolávací cena.', 'Cena Kúp teraz musí byť vyššia ako vyvolávacia cena.', 'Az azonnali árnak magasabbnak kell lennie a kikiáltási árnál.', 'Cijena Kupi odmah mora biti viša od početne cijene.', 'Cena Kupi zdaj mora biti višja od izklicne cene.', "Cena Kup teraz musi być wyższa niż cena wywoławcza.", "The Buy Now price must be higher than the starting price."],
  vQuantity: ['Množství musí být celé číslo ≥ 1.', 'Množstvo musí byť celé číslo ≥ 1.', 'A mennyiségnek ≥ 1 egész számnak kell lennie.', 'Količina mora biti cijeli broj ≥ 1.', 'Količina mora biti celo število ≥ 1.', "Ilość musi być liczbą całkowitą ≥ 1.", "Quantity must be a whole number ≥ 1."],
  vQuantityAuction: ['Aukce může mít jen 1 kus.', 'Aukcia môže mať len 1 kus.', 'Az aukció csak 1 darabos lehet.', 'Aukcija može imati samo 1 komad.', 'Dražba ima lahko le 1 kos.', "Licytacja może mieć tylko 1 sztukę.", "An auction can have only 1 item."],
  vDuration: ['Délka musí být 3, 5, 7, 10 nebo 30 dní.', 'Dĺžka musí byť 3, 5, 7, 10 alebo 30 dní.', 'Az időtartam 3, 5, 7, 10 vagy 30 nap lehet.', 'Trajanje mora biti 3, 5, 7, 10 ili 30 dana.', 'Trajanje mora biti 3, 5, 7, 10 ali 30 dni.', "Czas trwania musi wynosić 3, 5, 7, 10 lub 30 dni.", "Duration must be 3, 5, 7, 10 or 30 days."],
  vDuration30: ['30 dní jen pro nabídku Kup teď.', '30 dní len pre ponuku Kúp teraz.', '30 nap csak azonnali vételnél.', '30 dana samo za ponudu Kupi odmah.', '30 dni samo za ponudbo Kupi zdaj.', "30 dni tylko dla oferty Kup teraz.", "30 days only for Buy Now offers."],
  vDateInvalid: ['Neplatné datum.', 'Neplatný dátum.', 'Érvénytelen dátum.', 'Neispravan datum.', 'Neveljaven datum.', "Nieprawidłowa data.", "Invalid date."],
  vDatePast: ['Začátek musí být v budoucnu (nebo nechte prázdné = hned).', 'Začiatok musí byť v budúcnosti (alebo nechajte prázdne = hneď).', 'A kezdésnek a jövőben kell lennie (vagy hagyja üresen = azonnal).', 'Početak mora biti u budućnosti (ili ostavite prazno = odmah).', 'Začetek mora biti v prihodnosti (ali pustite prazno = takoj).', "Początek musi być w przyszłości (lub zostaw puste = od razu).", "The start must be in the future (or leave empty = immediately)."],
  vImagesMissing: ['Přidejte aspoň 1 fotku (URL).', 'Pridajte aspoň 1 fotku (URL).', 'Adjon meg legalább 1 fotót (URL).', 'Dodajte barem 1 fotografiju (URL).', 'Dodajte vsaj 1 fotografijo (URL).', "Dodaj co najmniej 1 zdjęcie (URL).", "Add at least 1 photo (URL)."],
  vImagesTooMany: ['Kategorie povoluje nejvýš {max} fotek.', 'Kategória povoľuje najviac {max} fotiek.', 'A kategória legfeljebb {max} fotót enged.', 'Kategorija dopušta najviše {max} fotografija.', 'Kategorija dovoljuje največ {max} fotografij.', "Kategoria pozwala na najwyżej {max} zdjęć.", "The category allows at most {max} photos."],
  vImagesUrl: ['Každá fotka musí být veřejná adresa začínající http(s)://', 'Každá fotka musí byť verejná adresa začínajúca http(s)://', 'Minden fotónak http(s)://-sel kezdődő nyilvános címnek kell lennie', 'Svaka fotografija mora biti javna adresa koja počinje s http(s)://', 'Vsaka fotografija mora biti javni naslov, ki se začne s http(s)://', "Każde zdjęcie musi być publicznym adresem zaczynającym się od http(s)://", "Each photo must be a public address starting with http(s)://"],
  vDescMissing: ['Popis je povinný.', 'Popis je povinný.', 'A leírás kötelező.', 'Opis je obavezan.', 'Opis je obvezen.', "Opis jest wymagany.", "A description is required."],
  vDescLong: ['Popis má {len} znaků včetně HTML, povoleno je 65 000.', 'Popis má {len} znakov vrátane HTML, povolených je 65 000.', 'A leírás HTML-lel együtt {len} karakter, legfeljebb 65 000 engedélyezett.', 'Opis ima {len} znakova uključujući HTML, dopušteno je 65 000.', 'Opis ima {len} znakov vključno s HTML, dovoljenih je 65 000.', "Opis ma {len} znaków łącznie z HTML, dozwolone jest 65 000.", "The description has {len} characters including HTML, 65,000 are allowed."],
  vDescTags: ['Popis obsahuje HTML značky, které Aukro nepovoluje: {tags}. V editoru použijte „Vyčistit HTML“.', 'Popis obsahuje HTML značky, ktoré Aukro nepovoľuje: {tags}. V editore použite „Vyčistiť HTML“.', 'A leírás az Aukro által nem engedélyezett HTML-címkéket tartalmaz: {tags}. A szerkesztőben használja a „HTML tisztítása“ gombot.', 'Opis sadrži HTML oznake koje Aukro ne dopušta: {tags}. U uređivaču upotrijebite „Očisti HTML“.', 'Opis vsebuje HTML oznake, ki jih Aukro ne dovoljuje: {tags}. V urejevalniku uporabite „Počisti HTML“.', "Opis zawiera znaczniki HTML niedozwolone przez Aukro: {tags}. W edytorze użyj „Wyczyść HTML”.", "The description contains HTML tags Aukro does not allow: {tags}. Use \"Clean HTML\" in the editor."],
  vAttrRequired: ['{name}: povinný atribut.', '{name}: povinný atribút.', '{name}: kötelező attribútum.', '{name}: obavezan atribut.', '{name}: obvezen atribut.', "{name}: atrybut wymagany.", "{name}: required attribute."],
  vAttrChoose: ['{name}: vyberte hodnotu ze seznamu.', '{name}: vyberte hodnotu zo zoznamu.', '{name}: válasszon értéket a listából.', '{name}: odaberite vrijednost s popisa.', '{name}: izberite vrednost s seznama.', "{name}: wybierz wartość z listy.", "{name}: choose a value from the list."],
  vAttrInvalid: ['{name}: neplatná volba.', '{name}: neplatná voľba.', '{name}: érvénytelen választás.', '{name}: neispravan odabir.', '{name}: neveljavna izbira.', "{name}: nieprawidłowy wybór.", "{name}: invalid choice."],
  vAttrNumber: ['{name}: zadejte číslo.', '{name}: zadajte číslo.', '{name}: adjon meg számot.', '{name}: unesite broj.', '{name}: vnesite število.', "{name}: podaj liczbę.", "{name}: enter a number."],
  vAttrInteger: ['{name}: zadejte celé číslo.', '{name}: zadajte celé číslo.', '{name}: adjon meg egész számot.', '{name}: unesite cijeli broj.', '{name}: vnesite celo število.', "{name}: podaj liczbę całkowitą.", "{name}: enter a whole number."],
  vAttrMin: ['{name}: minimum je {v}.', '{name}: minimum je {v}.', '{name}: a minimum {v}.', '{name}: najmanje {v}.', '{name}: najmanj {v}.', "{name}: minimum to {v}.", "{name}: the minimum is {v}."],
  vAttrMax: ['{name}: maximum je {v}.', '{name}: maximum je {v}.', '{name}: a maximum {v}.', '{name}: najviše {v}.', '{name}: največ {v}.', "{name}: maksimum to {v}.", "{name}: the maximum is {v}."],
  vAttrLength: ['{name}: nejvýš {v} znaků.', '{name}: najviac {v} znakov.', '{name}: legfeljebb {v} karakter.', '{name}: najviše {v} znakova.', '{name}: največ {v} znakov.', "{name}: najwyżej {v} znaków.", "{name}: at most {v} characters."],
  vSetDomain: ['Vyberte doménu účtu.', 'Vyberte doménu účtu.', 'Válassza ki a fiók domainjét.', 'Odaberite domenu računa.', 'Izberite domeno računa.', "Wybierz domenę konta.", "Choose the account domain."],
  vSetCity: ['Vyplňte město.', 'Vyplňte mesto.', 'Adja meg a várost.', 'Unesite grad.', 'Vnesite kraj.', "Uzupełnij miasto.", "Fill in the city."],
  vSetPostCode: ['Vyplňte PSČ.', 'Vyplňte PSČ.', 'Adja meg az irányítószámot.', 'Unesite poštanski broj.', 'Vnesite poštno številko.', "Uzupełnij kod pocztowy.", "Fill in the postcode."],
  vSetCountry: ['Vyberte zemi.', 'Vyberte krajinu.', 'Válassza ki az országot.', 'Odaberite državu.', 'Izberite državo.', "Wybierz kraj.", "Choose the country."],
  vSetShipping: ['Zadejte číselné ID šablony dopravy z Moje Aukro.', 'Zadajte číselné ID šablóny dopravy z Moje Aukro.', 'Adja meg a szállítási sablon számazonosítóját a Saját Aukróból.', 'Unesite brojčani ID predloška dostave iz Moj Aukro.', 'Vnesite številski ID predloge dostave iz Moj Aukro.', "Podaj liczbowe ID szablonu dostawy z Moje Aukro.", "Enter the numeric shipping template ID from My Aukro."],

  // ---- společné parametry (výchozí názvy, pokud je kategorie nevrací)
  gStav: ['Stav', 'Stav', 'Állapot', 'Stanje', 'Stanje', "Stan", "Condition"],
  gWarranty: ['Doba záruky (měsíce)', 'Doba záruky (mesiace)', 'Garancia (hónap)', 'Jamstvo (mjeseci)', 'Garancija (meseci)', "Okres gwarancji (miesiące)", "Warranty (months)"],
  gDelivery: ['Doba dodání', 'Doba dodania', 'Szállítási idő', 'Rok isporuke', 'Rok dobave', "Czas dostawy", "Delivery time"],
  sNew: ['Nové', 'Nové', 'Új', 'Novo', 'Novo', "Nowe", "New"],
  sUnpacked: ['Rozbaleno', 'Rozbalené', 'Kibontott', 'Otpakirano', 'Odpakirano', "Rozpakowane", "Unpacked"],
  sLikeNew: ['Zánovní', 'Zánovné', 'Újszerű', 'Kao novo', 'Kot novo', "Jak nowe", "Like new"],
  sUsed: ['Použité', 'Použité', 'Használt', 'Rabljeno', 'Rabljeno', "Używane", "Used"],
  sRepaired: ['Opravené', 'Opravené', 'Javított', 'Popravljeno', 'Popravljeno', "Naprawione", "Repaired"],
  sRefurbished: ['Repasované', 'Repasované', 'Felújított', 'Obnovljeno', 'Obnovljeno', "Odnowione", "Refurbished"],
  sBroken: ['Nefunkční / na díly', 'Nefunkčné / na diely', 'Nem működő / alkatrésznek', 'Neispravno / za dijelove', 'Nedelujoče / za dele', "Niesprawne / na części", "Not working / for parts"],
  d12: ['1-2 dny', '1-2 dni', '1-2 nap', '1-2 dana', '1-2 dni', "1-2 dni", "1-2 days"],
  d23: ['2-3 dny', '2-3 dni', '2-3 nap', '2-3 dana', '2-3 dni', "2-3 dni", "2-3 days"],
  d46: ['4-6 dní', '4-6 dní', '4-6 nap', '4-6 dana', '4-6 dni', "4-6 dni", "4-6 days"],
  d710: ['7-10 dní', '7-10 dní', '7-10 nap', '7-10 dana', '7-10 dni', "7-10 dni", "7-10 days"],
  d10plus: ['více než 10 dní', 'viac ako 10 dní', 'több mint 10 nap', 'više od 10 dana', 'več kot 10 dni', "ponad 10 dni", "more than 10 days"],
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
    pl: 'dni',
    en: 'days',
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
