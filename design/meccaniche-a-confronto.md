# Terzo gioco: confronto delle meccaniche

## Vincoli e scelta

Gioco statico, mobile first, per esercitare somme e moltiplicazioni binarie. Il giocatore deve compiere riporti, riconoscere prodotti nulli e allineare prodotti parziali; il punteggio non deve limitarsi a misurare l'inserimento di una risposta finale. Quattro ore rendono ragionevole un unico sistema di gioco riutilizzato in entrambe le operazioni, con venti missioni curate e una forte direzione artistica.

**Scelta consigliata: Cantiere Bit, un'officina di piccoli veicoli spaziali alimentati da carichi binari.** Le cariche arrivano su corsie di valore 1, 2, 4, 8…; due cariche uguali si compattano in una carica della corsia immediatamente a sinistra. La moltiplicazione prepara più carichi traslati, che vengono poi lavorati con la stessa meccanica. L'astronave costruita e il lancio sono la ricompensa visiva: la somma non è un minigioco estraneo alla costruzione.

## Tre alternative confrontate

| Proposta | Azione principale | Punti forti | Rischio | Entro quattro ore |
|---|---|---|---|---|
| **Cantiere Bit** | Compattare coppie e trasportare il riporto; allineare e assemblare prodotti parziali | Azioni corrispondenti agli algoritmi scritti; stesso sistema per entrambe le operazioni; grande spazio per animazioni leggibili | Ridursi a toccare tutte le coppie evidenziate | Alta: SVG, CSS e stato discreto, niente fisica reale |
| **Bit Express** | Deviare convogli verso stazioni e accoppiare vagoni; ogni scambio rappresenta una colonna | Ritmo immediato e molte occasioni di errore significativo | Il giocatore può imparare a seguire i binari senza capire i valori; incroci e finestre temporali diventano più difficili dell'aritmetica | Media: routing e tempi richiedono molto collaudo touch |
| **Reattore a circuiti** | Costruire celle con uscita risultato e uscita riporto, poi duplicare/traslare pannelli per i prodotti | Trasferimento verso addizionatori e logica; profondità da puzzle | Anticipa elettronica e porte logiche, allontanandosi dal ripasso richiesto; espressioni visive dense sul telefono | Bassa per un risultato rifinito; buona espansione futura |

Le valutazioni sono valutazioni progettuali, non risultati di test con studenti. Il primo prototipo deve controllare il rischio di automatismo di Cantiere Bit prima di investire in molte illustrazioni.

## Cantiere Bit: ciclo breve

1. Arriva una commessa: per esempio `1011 + 0110`. La nave incompleta aspetta nella parte alta.
2. Le due file di ingresso sono visibili e allineate a destra. Un comando «Carica» trasferisce le unità nelle corsie; la riga di calcolo resta visibile.
3. Il giocatore seleziona due unità della stessa corsia. Queste diventano una capsula di riporto: il giocatore la porta alla corsia subito a sinistra. La trasformazione mostra brevemente `1 + 1 = 10`, senza sostituirsi al gesto.
4. Una singola unità rimasta in una corsia rappresenta `1`; una corsia vuota rappresenta `0`. Tre unità diventano una unità residua e una coppia da riportare.
5. Il giocatore preme «Spedisci» quando pensa che ogni corsia contenga al massimo un'unità. La stringa risultante alimenta la nave: lancio breve, nuovo pezzo/nuova destinazione, commessa successiva.

**Una coppia non cambia valore totale.** Questo invariante deve essere visibile nell'animazione, ma non occorre mostrare il risultato decimale: il compito è il procedimento binario.

### Controlli touch

- Tap sull'unità, tap sulla seconda, tap sulla destinazione del riporto: alternativa completa al trascinamento, utilizzabile anche da tastiera.
- Trascinamento come scorciatoia facoltativa; mai precisione al pixel o dipendenza da pressione prolungata.
- Corsie larghe almeno 44 px; 6 colonne nelle missioni iniziali, fino a 8 nelle successive. Otto colonne occupano 352 px: su schermi più stretti prevedere scorrimento dichiarato oppure layout adattato, non riduzione arbitraria dei bersagli.
- La selezione è annullabile senza penalità. Le animazioni non devono accettare tocchi duplicati né coprire il calcolo successivo.
- Nessun timer nei primi cinque livelli; poi bonus di ritmo facoltativo, mai timer che sottrae tempo mentre il gioco anima o l'app non è visibile.

