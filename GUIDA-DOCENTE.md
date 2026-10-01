# Guida docente · Officina Orbitale

## La chiave

La nuova chiave privata di questo gioco si trova sul Mac in:

`/Users/delugan/Documents/Officina-Orbitale-docente/chiave-privata-docente.json`

Una copia di sicurezza di lavorazione è in `output/officina-orbitale-private/` nel progetto locale Rainerum. La chiave pubblica è già in `docs/public-key.json`. Non è la chiave di Pesca Binaria né di Dogana Booleana.

Conserva una copia privata della chiave docente: serve ad aprire tutti i LOG prodotti con questa versione. Non caricarla su GitHub, Classroom o sul sito. Cambiare chiavi rende i vecchi report incompatibili con quella nuova. Lo strumento `tools/keygen.mjs` rifiuta di sovrascrivere chiavi esistenti proprio per evitare questo problema.

## Raccogliere i lavori

1. Lo studente inserisce nome e classe, gioca e scarica il LOG dalla base o dal riepilogo.
2. Prima della consegna termina il carico attivo oppure sceglie **Pausa → Abbandona questa missione**. I carichi sospesi restano sul dispositivo e non sono ancora inclusi.
3. Lo studente allega il file `.LOG` a Classroom.
4. Apri `prof.html` dal sito o dal server locale, carica la chiave privata e seleziona i LOG scaricati da Classroom.
5. Filtra classe, nome e modalità. Seleziona uno studente per osservare operazioni, aiuti, errori e singole azioni. Puoi esportare le righe filtrate in CSV.

Se ricevi due esportazioni cumulative dello stesso studente, il sistema conta ogni tentativo una sola volta. Un identificatore con contenuti diversi fa rifiutare l'importazione. Le importazioni multiple sono atomiche: se un file della selezione è errato, nessuno dei file di quella selezione viene aggiunto; il report già aperto resta disponibile.

La chiave e i LOG importati restano nella memoria della scheda, senza invio a server. **Rimuovi chiave** elimina la chiave dalla pagina, ma i risultati già aperti restano visibili. **Svuota report** elimina i report dalla pagina. Chiudere la scheda rimuove entrambe le cose. Il CSV, una volta scaricato, contiene dati leggibili.

## Dati e interpretazione

| Evidenza | Che cosa osservare | Limite |
|---|---|---|
| Risultato corretto al primo tentativo | Precisione senza correzioni durante quel carico | Può essere stato richiesto un aiuto; leggerlo insieme al contesto |
| Fusione valida/errata | Esecuzione dei riporti; i comandi senza coppie sono disabilitati nella campagna aggiornata | La destinazione del riporto è generata dal gioco: non dimostra da sola che lo studente sappia scriverla |
| Scelta dei prodotti parziali | Distinzione fra bit 0 e bit 1 del moltiplicatore | Separare errori di scelta da errori di allineamento |
| Allineamento dei prodotti | Comprensione dello spostamento legato alla posizione del bit | Lo spostamento di una riga zero non cambia il risultato e non viene penalizzato |
| Aiuti richiesti | Ricorso al manuale o apertura del reattore coperto | Il reattore guidato dei primi livelli non conta come aiuto richiesto |
| Tempo attivo | Durata della fase di decisione con la pagina in primo piano | Non prova attenzione, impegno o tempo totale dedicato a studiare |
| Completamento dopo errori | Capacità di correggere e proseguire | Non equivale a correttezza al primo tentativo |

Confronta operazioni, livello, supporto visivo e modalità equivalenti. Non unire automaticamente allenamento e campagna. I dettagli distinguono **Reattore guidato** e **Previsione**. Il report ricalcola la correttezza a partire dalle azioni e non si fida dei totali dichiarati dal browser.

## Un uso formativo in classe

Dopo poche missioni, chiedi di risolvere su carta un'operazione nuova con la stessa struttura: per esempio `11 + 1`, `101 × 10`, `101 × 11`. Chiedi di indicare i riporti e scrivere i prodotti parziali. Questa prova verifica il trasferimento dal gioco alla notazione, che nessun conteggio di partite può dimostrare da solo.

Puoi premiare separatamente precisione al primo tentativo, correzione degli errori, progressione e autonomia rispetto agli aiuti richiesti. La velocità è un elemento accessorio, non una misura complessiva della competenza.

## Privacy e limiti tecnici

I progressi locali sono salvati nel normale archivio del browser, non cifrati. I file esportati sono cifrati con AES-GCM e chiave di sessione protetta da RSA-OAEP. Nome e classe stanno nel contenuto cifrato; il nome dello studente compare anche nel nome del file per rendere semplice la consegna.

La cifratura tutela il contenuto, **non certifica che il client non sia stato modificato**. Questo è un gioco interamente statico: va usato come evidenza formativa, insieme all'osservazione e agli esercizi su carta.

## Campagna ribilanciata (revisione 2)

Il primo tris introduce subito riporto singolo e catena breve. La previsione parte dalla missione 2; nella 9 il reattore torna visibile per introdurre i prodotti parziali senza timer. A zero vite si riprende dal carico fallito: il tentativo abbandonato resta nel LOG, con i suoi errori e il suo tempo. Le missioni successive si raggiungono direttamente dal riepilogo.

I nuovi tentativi registrano `campaignVersion: 2`. Le partite già in corso conservano esercizi e supporti della revisione 1 fino al termine della missione. I tentativi storici senza questa proprietà sono interpretati come revisione 1; chiavi e formato cifrato restano compatibili. Non confrontare il solo numero di livello fra le due revisioni: osserva operazione e supporto effettivi. Le stelle e i diamanti nella mappa sono riconoscimenti locali, non voti; includono anche gli errori dei tentativi riprovati della stessa missione.
