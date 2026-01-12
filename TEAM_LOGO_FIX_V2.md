# ✅ Team Logo Fix V2 - Funkcionalni Update Pattern

## 🔧 Problem

Logo još uvijek nestajao nakon refresh-a, iako smo koristili `useRef` za `currentTeam`.

## 🔍 Pravi Uzrok

Problem nije bio u `currentTeam` ref-u, već u `handleUpdateTeam` funkciji koja je koristila zastarjelu `teams` array iz closure-a. Kada se `handleUpdateTeam` pozove, koristi `teams` iz trenutnog closure-a, koji možda nije ažuran.

## ✅ Rješenje

Korišten **funkcionalni update pattern** u `setTeams`:

```typescript
const handleUpdateTeam = (updatedTeam: Team) => {
  setTeams((prevTeams) => {
    const updatedTeams = prevTeams.map((t) =>
      t.id === updatedTeam.id ? updatedTeam : t
    );
    saveTeams(updatedTeams);
    return updatedTeams;
  });
  setCurrentTeam(updatedTeam);
  setTeamCode(updatedTeam.team_code);
};
```

Ovaj pristup osigurava da uvijek koristimo najnoviju verziju `teams` array-a, a ne zastarjelu iz closure-a.

## 📝 Izmjene

- ✅ Ažuriran `handleUpdateTeam` u `src/hooks/useTeams.ts` da koristi funkcionalni update pattern
- ✅ `setTeams((prevTeams) => ...)` umjesto `setTeams(updatedTeams)`
- ✅ `saveTeams` se poziva unutar callback-a sa ažurnim `updatedTeams`

## ✅ Rezultat

Logo se sada pravilno sprema u storage i ostaje nakon refresh-a!

---

**Status:** ✅ **FIXED V2**