### Errori reali, senza trappole di interfaccia

Un trasporto confermato alla corsia sbagliata segnala «Questo riporto vale il doppio: una sola colonna a sinistra». La destinazione corretta non lampeggia prima della scelta. Se la consegna contiene ancora una coppia, il gioco indica la prima colonna non normalizzata e permette di riparare. Penalizzare il comando confermato, non il gesto di selezione. Il LOG distingue errore matematico da tentativo di selezionare un oggetto non disponibile.

## Esempio completo di somma

`1011 + 0110 = 10001`.

| Colonna | Unità in ingresso, compresi i riporti | Azione | Bit lasciato |
|---|---:|---|---:|
| 1 | 1 | Si conserva | 1 |
| 2 | 2 | Coppia → un riporto in colonna 4 | 0 |
| 4 | 2 | Coppia → un riporto in colonna 8 | 0 |
| 8 | 2 | Coppia → un riporto in colonna 16 | 0 |
| 16 | 1 | Si conserva | 1 |

La catena di riporti è una catena di trasformazioni visibili. L'ordine da destra a sinistra è consigliato inizialmente, ma un ordine diverso matematicamente valido non è un errore.

## Moltiplicazione: la stessa macchina, con uno stampo

Il moltiplicando è uno stampo binario. I bit del moltiplicatore vengono letti da destra a sinistra:

- bit `1`: produrre una copia dello stampo;
- bit `0`: nessuna copia, ma la posizione avanza comunque;
- ogni posizione successiva richiede una traslazione di una colonna a sinistra.

Il giocatore sceglie «Copia» oppure «Vuoto» e allinea ogni riga su una griglia. Lo spostamento è a scatti; l'interfaccia rende sempre riconoscibile la colonna delle unità. Un comando di conferma carica la riga. Il sistema non decide per il giocatore se il bit è 0 o 1 e non allinea automaticamente nelle missioni successive al tutorial. Le righe zero restano visibili come riferimento, anche se non contengono cariche.

Esempio `101 × 101`:

```text
    000101   copia, posizione 0
    000000   vuoto, posizione 1
  + 010100   copia traslata di 2, posizione 2
  --------
    011001
```

Le due unità nella colonna 4 si fondono e riportano in colonna 8. Rimangono 16 + 8 + 1. L'esempio rende necessari sia il bit zero interno sia il riporto. Un secondo esempio `1011 × 11 = 100001` mette in evidenza una catena di riporti dopo l'allineamento dei due prodotti parziali.

## Come evitare la noia e il clic automatico

Non basta far comparire coppie luminose. Le prime missioni aiutano; le successive tolgono l'evidenziazione e alternano tre tipi di commessa:

1. **Assemblaggio:** procedura completa, breve, con nuovi veicoli e ricompense visive.
2. **Riparazione:** una macchina ha già lavorato, ma ha lasciato un riporto nella colonna sbagliata o un prodotto non allineato. Il giocatore identifica e corregge il difetto. Il calcolo iniziale resta sempre visibile.
3. **Collaudo:** prima del lancio il giocatore compone la riga binaria finale con interruttori; la rappresentazione con cariche può essere consultata come aiuto registrato. Questo passaggio riduce gradualmente la dipendenza dal materiale concreto.

Non rendere ogni esercizio obbligatoriamente un percorso di tre fasi: sarebbe lungo. Assemblaggio nelle prime missioni, poi commesse brevi alternate. La varietà è cognitiva, non soltanto un cambio di sfondo.

La velocità deve dare un premio distinto dalla precisione. Nessuna classifica unica che premi molti tocchi veloci più della comprensione. Evitare mosse massime artificiali: il numero di riporti è spesso imposto dal problema.

