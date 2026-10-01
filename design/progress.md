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
