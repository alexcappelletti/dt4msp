import type { Project, Scenario, Theme, Measure, Statement } from '../../app/models/scenario';
import { populateScenario, populateTheme, populateMeasure } from '../../app/models/scenario';
import type {Geostory, StoryItem, StoryElement} from '../../app/models/geostory'
import {populateStoryItem, populateGeostory, populateStoryElement, updateItemStyle} from '../../app/models/geostory'
import {createMockSOSMaps} from './sos-map-mock'

/**
 * Crea un mock completo di Geostory per i test, ambientato nel Canale di Sicilia.
 */
export function createSOSMockGeostory(): Geostory {

	const mockSosMaps = createMockSOSMaps();
	const emodnetVisual = mockSosMaps[0];
	const sosVisual = mockSosMaps[1];
	const aquacoltureVisual = mockSosMaps[2];
	const shippingVisual = mockSosMaps[3];
	const protectedAreasVisual = mockSosMaps[4];
	const fishingZonesVisual = mockSosMaps[5];
	// --- SEZIONE 1: INTRODUZIONE (1 Elemento, 1 Item) ---
	const itemIntro: StoryItem = populateStoryItem({
		id: "item-mare-uuid",
		title: "L' AREA DI STUDIO STRETTO DI SICILIA",
		text: "L’area di studio comprende le acque marine sotto la giurisdizione nazionale (acque interne, acque territoriali, piattaforma continentale) antistanti le coste meridionali della Regione Sicilia, identificabili nelle tre sub-aree IMC/1, IMC/5 e IMC/6 del Piano dello Spazio Marittimo  dell’area marittima Ionio-Mediterraneo centrale. L’area di studio comprende le acque marine sotto la giurisdizione nazionale (acque interne, acque territoriali, piattaforma continentale) antistanti le coste meridionali della Regione Sicilia, identificabili nelle tre sub-aree IMC/1, IMC/5 e IMC/6 del  Piano dello Spazio Marittimo dell’area marittima Ionio-Mediterraneo centrale. Il SES dell’area è schematizzato nella figura seguente attraverso una serie di macro e micro componenti (Drivers di cambiamento, Fonti di Pressione, Pressioni,Componenti Biofisiche, Aree Protette e Aree di Attenzione, Servizi Ecosistemici). Per una descrizione di questi elementi e delle loro relazioni principali si rimanda al documento di progetto 'Socio-Ecological System (SES) of the Strait of Sicily – Synthesis Document, A. Barbanti, Settembre 2023'.",
		author: "Ricercatore ISMEA",
		visual: emodnetVisual,
		structure: 'page-title',

		style: updateItemStyle({ textAlignment: 'center' }),
	});

	const elementIntro: StoryElement = populateStoryElement({
		id: "el-intro-uuid",
		order: 1, // Ordine della sezione
		sectionID: "sezione-introduzione",
		sectionTitle: "Introduzione Geografica",
		storyItems: [itemIntro], // Un solo item
	});


	// --- SEZIONE 2: Bd

	const itemBD: StoryItem = populateStoryItem({
		text: "Lo scenario è definito da una narrativa sintetica che ne esprime la visione, da un orizzonte temporale di riferimento e da un elenco di settori principali e secondari. Narrativa e orizzonte temporale di riferimento: Nello scenario BD una serie di azioni importanti ed estese con obiettivi specifici di conservazione si combinano con azioni che favoriscono uno sviluppo sostenibile dell’economia blu, con particolare riferimento a settori innovativi, all’utilizzo di Nature Based Solutions (NBS) e di soluzioni e tecnologie in grado di ridurre le pressioni e gli impatti antropici. L’orizzonte temporale di riferimento è anche in questo il 2040, pur se è evidente che i nuovi usi e le trasformazioni previste, in particolare nei settori del trasporto marittimo e della pesca, così come le soluzioni e tecnologie adottate proiettano tendenzialmente questo scenario su un orizzonte di più lungo periodo. Stato giuridico dell’area di studio: Lo scenario assume che sia istituita la zona economica esclusiva con limiti esterni corrispondenti a quelli indicati nel Piano MSP approvato.",
		title: "SCENARIO 3: BLUE DEVELOPMENT (BD)",
		tags: ["bluedevelopment", "economia"],
		visual: sosVisual,
		structure: 'page',
		style: updateItemStyle({ visualPos: 'right' }),
	});
	
	const elementBD: StoryElement = populateStoryElement({
		id: "el-pesca-uuid",
		order: 2, // Ordine della sezione
		sectionID: "BD",
		sectionTitle: "SCENARIO 3: BLUE DEVELOPMENT (BD)",
		storyItems: [itemBD], // Un solo item
	});
	
	const itemEcologia: StoryItem = populateStoryItem({
		"text": "Lo scenario tiene conto di tutti gli usi attualmente in essere, ma focalizza la sua attenzione e spazializzazione su specifici temi / settori, definiti Temi / Settori Principali, per i quali sono previste specifiche variazioni nel tempo e/o specifiche azioni localizzate spazialmente. Altri temi / settori vengono menzionati, non esaustivamente per evidenziarne comunque la presenza e in molti casi la rilevanza, come Temi / Settori Secondari per lo scenario. Temi / Settori Principali: 1. Energia 2. Trasporto Marittimo 3. Protezione ambientale 4. Pesca 5. Acquacoltura 6. Difesa costiera 7. Turismo Costiero e Marittimo 8. Ricerca & Innovazione 9. Paesaggio e patrimonio culturale. Temi / Settori Secondari: 1. Sicurezza e sorveglianza 2. Energia - Oil&Gas ",
		"title": "Temi / Settori Principali e Secondari",
		"tags": ["bluedevelopment", "economia"],
		visual: protectedAreasVisual,
		structure: 'page',
		style: updateItemStyle({ visualPos: 'left' }),
	});

	
	const elementEcologia: StoryElement = populateStoryElement({
		// Stesso order della sezione precedente, la funzione groupBy ordinerà per order
		order: 2,
		sectionID: "BD",
		sectionTitle: "",
		storyItems: [itemEcologia], // Un solo item
	});


	// --- SEZIONE 3:

	const itemTemi: StoryItem = populateStoryItem({
		"title": "Temi Principali",
		"tags": ["temi", "economia", "bluedevelopment"],
		visual: protectedAreasVisual,
		structure: 'page-title',
		style: updateItemStyle({}),
	});


	const elementTemi: StoryElement = populateStoryElement({
		order: 3, // Ordine della sezione
		sectionID: "sezione-impatti",
		sectionTitle: "Temi principali",
		storyItems: [itemTemi],
	});

	
	const itemEnergia: StoryItem = populateStoryItem({
		"text": "Presupponendo misure più rigorose per la protezione della natura e la riduzione degli effetti negativi delle attività umane, gli sviluppi futuri dei parchi eolici offshore daranno priorità a soluzioni per ridurne gli impatti. Seguendo le migliori pratiche attuali, ciò implicherà una serie di opzioni che incidono su: 1) la progettazione dell’OWF: utilizzo delle infrastrutture dell’OWF in progetti di ripristino della natura (ad esempio fondazioni di turbine progettate come scogliere artificiali); 2) la gestione strategica delle attività dell’OWF: riduzione degli effetti cumulativi delle attività legate agli OWF sulle specie e sugli habitat di valore identificati, implicando una pianificazione nello spazio e nel tempo, ad esempio, delle attività di trivellazione o di fondazione, delle attività delle navi, del funzionamento degli OWF in linea con i modelli migratori e sensibilità/tempo di recupero e capacità delle specie; 3) l'interazione tra l’OWF e altre attività. In linea con: 1) le ipotesi dello scenario BD orientato primariamente a promuovere l’economia del mare attraverso soluzioni innovative e nel rispetto degli obiettivi di conservazione, 2) le aree con proposte di OWF in essere, con vari livelli di avanzamento progettuale e istruttorio, 3) esempi di soluzioni di migliori pratiche utilizzabili per ridurre gli impatti, 4) gli obiettivi nazionali attuali e ragionevolmente attesi per l'Italia al 2030 e 2040-2050 (2.1 GW al 2030 (PNIEC, 2023), 5 GW al 2040-2050), la capacità OWF installata nel 2040 in SOS è stabilita in un valore obiettivo nello scenario BD di 3 GW. L’esigenza di raggiungere un impatto ambientale ridotto dovrà avere un impatto sulla progettazione degli OWF, sulle soluzioni tecnologiche adottate e sulle opzioni di gestione degli OWF. Considerando una produzione specifica attesa di 4 MW/km2, sulla base anche delle intensità medie del vento presente nell'area (7-8 m/s), ciò si tradurrebbe in ca. 750 km2 per ospitare 3 GW, entro il 2040. Sono individuate 3 aree (OW1, OW2, OW4) (aree ampie complessivamente circa 1770 km2 dentro cui posizionare i 750 km2 totali necessari), oltre 25 km dalla costa, al di fuori delle acque territoriali. Le aree sono state delimitate cercando di minimizzare i conflitti con gli habitat di fondo di pregio (in particolare presenza di VMEs e habitat di banchi e seamounts), con la pesca (inclusa la pesca di grandi pelagici con reti a circuizione) e con le rotte di traffico NE-SW. In particolare, l’area OW2, ampia complessivamente circa 540 km2, ospita impianti integrati e si configura come un’’isola energetica”. L’area ospita sia OWF che WEC (Wave Energy Converters), e al suo interno ospita impianti di acquacoltura offshore. L’energia prodotta viene trasformata in idrogeno/metanolo e/o ricarica batterie e viene quindi utilizzata come combustibili alternativi per le navi in transito. Si introducono sistemi integrati per contenere i costi dell’eolico anche a lungo termine, grazie all’integrazione di WEC, nonchè floating-breakwaters per mitigare gli effetti delle mareggiate sulle infrastrutture. I WEC forniscono energia “in loco” per le attività dell’isola energetica, ma fungono anche da barriere artificiali per proteggere gli impianti eolici che possono quindi essere realizzati senza ancoraggi e con materiali a basso costo. Non si prevede il conferimento a terra dell’energia prodotta, minimizzando l’impatto ambientale a terra e sul fondale. Le aree sono interdette alla navigazione commerciale e passeggeri, mentre è consentito l’accesso in alcune aree, in sicurezza e previa autorizzazione da parte dell’Autorità Marittima, per attività diverse dall’eolico. Nelle aree in cui si sviluppano impianti eolici, viene infatti promossa la sinergia e il multiuso con il settore della pesca, attraverso l’utilizzo di attrezzi che possano essere utilizzati in sicurezza all’interno delle OWF (per esempio, non con reti a strascico o reti da tonno e piccoli pelagici), l’acquacoltura e il turismo (in OW4). I porti principali di riferimento a terra per attività di costruzione e manutenzione sono Taranto e Augusta e, in seconda battuta, Gela, Porto Empedocle, Mazzara del Vallo e Pozzallo. Gli hub principali di appoggio subiscono trasformazioni e migliorie logistiche, ma anche una maggior efficienza di servizi e un rinnovamento infrastrutturale. Anche attraverso attività di ricerca e sperimentazione, vengono promosse soluzioni innovative e a impatto ridotto da adottare nelle fasi di costruzione esercizio e decommissioning, sia per strutture a mare che per il conferimento a terra dell’energia prodotta. E’ noto come l’area marittima dello Ionio-Mediterraneo Centrale sia una delle più importanti del Mediterraneo per l’avifauna (Piano dello Spazio Marittimo - Area Marittima “Ionio - Mediterraneo Centrale”, 2024, Lipu e Ispra, 2015; www.medgsr.org). Nell’area riveste particolare importanza per gli uccelli il gruppo di isole situato in posizione strategica nello stretto di mare tra la Sicilia e la Tunisia. Queste isole sostengono grandi colonie di procellariformi, in particolare berte maggiori e minori e uccelli delle tempeste, Due rotte migratorie principali coinvolgono l’intero flusso migratorio sull’Europa, connettendo la Tunisia con la Sardegna e con la Sicilia occidentale (Tattoni e Ciolli, 2019). Le aree OW1-OW2-OW4 hanno una presenza non trascurabile di avifauna marina, in particolare OW2 (www.medgsr.org), ma sono al di fuori della principale rotta migratoria fra Italia-Sicilia-Tunisia (www.medgsr.org; Tattoni e Ciolli, 2019). ISPRA (ISPRA, 2021) attribuisce alle aree in cui si trovano OW1 e OW2 una sensibilità alta rispetto ai movimenti migratori, mentre la sensibilità è media in OW4. Inoltre, la sensibilità rispetto ai movimenti in periodo riproduttivo è bassa in tutte e tre le aree.",
		"title": "ENERGIA",
		"tags": ["ambiente", "biodiversità"],
		visual: aquacoltureVisual,
		structure: 'page',
		style: updateItemStyle({}),
	});
	const elementEnergia: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [itemEnergia],
	});

	const itemTrasporti: StoryItem = populateStoryItem({
		"text": "Lo scenario è simile a N@W, ma considera un incremento del traffico da oggi al 2040 così definito, in termini di densità di traffico, ovvero di rotte che attraversano ciascuna cella nell’unità di tempo, per diverse tipologie di imbarcazioni: +30% per navi cargo e portarinfuse (CAR); +53% per navi portacontainer (CON); +26% per navi passengeri e da crociera (PAS); +38% per navi petroliere e gasiere (TGC); +33% per navi roll-on-roll-off cargo e passengeri (RRO). Questi valori sono derivati dal recente studio condotto da EMSA per valutare l’evoluzione attesa del rumore sottomarino nei mari europei, con e senza misure di mitigazione (EMSA, 2024), e sono in linea con altre indicazioni derivabili dalla letterature di settore: proiezioni del trasporto marittimo globale al 2050 (EMSA-EEA, 2021); aumento annuo atteso delle movimentazioni di container del 3.1% nel Mediterraneo occidentale (Piano del Mare (2023)) e del 2.7% relativamente al periodo 2021-2026 (Report SRM 2022). Nel corso dell’analisi potranno essere considerate a titolo esplorativo altre percentuali di variazione per una o più tipologia di navi, anche in relazione ad evidenze e informazioni locali rilevanti. L’aumento di traffico riguarderà in particolare le principali direttrici attuali, al netto delle redistribuzioni dei flussi imposte da altri elementi di scenario (ad esempio, campi eolici), ma sarà associato a interventi per la riduzione del suo impatto: riduzione della velocità a 10 nodi in una subarea della nuova PSSA (area CCH) con effetti su URN e su collisioni con cetacei, riduzione della rumorosità media della flotta mercantile e passeggeri, migliore regolamentazione della gestione delle acque di zavorra (BWM), ulteriore potenziamento dei sistemi di prevenzione e gestione di eventi di inquinamento accidentale, evoluzione verso combustibili a minori emissioni. Ulteriori iniziative verso la sostenibilità vengono intraprese nei porti, grandi e piccoli, della zona (ad esempio, elettrificazione delle banchine, disponibilità di combustibili alternativi, gestione dei rifiuti, facilities per la gestione delle acque residue di sea water scrubber, gestione dei materiali dragati), così come viene considerata l'evoluzione verso combustibili a minori emissioni. E’ atteso peraltro un incremento, valutato complessivamente modesto rispetto al traffico complessivamente presente nell’area, del traffico a corto raggio per attività di costruzione e manutenzione dei campi eolici previsti nello scenario, e di altri campi eolici potenzialmente realizzabili in aree circostanti (in particolare nell’area a ovest dell’area pilota SOS). L’“isola energetica” realizzata in OW2 funge da punto di rifornimento per combustibili alternativi (idrogeno, metanolo, ed elettrico) per diminuire gli impatti e le pressioni nelle aree costiere e di snodo portuale. La stessa installazione di un'isola energetica nel corridoio di traffico comporta anche una conseguente diminuzione della velocità delle navi in transito, in linea con il limite di 10 nodi proposto per la subarea della PSSA e con associati benefici ambientali (e.g. riduzione del rumore e delle collisioni con megafauna). La presenza delle 3 aree OW1, OW2 e OW4 all’interno del corridoio di traffico NW-SE richiederà di approfondire aspetti di sostenibilità economica e di sicurezza del trasporto marittimo nell’area, individuando eventuali ulteriori misure di regolamentazione (ad esempio, TSS).",
		"title": "TRASPORTO MARITTIMO",
		structure: 'page',
		style: updateItemStyle({}),
	});
	

	const elementTrasporti: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [itemTrasporti],
	});

	const itemPesca: StoryItem = populateStoryItem({
		"text": "La distribuzione spaziale dello sforzo nell'area presenta nel tempo cambiamenti notevoli e l'intensità della pesca a strascico diminuisce, proseguendo il trend in atto ed anche in relazione all’istituzione di nuove aree protette e l'ampliamento delle FRA esistenti nelle aree con EFH e VME. Più precisamente, l'intensità della pesca a strascico diminuisce complessivamente del 9%, redistribuendo spazialmente lo sforzo tenendo conto delle nuove chiusure previste dallo scenario (e.g. nuove aree protette, campi eolici, nuove FRA). Questo trend è in linea anche con le politiche in atto per incentivare con risorse dedicate la riduzione della flotta per la pesca a strascico. Vengono pienamente riconosciuti i “fishing grounds” esistenti per la pesca a strascico (Russo et al., in stampa). Queste aree sono considerate nello scenario come aree con priorità per le attività di pesca, a cui gli altri usi sono subordinati e si devono adeguare, al netto di altri usi specifici e diversi previsti allo scenario medesimo (ad esempio, campi eolici). Il controllo e la lotta alla pesca illegale (IUU), diffusamente presente nell’area (Jarboui et al., 2022) sono attuati in modo deciso ed efficace. La pesca artigianale (Grati et al., 2022) è considerata una risorsa e viene incrementata (+9% rispetto all’attuale); gli investimenti vengono indirizzati sia sul sostegno alla formazione dei giovani pescatori, sia sulla promozione dei prodotti/eccellenze locali. La promozione di accordi e tavoli di cogestione tra la pesca artigianale e i siti N2K diventa una pratica comune nella zona, ed è regolata dai piani di gestione delle aree di conservazione. Viene attuata una adeguata sorveglianza di tali aree, considerandola un importante prerequisito per aumentare la resa all'interno dell'area. Nelle aree in cui si sviluppano impianti eolici, viene promossa la sinergia e il multiuso con il settore della pesca, attraverso l’utilizzo di attrezzi che possano essere utilizzati in sicurezza all’interno delle OWF (per esempio, non con reti a strascico o reti da tonno e piccoli pelagici). Come da Action Plan (COM(2023)102 final), si vieta la pesca a strascico con attrezzi attivi nelle aree SIC/ZSC designate ai sensi della direttiva Habitat per la protezione di habitat e le specie marine bentoniche. Nell'area valgono le norme tecniche sulla pesca dei Piani di Gestione Locale delle Unità Gestionali “Arcipelago delle Isole Pelagie”, “Capo Passero – Siracusa” e “Mazara del Vallo”. In particolare, nell’Unità Gestionale “Arcipelago delle Isole Pelagie” è proibita la pesca alle imbarcazioni di lft>24 m e con motore superiore a 500 kw. In seguito al completamento delle valutazioni sulle aree pilota identificate da GFCM, il divieto di pesca a strascico viene portato da 1000 metri a 800 metri di profondità, in quanto queste aree possono ospitare ecosistemi marini vulnerabili (VME), sostenendo al contempo attività di pesca relativamente limitate da parte di alcuni pescherecci che si dedicano a stock specifici di acque profonde (GFCM REC 29/2005/1). Vengono istituite 2 nuove FRA per protezione di EFH, elasmobranchi e VME (Isidella). Nelle nuove FRA, così come nelle FRA esistenti, vige oltre allo strascico anche il divieto per reti da posta e palangari (GFCM SAC 2023). Le nuove aree protette / OECMs sono inserite in un contesto di area protetta transnazionale con Malta e Tunisia e di istituzione di nuove FRA in acque tunisine, di cui si valuteranno per quanto possibile gli effetti sulla sostenibilità del settore e riguardo agli stock ittici. Viene posta una restrizione alla pesca ricreativa nelle ore notturne e in aree di protezione (incluse FRA e VME), si vieta inoltre l'utilizzo di luci artificiali, e apparati 'aqualung' con lance a mano o fucili subacquei (GFCM REC /45/2022/12). La flotta navale viene progressivamente sostituita da nuove navi, che presentano una migliore efficienza energetica. Le strutture portuali per il trattamento dei rifiuti/riciclaggio, con riferimento in particolare agli scarti delle attività di pesca e alle plastiche pescate in mare, sono sviluppate in modo omogeneo all'interno del bacino, sulla base dell'uso continuativo dei fondi strutturali. La sostenibilità economica del settore è favorita anche da interventi sull’intera catena del valore, per ottenere un aumento del valore aggiunto del pescato (marchi e ecolabel).",
		"title": "PESCA",
		tags: ["pesca sostenibile"],
		structure: 'page',
		style: updateItemStyle({}),
	});
	const elementPesca: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [itemPesca],
	});

	const itemAcqua: StoryItem = populateStoryItem({
		"text": "In coerenza con le politiche regionali / nazionali / europee di sviluppo del settore, la produzione alimentare nella zona è considerata una priorità e lo sviluppo dell’acquacoltura rappresenta una risorsa importante. Gli investimenti in tecnologie innovative (e.g. IMTA, mangimistica e riduzione degli antibiotici) e nella diversificazione delle specie sono identificati come uno strumento per rispondere alle pressioni e adeguatamente sostenuti dai fondi strutturali. I fondi mirano anche al miglioramento dell’efficienza energetica nell’acquacoltura. Viene promossa l’attuazione del piano AZA (D.A.103/GAB del 25/06/2021). Le possibilità di sviluppo dell’acquacoltura in condizioni esposte / offshore vengono esplorate adeguatamente, in particolare in abbinamento con l’isola energetica multiuso (OW2) e con gli altri impianti eolici previsti dallo scenario, e sostenute da investimenti centrali. Le caratteristiche oceanografiche delle aree e la loro collocazione rispetto alla linea di costa potrebbe consentire l’allevamento di specie ittiche ad elevato valore commerciale utilizzando gabbie emerse o sommerse. In merito ai processi di sviluppo, le strategie dell’acquacoltura siciliana passano attraverso le politiche di indirizzo regionale che dovrebbero tendere a potenziare l’innovazione tecnologica, di processo e di prodotto. I prodotti vengono valorizzati e promossi, anche attraverso una dichiarata sostenibilità ambientale delle aziende, nonché la ricerca di nuovi mercati e l’estensione della produzione a nuovi prodotti di allevamento, con costi di produzione sempre più contenuti. Uno scenario interessante è quello di penetrare nuovi settori di mercato con uno spettro di prodotti più ampio (nuove specie come per esempio l’ombrina boccadoro, ricciole, e diverse taglie), con strategie di commercializzazione innovative (semilavorati freschi, filetti), l’adozione di marchi di origine, IGT e certificazioni. Un contributo importante allo sviluppo del settore può essere fornito dalle competenze presenti sull’Isola in ambito scientifico e dalle indicazioni che possono provenire dal distretto produttivo della pesca e dal distretto tecnologico agro-bio e pesca ecocompatibile (MASAF, 2009). Vengono individuate per lo sviluppo di impianti di acquacoltura alcune aree intorno alla batimetrica dei 30 m, entro 3 mn dalla costa, selezionate fra le «aree vocate» del Decreto regionale 103/GAB del 25/06/2021.",
		"title": "ACQUACOLTURA",
		tags: ["pesca sostenibile, acquacoltura, sviluppo"],
		structure: 'page',
		style: updateItemStyle({}),
	});
	const elementAcqua: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [itemAcqua],
	});
	const elementDifesa: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [populateStoryItem({
			"text": "Nello scenario BD, le misure per affrontare l’erosione costiera e il rischio di inondazioni vengono intraprese con una chiara visione e programmazione a lungo termine (PRCEC, 2020 e nuovo Piano in fase di ultimazione da parte dell’Autorità di Bacino del Distretto Idrografico della Sicilia). Vengono identificati gli hotspot. Le misure da intraprendere non sono semplici: è necessario ricreare il nesso naturale terra-mare, considerando l’apporto fluviale e le dinamiche naturali delle dune. Le cause dell’erosione vengono analizzate e comprese alla scala spaziale più adeguata e le azioni di difesa costiera sono integrate ove necessario con azioni lungo i corsi d’acqua, le foci e le aree portuali. Gli interventi attuati sono soft e le NBS hanno la priorità. Viene programmazione e attuata con i comuni costieri la corretta gestione delle banquette di Poseidonia, favorendo in caso di rimozione il suo riutilizzo nelle forme consentite dalle norme vigenti. Vengono studiati e valutati attentamente gli effetti sugli habitat bentonici e le comunità ittiche demersali degli interventi di ripascimento e adottate adeguate misure di mitigazione. Le sabbie offshore compatibili, anche da cave profonde >100 mt, vengono utilizzate per ripascimenti e opere di difesa costiera. Sono stati individuati i tratti di costa con i maggiori trend erosivi (2006-2020, ISPRA) e le potenziali cave a mare censite nell’area, anche oltre 100 mt di profondità. Altre cave potenzialmente utilizzabili sono state individuate nel Golfo di Palermo e di Termini Imerese.",
			"title": "DIFESA COSTIERA",
			tags: ["pesca sostenibile, difesa, sviluppo"],
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});
	const elementTurismo: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [populateStoryItem({
			"text": "La transizione sostenibile del turismo C&M viene fortemente promossa e i modelli turistici implementati evolvono rispetto a quelli di tipo tradizionale oggi in essere. Questo riguarda importanti aspetti di sostenibilità come il risparmio energetico e delle risorse in genere, la gestione dei rifiuti, la gestione e destagionalizzazione dei flussi. Viene promossa la diversificazione dell’offerta su settori di turismo esperienziale qualil’ecoturismo, anche in relazione all’ampliamento della rete di aree protette, il pescaturismo, il diving e il whale -watching. In collegamento con interventi sulle aree protette e nuove misure di conservazione, vengono introdotte specifiche misure per ridurre l'impatto delle barche da diporto sui fondali. Vengono promosse soluzioni innovative e tecnologie per la gestione ambientale dei marina (e.g. energia, gestione dei rifiuti e dei reflui). Vengono individuate aree di promozione e sviluppo (non esclusivo) di attività di turismo esperienziale, con particolare riferimento all’ecoturismo. Le aree protette esistenti e di nuova istituzione sono, con limitazioni particolari nelle aree a protezione rigorosa, luoghi di promozione di ecoturismo. Viene promosso il turismo multiuso con impianti eolici, in particolare nell’area OW4, e sono individuate le principali darsene da diporto, per interventi di efficientamento ambientale.",
			"title": "TURISMO",
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});
	const elementRicerca: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [populateStoryItem({
			"text": "La ricerca e innovazione sono promosse nell'area (e.g. centri di ricerca, sistemi di osservazione e monitoraggio), per supportare un'economia blu sostenibile, la conservazione e restauro degli ecosistemi marini e la ricerca di materiali e soluzioni a basso impatto per gli impianti eolici offshore. Sono promosse attività di ricerca per: • sviluppare nuove modalità di fruizione e protezione del patrimonio culturale subacqueo e della biodiversità, • sviluppare nuove soluzioni tecniche per l’acquacoltura offshore, • la progettazione integrata tra parchi eolici e acquacoltura offshore e più in generale la sperimentazione di soluzioni di coesistenza e sinergia fra sistemi di produzione di energia rinnovabile in mare e dal mare e altri usi. • avviare e sostenere attività di citizen science. Sono individuati e valorizzati, in un contesto mediterraneo ed europeo, i principali siti osservativi e centri di ricerca presenti nell’area.",
			"title": "RICERCA E INNOVAZIONE",
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});
	const elementPaesaggio: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-temi",
		storyItems: [populateStoryItem({
			"text": "Anche nello scenario BD la tutela del paesaggio (in particolare nelle aree vicine alla costa) e dell'UCH (in tutte le aree, comprese le acque profonde) è valorizzata e associata, ove possibile, alla protezione della natura stabilendo obiettivi comuni e attività di monitoraggio e sorveglianza. Le azioni di tutela sono anche associate ad iniziative gestite di turismo esperienziale e culturale, anche utilizzando tecnologie digitali. Le misure puntano a sostenere il valore paesaggistico della fascia costiera, promuovendo il recupero e la riqualificazione di edifici e aree soggette a tutela e lotta all'abusivismo edilizio nelle aree costiere. Particolare rilevanza ha la conservazione del patrimonio archeologico subacqueo. Si propongono anche iniziative mirate a promuovere e creare consapevolezza sul patrimonio culturale immateriale e promuovere la cooperazione regionale e internazionale nel settore. La valorizzazione si focalizza su azione “in loco”, mediante la realizzazione di itinerari subacquei o multimediali (culturali ma anche naturalistici, Telecamere subacquee, VR), al fine di sensibilizzare i fruitori alla tutela e alla fruizione sostenibile. All’interno delle aree già mappate nel Piano MSP congiuntamente con MIC e la Soprintendenza (patrimonio subacqueo – Relitti, beni archeologici e architettonici), vengono individuate in particolare 2 aree di interesse per lo scenario in oggetto: Campobello di Mazara – Ribera; Marzamemi – Portopalo). All’interno di queste aree potrebbe essere valutata la creazione di «Parchi Archeologici Subacquei».",
			"title": "PAESAGGIO E PATRIMONIO CULTURALE",
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});

	//sez 3 
	const elementValutazione: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-valutazione",
		sectionTitle: "Valutazione preliminare",
		storyItems: [populateStoryItem({
			"text": "Al fine di fornire prime indicazioni di massima sulla rilevanza ambientale e le conseguenze ambientali dello scenario rispetto alla situazione attuale sono state effettuate delle stime indicative delle superfici che potrebbero rientrare nel 30% di aree protette (SWD(2022) 23 final), ovvero nel 10% di aree con protezione rigorosa (i.e. strictly protected). Come già esposto sopra, le stime effettuate sono esplorative e sono basate su una serie di assunzioni. La tabella evidenzia come nello scenario BD la percentuale di aree protette, considerando anche le OECM potenziali, salga al 35%, con un ruolo importante svolto in particolare dalle aree vietate alla pesca a strascico di fondo riconosciute in ambito GFCM. Inoltre, anche considerando l’ipotesi che l’intera area delle AMP possa essere considerata come area a protezione rigorosa, verrebbe raggiunto solamente l’1,4% dell’area, rimanendo lontani dall’obiettivo del 10%.",
			"title": "VALUTAZIONE PRELIMINARE DELLE AREE OGGETTO DI PROTEZIONE RISPETTO AGLI OBIETTIVI DELLA STRATEGIA SULLA BIODIVERSITÀ 2030",
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});
	//sez 4
	const elementBib: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-bib",
		sectionTitle:"Bibliografia",
		storyItems: [populateStoryItem({
			"text": "Centro Nazionale per la Biodiversità (no date) NBFC. Available at: https://www.nbfc.it/ (Accessed: 19 March 2024). Oteros-Rozas, E. et al. (2015) ‘Participatory scenario planning in place-based social-ecological research: Insights and experiences from 23 case studies’, Ecology and Society, 20(4). doi:10.5751/es-07985-200432. Neef, R., Verweij, S., Busscher, T. & Arts, J. A common ground? Constructing and exploring scenarios for infrastructure network-of-networks. Futures 124, 102649 (2020). ECORYS, 2012. Available at: https://www.ecorys.com/it/ Redman, C.L., Grove, J.M. and Kuby, L.H. (2004) ‘Integrating social science into the long-term ecological research (LTER) network: Social Dimensions of ecological change and ecological dimensions of social change’, Ecosystems, 7(2). doi:10.1007/s10021-003-0215-z. Borjeson, L., Hojer, M., Dreborg, K.H., Ekvall, T., Finnveden, G., 2006. Scenario types and techniques: towards a user's guide. Futures 38 (7), 723e739. http://dx.doi.org/10.1016/j.futures.2005.12.002. Barbanti A., L. Gusatu. Socio-Ecological System (SES) of the Strait of Sicily – Synthesis Document, September 2023. CNR-ISMAR. Barbanti A., L., Gusatu, (2023). Task 4.4 – Biodiversity mainstreaming in MSP through scenario building and scenario analysis: Guideline to operationalize scenario building and scenario analysis. May 2023. CNR-ISMAR. EMSA-EEA, European Maritime Transport Environmental Report 2021. Available at: https://www.eea.europa.eu/publications/maritime-transport EMSA-EEA, European Maritime Transport Environmental Report 2025. Available at: https://www.eea.europa.eu/publications/maritime-transport European Maritime Safety Agency (2024), NAVISON Final Report: Calculation and analysis of shipping sound maps for all European seas from 2016 to 2050, EMSA, Lisbon Gazzetta Ufficiale della Repubblica Italiana (2023), Piano del Mare 2023-2025. Presidenza del consiglio dei Ministri, Roma Italy. Available at: https://www.gazzettaufficiale.it/eli/gu/2023/10/23/248/so/36/sg/pdf Danovaro R., S. Bianchelli, P. Brambilla, G. Brussa, C. Corinaldesi, A. Del Borghi, A. Dell’Anno, S. Fraschetti, S. Greco, M. Grosso, E. Nepote, L. Rigamonti, F. Boero, 2024. Making eco- sustainable floating offshore wind farms: Siting, mitigations, and compensations. Renewable and Sustainable Energy Reviews, Volume 197, 114386, https://doi.org/10.1016/j.rser.2024.114386 Panaro A. (2022). I nuovi Scenari Logistici e Portuali nel Mediterraneo: è possibile sciogliere i nodi?. SRM - Richmond Logistic Forum Rimini. Available at: https://www.sr-m.it/media/files/PANARO-LOGISTICS-RICHMOND.pdf IMO MED-SECA. New shipping fuel standards to reduce sulphur air pollutants in the Mediterranean by 80% (2022) Environment. Available at: https://environment.ec.europa.eu/news/new-shipping-fuel-standards-reduce-sulphur-air- pollutants-mediterranean-80-2022-12-16_en (Accessed: 19 March 2024). Marine Environment Protection Committee (MEPC 80), 3-7 July 2023 (no date) International Maritime Organization. Available at: https://www.imo.org/en/MediaCentre/MeetingSummaries/Pages/MEPC-80.aspx (Accessed: 19 March 2024). Wurtz, M. and Rovere, M. (2015) ‘Atlas of the Mediterranean Seamounts and seamount-like structures’, IUCN [Preprint]. doi:10.2305/iucn.ch.2015.07.en. IUCN, 2018, Protected Area Technical Report Series No 3 SWD(2022) 23. PNIEC, 2023. PIANO NAZIONALE INTEGRATO PER L’ENERGIA E IL CLIMA (rev. giugno 2023) Ministero delle Infrastrutture e dei Trasporti (2024), I Piani dello Spazio Marittimo italiani Area Marittima “Ionio - Mediterraneo Centrale”. SID. Available at: https://www.sid.mit.gov.it/documenti-piano FAO, 2022. Recommendation GFCM/45/2022/12 on the establishment of a set of minimum rules for sustainable recreational fisheries in the Mediterranean Sea. FAO, 2021. GFCM 2030 Strategy for sustainable fisheries and aquaculture in the Mediterranean and the Black Sea. FAO. https://doi.org/https://doi.org/10.4060/cb7562en FAO, 2022. Recommendation GFCM/45/2022/4 on a multiannual management plan for the sustainable exploitation of demersal stocks in the Strait of Sicily (geographical subareas 12 to 16), repealing Recommendations GFCM/44/2021/12 and GFCM/42/2018/5. FAO, 2022. Recommendation GFCM/45/2022/5 on a multiannual management plan for the sustainable exploitation of giant red shrimp and blue and red shrimp stocks in the Strait of Sicily (geographical subareas 12 to 16), repealing Recommendations GFCM/44/2021/7 and GFCM/43/2019/6. The General Fisheries Commission for the Mediterranean (GFCM), 2005. Recommendation 29/2005/1 Management of certain fisheries exploiting demersal and deepwater species. The General Fisheries Commission for the Mediterranean (GFCM), 2016. REC.CM- GFCM/40/2016/4 establishing a multiannual management plan for the fisheries exploiting European hake and deep-water rose shrimp in the Strait of Sicily (GSA 12 to 16) Co.Ge.P.A. di Capo Passero-Siracusa, Piano di Gestione Locale dell’Unità Gestionale da Capo Passero a Siracusa. SOS – Stretto di Sicilia – Geostoria degli Scenari 49 Co.Ge.P.A. di Lampedusa e Linosa, Piano di Gestione Locale dell’Unità Gestionale comprendente l’Arcipelago delle Isole Pelagie. Co.Ge.P.A. di Mazara del Vallo. Piano di Gestione Locale (PGL) dell’Unità Gestionale di Mazara del Vallo. Lauria, V., Garofalo, G., Fiorentino, F., Massi, D., Milisenda, G., Piraino, S., Russo, T., & Gristina, M. (2017). Species distribution models of two critically endangered deepsea octocorals reveal fishing impacts on vulnerable marine ecosystems in central Mediterranean Sea. Scientific Reports, 7(1), 8049. https://doi.org/10.1038/s41598-017-08386-z Andaloro F., A. Puccillo, R. Ferrone, 2023. LA PESCA ITALIANA NELL’USO DELLO SPAZIO MARITTIMO. Scenari futuri e riflessi socioeconomici. EDIZIONE FLAI CGIL. Andaloro F., A. Puccillo, R. Ferrone, 2024. Sostenibilità energetica e sostenibilità sociale e economica della pesca. EDIZIONE FLAI CGIL. Álvarez, H., Vulperhorst, V., Blanco, J., Fournier, N., Marin, P., Perry, A.L. and Coelho, V. 2021. Transparency and compliance weaknesses in GFCM Fisheries Restricted Areas. How continuous IUU fishing inside the Strait of Sicily FRAs undermines fisheries sustainability and the credibility of the GFCM. Oceana. Madrid, 24 pp.. EC, 2023. , EU Action Plan: Protecting and restoring marine ecosystems for sustainable and resilient fisheries. (COM(2023)102 final). EC, 2022. Criteria and guidance for protected areas designations. SWD(2022) 23 final. EU, 2024. Regulation (EU) 2024/1991 on nature restoration and amending Regulation (EU) 2022/869. ISPRA, 2021. Mappe di sensibilità dell’avifauna per l’eolico offshore. Relazione consegnata al Ministero dell’Ambiente e della Sicurezza Energetica. Pp. 1-26 + 9 mappe. Tattoni, C., & Ciolli, M. (2019). Analysis of bird flyways in 3D. ISPRS International Journal of Geo-Information, 8(12), 535. Lipu & ISPRA (2015). Identificazione delle IBA marine per la conservazione della Berta maggiore in Italia. Regione Siciliana, 2020. “Piano Regionale Contro l'Erosione Costiera (PRCEC). Regione Siciliana, Assessorato Regionale Territorio ed Ambiente, 2021. Carta delle aree vocate alla maricoltura e “Guida metodologica per l’individuazione delle aree vocate all’acquacoltura”. D.A.103/GAB del 25/06/2021. Russo T, D’Andrea L, Franceschini S, Accadia P, Cucco A, Garofalo G, Gristina M, Parisi A, Quattrocchi G, Sabatella RF, Sinerchia M, Canu DM, Cataudella S and Fiorentino F (2019). Simulating the Effects of Alternative Management Measures of Trawl Fisheries in the Central Mediterranean Sea: Application of a Multi-Species Bio-economic Modeling Approach. Front. Mar. Sci. 6:542. doi: 10.3389/fmars.2019.00542. Carlucci R, Cipriano G, Cascione D, Ingrosso M, Russo T, Sbrana A, Fanizza C and Ricci P (2022) Application of a multi-species bioeconomic modelling approach to explore fishing traits within eligible cetacean conservation areas in the Northern Ionian Sea (Central Mediterranean Sea). Front. Mar. Sci. 9:1005649. doi: 10.3389/fmars.2022.1005649 Agnetta D, Badalamenti F, Colloca F, Cossarini G, Fiorentino F, Garofalo G, Patti B, Pipitone C, Russo T, Solidoro C. and Libralato S (2022) Interactive effects of fishing effort reduction and climate change in a central Mediterranean fishing area: Insights from bio-economic indices derived from a dynamic food-web model. Front. Mar. Sci. 9:909164. doi: 10.3389/fmars.2022.909164. Grati F., et al., 2022. Mapping small-scale fisheries through a coordinated participatory strategy. Fish and Fisheries. 2022;23:773–785. Jarboui, O., Ceriola, L., & Fiorentino, F. (2022). Current fisheries management in the Strait of Sicily and progress towards an ecosystem approach. In Vasconcellos, M. and Ünal, V., eds.. Transition towards an ecosystem approach to fisheries in the Mediterranean Sea – Lessons learned through selected case studies. FAO Fisheries and Aquaculture Technical Paper No. 681. Rome, FAO: 147-162. Fiorentino, F. et al., 2024. Learning from the history of red shrimp fisheries in the Mediterranean to improve sustainability of deep-water bottom trawling. ICES Journal of Marine Science , 2024, Vol. 81, Issue 4, 652–664, https://doi.org/10.1093/icesjms/fsae031 Marsaglia, L., et al., 2024. Shedding light on trawl fishing activity in the Mediterranean Sea with remote sensing data. ICES Journal of Marine Science, 2024, Vol. 0, Issue 0, 1–15. https://doi.org/10.1093/icesjms/fsae153.",
			"title": "PRINCIPALE BIBLIOGRAFIA CONSULTATA",
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});
	//sez 5
	const elementLogo: StoryElement = populateStoryElement({
		order: 3,
		sectionID: "sezione-logo",
		storyItems: [populateStoryItem({
			"text": "Workshop: Sviluppo partecipto di scenari per la Pianificazion Spaziale Marittima e la salvaguardia della biodiversità",
			"title": "MareFuturo co-creare sosteinbile",
			structure: 'page',
			style: updateItemStyle({})} as Partial<StoryItem>)
		],
	});



	// --- 4. Popola la Geostory ---

	const mockGeostory: Geostory = populateGeostory({
		id: "geostory-canale-sicilia-uuid",
		title: "Geostoria: Dinamiche Socio-Ambientali del Canale di Sicilia",
		author: "Osservatorio Mediterraneo",
		topic: "Geopolitica e Ambiente",
		scenario: "Stato Attuale 2024",
		language: "ita",
		exportType: "pdf",
		// Passiamo tutti gli elementi, populateGeostory li raggrupperà e ordinerà automaticamente.
		elements: [
			elementIntro, 
			elementBD,
			elementEcologia,
			elementTemi,
			elementEnergia,
			elementTrasporti,
			elementPesca,
			elementAcqua,
			elementDifesa,
			elementTurismo,
			elementRicerca,
			elementPaesaggio,
			elementValutazione,
			elementBib,
			elementLogo

		],
	});

	return mockGeostory;
}