## Progressione di venti missioni

Tre o quattro commesse per missione; numeri costruiti per coprire casi, non campionati uniformemente. Risultati entro otto bit. Operandi di somma al massimo 127; moltiplicazioni inizialmente 3×3 bit, poi 4×4 bit.

| Missione | Nuovo obiettivo | Caso significativo |
|---:|---|---|
| 1 | Leggere corsie e bit | `001 + 010`, nessun riporto |
| 2 | Una coppia, un riporto | `001 + 001` |
| 3 | Riporto in colonna interna | `010 + 010` |
| 4 | Unità residua e riporto | `011 + 011` |
| 5 | Catena di riporti | `0111 + 0001` |
| 6 | Più colonne, aiuto ridotto | `1011 + 0110` |
| 7 | Nuova colonna più significativa | `1111 + 0001` |
| 8 | Riparare una somma incompleta | Riporto dimenticato o spostato troppo |
| 9 | Moltiplicazione per 0 e per 1 | `101 × 0`, `101 × 1` |
| 10 | Moltiplicazione per 10 | Una traslazione, `101 × 10` |
| 11 | Due prodotti parziali | `101 × 11` |
| 12 | Zero interno nel moltiplicatore | `101 × 101` |
| 13 | Più di un riporto nel prodotto | `111 × 11` |
| 14 | Prodotti con catena lunga | `1011 × 11` |
| 15 | Distinguere copia e spostamento | `110 × 101`, confronto con errore tipico |
| 16 | Riparare un prodotto | Riga spostata di una colonna |
| 17 | Somme e prodotti alternati | Riconoscere la macchina da usare |
| 18 | Collaudo con aiuto consultabile | Comporre il risultato prima della verifica |
| 19 | Prodotti di quattro bit | `1101 × 1011` e casi sparsi/densi |
| 20 | Consegna finale mista | Somma, catena, prodotto con zero, riparazione |

La modalità infinita si sblocca dopo la missione 20, coerentemente con la preferenza espressa dall'utente per Dogana Booleana. Allenamento separato per scegliere operazione e aiuti. Impostazioni normali: audio, movimento ridotto; niente pannello tecnico esteso.

## Dati utili nel LOG

Per ogni esercizio: operazione e operandi, forma di esercizio, risultato atteso, risultato consegnato, azioni confermate con tempi attivi, numero e posizione dei riporti corretti/errati, allineamenti corretti/errati, scelte copia/vuoto, aiuti consultati, riparazioni, esito, modalità, tempo attivo. Salvare anche schema e versione del gioco.

Il report docente può separare accuratezza di somma, gestione dei riporti, scelta dei prodotti nulli, allineamento dei prodotti parziali, autonomia e tempo attivo. Completare una missione assistita non dimostra automaticamente la capacità di eseguire su carta: distinguere nel report «con aiuti» e «senza aiuti», senza inferire un voto da un solo numero. Cifratura per consegna e privacy coerente con i giochi precedenti; non promettere autenticità inviolabile in un sito interamente statico.

## Taglio di sviluppo e prova decisiva

Prima costruire un singolo ordine di somma e uno di prodotto con grafica provvisoria: `1011+0110`, `101×101`. Entro il primo prototipo verificare che il docente capisca il gesto senza leggere un paragrafo, che tutti i bersagli siano toccabili a 390×844 e che il risultato del gioco sia trascrivibile in colonna. Se l'azione dei riporti sembra soltanto ripetitiva, dare priorità alle missioni di riparazione e collaudo prima di produrre altri sfondi.

Per quattro ore: un ambiente d'officina illustrato, quattro varianti di atmosfera, veicoli SVG modulari e una piccola mascotte meccanica sono più realistici di venti scene completamente diverse. Animazioni originali di fusione, arco del riporto, scorrimento stampo e lancio; suoni Web Audio originali. Salvare energia e tempi per test mobili, log e area docente. AND/OR bit a bit rimangono fuori dalla prima versione: non aiutano il nucleo scelto.
