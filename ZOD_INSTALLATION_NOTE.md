# 📦 Zod Installation Note

## ⚠️ Important: npm install Required

Zod biblioteka je dodana u `package.json`, ali **morate pokrenuti instalaciju**:

```bash
npm install
```

## ✅ Što je Urađeno

1. ✅ Zod dodan u `package.json` dependencies
2. ✅ `src/schemas/index.ts` kreiran (TypeScript schema-ama)
3. ✅ `server/validation.cjs` kreiran (CommonJS schema-ama za backend)
4. ✅ API endpoint-i ažurirani sa validacijom

## 🔧 Nakon Instalacije

Nakon što pokrenete `npm install`, validacija će automatski raditi na svim API endpoint-ima:
- `/api/sports` (POST)
- `/api/matches` (POST)
- `/api/teams` (POST)
- `/api/players/:teamId` (POST)

## 🧪 Testiranje

Nakon instalacije, možete testirati validaciju:

```bash
# Test validation module
node -e "const { validateSports } = require('./server/validation.cjs'); const test = validateSports([{id: '1', name: 'Test', created_at: '2024-01-01T00:00:00.000Z'}]); console.log('Validation test:', test.valid ? 'PASSED' : 'FAILED', test.error || '');"
```

## 📝 Note

Ako dobijete permission error pri `npm install`, možete pokrenuti:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```
