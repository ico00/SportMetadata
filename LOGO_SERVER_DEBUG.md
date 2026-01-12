# 🔍 Logo Server Debug - Logovi Dodani

## Problem

Logo se ne sprema u `data/teams.json` fajl na serveru.

## Debug Logovi Dodani na Serveru

Dodani su console.log-ovi u `server/index.cjs` POST /api/teams endpoint:

1. **Prije validacije**: Provjera da li team ima logo u zahtjevu
2. **Nakon validacije**: Provjera da li team ima logo nakon Zod validacije
3. **Upozorenje**: Ako logo postoji prije validacije, ali ne postoji nakon validacije

## Kako Testirati

1. Otvorite server console (gdje se server pokreće)
2. Uploadujte logo u aplikaciji
3. Provjerite server console logove - trebali biste vidjeti:
   - `📥 POST /api/teams`
   - `🔍 Team with logo in request: ...`
   - `🔍 Team with logo after validation: ...` ILI `❌ Logo was lost during validation!`
   - `✅ Teams saved successfully`

Ako vidite "Logo was lost during validation!", to znači da Zod validacija briše logo polje (što ne bi trebalo jer je `logo?.optional()`).

---

**Status:** 🔍 **SERVER DEBUG LOGOVI DODANI**
