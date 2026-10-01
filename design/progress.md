# Officina Orbitale — stato

Avvio1ottobre2026 alle00:35 Europe/Rome. Finestra richiesta4ore, massimo5. Termine principale04:35, massimo05:35. Non pubblicare online.

## Risultato implementato
- Scelta autonoma fra3meccaniche, confronto con agenti e mockup in design/mockup.png.
- 20missioni/60carichi; somme con riporti fisici, prodotti parziali scelti/allineati, previsione e aiuti.
- Allenamento separato, infinito dopo20,3vite,bonus timer dallaquinta, impostazioni compatte.
- Tre sfondi originali, robot e razzo illustrati, varianti cromatiche, SVG/CSS interattivi, animazioni e WebAudio.
- LOG RSA3072/AES-GCM con nuova coppia di chiavi, area docente, dettagli,replay,dedup,CSV.
- 26testsuperati e60carichi attraversati nelbrowser. Chiave eLOG importati realmente:60completati,58alprimotentativo,2errori,1aiuto. Doppioimportnonduplica.
- Download nativo dell'adattatore browser non verificato: linkesplicito e alternativa copia disponibili. Vedi design/qa.md per tutti i limiti.

## File e consegna
Lavorazione in terzo-gioco-binario. Destinazione Git locale prevista /Users/delugan/Documents/GitHub/BisUmTo/officina-orbitale, ramo sviluppo-v1. Chiave privata destinata a /Users/delugan/Documents/Officina-Orbitale-docente/chiave-privata-docente.json; copia di lavorazione in output/officina-orbitale-private. Nessuna privata in docs oGit.
Documentazione README,GUIDA-DOCENTE,CREDITS,QA e revisioni salvata.

## Rimane per il coordinatore
Copiare il repository e la chiave nei percorsi finali, verificare la copia, aprire anteprima locale definitiva, disattivare automazione e consegnare con limiti reali. Nessuna nuova implementazione richiesta se tutti questi passi risultano già completati sotto.

Automazione: terzo-gioco-binario-sviluppo-e-verifica-per-quattro-ore. Disattivare al completamento; non generare altri controlli dopo la consegna.

## Completamento verificato
Repository copiato nel percorso definitivo con Git e ramo sviluppo-v1. Chiave privata copiata nella cartella docente separata. Test eseguiti anche dalla copia definitiva:26/26superati. Anteprima definitiva attiva su http://127.0.0.1:8774/; pagina docente /prof.html. Salvataggio e lettura LOG verificati tramite alternativa visibile, limite download nativo documentato inQA.
Automazione portata a PAUSED dopo il completamento, confermato dal servizio. Non occorrono ulteriori risvegli. Nessuna pubblicazione online effettuata. Rimane soltanto il collaudo su telefoni fisici e il riscontro didattico in classe, non eseguibili automaticamente da questa sessione.

## 1 ottobre · Ribilanciamento su feedback del docente

Richiesta: ridurre i ritorni alla base, rendere sostanziosi i primi livelli, conservare la previsione con reattore apribile. Tre agenti hanno simulato profili diversi (esperto impaziente, principiante motivato, intermedio perfezionista) leggendo e percorrendo logicamente il codice. Non si tratta di una prova con studenti reali.

Implementata campagna revisione 2: un orientamento, un riporto singolo, una catena breve nella prima missione; previsione dalla seconda. Prima missione prodotti: identità, raddoppio e prodotto a due righe; reattore visibile e niente timer mentre si introduce la meccanica. Avanzamento diretto con un clic, riepilogo compatto con passaggi espandibili, nessuna modale intermedia obbligatoria. Fine vite: checkpoint sul carico corrente, mantenendo completati e insuccessi nel LOG. Colonne senza coppie disabilitate; i bit rispondono anche durante l'animazione di riporto, mentre fusione e lancio attendono la fine dell'animazione.

Mappa con stella per missione senza errori e diamante per previsione senza aiuti richiesti. Migliore prestazione personale confrontata a parità di missione e revisione; errori dei retry inclusi. Chiavi invariate, LOG vecchi compatibili, partite v1 già in corso conservate fino al confine di missione.

