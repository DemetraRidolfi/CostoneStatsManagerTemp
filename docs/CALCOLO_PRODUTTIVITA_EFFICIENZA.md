# Schema di Calcolo: PRODUTTIVITÀ ed EFFICIENZA

Questo documento descrive in dettaglio come vengono calcolati i valori di **PRODUTTIVITÀ** ed **EFFICIENZA** nell'applicazione CostoneStatsManager.

---

## Tipi di Azione Registrabili

Prima di descrivere i calcoli, è importante comprendere i tipi di azioni che possono essere registrate durante una partita:

| Tipo Azione | Codice | Descrizione |
|-------------|--------|-------------|
| Canestro da 2 punti | `made2` | Tiro da 2 punti realizzato |
| Canestro da 3 punti | `made3` | Tiro da 3 punti realizzato |
| Tiro sbagliato da 2 | `missed2` | Tiro da 2 punti sbagliato |
| Tiro sbagliato da 3 | `missed3` | Tiro da 3 punti sbagliato |
| Fallo subito (rimessa) | `foulInbound` | Fallo subito con rimessa laterale/dal fondo |
| Fallo subito (tiri liberi) | `foulShot` | Fallo subito con tiri liberi (può includere situazioni AND-1) |
| Palla persa | `turnover` | Palla persa/turnover |
| Assist | `assist` | Assist effettuato |
| Nessun impatto | `noImpact` | Azione senza impatto significativo |
| Rimbalzo offensivo | `offensiveRebound` | Rimbalzo offensivo conquistato |

### Proprietà Aggiuntive delle Azioni

Alcune azioni possono avere proprietà aggiuntive:

- **`offensiveRebound`** (boolean): Indica se dopo un tiro sbagliato è stato conquistato un rimbalzo offensivo
- **`freeThrowPoints`** (number): Punti realizzati ai tiri liberi (0, 1, 2 o 3)
- **`and1Points`** (number): Punti del canestro in una situazione di AND-1 (2 o 3)
- **`hasAssist`** (boolean): Indica se l'azione è stata assistita da un compagno

---

## EFFICIENZA (Efficacia)

### Definizione
L'**EFFICIENZA** rappresenta la percentuale di azioni che terminano con un esito positivo (realizzazione di punti).

### Formula

```
EFFICIENZA = (Azioni Positive / Azioni Rilevanti) × 100
```

### Azioni Rilevanti (Denominatore)
Tutte le azioni **ESCLUSE**:
- `noImpact` (nessun impatto)
- `foulInbound` (fallo subito con rimessa)

### Azioni Positive (Numeratore)
Vengono conteggiate come positive le seguenti azioni:

| Tipo Azione | Condizione | Conteggio |
|-------------|------------|-----------|
| `made2` | Sempre | +1 |
| `made3` | Sempre | +1 |
| `foulShot` con AND-1 | `and1Points > 0` | +1 |
| `foulShot` con tiri liberi realizzati | `freeThrowPoints > 0` | +1 |

### Esempi di Calcolo Efficienza

**Esempio 1: 10 azioni totali**
- 3 × `made2` → 3 positive
- 2 × `made3` → 2 positive
- 2 × `missed2` → 0 positive
- 1 × `turnover` → 0 positive
- 1 × `foulShot` (1 punto ai liberi) → 1 positiva
- 1 × `foulInbound` → NON contata nelle rilevanti

**Calcolo:**
- Azioni rilevanti = 10 - 1 (foulInbound) = 9
- Azioni positive = 3 + 2 + 0 + 0 + 1 = 6
- **EFFICIENZA = (6 / 9) × 100 = 67%**

**Esempio 2: AND-1**
- 1 × `foulShot` con `and1Points = 2` e `freeThrowPoints = 1`
- Questa è 1 azione positiva (il canestro è stato realizzato con fallo subito)

### Prompt AI per Calcolo EFFICIENZA

Il seguente prompt può essere utilizzato per istruire un sistema AI a calcolare l'EFFICIENZA, indipendentemente dai parametri specifici del codice:

---

