# Officina Orbitale — design scelto
## Intento
Terzo gioco didattico della serie Pesca Binaria / Dogana Booleana, italiano mobile first statico GitHub Pages. Somme e moltiplicazioni binarie si imparano agendo su energia organizzata in colonne, poi prevedendo risultati. Finestra4h dalle00:35del1ottobre2026, massimo5h. Utente delega scelta ed esecuzione: non richiede gate di approvazione aggiuntivi.
## Alternative
Officina: riporto fisico e prodotti parziali, forte trasferimento, scelta vincente. Runner: pressione motoria distrae da ragionamento, scartato. Circuiti: utile perAND/OR ma priorità diversa, scartato.
## Gameplay
20missioni, 3ordini ciascuna. 3vite per missione. Un errore matematico toglie vita; scelta/cambio provvisorio è libero fino a conferma. Ogni ordine ha somma oppure moltiplicazione, risultato<=255, max8colonne. Min4colonne; su telefoni stretti tavola con scorrimento orizzontale solo se8colonne, controlli min44px.
Somma: due file di capsule diventano carichi per colonna. Toccare colonna con>=2capsule fonde2 in1 nella colonna immediatamente a sinistra, animazione del riporto. Non imporre ordine fra fusioni legali. Risultato inserito dal giocatore in riga di bit0/1, mai auto compilato. Nei primi ordini fusione completa richiesta prima del lancio. Dopo missione6 reactor coperto: si può prevedere risultato senza fusioni oppure aprire con aiuto registrato. Risultato corretto avvia veicolo e mostra operazione in colonna.
Moltiplicazione: per OGNI bit del moltiplicatore (inclusi0) scegliere copia del moltiplicando oppure riga zero, e allineamento0..3con frecce. Conferma verifica valore e shift; shift irrilevante su riga zero. Prodotto parziale corretto alimenta tavola. Poi fusione / previsione somma come sopra. Nessuna generica leva che risolve prodotto da sola.
Progressione:1-2somme senza riporto;3singolo;4-5catene;6-8previsione;9-10moltiplicazioni per0/1 e10;11-12shift;13-16parziali multipli/zeri interni;17-20miste e previsione. Ogni missione casi intenzionali, infinite sbloccato dopo20. Allenamento separato somma/prodotto con aiuti liberi e LOG distinto.
Timer: dallemissione5contoalla rovescia solo per bonus, esaurimento non toglie vite. Tempi attivi esclusi pausa,help,tabnascosta,feedback bloccante. Prima niente timerindicazione. Precisione prima di velocità.
## Grafica
Officina spaziale illustrata, navy profondo, capsule turchesi, rame/arancio caldo, robot originale e razzi modulari SVG. Sfondo raster originale creato imagegen; SVG reattivi sopra. Animazioni capsule/riporti, caricamento, decollo, transizioni. WebAudio originale con controlli suoni/musica; reducedmotion. FontFredoka locale OFL già nelle risorse Pesca, licenza inclusa.
## UI
Home nome/classe, inizia/riprendi, allenamento, report, impostazioni compatte(suoni,musica,movimento), docente link. Header missione/3vite/bonusquandoattivo. Brief3passaggi per nuove meccaniche. Aiuto contestuale. Nessun account/networktelemetry. Desktop tavola centrale max780, mobile first 360x640.
## Log e docente
Formato proprio officina-orbitale,version1, schema1. Chiavi nuove; privata fuori repo in output/officina-orbitale-private. AES-GCM+RSA-OAEP comeDogana. Report dei problemi e azioni: merge,column; partial,row,include,shift; submit,value; hint. Azioni ricalcolate serverless dal prof; status completed/abandoned; no false authenticityclaim. Replay ricalcola correttezza; ID dedup globale e conflitti respinti; CSV antifomula. Nome/classe bloccati per storico; nuovo studente può prima esportare. Persistenza immediata ancheerrori+resume reload, storagefailure visibile.
## Interfaccia core vincolante
BITS littleendian in tutto il codice. Funzioni:
mission(level) => {level,title,sector,predict,bonusMs,orders:[{op:'add'|'mul',a,b,width}]}.
makeProblem(op,a,b) => {op,a,b,width}; width=Math.max(4,bitLength(result)),<=8.
createPuzzle(problem) => {problem,counts:Array(width),nextRow:0,rows:[],phase:'partials'|'reactor'}; somma counts da a+b incolonna nonnormalizzati; moltiplicazione counts0.
applyMove(puzzle,action) => {puzzle,correct,reason,carryFrom?,done?}; pure. merge {kind:'merge',column}; partial {kind:'partial',include:boolean,shift:number}; submit {kind:'submit',value:number}; hint {kind:'hint'}. Invalidmath returns correctfalse nochange; malformed throws. Partial consumes nextRow onlyifcorrect; eachbit from LSB through bitlength(b)min1. submit allowed onlyafterpartials; checksvalue exact, doesnotrequire normalized(core letsUI requireforguided).
expected(problem) numeric. bits(value,width) arrayLSB. replay(problem,actions) returns {puzzle,errors,merges,partialCorrect,partialErrors,submitCount,firstTry,completed,hints,independent}.
Actions logs have {kind,...,seq,activeAtMs}; replay ignores no clientcorrectflags.

## Ruling progressione del reattore
`mission.predict` è vero nelle missioni6–8 e15–20. Le nuove moltiplicazioni9–14 mantengono il reattore visibile guidato; la previsione riprende dalla15. I20titoli sono evocativi e specifici, i settori restano stringhe Energia, Propulsione e Orbita. Questo ruling prevale sulla formulazione generale della copertura dopo missione6.

## Ruling allineamento dei parziali
`partial.shift` accetta soltanto interi0..3; shift4 o superiore è malformato e lancia. Campagna e allenamento usano moltiplicatore b<=15. `makeProblem` continua ad accettare operandi0..255 con risultato<=255, ma la risoluzione guidata di moltiplicatori oltre15 non appartiene al contratto del gioco.