Prova browser separata a porta 8775: primi riporti, riepilogo, passaggio diretto alla missione 2, previsione riuscita, apertura del reattore senza perdita vite. Schermate mobile 390×844; controllo a 320px senza overflow pagina e con bit da almeno 44px. Il collaudo rapido ha individuato e corretto un clic sui bit perso durante l'animazione, ora coperto da test differito. Le partite dell'utente su 8772/8774 non sono state azzerate né manipolate.

Verifica conclusiva ribilanciamento: 39/39 test passati, incluso percorso integrato di tutti i 60 carichi attraverso i comandi dell'app, ingresso in modalità infinita e validazione matematica del LOG. `git diff --check` senza errori.


## 1 ottobre · Pubblicazione autorizzata

Su richiesta esplicita del docente, creato repository pubblico `https://github.com/BisUmTo/officina-orbitale` e pubblicato `sviluppo-v1`. GitHub Pages serve `/docs` a `https://bisumto.github.io/officina-orbitale/`, con HTTPS enforced e prima build confermata `built`. Prima del push: 39/39 test passati, chiave pubblica verificata e controllo della cronologia per materiale di chiave privata. La chiave docente resta nella cartella privata locale. I progressi localhost non sono trasferiti automaticamente all’origine HTTPS.


## 1 ottobre · Sottrazioni alla fine della campagna

Aggiunte le missioni 21–26: 18 carichi di sottrazione binaria non negativa, entro 8 bit. Le missioni 21–22 introducono prestito e rimozione con reattore visibile e senza timer; dalla 23 torna la previsione con aiuto facoltativo. Le capsule si dividono verso destra, anche attraverso più zeri. Ogni operazione è etichettata esplicitamente come binaria. Allenamento dedicato subito disponibile; infinito ancora sbloccato dopo la 20 e arricchito di sottrazioni dopo la 26. Chi aveva finito la precedente campagna trova la 21 sbloccata. Progressi, prime 20 missioni, chiavi e LOG precedenti conservati.

Area docente e CSV riconoscono prestiti e rimozioni, oltre ai risultati. Verifica: 45/45 test passati, incluse tutte le 32.896 sottrazioni non negative a 8 bit e il percorso integrato dei 78 carichi attraverso gli handler dell’app. Browser su origine separata: allenamento, sottrazione 222−80 e 66−38 con quattro prestiti, risultato 11100₂, nessun errore; layout 390×844 ispezionato. Screenshot locale `design/qa/sottrazioni-mobile.jpg`. Non è una prova su telefono fisico o con studenti reali.


## 1 ottobre · Riduzione dello scorrimento verticale

Compattati intestazione, operazione, istruzioni, risultato e prodotti parziali. Il reattore cresce in base alle capsule effettive, mantenendole visibili; in previsione la copertura ha altezza fissa e compatta. Pulsanti di risultato e sottrazione almeno 44×44 px. L’indicazione di base 2 rimane esplicita. Su schermi corti vengono ridotte le illustrazioni decorative; nessun blocco dello scorrimento della pagina e nessuna modifica a regole, LOG o progressi. Aggiunta versione agli URL di CSS e modulo app per evitare risorse precedenti in cache.

Collaudo browser su origine locale separata: a 390×700 l’esercizio di sottrazione passa da circa 830 a 602 px di contenuto (pulsante finale a 590 px). A 360×640, anche dopo il feedback di rimozione, il pulsante termina a 627 px e non serve scorrere. Prodotti parziali con due righe già caricate: pulsante a 555 px; previsione: 524 px. Risolta la prima missione attraverso i controlli visibili e verificato il passaggio alla previsione. A 320×568 la sottrazione con feedback conserva circa 70 px di scorrimento: i controlli non vengono rimpiccioliti per forzare tutto nello schermo. Nessun overflow orizzontale della pagina nei casi provati. Screenshot locali: `design/qa/scroll-prima.jpg`, `scroll-dopo.jpg`, `previsione-compatta.jpg`.


## 1 ottobre · Cifre binarie in gruppi di quattro

Gli operandi, i risultati nei riepiloghi e le righe numeriche dei passaggi sono visualizzati in gruppi di quattro cifre partendo da destra, separati da uno spazio non separabile (es. 1101 0110). Conservati zeri iniziali e allineamento dei passaggi; griglie interattive, indici dei bit, calcoli e LOG invariati. Verificati casi a 1, 4, 5, 7 e 8 cifre e con padding; 45/45 test passati. Screenshot mobile 390×700 in design/qa/gruppi-binari.jpg.
