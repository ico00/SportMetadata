# 🔍 Logo Debug - Console Logovi Dodani

## Problem

Logo se prikazuje nakon upload-a, ali nestaje nakon refresh-a. Dodani su console.log-ovi da vidimo što se dešava.

## Debug Logovi Dodani

### 1. App.tsx - Upload Handler
- Log kada se logo uploaduje
- Prikazuje team ID i logo length

### 2. useTeams.ts - handleUpdateTeam
- Log kada se `handleUpdateTeam` pozove
- Prikazuje da li team ima logo i logo length
- Log nakon update-a teams array-a
- Log nakon spremanja (success/error)

### 3. storage.ts - saveTeams
- Log na početku `saveTeams`
- Log ako team sa logo postoji
- Log prije i poslije spremanja (Tauri/localStorage/server)
- Log JSON length

## Kako Testirati

1. Otvorite browser console (F12)
2. Uploadujte logo
3. Provjerite console logove
4. Refreshajte stranicu
5. Provjerite da li se logo učita

Logovi će pokazati:
- Da li se `handleUpdateTeam` poziva sa logo poljem
- Da li se `saveTeams` poziva
- Da li se logo sprema u JSON
- Da li se logo učitava nakon refresh-a

---

**Status:** 🔍 **DEBUG LOGOVI DODANI**
