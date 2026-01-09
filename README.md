# Photo Mechanic Team TXT Generator

Desktop aplikacija za generisanje formatiranih TXT fajlova za Photo Mechanic code replacements. Aplikacija je dizajnirana za sportske fotografije koji trebaju brzo kreirati liste igrača u formatu kompatibilnom sa Photo Mechanic softverom.

## Funkcionalnosti

- **Višestruki načini unosa**: Zalijepite tekst, unesite ručno ili učitajte PDF
- **Pametan parser**: Automatski prepoznaje različite formate igrača:
  - `7 Ivan Horvat`
  - `Ivan Horvat (7)`
  - `7h Ivan Horvat`
  - `Ivan Horvat - 7`
- **Editable tabela**: Inline editing za brze izmene podataka
- **Auto-preview**: Vidite kako će izgledati eksportovani fajl prije eksporta
- **Autosave**: Podaci se automatski čuvaju lokalno
- **Dark mode**: Moderni, tamni interfejs prilagođen fotografima

## Tehnologije

- **Framework**: Tauri (Rust + WebView)
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Lokalni JSON fajlovi

## Instalacija

### Preduvjeti

- Node.js (v18 ili noviji)
- Rust (najnovija stabilna verzija)
- npm ili yarn

### Instalacija Rust-a

Ako nemate Rust instaliran, možete ga instalirati koristeći `rustup`:

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Windows:**
Preuzmite i pokrenite [rustup-init.exe](https://rustup.rs/)

Nakon instalacije, restartujte terminal ili pokrenite:
```bash
source $HOME/.cargo/env
```

Proverite instalaciju:
```bash
rustc --version
cargo --version
```

### Koraci

1. Klonirajte ili preuzmite projekat
2. Instalirajte dependencies:
```bash
npm install
```

3. Pokrenite development server:
```bash
npm run tauri:dev
```

4. Za build produkcijske verzije:
```bash
npm run tauri:build
```

**Napomena:** Prvi put kada pokrenete `tauri:dev`, Rust će automatski preuzeti i kompajlirati sve potrebne dependencies, što može potrajati nekoliko minuta.

## Korištenje

Aplikacija koristi hijerarhijsku strukturu: **Sport → Utakmica → Momčad → Igrači**

1. **Kreirajte sport**: Kliknite na "Novi Sport" i unesite naziv sporta (npr. "Nogomet", "Košarka")
2. **Kreirajte utakmicu**: Odaberite sport, zatim kliknite "Nova Utakmica" i unesite datum i opis
3. **Kreirajte momčad**: Odaberite utakmicu, zatim kliknite "Nova Momčad" i unesite naziv i team code
4. **Dodajte igrače**: 
   - Zalijepite listu igrača u tekstualno polje ili
   - Unesite igrače ručno jedan po jedan
5. **Uredite podatke**: Kliknite na "Uredi" za bilo kojeg igrača da izmijenite podatke
6. **Eksportujte**: Kliknite na "Eksportuj TXT Fajl" da generišete fajl za Photo Mechanic

## Format eksporta

Eksportovani TXT fajl koristi sledeći format:
```
{team_code}{player_number}\t{first_name} {last_name} ({player_number})
```

Primjer:
```
HRV7	Ivan Horvat (7)
HRV10	Marko Petrov (10)
```

Fajl je tab-separated i spreman za direktno korištenje u Photo Mechanic code replacements.

## Podržani formati unosa

Aplikacija automatski prepoznaje sledeće formate:

- `7 Ivan Horvat` - broj na početku
- `Ivan Horvat (7)` - broj u zagradama na kraju
- `7h Ivan Horvat` - broj sa sufiksom
- `Ivan Horvat - 7` - broj nakon crtice

Redovi koji ne odgovaraju nijednom formatu će biti označeni kao nevalidni i možete ih ručno ispraviti u tabeli.

## Struktura podataka

Aplikacija čuva podatke u lokalnim JSON fajlovima:
- `sports.json` - Lista svih sportova
- `matches.json` - Lista svih utakmica
- `teams.json` - Lista svih momčadi
- `players-{team_id}.json` - Lista igrača za svaku momčad

Hijerarhija: Sport → Utakmica → Momčad → Igrači

## Buduća proširenja

- Podrška za više ekipa po eventu
- Polje za poziciju igrača
- Sortiranje po broju igrača
- Preset team code-ovi
- Direktan export u Photo Mechanic code replacement format

## Licenca

MIT
