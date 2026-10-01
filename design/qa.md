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