> **PROMPT: Calcolo EFFICIENZA nel Basket**
>
> Devi calcolare l'**EFFICIENZA** di un giocatore o schema di gioco nel basket. L'efficienza è una percentuale che misura il rapporto tra azioni che hanno prodotto punti e le azioni rilevanti totali.
>
> **INPUT**: Una lista di azioni/giocate, dove ogni azione ha:
> - Un **tipo** (es: tiro realizzato da 2, tiro realizzato da 3, tiro sbagliato, palla persa, fallo subito con rimessa, fallo subito con tiri liberi, azione senza impatto, ecc.)
> - Eventuali **proprietà aggiuntive** (es: punti ai tiri liberi, punti del canestro in situazione AND-1)
>
> **LOGICA DI CALCOLO**:
>
> 1. **STEP 1 - Filtra le azioni rilevanti**:
>    - ESCLUDI dal conteggio totale le azioni che non hanno impatto significativo sul possesso (es: "nessun impatto", "fallo subito con rimessa laterale")
>    - INCLUDI tutte le altre azioni: tiri realizzati, tiri sbagliati, palle perse, falli subiti con tiri liberi
>
> 2. **STEP 2 - Conta le azioni positive**:
>    Un'azione è POSITIVA se ha prodotto almeno un punto. Conta come positiva:
>    - Ogni tiro da 2 punti realizzato
>    - Ogni tiro da 3 punti realizzato
>    - Ogni situazione AND-1 (canestro + fallo = il canestro è stato realizzato, quindi positivo)
>    - Ogni fallo subito con tiri liberi SE almeno un tiro libero è stato realizzato (punti > 0)
>
> 3. **STEP 3 - Calcola la percentuale**:
>    ```
>    EFFICIENZA = (Numero Azioni Positive / Numero Azioni Rilevanti) × 100
>    ```
>    Arrotonda al numero intero più vicino.
>
> **OUTPUT**: Un valore percentuale intero (0-100).
>
> **ESEMPI**:
> - 5 tiri realizzati su 10 tentativi rilevanti → EFFICIENZA = 50%
> - 3 canestri + 1 AND-1 su 6 azioni rilevanti → EFFICIENZA = 67% (4/6)
> - 0 azioni positive su 5 azioni rilevanti → EFFICIENZA = 0%
>
> **NOTA**: Le azioni "fallo subito con rimessa" (senza tiri liberi) sono escluse dal calcolo perché non rappresentano un tentativo di segnare, ma danno comunque un vantaggio alla squadra (conteggiato nella PRODUTTIVITÀ).

---

## PRODUTTIVITÀ

### Definizione
La **PRODUTTIVITÀ** è un valore numerico che rappresenta il contributo netto di un giocatore o schema, considerando sia le azioni positive che quelle negative.

### Schema dei Valori

| Tipo Azione | Condizione | Valore |
|-------------|------------|--------|
| `made2` | - | **+2** |
| `made3` | - | **+3** |
| `missed2` | Senza rimbalzo offensivo | **-1** |
| `missed2` | Con rimbalzo offensivo (`offensiveRebound = true`) | **-0.5** |
| `missed3` | Senza rimbalzo offensivo | **-1** |
| `missed3` | Con rimbalzo offensivo (`offensiveRebound = true`) | **-0.5** |
| `turnover` | - | **-0.5** |
| `foulInbound` | - | **+0.5** |
| `foulShot` (AND-1) | `and1Points` presente | **+and1Points + freeThrowPoints** |
| `foulShot` (solo TL) | `and1Points` assente | **+freeThrowPoints** |
| `noImpact` | - | **0** |
| `assist` | - | **0** |
| `offensiveRebound` | - | **0** |

### Dettaglio dei Valori

#### Azioni Positive
- **Canestro da 2 (`made2`)**: +2 punti
- **Canestro da 3 (`made3`)**: +3 punti
- **Fallo subito con rimessa (`foulInbound`)**: +0.5 (il fallo subito dà un vantaggio alla squadra)
- **Fallo subito con tiri liberi (`foulShot`)**:
  - **Situazione AND-1**: Il valore è `and1Points + freeThrowPoints`
    - Esempio: Canestro da 2 con fallo e 1 tiro libero realizzato = +2 + 1 = +3
    - Esempio: Canestro da 3 con fallo e 0 tiri liberi = +3 + 0 = +3
  - **Solo tiri liberi**: Il valore è uguale a `freeThrowPoints`
    - Esempio: 2 tiri liberi su 2 = +2
    - Esempio: 1 tiro libero su 2 = +1
    - Esempio: 0 tiri liberi su 2 = 0

