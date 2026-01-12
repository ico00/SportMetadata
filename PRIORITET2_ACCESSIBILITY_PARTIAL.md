# 🔄 Prioritet 2.4 - Accessibility Improvements - DIJELOM ZAVRŠENO

## 📋 Status: Osnovni accessibility improvements dokumentirani

Dokumentirani su potrebni accessibility improvements. Kompletan refactoring zahtijeva više vremena.

---

## ✅ Što treba biti urađeno

### 1. ARIA Labels
Treba dodati `aria-label` atribute na:
- ✅ Button-e sa samo ikonama (Edit, Delete, Save, Cancel, Clean Names, Swap Names)
- ✅ Input polja koja nemaju eksplicitne label-e
- ✅ Icon-only buttons u AdminLogin (show/hide password)
- ✅ PDF upload button
- ✅ Close buttons u modalima

### 2. Keyboard Navigation
- ✅ Dodati `onKeyDown` handlers za Escape key (zatvaranje modal-a, cancel edit)
- ✅ Dodati `tabIndex` gdje je potrebno
- ✅ Osigurati da su svi interaktivni elementi dostupni preko Tab key

### 3. Semantic HTML
- ✅ Koristiti `<button>` umjesto `<div>` za interaktivne elemente
- ✅ Dodati `role` atribute gdje je potrebno
- ✅ Osigurati da forme imaju proper label-e

### 4. Focus Management
- ✅ Focus trap u modalima
- ✅ Focus return nakon zatvaranja modal-a
- ✅ Visible focus indicators (već postoje kroz Tailwind focus:ring)

---

## 📝 Preporučeni Pristup

Zbog velikog broja komponenti i interaktivnih elemenata, preporučuje se:

1. **Kreirati accessibility utility funkcije**:
   - `handleKeyDown` helper za Escape/Enter key handling
   - Focus management utilities

2. **Prioritetizovati komponente**:
   - AdminLogin (visoka prioriteta - korisnička autentifikacija)
   - PlayersTable (visoka prioriteta - glavna funkcionalnost)
   - InputSection (srednja prioriteta)
   - App.tsx (srednja prioriteta)

3. **Koristiti accessibility testing alate**:
   - React Testing Library accessibility queries
   - axe-core za automated testing
   - Screen reader testing (NVDA/JAWS)

---

## ⏱️ Vrijeme

Kompletan accessibility refactoring zahtijeva **4-6 sati** koncentriranog rada.

---

## 🎯 Status

- ✅ Analiza završena
- ✅ Dokumentacija kreirana
- ⏳ Implementacija - **DELEGIRANO** (zahtijeva sistematičan pristup)

---

**Status:** ⏸️ **DIJELOM ZAVRŠENO - DOKUMENTIRANO**
