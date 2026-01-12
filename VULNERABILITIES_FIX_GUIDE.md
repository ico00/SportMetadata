# 🔒 Vulnerabilities Fix Guide

## 📊 Trenutna Situacija

Aplikacija ima **3 vulnerabilities** koje ne mogu biti automatski popravljene:

### 1. **pdfjs-dist** (HIGH severity) ⚠️
- **Trenutna verzija:** `^3.11.174`
- **Preporučena verzija:** `5.4.530` (breaking change)
- **Problem:** Vulnerable to arbitrary JavaScript execution upon opening a malicious PDF
- **Rizik:** **VISOK** - koristi se za parsiranje PDF fajlova u aplikaciji
- **Prioritet:** 🔴 **VISOK** - treba riješiti što prije

### 2. **esbuild/vite** (MODERATE severity)
- **Trenutna verzija vite:** `^5.0.0`
- **Preporučena verzija:** `7.3.1` (breaking change)
- **Problem:** esbuild enables any website to send requests to development server
- **Rizik:** **SREDNJI** - utiče samo na development server, ne na produkciju
- **Prioritet:** 🟡 **SREDNJI** - manje hitno, development-only

---

## 🎯 Preporučeni Plan Akcije

### Faza 1: Riješiti HIGH severity (pdfjs-dist) - PRIORITET

**Preporučujem da prvo riješite pdfjs-dist jer je HIGH severity i koristi se za parsiranje PDF-ova.**

#### Korak 1: Provjerite kompatibilnost

Provjerite dokumentaciju pdfjs-dist za breaking changes između v3 i v5:
- https://github.com/mozilla/pdf.js/releases
- Breaking changes između v3 i v5

#### Korak 2: Ažurirajte pdfjs-dist

```bash
npm install pdfjs-dist@latest
```

Ili ako želite specifičnu verziju:
```bash
npm install pdfjs-dist@5.4.530
```

#### Korak 3: Provjerite korištenje u kodu

Provjerite `src/utils/pdfParser.ts` - možda će trebati ažurirati API pozive ako su se promijenili između v3 i v5.

#### Korak 4: Testirajte

Testirajte PDF upload i parsiranje funkcionalnost.

---

### Faza 2: Riješiti MODERATE severity (vite/esbuild) - MANJE HITNO

**Ovo je manje hitno jer utiče samo na development server, ne na produkciju.**

#### Opcija A: Ažurirajte vite (Breaking changes)

```bash
npm install vite@latest
```

**⚠️ PAŽNJA:** Vite 7 ima breaking changes. Provjerite:
- https://vitejs.dev/guide/migration
- Changelog između v5 i v7

#### Opcija B: Ignorirajte za sada (Development-only)

Ako koristite samo development server lokalno i niste na javnoj mreži, možete ovo privremeno ignorisati jer:
- Utječe samo na development server
- Ne utječe na produkcijski build
- Moderate severity (niži rizik)

---

## 🛠️ Koraci za Rješavanje

### Korak 1: Backup (Preporučeno)

```bash
# Napravite backup package.json
cp package.json package.json.backup
```

### Korak 2: Ažurirajte pdfjs-dist

```bash
npm install pdfjs-dist@latest
```

### Korak 3: Provjerite korištenje

Provjerite `src/utils/pdfParser.ts` - provjerite API pozive.

### Korak 4: Testirajte

```bash
# Testirajte aplikaciju
npm run dev

# Testirajte PDF upload funkcionalnost
```

### Korak 5: (Opciono) Ažurirajte vite

Ako želite riješiti i vite vulnerability:

```bash
npm install vite@latest
```

**⚠️ PAŽNJA:** Možda će trebati ažurirati i druge devDependencies.

### Korak 6: Provjerite rezultat

```bash
npm audit
```

---

## 📋 Breaking Changes Checklist

### pdfjs-dist v3 → v5

- [ ] Provjeriti API changes u pdfParser.ts
- [ ] Provjeriti import statements
- [ ] Testirati PDF parsing
- [ ] Provjeriti worker konfiguraciju (ako se koristi)

### vite v5 → v7

- [ ] Provjeriti vite.config.ts
- [ ] Provjeriti build proces
- [ ] Provjeriti dev server konfiguraciju
- [ ] Testirati development server
- [ ] Testirati production build

---

## ⚠️ Ako Ne Možete Ažurirati Odmah

### Za pdfjs-dist (HIGH severity):

Ako ne možete odmah ažurirati:
1. **Ograničite PDF upload** - validirajte PDF fajlove prije parsiranja
2. **Koristite sandbox okruženje** - parsirajte PDF-ove u izoliranom okruženju
3. **Dodajte warning** - upozorite korisnike da uploadaju samo pouzdane PDF-ove

### Za vite/esbuild (MODERATE severity):

Ako ne možete odmah ažurirati:
1. **Development-only** - koristite lokalno, ne na javnoj mreži
2. **Firewall** - zaštitite development server firewall-om
3. **Nije hitno** - može čekati, ne utiče na produkciju

---

## 🔍 Provjera Nakon Popravki

```bash
# Provjerite vulnerabilities
npm audit

# Provjerite da li aplikacija radi
npm run dev

# Provjerite build
npm run build
```

---

## 📚 Resursi

- [pdfjs-dist releases](https://github.com/mozilla/pdf.js/releases)
- [pdfjs-dist migration guide](https://github.com/mozilla/pdf.js/blob/main/CHANGELOG.md)
- [vite migration guide](https://vitejs.dev/guide/migration)
- [npm audit docs](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## ✨ Preporuka

**Za produkciju:**
- 🔴 **MORATE** riješiti pdfjs-dist (HIGH severity)
- 🟡 Preporučeno riješiti vite (MODERATE severity)

**Za development:**
- 🟡 Preporučeno riješiti pdfjs-dist
- ⚪ Opciono riješiti vite (development-only)

---

## 🎯 Brzo Rješenje (Ako želite riješiti odmah)

```bash
# 1. Backup
cp package.json package.json.backup

# 2. Ažuriraj pdfjs-dist (prioritet)
npm install pdfjs-dist@latest

# 3. Provjeri i testiraj
npm audit
npm run dev

# 4. (Opciono) Ažuriraj vite
npm install vite@latest
npm audit
```

**Testirajte pažljivo nakon svakog koraka!** 🚀
