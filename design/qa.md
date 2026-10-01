# Verifica della prima versione

1 ottobre 2026. Test sul frontend statico locale e sui moduli reali, con revisione indipendente del core e dell'integrazione.

## Matematica e regressioni

Comando: `node --test tests/*.test.mjs` — **26 test, 26 superati**.

- Tutte le 16.384 somme fra operandi 0..127, con conservazione del valore a ogni fusione.
- Tutti i 256 prodotti fra operandi 0..15, incluse righe zero e riporti nella somma dei parziali.
- Controllo indipendente di 34.864 coppie ammesse dal core, limite255 e ordine inverso delle fusioni.
- Scelte errate, allineamenti errati, indici malformati, azioni dopo il completamento, sequenze e tempi non validi.
- Ricaricamento conserva vite ed errori; terzo errore archivia il carico abbandonato.
- Sblocco salvato immediatamente al terzo carico, anche lasciando il riepilogo.
- Pause, aiuto e scheda nascosta non consumano tempo attivo.
- Aiuto consultato dalla base durante un carico sospeso viene registrato.
- Reattore coperto marcato aria-hidden e inert; il contenuto non è offerto come risposta al lettore schermo.
- Doppio invio identico entro250ms non sottrae due vite; mosse diverse e fusioni deliberate restano disponibili.
- Allenamento non sblocca missioni; infinito richiede missione20; modalità separate nei LOG.
- Snapshot identità e tentativi acquisito prima delle attese di esportazione.
- Cifratura con coppia reale RSA3072/AES-GCM, IV casuali, chiave errata, alterazioni; CSV e testo HTML ostili trattati come dati.

## Browser

Sessione sintetica «Verifica automatica / QA», senza dati reali di studenti.

- Tutti i **60 carichi delle 20 missioni** completati tramite controlli visibili del gioco.
- Due errori inseriti intenzionalmente: risultato errato e scelta errata di una riga; un aiuto richiesto.
- Provati riporti singoli e a catena, zero e uno, spostamenti, moltiplicatori con zeri intermedi e prodotti fino225; somme fino255.
- Sblocco della modalità infinita osservato dopo20missioni.
- Layout ispezionato a390×844 e360×640, oltre alla vista desktop. Controlli principali44–46px o più; otto colonne entrano a390px, a360px scorre soltanto la tavola. Preparazione dei parziali compatta per evitare di dover tornare continuamente in alto.
- Ricaricamento dopo errore: vite ed esercizio conservati.
- Chiave docente caricata tramite selezione file reale e verificata nella pagina.
- LOG cifrato effettivamente prodotto dal gioco importato nella pagina docente: **60 completati,58 al primo tentativo,2 errori,1 aiuto**. Il tempo registrato per la sessione di collaudo era7min52s.
- Reimportazione dello stesso LOG: **60 tentativi unici e60 sovrapposizioni escluse**, senza raddoppio.
- Dettaglio docente mostra operazioni, supporto iniziale e azioni.
- Nessun errore console osservato durante il percorso principale.

## Limiti reali

Il controllo automatico del download tramite l'adattatore del browser integrato è scaduto senza restituire il percorso del file. Non è stato quindi certificato il salvataggio nella cartella Download di quel browser. È stato aggiunto un link esplicito al LOG e un'alternativa visibile di copia del testo cifrato; il file estratto da questa alternativa è quello poi importato e verificato nell'area docente. La creazione del contenuto, la cifratura e la lettura sono verificate; resta da provare il salvataggio nativo sul browser/telefono usato dagli studenti.

Non sono stati provati fisicamente un iPhone/Android, un lettore schermo completo o l'ascolto attraverso altoparlanti del dispositivo. Dimensioni mobili, semantica accessibile, gestione del movimento e grafo WebAudio sono implementati; questo non sostituisce un test con studenti reali.

La cifratura non rende autentici dati creati interamente sul client. Le metriche supportano una valutazione formativa, non la sostituiscono. Non è stata effettuata alcuna pubblicazione online.

## Ribilanciamento del 1 ottobre 2026

