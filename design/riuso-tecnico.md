# Terzo gioco: audit di riuso

Analisi in sola lettura di `dogana-booleana/` e `pesca-binaria/`. Nessun file dei giochi o chiave modificato.

## Raccomandazione

Usare Dogana Booleana come base tecnica per cifratura, importazione docente, tempo attivo e accessibilità. È più rigorosa di Pesca nei controlli di schema, dimensione, duplicati e gestione del tempo. Riutilizzare moduli piccoli e pattern, non clonare l'intera app a stati di ospiti: somme e prodotti richiedono uno stato didattico proprio.

### Moduli e punti precisi

| Fonte | Riuso | Adattamento necessario |
|---|---|---|
| `dogana-booleana/docs/crypto.mjs` | AES-GCM 256 bit con IV casuale, chiave AES avvolta RSA-OAEP SHA-256; `seal`, `unseal`, `unlock`; controlli su formato, chiave e dimensioni | Nuovo `format`, AAD, errore con nome nuovo gioco e import di un nuovo `validateLog`. Nuova coppia di chiavi; non copiare nessuna chiave privata esistente. |
| `dogana-booleana/docs/clock.mjs` | `DecisionClock`: `reset`, `resume`, `pause`, `elapsed`, `remaining`, `expired`; clock iniettabile per test | Riutilizzabile quasi invariato. Avviare solo quando il giocatore può agire; fermare durante animazioni bloccanti, aiuto, dialoghi, scheda nascosta. |
| `dogana-booleana/docs/prof.mjs`, funzioni pure iniziali | `mergeLogs`, dedup globale per ID, collisione con dati differenti respinge import intero; `filterReport`; `csvCell` | Separare funzioni pure dal mounting UI. Ricostruire correttezza dal problema e dalle azioni, mai fidarsi di totali inviati dal browser. Sostituire metriche AND/OR/NOT con riporto, colonna, prodotto parziale e allineamento. |
| `dogana-booleana/docs/audio.mjs` | WebAudio originale, niente risorse esterne, sblocco su gesto, spegnimento musica | Nuovi suoni distinti per fusione/riporto, avanzamento di colonna, scelta del prodotto parziale, consegna. Non inizializzare AudioContext prima del gesto utente. |
| `dogana-booleana/docs/app.mjs` | Persistere immediatamente errore e stato prima dell'animazione; bloccare input nel feedback; identità studente bloccata dopo primo tentativo; cambio studente con salvataggio | Non copiare i riferimenti a ospiti/livelli. Snapshot completo dello stato aritmetico e tempo attivo. Distinguere nuovo esercizio, ripetizione e correzione. |
| `dogana-booleana/docs/index.html`, `style.css` | HTML semantico, pulsanti 44+ px, focus visibile, dialog nativo, annunci live, riduzione animazioni | Ogni azione deve funzionare anche al tap e con tastiera. Drag-and-drop può essere aggiuntivo ma mai obbligatorio. |
| `pesca-binaria/docs/app.mjs`, `effects.mjs` | Separazione azione / animazione e oggetti che si spostano fisicamente verso una rappresentazione numerica | Buon principio visivo: il riporto deve effettivamente passare alla colonna sinistra e il prodotto parziale spostarsi di posizione; non semplice cambio del testo. |

## Schema minimo consigliato del LOG

Envelope cifrato come Dogana, con formato proprio. Payload versionato:

```js
{
  format: 'nuovo-gioco-log', version: 1, rulesVersion: 1,
  exportedAt: 'ISO date',
  student: { name: '...', className: '...' },
  attempts: [{
    id: 'UUID', sessionId: 'UUID', exerciseId: 'stable ID',
    retryOf: null, // ID dell'esercizio/tentativo precedente, se ripetuto
    at: 'ISO date', mode: 'campaign', level: 1,
    operation: 'add', // add | multiply
    operands: [7, 5], width: 5,
    status: 'completed', // completed | abandoned | timeout
    activeMs: 14500,
    assistance: { hints: 0, workedExample: false },
    actions: [
      { seq: 0, kind: 'column', column: 0, digit: 0, carry: 1,
        activeAtMs: 3500 },
      { seq: 1, kind: 'partial', multiplierBit: 1, included: false,
        shift: 1, value: 0, activeAtMs: 6000 },
      { seq: 2, kind: 'submit', value: 12, activeAtMs: 14500 }
    ]
  }]
}
```

Questo è uno schema semantico da adattare alla meccanica scelta: registrare solo le azioni che l'interfaccia richiede davvero. Per una meccanica di fusione di token, usare `merge` con colonna e stato prima/dopo; per una scelta di bit usare `column`; non inventare evidence di passaggi non svolti. Un `correct` salvato può essere utile come cache, ma va verificato rigiocando le azioni rispetto agli operandi. Registrare azioni errate e corrette, senza cancellare gli errori dopo il retry.

