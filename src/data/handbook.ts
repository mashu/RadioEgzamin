import type { HandbookSection } from '@/types/domain';

export const HANDBOOK = [
  {
    id: "h-ohm", topic: "elektro", title: "Prawo Ohma i moc",
    body: [
      { p: "Trzy wielkości spinają całą elektrotechnikę: napięcie U (wolty), prąd I (ampery) i opór R (omy). Prawo Ohma wiąże je zależnością U = I·R. Zasłaniając szukaną literę w trójkącie U / (I·R), od razu odczytasz wzór: I = U/R, R = U/I." },
      { p: "Moc to szybkość zamiany energii: P = U·I. Podstawiając prawo Ohma otrzymujesz dwie wygodne postacie — P = I²·R (gdy znasz prąd i opór) oraz P = U²/R (gdy znasz napięcie i opór). Wybieraj tę, do której masz dane, zamiast liczyć okrężnie." },
      { p: "Połączenia: w szeregu prąd jest wspólny, a opory i napięcia się dodają. W równoległym wspólne jest napięcie, a przewodności (odwrotności oporów) się dodają — wypadkowy opór maleje. Dla n jednakowych oporników równolegle R = R0/n, co wykorzystujemy budując sztuczne obciążenie 50 Ω z kilku oporników." },
      { calc: [
        ["U = I · R", "napięcie z prawa Ohma"],
        ["P = U · I = I²R = U²/R", "trzy postacie mocy"],
        ["szereg", "R = R1 + R2 + …"],
        ["równolegle", "1/R = 1/R1 + 1/R2 + …"],
      ]},
    ],
  },
  {
    id: "h-ac", topic: "ac", title: "Prąd zmienny: okres, amplituda, wartość skuteczna",
    body: [
      { p: "Sygnał sinusoidalny opisują trzy „wysokości”: amplituda Û (szczyt), wartość międzyszczytowa Upp = 2·Û oraz wartość skuteczna U_sk. Wartość skuteczna to takie napięcie stałe, które w oporze wydzieliłoby tę samą moc — dlatego to ona liczy się energetycznie." },
      { p: "Dla czystej sinusoidy U_sk = Û / √2 ≈ 0,707·Û. Idąc w drugą stronę, Û = U_sk·√2. Ta zależność wraca na egzaminie wielokrotnie: przy pomiarze mocy oscyloskopem, przy napięciu zasilacza z filtrem pojemnościowym, przy dobieraniu diod." },
      { p: "Czas i częstotliwość są odwrotnościami: f = 1/T. Okres 20 ms daje 50 Hz (sieć), okres 1 µs to 1 MHz. Przesuń suwak poniżej, by zobaczyć, jak amplituda i wartość skuteczna zmieniają się razem." },
      { interactive: "sine" },
    ],
  },
  {
    id: "h-lc", topic: "elementy", title: "R, L, C i rezonans",
    body: [
      { p: "Kondensator gromadzi ładunek, cewka gromadzi energię pola magnetycznego. Ich „opór” dla prądu zmiennego to reaktancja: pojemnościowa Xc = 1/(2πfC) maleje z częstotliwością, indukcyjna XL = 2πfL rośnie. W kondensatorze prąd wyprzedza napięcie o 90°, w cewce jest odwrotnie." },
      { p: "Gdy Xc = XL, obwód LC jest w rezonansie: f₀ = 1 / (2π√(LC)). Ponieważ f₀ ∝ 1/√(LC), by podwoić częstotliwość, trzeba czterokrotnie zmniejszyć L lub C — dlatego strojąc obwód z 3,5 na 7 MHz zmniejszamy 400 pF do 100 pF." },
      { p: "Dobroć Q mówi, jak „ostry” jest rezonans. Szerokość pasma to B = f₀/Q. Wysokie Q oznacza wąskie pasmo i małe straty — pożądane w filtrach i obwodach nadajnika. Łączenie: kondensatory równolegle dodają pojemność, cewki szeregowo dodają indukcyjność (jak oporniki)." },
      { calc: [
        ["Xc = 1 / (2πfC)", "reaktancja pojemnościowa"],
        ["XL = 2πfL", "reaktancja indukcyjna"],
        ["f₀ = 1 / (2π√(LC))", "częstotliwość rezonansowa"],
        ["B = f₀ / Q", "pasmo obwodu rezonansowego"],
      ]},
    ],
  },
  {
    id: "h-semi", topic: "elementy", title: "Półprzewodniki i prostowniki",
    body: [
      { p: "Dioda przewodzi prąd w jedną stronę. Prostownicza służy do zamiany prądu zmiennego na stały; Zenera stabilizuje napięcie (pracuje w kierunku zaporowym na napięciu przebicia); warikap zmienia pojemność napięciem i stroi obwody. Tranzystor wzmacnia: mały prąd bazy steruje β-krotnie większym prądem kolektora." },
      { p: "Prostowniki różnią się liczbą wykorzystanych połówek. Jednopołówkowy (1 dioda) przepuszcza tylko dodatnie połówki — na wyjściu widać przerwy. Dwupołówkowy (odczep + 2 diody) i mostkowy (4 diody) prostują obie połówki — garby następują bez przerw, łatwiej je wygładzić." },
      { p: "Za prostownikiem stoi filtr pojemnościowy: kondensator ładuje się do wartości szczytowej, więc napięcie nieobciążone U_dc ≈ Û = U_sk·√2. Diody dobieramy z zapasem na napięcie wsteczne — w układzie z filtrem sięga ono nawet 2·Û." },
      { charts: ["rect-half", "rect-full", "rect-bridge"] },
    ],
  },
  {
    id: "h-wave", topic: "fale", title: "Fale radiowe i propagacja",
    body: [
      { p: "Fala elektromagnetyczna ma dwie prostopadłe składowe — elektryczną i magnetyczną. Kierunek pola E wyznacza polaryzację (pionowa lub pozioma). W próżni fala biegnie z prędkością c ≈ 300 000 km/s, w ośrodku wolniej (stąd współczynnik skrócenia kabla)." },
      { p: "Podstawowy związek to c = λ·f. W praktyce wygodny jest skrót: λ[m] = 300 / f[MHz]. Fale krótkie (HF) to 3–30 MHz, czyli 100–10 m. Powyżej 30 MHz zaczyna się UKF." },
      { p: "O zasięgu na KF decyduje jonosfera: odbija fale z powrotem na Ziemię, umożliwiając łączności dalekie. Jej stan zmienia się w cyklu słonecznym ~11 lat. Prognozy podają MUF — najwyższą częstotliwość odbijaną na danej trasie. Między falą przyziemną a powrotem fali przestrzennej powstaje strefa martwa bez odbioru." },
      { interactive: "wave" },
    ],
  },
  {
    id: "h-mod", topic: "modulacje", title: "Modulacje i emisje",
    body: [
      { p: "Modulacja wpisuje informację w nośną. AM zmienia amplitudę (szerokie ~9 kHz, prosty odbiór). FM zmienia częstotliwość (odporne na trzaski, dlatego w UKF FM przemiennikowej). SSB przenosi tylko jedną wstęgę boczną bez nośnej — najoszczędniejsza pod względem mocy i pasma emisja foniczna (~3 kHz)." },
      { p: "CW (telegrafia) to kluczowanie nośnej: nadajesz ją albo wyłączasz. Zajmuje najwęższe pasmo (kilkaset Hz), więc ma najlepszy zasięg przy małej mocy. By usłyszeć czystą nośną CW, odbiornik dokłada BFO — różnica częstotliwości daje słyszalny ton." },
      { p: "Emisje cyfrowe, np. FSK (RTTY), kodują dane przesuwem częstotliwości między dwoma tonami (mark/space). Poniżej porównanie typowych szerokości kanału." },
      { charts: ["bandwidth"] },
    ],
  },
  {
    id: "h-rx", topic: "nadodb", title: "Nadajniki i odbiorniki",
    body: [
      { p: "Odbiornik superheterodynowy zamienia odbierany sygnał na stałą częstotliwość pośrednią (p.cz.), na której łatwo uzyskać dużą selektywność i wzmocnienie. Kolejność bloków: filtr wejściowy → wzmacniacz w.cz. → mieszacz (miesza z heterodyną) → wzmacniacz p.cz. → detektor → wzmacniacz akustyczny." },
      { p: "Klasa pracy wzmacniacza zależy od emisji. Sygnały o zmiennej obwiedni (SSB) wymagają liniowości — klasa AB. Sygnały o stałej obwiedni (CW, FM) pozwalają użyć bardzo sprawnej, nieliniowej klasy C, która przy SSB by je zniekształciła." },
      { p: "Zasilacz nadajnika: transformator → prostownik → filtr. Pamiętaj o wartości szczytowej na filtrze (Û = U_sk·√2) i o doborze diod na napięcie wsteczne z zapasem. Sztuczne obciążenie 50 Ω pozwala stroić i mierzyć nadajnik bez promieniowania w eter." },
    ],
  },
  {
    id: "h-ant", topic: "anteny", title: "Anteny i linie zasilające",
    body: [
      { p: "Dipol półfalowy zawieszony poziomo promieniuje najsilniej prostopadle do drutu — charakterystyka „ósemkowa”. Pionowa ćwierćfalówka promieniuje równomiernie dookoła — charakterystyka dookólna. Impedancja dipola (ok. 50–73 Ω) dobrze pasuje do kabla 50 Ω." },
      { p: "Antena kierunkowa (Yagi) skupia energię: reflektor z tyłu, radiator zasilany, direktory z przodu wyostrzają wiązkę i dają zysk. Zysk podajemy w dBi (względem izotropu) lub dBd (względem dipola); dBi = dBd + 2,15." },
      { p: "Linia zasilająca powinna być dopasowana. Niezgodność impedancji obciążenia z opornością falową kabla tworzy falę stojącą (WFS/SWR > 1), którą mierzymy reflektometrem. Kabel wnosi tłumienie w dB — pamiętaj, że dla napięcia 6 dB to stosunek 2×, dla mocy 4×." },
      { charts: ["polar-dipole", "polar-vertical", "polar-yagi"] },
    ],
  },
  {
    id: "h-safe", topic: "bezpiecz", title: "Bezpieczeństwo pracy",
    body: [
      { p: "Prąd i napięcie w.cz. są groźne. Przy antenie zawsze wyłącz nadajnik i odłącz/uziem antenę — napięcie w.cz. poparza, a odruch odsunięcia grozi upadkiem z wysokości. Prace na wysokości wykonuj w asyście, w szelkach z liną asekuracyjną, w kasku." },
      { p: "Kondensatory (zwłaszcza w zasilaczach) trzymają ładunek długo po wyłączeniu — rozładuj je opornikiem przed dotknięciem. Mierząc nieznane napięcie, zaczynaj od najwyższego zakresu miernika. Antenę przed burzą odłącz od sprzętu i zewrzyj do uziemienia." },
      { p: "Pierwsza pomoc przy porażeniu: zadbaj o własne bezpieczeństwo, odłącz porażonego od prądu, oceń funkcje życiowe, wezwij pomoc, w razie potrzeby prowadź RKO w rytmie 30 uciśnięć na 2 wdechy (~100–120 uciśnięć/min)." },
    ],
  },
  {
    id: "h-proc", topic: "qkod", title: "Kod Q, RST i procedury",
    body: [
      { p: "Kod Q to trzyliterowe skróty zaczynające się na Q, które zastępują całe zdania niezależnie od języka rozmówcy. Bez znaku zapytania to stwierdzenie, ze znakiem — pytanie (QRL = jestem zajęty; QRL? = czy częstotliwość jest zajęta?)." },
      { p: "Raport RST ocenia odbiór: R — czytelność (1–5), S — siła (1–9), T — ton (1–9, tylko telegrafia). W fonii podajemy RS (np. „pięć-dziewięć” = 59), w CW pełne RST (np. 599). „599” to raport wzorcowy: doskonała czytelność, bardzo silny sygnał, czysty ton." },
      { qtable: [
        ["QRG", "moja/twoja częstotliwość"],
        ["QSY", "zmień częstotliwość"],
        ["QRM", "zakłócenia od stacji"],
        ["QRN", "zakłócenia atmosferyczne"],
        ["QSB", "zaniki (fading) sygnału"],
        ["QRP / QRO", "zmniejsz / zwiększ moc"],
        ["QTH", "moje położenie"],
        ["QSO", "łączność"],
        ["QSL", "potwierdzam odbiór"],
        ["QRZ?", "kto mnie woła?"],
        ["QRV", "jestem gotów"],
        ["QRT", "kończę pracę"],
      ]},
    ],
  },
  {
    id: "h-law", topic: "przepisy", title: "Przepisy: ITU, CEPT, IARU, pasma",
    body: [
      { p: "Ramy międzynarodowe tworzy ITU (siedziba w Genewie), dzieląc świat na trzy regiony — Polska leży w Regionie 1. ITU wydaje Regulamin Radiokomunikacyjny definiujący służbę amatorską i przydzielone jej pasma. W Europie działa CEPT (uznawanie pozwoleń, np. zalecenie T/R 61-01). Radioamatorów reprezentuje IARU (w Polsce: PZK)." },
      { p: "W Polsce pozwolenia wydaje Prezes UKE. Świadectwo klasy A daje pozwolenie kategorii 1 (pełne uprawnienia). W logu zapisujemy czas UTC. Znak wywoławczy podajemy przynajmniej na początku i końcu każdego nadawania oraz w miarę możliwości częściej." },
      { p: "Wybrane pasma amatorskie (Region 1) warto znać na pamięć:" },
      { bands: [
        ["160 m", "1810–2000 kHz"],
        ["80 m", "3500–3800 kHz"],
        ["40 m", "7000–7200 kHz"],
        ["20 m", "14000–14350 kHz"],
        ["15 m", "21000–21450 kHz"],
        ["10 m", "28000–29700 kHz"],
        ["2 m", "144–146 MHz"],
        ["70 cm", "430–440 MHz"],
      ]},
    ],
  },
] as const satisfies readonly HandbookSection[];
