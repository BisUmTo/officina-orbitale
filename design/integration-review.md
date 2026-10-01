# Revisione indipendente dell'integrazione

Ambito: `docs/app.mjs`, `docs/clock.mjs`, `docs/report.mjs`, `docs/crypto.mjs`, `docs/prof.mjs`, test del core e del report. Revisione in sola lettura dei file di prodotto; le correzioni durante la revisione sono state applicate dall'agente principale.

## Finding e stato finale

1. **P2, risolto — Completamento perso cambiando attività dopo il terzo carico.** In origine lo sblocco avveniva solo premendo il pulsante della schermata riepilogativa. Tornare alla base e iniziare un allenamento cancellava il riepilogo senza assegnare il completamento. Ora `finishOrder()` registra immediatamente completamento e sblocco. Smoke test indipendente con DOM simulato: tre carichi della missione 1 → `completed=[1]`, `unlocked=2`; iniziare l'allenamento conserva entrambi.
2. **P2, risolto — Aiuto dalla base non registrato sul carico sospeso.** Il vecchio controllo `view==='game'` permetteva Pausa → base → Come si gioca → ripresa senza alcun hint nel LOG. Ora `help()` registra l'aiuto quando esiste un carico attivo. Smoke test indipendente: l'azione aumenta di uno anche dalla base.
3. **P2, risolto — Contenuto del reattore coperto disponibile al lettore schermo.** Le capsule e le etichette con il loro numero restavano accessibili dietro la copertura visiva. Il markup aggiornato applica `aria-hidden="true" inert` alla tavola durante la previsione e mantiene separato il pulsante che registra l'apertura come aiuto. Verificata la correzione nel codice; non eseguita una sessione con lettore schermo reale.
4. **P2, risolto — Snapshot esportato esposto a cambi di stato durante le attese.** Il riferimento ai tentativi veniva catturato prima di `await`, mentre l'identità veniva letta dopo il recupero della chiave. Ora tentativi e identità sono copiati prima della prima attesa; anche il nome del download usa lo snapshot. L'export comprende solo tentativi conclusi/abbandonati, evitando collisioni tra un ID esportato in corso e lo stesso ID completato successivamente. Correzione verificata nel codice.

**Nessun finding bloccante aperto nell'ambito esaminato.**

## Verifiche

- Suite completa aggiornata: **15 test superati, 0 falliti**, eseguita con `/Users/delugan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs`.
- Smoke test dell'app mediante import dinamico e DOM/storage simulati, senza modificare il prodotto: errore salvato subito; nuova istanza dell'app conserva azione e due vite; altri due errori archiviano il tentativo come abbandonato con tre azioni e nessun carico attivo.
- Verifica indipendente di `DecisionClock` con sorgente temporale controllata: intervalli in pausa esclusi, ripresa cumulativa corretta.
- Lettura dei controlli runtime: tempo fermato da modali, scheda nascosta e pagehide; ripresa subordinata a vista gioco, carico attivo, assenza di animazione bloccante e dialogo chiuso. Durante il riporto le azioni di gioco sono bloccate; pausa e impostazioni restano disponibili.
- Report docente: replay dei dati matematici, rifiuto delle azioni successive al completamento, sequenza e tempi validati; dedup globale atomico, conflitti respinti e input preservati; campagne/allenamento/infinito separati; scaffold indicato nel dettaglio.
- Crittografia e output: test di roundtrip RSA3072/AES-GCM, IV distinti, chiave errata e contenuto alterato respinti; CSV protetto da formule e testo HTML escapato.

## Limiti della verifica

La verifica automatica dell'app usa un DOM simulato: non certifica disposizione mobile, gestione reale del focus, download nei browser o annunci delle tecnologie assistive. Questi aspetti restano parte della QA browser dell'agente principale. Nessuna chiave privata è stata copiata nel report o nei file del prodotto.

## Verdetti

**Spec:** i flussi esaminati rispettano persistenza, vite, separazione dei report, ricalcolo delle azioni e sospensione del tempo; i problemi individuati risultano risolti nella versione riesaminata.

**Qualità:** approvata per l'ambito logico e di integrazione esaminato, con verifica browser separata necessaria per le caratteristiche propriamente visuali e di accessibilità.