### Competenze ricavabili senza sovrainterpretare

- Somma: correttezza del risultato, correttezza al primo tentativo per colonna; riporti creati correttamente, riporti propagati, catene di riporto; esempi con e senza riporto separati.
- Moltiplicazione: distinzione bit 0/1 del moltiplicatore; scelta corretta dei prodotti parziali; shift/allineamento; somma finale dei parziali.
- Autonomia: tentativi senza aiuti e con aiuti separati; correttezza prima di una correzione distinta dal completamento finale.
- Progresso: confronto per fasce di difficoltà e tipo di problema, non solo percentuale globale.
- Tempo: tempo attivo di decisione per esercizio, mediana per famiglia e correttezza. Non equivale a tempo di studio né misura l'attenzione. La precisione didattica ha priorità sulla velocità.

Se il gameplay fa eseguire automaticamente il riporto o lo shift, il log non può dimostrare che lo studente lo sappia scegliere: cambiare meccanica o limitare esplicitamente la competenza inferita. Non valutare una singola colonna corretta come esercizio completo.

## Rischi da risolvere nel design

1. **Indovinare tramite mosse uniche**: se l'unica fusione possibile è sempre evidenziata, il giocatore può completare senza aritmetica. Alternare brevi decisioni, pianificazione e livelli con più mosse legali; togliere gli aiuti gradualmente.
2. **Larghezza e overflow**: riservare sempre una colonna extra per la somma e fino alla somma delle larghezze per i prodotti. Mai perdere il riporto finale. Per smartphone limitare le cifre o rendere la colonna attiva focalizzata; numeri maggiori non devono imporre bottoni minuscoli.
3. **Falsa competizione**: non mescolare allenamento/campagna, aiuti/non aiuti, problemi di difficoltà diversa. Premiare precisione e miglioramento oltre alla velocità.
4. **Ricarica per cancellare errori**: scrivere azione ed errore prima di animare; ripresa conserva lo stesso problema, errori e tempo accumulato.
5. **Report frontend**: la cifratura protegge la riservatezza dei contenuti; non certifica l'autenticità dell'attività contro chi sa manipolare il client. Non dichiarare LOG non falsificabile. La chiave docente non rende segreta la pagina HTML pubblica: abilita la decifratura locale.
6. **Dati personali**: nome/classe solo nel payload cifrato, non in telemetria o richieste esterne. Il nome del file può contenere il nome per la consegna come nei giochi precedenti, ma il contenuto envelope non deve contenerlo in chiaro. Stato locale leggibile solo come normale storage del browser, senza promettere cifratura locale.
7. **Import batch**: limite file, numero tentativi, durata e grandezza; CSV anti-formula; stringhe visualizzate con textContent/escaping; import completamente atomico quando un log non è valido.

## Test indispensabili

- Core aritmetico: tutti i casi di colonna 0+0, 0+1, 1+1, 1+1+riporto; riporto a catena (7+1); risultato che cresce di cifra; prodotti per 0 e 1, potenze di due, moltiplicatore con zero interno (es. 5), parziali multipli e riporto nella loro somma.
- Replay: un'azione scorretta non può risultare corretta manipolando un campo `correct`; indici negativi/fuori range, valori non interi, sequenze duplicate, timestamp non monotoni e overflow rifiutati.
- UI/stato: doppio tap/tasto non duplica azioni; aiuto e pause fermano il clock; reload dopo errore e durante animazione riprende senza eliminare errori; cambio studente non rinomina storico; errore di storage è visibile; download fallito lascia report disponibile.
- Crypto: round trip reale, IV diversi, chiave errata, ciphertext alterato, formato/chiave ID errati, nessuna chiave privata in docs o git. Basare la suite su `dogana-booleana/tests/report.test.mjs`.
- Report: esportazioni sovrapposte deduplicate; stesso ID con contenuto diverso respinto; import invalido non altera report esistente; campagna/allenamento separati; tempi ricostruiti; CSV protetto.
- Browser reale: 360×640 e 390×844, desktop, touch e tastiera; contrasto e numeri leggibili; nessuna dipendenza esclusiva dai colori; reduced-motion; dialog focus e pulsanti sempre raggiungibili; visita statiche con prefisso GitHub Pages; niente URL assoluti /assets.

## Limite dell'audit

Sono stati letti i moduli e le prove esistenti indicati, senza eseguire test né visitare il browser: questo rapporto è una raccomandazione di riuso, non una nuova certificazione di correttezza dei due giochi.
