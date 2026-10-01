# Revisione indipendente del core

Ambito: `design/spec.md`, `docs/core.mjs`, `tests/core.test.mjs`; lettura aggiuntiva del confine di validazione in `docs/report.mjs` e dei controlli in `docs/app.mjs`. Nessun file di prodotto modificato.

## Finding prioritizzati

- **P3 — Dominio dello shift più permissivo della specifica** (`docs/core.mjs:27`). La specifica di gameplay limita l'allineamento a 0–3, e l'interfaccia applica questo limite, ma il core accetta 0–7. Riproduzione: `applyMove(createPuzzle(makeProblem('mul',5,0)), {kind:'partial',include:false,shift:7}).correct` restituisce `true`. Una riga zero con shift 7 può quindi essere accettata dal replay pur essendo un'azione non producibile dall'interfaccia prevista. Non altera il valore matematico né blocca missioni normali. Allineare il dominio del validatore a quello del gioco, oppure documentare esplicitamente il dominio generico 0–7 del core e imporre 0–3 al confine dei log del gioco.

Nessun finding P0/P1/P2 riscontrato nel core.

## Evidenze

- Suite ufficiale eseguita con il Node indicato: **7 test su 7 superati**.
- Verifica indipendente esaustiva di **34.864 coppie valide**, con entrambi gli operandi 0–255 e risultato ≤255, per somme e prodotti: energia conservata, tutti i prodotti parziali caricati, normalizzazione corretta, risultato accettato. Questa verifica estende gli intervalli della suite (somme 0–127, prodotti 0–15).
- Le fusioni della verifica indipendente scelgono la colonna legale più alta, mentre la suite sceglie la più bassa: nessuna dipendenza impropria dall'ordine dei riporti riscontrata.
- Zero, prodotto per zero, bit zero interni, larghezze 4–8 e risultato 255 coperti. Lo shift è correttamente irrilevante quando il valore della riga è zero; l'inclusione continua a verificare il bit del moltiplicatore.
- Gli errori matematici non consumano righe e mantengono lo stato. Le transizioni producono nuovi array senza mutare gli input. La suite controlla inoltre input congelati.
- Le 20 missioni rispettano numero di ordini, tetto 255, settori, timer dalla quinta e ruling sulla previsione (6–8 e 15–20); la sequenza di casi introduce riporti singoli/catene, shift, zeri interni e operazioni miste.
- Azioni malformate e vincoli numerici sono respinti; correttezza dichiarata dal client ignorata. `seq`, timestamp e azioni successive al completamento sono verificati dal livello report: non sono quindi segnalati come omissioni del core.

## Verdetti distinti

**Spec:** conforme per matematica, stato, immutabilità e scaffolding delle missioni; una discrepanza minore nel dominio di shift documentata sopra.

**Qualità:** approvato, senza difetti bloccanti riscontrati. Il core è piccolo e puro; le verifiche esaustive indipendenti confermano i risultati oltre gli intervalli attualmente presenti nei test persistenti. Utile conservare nel repository almeno casi di confine con operandi >127 e risultato 255, oggi verificati solo durante questa revisione.