- Tre revisioni con profili di studenti simulati, non utenti reali: concordanza su sei somme iniziali senza riporti e interruzioni eccessive. Revisioni successive hanno corretto etichette allenamento/infinito e distinzione fra manuale e apertura del reattore.
- Browser reale su origine di collaudo separata: completati i tre carichi iniziali, raggiunta missione 2 con un clic, risolta previsione, aperto il reattore mantenendo tutte le vite.
- Layout 390×844: riepilogo di missione e previsione con CTA visibile. A 320px: larghezza documento 320px, bit da 44×46px, nessun overflow orizzontale della pagina nel caso iniziale provato. I casi a 8 colonne mantengono lo scorrimento interno preesistente.
- Screenshot locali ignorati da Git: `design/qa/v2-rotta-continua-mobile.jpg`, `design/qa/v2-prima-previsione-mobile.jpg`.
- Nuove regressioni: riporti immediati, continuità missioni, checkpoint dopo fallimento e reload, colonne non fondibili, input durante animazione, record coerenti dopo retry, conservazione v1 e lettura del supporto nei LOG precedenti.
- Nessuna chiave rigenerata e nessuna pubblicazione. Il miglioramento dell'interesse è un'ipotesi progettuale da osservare in classe; la simulazione degli agenti non la dimostra.
- Esito finale: 39/39 test Node passati; un test integrato completa i 60 carichi tramite handler dell'app e verifica il passaggio alla modalità infinita e la validità del LOG. La verifica browser riguarda il primo tratto e il layout, non una sessione manuale completa di 60 carichi.


## 1 ottobre · Sottrazioni alla fine della campagna

Aggiunte le missioni 21–26: 18 carichi di sottrazione binaria non negativa, entro 8 bit. Le missioni 21–22 introducono prestito e rimozione con reattore visibile e senza timer; dalla 23 torna la previsione con aiuto facoltativo. Le capsule si dividono verso destra, anche attraverso più zeri. Ogni operazione è etichettata esplicitamente come binaria. Allenamento dedicato subito disponibile; infinito ancora sbloccato dopo la 20 e arricchito di sottrazioni dopo la 26. Chi aveva finito la precedente campagna trova la 21 sbloccata. Progressi, prime 20 missioni, chiavi e LOG precedenti conservati.

Area docente e CSV riconoscono prestiti e rimozioni, oltre ai risultati. Verifica: 45/45 test passati, incluse tutte le 32.896 sottrazioni non negative a 8 bit e il percorso integrato dei 78 carichi attraverso gli handler dell’app. Browser su origine separata: allenamento, sottrazione 222−80 e 66−38 con quattro prestiti, risultato 11100₂, nessun errore; layout 390×844 ispezionato. Screenshot locale `design/qa/sottrazioni-mobile.jpg`. Non è una prova su telefono fisico o con studenti reali.


## 1 ottobre · Riduzione dello scorrimento verticale

Compattati intestazione, operazione, istruzioni, risultato e prodotti parziali. Il reattore cresce in base alle capsule effettive, mantenendole visibili; in previsione la copertura ha altezza fissa e compatta. Pulsanti di risultato e sottrazione almeno 44×44 px. L’indicazione di base 2 rimane esplicita. Su schermi corti vengono ridotte le illustrazioni decorative; nessun blocco dello scorrimento della pagina e nessuna modifica a regole, LOG o progressi. Aggiunta versione agli URL di CSS e modulo app per evitare risorse precedenti in cache.

Collaudo browser su origine locale separata: a 390×700 l’esercizio di sottrazione passa da circa 830 a 602 px di contenuto (pulsante finale a 590 px). A 360×640, anche dopo il feedback di rimozione, il pulsante termina a 627 px e non serve scorrere. Prodotti parziali con due righe già caricate: pulsante a 555 px; previsione: 524 px. Risolta la prima missione attraverso i controlli visibili e verificato il passaggio alla previsione. A 320×568 la sottrazione con feedback conserva circa 70 px di scorrimento: i controlli non vengono rimpiccioliti per forzare tutto nello schermo. Nessun overflow orizzontale della pagina nei casi provati. Screenshot locali: `design/qa/scroll-prima.jpg`, `scroll-dopo.jpg`, `previsione-compatta.jpg`.
