# 🐛 Bug Fix: useEffect Infinite Loop

## Problem

Nakon refactoringa, API pozivi su se izvršavali u beskonačnom loopu:
```
📥 GET /api/sports
📥 GET /api/matches
📥 GET /api/teams
📥 GET /api/sports
📥 GET /api/matches
... (ponavlja se)
```

## Uzrok

`useToast` hook je vraćao **novi objekt na svakom renderu**, što je uzrokovalo da se `toast` dependency u useEffect hooks-ima mijenjao na svakom renderu, uzrokujući beskonačni loop:

```typescript
// useSports.ts (primjer problema)
useEffect(() => {
  loadSports()...
}, [toast]); // ❌ toast se mijenja na svakom renderu!
```

## Rješenje

Koristiti `useMemo` u `useToast` hook-u da memoiziramo objekt sa funkcijama:

```typescript
export function useToast() {
  return useMemo(() => {
    // Funkcije...
    return {
      showSuccess,
      showError,
      // ...
    };
  }, []); // ✅ Prazan dependency array - funkcije su stabilne
}
```

## Promjene

**Fajl:** `src/hooks/useToast.ts`
- ✅ Dodan `useMemo` da memoizira objekt sa funkcijama
- ✅ Prazan dependency array (funkcije su stabilne, ne zavise od state-a)

## Rezultat

- ✅ useEffect hooks se više ne izvršavaju u loopu
- ✅ API pozivi se izvršavaju samo jednom (ili kada je potrebno)
- ✅ Performanse poboljšane

## Lekcija

**Best Practice:** Kada hook vraća objekt ili array, treba koristiti `useMemo` da se osigura da se referenca ne mijenja između renderova ako nije potrebno.
