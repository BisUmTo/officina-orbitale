# LOG e osservatorio docente — integrazione

## API pubbliche

`docs/report.mjs` importa soltanto il core matematico, senza DOM.

- `validateLog(log)` restituisce **l’input originale** dopo verifica, oppure lancia un errore. Non corregge e non muta dati. Formato `officina-orbitale-log`, versione 1. Date canoniche `new Date().toISOString()`. Identificatori non vuoti max 150 caratteri; nome max 120 e classe max 80. Campagna, allenamento e infinita usano `campaign`, `training`, `infinite`; livello intero 1–20. Tempi interi in millisecondi, durata massima sette giorni per tentativo. Max 50.000 tentativi per LOG, max 10.000 azioni per tentativo. `seq` deve essere contigua e **partire da 0**; `activeAtMs` monotono (uguaglianze ammesse) e compreso tra zero e `activeMs`. Ogni problema deve avere la larghezza esatta del core e risultato <=255. Ogni azione viene rigiocata: un errore matematico è ammesso e contato, una forma malformata è respinta. Stato `completed` richiede un lancio corretto; `abandoned` richiede nessun completamento. Qualunque azione dopo il completamento è respinta. `partial.row` è facoltativo; se presente deve corrispondere al parziale corrente.
- `replayAttempt(attempt)` restituisce metriche matematiche: `completed, errors, merges, mergeErrors, partialCorrect, partialErrors, partialValueErrors, partialShiftErrors, submitCount, submitErrors, hints, firstTry, independent, expected`. Tutti i flag correttezza inviati dal client sono ignorati. È un helper per un tentativo già validato.
- `mergeLogs(existingLogs, newLog?)` restituisce un nuovo **array di LOG**: aggiunge il LOG facoltativo, valida tutta la collezione, deduplica globalmente per ID e copia gli oggetti. Non muta gli array sorgente. Un ID con dati del tentativo differenti o identità differente respinge tutta la chiamata. Ordine delle chiavi JSON irrilevante; l’identità viene normalizzata per spazi e maiuscole. Metadati di esportazione diversi sono ammessi. I LOG restituiti contengono solo i tentativi non ancora incontrati; file privi di nuovi tentativi vengono omessi. Max 1.000 LOG e 250.000 tentativi unici.
- `summarize(logs)` accetta **LOG[]**, validandoli e deduplicandoli. Restituisce `{students, total, studentCount, duplicates}`. Ogni riga `students` è una identità **più una modalità esatta**; campagna, allenamento e infinita non vengono mescolati. Campi riga: `key, studentKey, name, className, mode, attempts, sessions`, metriche aggregate, `completionRate, firstTryRate, medianActiveMs, medianCompletedMs, byOperation:{add,mul}, byLevel`. `firstTry` e `independent` sono conteggi; `hints` conta aperture aiuto. `attempts` contiene le metriche ricalcolate nel campo `metrics`. Conservare i LOG originali quando si vuole conoscere `duplicates`: l’array già deduplicato ha zero duplicati.
- `csvCell`, `buildCSV(rows)` producono CSV con BOM, separatore punto e virgola, CRLF, escaping delle virgolette e protezione formule. Passare righe `summarize(...).students`, anche filtrate. `escapeHTML` supporta la visualizzazione sicura.

## Esportazione dal gioco

```js
import {validateLog, summarize} from './report.mjs';
import {seal} from './crypto.mjs';
const payload = {
  format:'officina-orbitale-log', version:1,
  exportedAt:new Date().toISOString(),
  student:{name, className}, attempts
};
validateLog(payload);
const envelope = await seal(payload, publicJwk);
// JSON.stringify(envelope) per download .json o .LOG
const rows = summarize([payload]).students;
```

`crypto.mjs` esporta `seal(log, publicJwk)`, `unseal(envelope, privateKey)`, `unlock(privateJwk, publicJwk)`, `importPublic`, `importPrivate`, `to64`, `from64`. Envelope `{format:'officina-orbitale', version:1, keyId, iv, wrappedKey, ciphertext}`. AES-GCM 256, IV casuale 12 byte, RSA-OAEP SHA-256 3072 bit, AAD **officina-orbitale-v1**. Payload massimo circa 47 MB; envelope massimo 64 MB. `unseal` valida il payload dopo decifratura. `unlock` verifica corrispondenza alla chiave pubblica e prova crittografica di apertura.

## Chiavi e privacy

Chiave pubblica nuova: `docs/public-key.json`. La privata è esclusivamente nel percorso fratello `../output/officina-orbitale-private/chiave-privata-docente.json`, permessi 0600; la directory è 0700. Non è parte di `terzo-gioco-binario`, non è stata stampata e non va pubblicata. `tools/keygen.mjs` rifiuta sovrascritture di chiavi preesistenti. La cifratura protegge riservatezza, non attesta autenticità delle azioni.

`prof.html` e `prof.mjs` sono frontend statici con risorse relative. Un’importazione multipla è atomica: tutti i file selezionati vengono decifrati e la collezione prospettica validata prima di assegnare il nuovo report. Errori visibili conservano il report precedente. Chiave e LOG non sono salvati in storage e non vengono inviati a servizi esterni. CSV esporta solo righe filtrate; il dettaglio mostra tutti i tentativi e ogni azione. Layout navy/turchese/arancio, responsive, pulsanti >=44 px, focus visibile, stato aria-live e dialog nativo.

## Interpretazione didattica

Completamento, risultato al primo tentativo, errori, aiuti, fusioni e parziali sono distinti. Le fusioni valide sono operazioni eseguite, non prova di una scelta autonoma del riporto generato. Tempo attivo è tempo registrato dal gioco, non attenzione o studio. Gli errori parziali di scelta e di allineamento sono ricalcolati dalle ragioni del core; altri errori di fase restano nel totale `partialErrors`.

## Verifica

`node --test tests/report.test.mjs`: otto gruppi di test passati con la nuova coppia reale RSA3072. Coperti replay senza fidarsi di flag client, stato incoerente, seq/tempi invalidi, azioni dopo completamento, parziali/allineamento, dedup globale e conflitto atomico, identità+modalità, mediane, CSV antifomula/HTML escaping, roundtrip cifrato, IV casuali, chiave errata, formato/ID errati e ciphertext alterato. Quando la chiave privata reale non è disponibile (clone o CI), la suite verifica comunque la pubblica distribuita e usa una coppia RSA3072 temporanea per la prova crittografica.

## Scaffolding e snapshot immutabili

`attempt.scaffold` è facoltativo, ma quando presente deve essere `reactor` o `prediction`; nel dettaglio viene mostrato come Reattore guidato / Previsione. Per LOG precedenti senza campo, `scaffoldOf(attempt)` deriva il valore dalla progressione della missione (`mission(level).predict`), con allenamento sempre guidato. `independent` rimane la metrica tecnica hints===0, etichettata “senza aiuti richiesti”: il reattore guidato iniziale non conta come aiuto richiesto e non dimostra assenza di scaffolding. Confrontare livelli e modalità equivalenti. Il gioco esporta solo tentativi chiusi o abbandonati, escludendo il tentativo attivo, per preservare snapshot immutabili dello stesso ID.
