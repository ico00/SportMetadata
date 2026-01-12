# 🔍 Analiza Problema s Logo Nestajanjem

## Problem

Logo se prikazuje nakon upload-a, ali nestaje nakon refresh-a.

## Analiza

1. **Provjera `data/teams.json`**: Logo se NE sprema u fajl - team "Dinamo" nema `logo` polje.
2. **Console logovi**: Ne vidimo logove koje smo dodali (`saveTeams`, `handleUpdateTeam`), što sugerira da se možda ne pozivaju.
3. **Server mode**: Aplikacija koristi server (vidimo API pozive), što znači:
   - Logo se sprema u localStorage + šalje na server
   - Nakon refresh-a, učitava se sa servera
   - Server vraća `data/teams.json` koji nema logo
   - Server podaci prepisuju localStorage

## Mogući Uzroci

1. **Server validacija**: Možda `validateTeams` briše logo polje (ali schema podržava `logo?.optional()`)
2. **Server writeJsonFile**: Možda `writeJsonFile` ne sprema logo
3. **SaveTeams se ne poziva**: Možda `saveTeams` ne radi kako treba
4. **LoadTeams prepisuje**: Kada se učitava sa servera, prepisuje localStorage bez logo-a

## Rješenje

Trebamo provjeriti:
1. Da li se `saveTeams` poziva (dodati logove - već dodano)
2. Da li server prima logo u POST zahtjevu
3. Da li server sprema logo u fajl
4. Da li server vraća logo u GET zahtjevu

---

**Status:** 🔍 **ANALIZA**
