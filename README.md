# Officina Orbitale

Un'officina spaziale per allenare **somme e moltiplicazioni binarie**. Solo frontend statico, mobile first, pronto per GitHub Pages. Nessun account, backend, CDN o telemetria.

## Avvio locale

Su questo Mac, apri `Avvia.command`. In alternativa, dalla cartella del repository:

```sh
python3 -m http.server 8774 --bind 127.0.0.1 --directory docs
```

Apri `http://127.0.0.1:8774/`. La pagina docente è `http://127.0.0.1:8774/prof.html`.

Non aprire `index.html` direttamente come file: i moduli JavaScript e la chiave pubblica richiedono un server locale oppure HTTPS. La pubblicazione non è stata effettuata.

## Pubblicazione su GitHub Pages

1. Crea un repository GitHub e collegalo alla copia locale.
2. Pubblica il ramo scelto.
3. In **Settings → Pages**, scegli **Deploy from a branch**, il ramo e la cartella **/docs**.
4. Attendi la pubblicazione e apri l'indirizzo assegnato da GitHub.

Tutti i percorsi sono relativi: funziona anche sotto il prefisso `/officina-orbitale/`. Pubblica soltanto i file del repository. La **chiave privata docente deve rimanere fuori dal repository**.

## Come si gioca

- **Somme:** ogni tubo rappresenta una colonna binaria. Tocca un tubo con almeno due capsule: due unità diventano una nella colonna immediatamente a sinistra. È il riporto. Imposta personalmente i bit del risultato e lancia il carico.
- **Moltiplicazioni:** leggi da destra ogni bit del moltiplicatore. Scegli una copia oppure una riga zero, sposta la copia nella posizione corretta e caricala. I prodotti parziali alimentano il reattore e vengono sommati.
- **Previsione:** più avanti il reattore è coperto. Puoi prevedere il risultato oppure aprirlo come aiuto registrato.
- Ogni missione contiene tre carichi e tre vite. Sono presenti 20 missioni con casi intenzionali, tre ambientazioni, effetti sonori e animazioni. **Spazio infinito** si sblocca solo al completamento della ventesima missione.
- **Allenamento** è separato: scegli somme o prodotti, senza timer. Le impostazioni del gioco contengono soltanto suoni, musica e animazioni.
- Dalla quinta missione il conto alla rovescia assegna un **bonus propulsore** per un carico corretto al primo tentativo entro il tempo. La scadenza non toglie vite e non interrompe il lavoro. Precisione e completamento restano distinti dalla velocità.
- Il salvataggio è locale al browser. Puoi interrompere e riprendere mantenendo errori, vite e tempo. L'identità dello studente rimane associata allo storico; il cambio studente richiede di salvare prima il LOG.

Il gioco arriva a risultati di 8 bit (255). Non include AND/OR bit a bit: questa versione mantiene il focus sulle due operazioni richieste.

## Consegna e area docente

Dalla base scegli **Il mio LOG → Scarica il file LOG**. Se il browser blocca il salvataggio, espandi l'alternativa e copia il contenuto cifrato in un file `.LOG`. I carichi in corso vengono inclusi dopo il completamento o l'abbandono, evitando export con lo stesso identificatore e contenuti diversi.

L'area docente importa la chiave privata e uno o più LOG, ricostruisce le azioni, elimina le sovrapposizioni e separa campagna, allenamento e modalità infinita. Offre dettaglio dei passaggi e CSV. Vedi [GUIDA-DOCENTE.md](GUIDA-DOCENTE.md).

## Struttura e verifica

- `docs/core.mjs`: operazioni, casi della campagna, fusioni, prodotti parziali e replay.
- `docs/app.mjs`: interfaccia, salvataggio, aiuti e ciclo di gioco.
- `docs/art.mjs`, `style.css`, `audio.mjs`: grafica, animazioni e suoni.
- `docs/clock.mjs`: tempo di interazione in primo piano.
- `docs/report.mjs`, `crypto.mjs`, `prof.*`: LOG, cifratura e osservatorio docente.
- `tests/`: matematica, replay, cifratura e regressioni del ciclo di vita.
- `design/`: mockup, confronto delle meccaniche, piano e revisioni.

```sh
npm test
```

La suite usa soltanto Node.js e i suoi moduli standard. Le prove crittografiche usano la chiave reale se presente nel percorso locale separato; altrimenti generano una coppia temporanea per il test.

Il file [design/qa.md](design/qa.md) descrive le verifiche svolte e i limiti reali. I LOG non certificano l'autenticità contro manipolazioni del client; il tempo attivo non misura attenzione o tempo di studio.