#### Azioni Negative
- **Tiro sbagliato da 2 (`missed2`)**: 
  - **-1** se il possesso è perso (nessun rimbalzo offensivo)
  - **-0.5** se la squadra recupera il rimbalzo offensivo (l'opportunità non è completamente persa)
- **Tiro sbagliato da 3 (`missed3`)**:
  - **-1** se il possesso è perso (nessun rimbalzo offensivo)
  - **-0.5** se la squadra recupera il rimbalzo offensivo
- **Palla persa (`turnover`)**: -0.5 (perdita del possesso senza tentativo di tiro)

#### Azioni Neutre
- **Nessun impatto (`noImpact`)**: 0
- **Assist (`assist`)**: 0 (l'assist è registrato come proprietà del tiro realizzato)
- **Rimbalzo offensivo (`offensiveRebound`)**: 0 (il valore è incorporato nella riduzione della penalità del tiro sbagliato)

### Esempi di Calcolo Produttività

**Esempio 1: Partita base**
- 2 × `made2` = +2 × 2 = +4
- 1 × `made3` = +3
- 2 × `missed2` (senza rimbalzo) = -1 × 2 = -2
- 1 × `missed3` (con rimbalzo) = -0.5
- 1 × `turnover` = -0.5
- 1 × `foulInbound` = +0.5

**Calcolo:**
**PRODUTTIVITÀ = 4 + 3 - 2 - 0.5 - 0.5 + 0.5 = +4.5**

**Esempio 2: Situazione AND-1**
- 1 × `foulShot` con `and1Points = 2` e `freeThrowPoints = 1`

**Calcolo:**
**PRODUTTIVITÀ = 2 + 1 = +3**

**Esempio 3: Solo tiri liberi (non AND-1)**
- 1 × `foulShot` con `freeThrowPoints = 2` (2/2 ai TL)

**Calcolo:**
**PRODUTTIVITÀ = +2**

**Esempio 4: Tiri liberi sbagliati**
- 1 × `foulShot` con `freeThrowPoints = 0` (0/2 ai TL)

**Calcolo:**
**PRODUTTIVITÀ = 0**

---

## Riepilogo Visivo

### Tabella Riassuntiva EFFICIENZA

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EFFICIENZA (%)                               │
├─────────────────────────────────────────────────────────────────────┤
│  Formula: (Azioni Positive / Azioni Rilevanti) × 100                │
├─────────────────────────────────────────────────────────────────────┤
│  AZIONI ESCLUSE DAL CALCOLO:                                        │
│  • noImpact                                                          │
│  • foulInbound                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  AZIONI POSITIVE:                                                    │
│  • made2                    ✓                                        │
│  • made3                    ✓                                        │
│  • foulShot (AND-1)         ✓ (se and1Points > 0)                   │
│  • foulShot (TL)            ✓ (se freeThrowPoints > 0)              │
├─────────────────────────────────────────────────────────────────────┤
│  AZIONI NON POSITIVE:                                                │
│  • missed2                  ✗                                        │
│  • missed3                  ✗                                        │
│  • turnover                 ✗                                        │
│  • foulShot (0 punti)       ✗                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Tabella Riassuntiva PRODUTTIVITÀ

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUTTIVITÀ                                  │
├─────────────────────────────────────────────────────────────────────┤
│  VALORI POSITIVI:                                                    │
│  ┌──────────────────┬───────────────────────────────┐               │
│  │ made2            │ +2                            │               │
│  │ made3            │ +3                            │               │
│  │ foulInbound      │ +0.5                          │               │
│  │ foulShot (AND-1) │ +and1Points + freeThrowPoints │               │
│  │ foulShot (TL)    │ +freeThrowPoints              │               │
│  └──────────────────┴───────────────────────────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  VALORI NEGATIVI:                                                    │
│  ┌──────────────────┬───────────────────────────────┐               │
│  │ missed2/missed3  │ -1 (senza rimbalzo offensivo) │               │
│  │ missed2/missed3  │ -0.5 (con rimbalzo offensivo) │               │
│  │ turnover         │ -0.5                          │               │
│  └──────────────────┴───────────────────────────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  VALORI NEUTRI (0):                                                  │
│  • noImpact                                                          │
│  • assist (registrato come proprietà)                                │
│  • offensiveRebound (incorporato nel tiro sbagliato)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Interpretazione dei Valori

### Efficienza
| Range | Valutazione | Colore UI |
|-------|-------------|-----------|
| ≥ 60% | Eccellente | 🟢 Verde |
| 40-59% | Nella media | 🟡 Giallo/Ambra |
| < 40% | Da migliorare | 🔴 Rosso |

### Produttività
| Range | Valutazione | Colore UI |
|-------|-------------|-----------|
| ≥ 2.0 | Eccellente | 🟢 Verde |
| 0 - 1.9 | Nella media | 🟡 Giallo/Ambra |
| < 0 | Da migliorare | 🔴 Rosso |

---

## Note Tecniche

- Le funzioni di calcolo sono definite in `src/utils/pdf/statistics.ts`
- I valori sono arrotondati: l'efficienza è arrotondata all'intero più vicino, la produttività a una cifra decimale
- Il rimbalzo offensivo mitiga la penalità del tiro sbagliato da -1 a -0.5
- Il fallo subito con rimessa (`foulInbound`) contribuisce positivamente alla produttività (+0.5) ma non viene contato nel calcolo dell'efficienza
